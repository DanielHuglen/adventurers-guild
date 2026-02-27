import { EconomyEarningsEntry, EconomyMissionGoldRange, EconomyStatistics } from 'app/shared/api-models';
import { Character } from 'app/shared/character-models';
import { Mission } from 'app/shared/mission-model';

export const TAX_FREE_THRESHOLD_GOLD = 10_000;
export const UPPER_TAX_THRESHOLD_GOLD = 50_000;

function asFiniteNumber(value: unknown, fallback = 0): number {
	const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
	return Number.isFinite(n) ? n : fallback;
}

function sum(values: number[]): number {
	return values.reduce((acc, v) => acc + v, 0);
}

function avg(values: number[]): number {
	return values.length ? sum(values) / values.length : 0;
}

function median(values: number[]): number {
	if (!values.length) return 0;
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function min(values: number[]): number {
	return values.length ? Math.min(...values) : 0;
}

function max(values: number[]): number {
	return values.length ? Math.max(...values) : 0;
}

function getMissionOutcomeGolds(mission: Mission): number[] {
	return (mission.potentialOutcomes ?? [])
		.map((o) => asFiniteNumber(o?.reward?.gold, NaN))
		.filter((n) => Number.isFinite(n));
}

function computeTaxOwedFromProfit(profit: number): number {
	// System page rules:
	// - 0% up to 10,000g
	// - 20% for 10,000g–50,000g
	// - 40% above 50,000g
	const taxableProfit = Math.max(0, profit);
	const lowerBracketSize = UPPER_TAX_THRESHOLD_GOLD - TAX_FREE_THRESHOLD_GOLD;
	const bracket20 = Math.min(Math.max(0, taxableProfit - TAX_FREE_THRESHOLD_GOLD), lowerBracketSize);
	const bracket40 = Math.max(0, taxableProfit - UPPER_TAX_THRESHOLD_GOLD);
	return bracket20 * 0.2 + bracket40 * 0.4;
}

export interface ComputeEconomyStatisticsParams {
	currentDate: string;
	missions: Mission[];
	members: Character[];
}

export function computeEconomyStatistics(params: ComputeEconomyStatisticsParams): EconomyStatistics {
	const { currentDate, missions, members } = params;

	const completedMissions = missions.filter((m) => !!m.finalOutcome);
	const inFlightMissions = missions.filter((m) => !m.finalOutcome && !!m.dispatchDate);
	const backlogMissions = missions.filter((m) => !m.dispatchDate);

	const completedGolds = completedMissions.map((m) => asFiniteNumber(m.finalOutcome?.reward?.gold));

	const byTier: Record<string, { missions: number; gold: number }> = {};
	const byLocation: Record<string, { missions: number; gold: number }> = {};
	const byLevel: Record<string, { missions: number; gold: number }> = {};

	for (const mission of completedMissions) {
		const tier = mission.finalOutcome?.tier ?? 'Unknown';
		byTier[tier] ??= { missions: 0, gold: 0 };
		byTier[tier].missions += 1;
		byTier[tier].gold += asFiniteNumber(mission.finalOutcome?.reward?.gold);

		const locationKey = String(mission.location ?? 'Unknown');
		byLocation[locationKey] ??= { missions: 0, gold: 0 };
		byLocation[locationKey].missions += 1;
		byLocation[locationKey].gold += asFiniteNumber(mission.finalOutcome?.reward?.gold);

		const levelKey = String(mission.level ?? 'Unknown');
		byLevel[levelKey] ??= { missions: 0, gold: 0 };
		byLevel[levelKey].missions += 1;
		byLevel[levelKey].gold += asFiniteNumber(mission.finalOutcome?.reward?.gold);
	}

	function toGoldRange(mission: Mission): EconomyMissionGoldRange {
		const golds = getMissionOutcomeGolds(mission);
		const successGold = asFiniteNumber(mission.potentialOutcomes?.find((o) => o.tier === 'Success')?.reward?.gold, NaN);
		return {
			missionId: mission.id,
			title: mission.title,
			location: mission.location,
			level: asFiniteNumber(mission.level),
			minGold: min(golds),
			maxGold: max(golds),
			expectedGold: Number.isFinite(successGold) ? successGold : avg(golds),
		};
	}

	const pipelineItems = inFlightMissions.map(toGoldRange);
	const backlogItems = backlogMissions.map(toGoldRange);

	const pipelineMinGold = sum(pipelineItems.map((i) => i.minGold));
	const pipelineMaxGold = sum(pipelineItems.map((i) => i.maxGold));
	const pipelineExpectedGold = sum(pipelineItems.map((i) => i.expectedGold));

	const backlogMinGold = sum(backlogItems.map((i) => i.minGold));
	const backlogMaxGold = sum(backlogItems.map((i) => i.maxGold));
	const backlogExpectedGold = sum(backlogItems.map((i) => i.expectedGold));

	const debts = members
		.map((m) => ({
			memberId: m.id,
			name: m.name,
			debt: asFiniteNumber(m.debt, 0),
		}))
		.filter((d) => d.debt > 0)
		.sort((a, b) => b.debt - a.debt);

	const debtTotal = sum(debts.map((d) => d.debt));

	const staffingByMission = new Map<number, number>();
	for (const member of members) {
		const missionId = asFiniteNumber(member.activeMission, NaN);
		if (!Number.isFinite(missionId) || missionId <= 0) continue;
		staffingByMission.set(missionId, (staffingByMission.get(missionId) ?? 0) + 1);
	}

	const staffingByMissionId = [...staffingByMission.entries()]
		.map(([missionId, assigned]) => ({ missionId, assigned }))
		.sort((a, b) => b.assigned - a.assigned || a.missionId - b.missionId);

	const completedNetGold = sum(completedGolds);

	const missionById = new Map<number, Mission>(missions.map((m) => [m.id, m]));

	const earningsByMember: EconomyEarningsEntry[] = members.map((member) => {
		const completed = Array.isArray(member.completedMissions) ? member.completedMissions : [];
		let earnings = 0;

		for (const missionId of completed) {
			const mission = missionById.get(missionId);
			if (!mission?.finalOutcome) continue;

			const partySize = Array.isArray(mission.finalComposition) ? mission.finalComposition.length : 0;
			if (partySize <= 0) continue;

			const missionGold = asFiniteNumber(mission.finalOutcome.reward?.gold, 0);
			earnings += missionGold / partySize;
		}

		return {
			memberId: member.id,
			name: member.name,
			earnings,
		};
	});

	const sortedByEarnings = [...earningsByMember].sort((a, b) => a.earnings - b.earnings || a.memberId - b.memberId);

	const bottomEarner = sortedByEarnings.length ? sortedByEarnings[0] : null;
	const topEarner = sortedByEarnings.length ? sortedByEarnings[sortedByEarnings.length - 1] : null;

	return new EconomyStatistics({
		currentDate,
		taxOwed: computeTaxOwedFromProfit(completedNetGold),
		topEarner,
		bottomEarner,
		missions: {
			total: missions.length,
			completed: completedMissions.length,
			inFlight: inFlightMissions.length,
			backlog: backlogMissions.length,
		},
		completedEconomy: {
			netGold: completedNetGold,
			avgGold: avg(completedGolds),
			medianGold: median(completedGolds),
			minGold: min(completedGolds),
			maxGold: max(completedGolds),
		},
		completedDistribution: {
			byTier,
			byLocation,
			byLevel,
		},
		pipeline: {
			count: pipelineItems.length,
			minGold: pipelineMinGold,
			maxGold: pipelineMaxGold,
			expectedGold: pipelineExpectedGold,
			items: pipelineItems,
		},
		backlogOpportunity: {
			count: backlogItems.length,
			minGold: backlogMinGold,
			maxGold: backlogMaxGold,
			expectedGold: backlogExpectedGold,
			items: backlogItems,
		},
		debt: {
			total: debtTotal,
			nonZeroCount: debts.length,
			topDebtors: debts.slice(0, 10),
		},
		staffing: {
			activeAssignments: sum(staffingByMissionId.map((s) => s.assigned)),
			byMissionId: staffingByMissionId,
		},
	});
}
