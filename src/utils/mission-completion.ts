import { Character } from 'app/shared/character-models';
import { getMembersMatchingReccommendationsCount } from 'app/shared/mission-helper.service';
import { Mission } from 'app/shared/mission-model';
import { MissionCalculationInputs } from 'utils/mission-calculation';

export const MAX_MEMBER_LEVEL = 8;
export const MAX_MEMBER_EXPERIENCE = MAX_MEMBER_LEVEL * 10;

export function getCityReputationKey(city: string): string {
	// Maps display names (Mission.location) to meta.json cityReputations keys
	switch (city) {
		case 'Waterdeep':
			return 'waterdeep';
		case 'Neverwinter':
			return 'neverwinter';
		case "Baldur's Gate":
			return 'baldursGate';
		case 'Luskan':
			return 'luskan';
		case 'Mirabar':
			return 'mirabar';
		case 'Silverymoon':
			return 'silverymoon';
		case 'Piltover':
			return 'piltover';
		case 'Moonshae Isles':
			return 'moonsheaIsles';
		default:
			return city.toLowerCase();
	}
}

export interface CompleteMissionsDependencies {
	evaluateMissionRoll: (roll: number, inputs: MissionCalculationInputs) => { outcome: string };
	calculateExperienceGain: (member: Character, mission: Mission) => number;
}

export interface CompleteMissionsParams {
	missions: Mission[];
	members: Character[];
	adjustedDate: Date;
	metaCityReputations?: Record<string, number>;
}

export function completeMissionsUpToDate(
	params: CompleteMissionsParams,
	deps: CompleteMissionsDependencies,
): { completedMissionIds: number[] } {
	const { missions, members, adjustedDate, metaCityReputations } = params;
	const { evaluateMissionRoll, calculateExperienceGain } = deps;
	const completedMissionIds: number[] = [];

	// Complete any missions that ended before the new date
	missions.forEach((mission: Mission) => {
		if (mission.dispatchDate && !mission.finalOutcome) {
			if (!mission.completionDate) {
				return;
			}
			const missionEndDate = new Date(mission.completionDate);
			if (missionEndDate.getTime() <= adjustedDate.getTime()) {
				completedMissionIds.push(mission.id);

				// Complete the mission
				const { level, recommendedComposition, finalComposition, diceRoll } = mission;
				const cityKey = getCityReputationKey(mission.location);
				const baseReputationInCity = metaCityReputations?.[cityKey] ?? 0;
				const totalReputationInCity =
					baseReputationInCity +
					missions
						.filter((m) => m.location === mission.location && m.finalOutcome)
						.reduce((sum, m) => sum + (m.finalOutcome?.reward.reputation || 0), 0);

				const dispatchedMembers = members.filter((member: Character) => member.activeMission === mission.id);
				const totalPartyLevel = dispatchedMembers.reduce((sum, member) => sum + Math.floor(member.experience / 10), 0);
				const averagePartyLevel = dispatchedMembers.length ? Math.floor(totalPartyLevel / dispatchedMembers.length) : 0;
				const totalBonus = dispatchedMembers.reduce((sum, member) => sum + (member.hasBonus ? 1 : 0), 0);
				const missionCalculationInputs = {
					LM: level,
					NM: recommendedComposition.length,
					Np: finalComposition?.length ?? 0,
					Lp: averagePartyLevel,
					Pp: getMembersMatchingReccommendationsCount(dispatchedMembers, recommendedComposition),
					R: totalReputationInCity,
					O: totalBonus,
				} as MissionCalculationInputs;

				const { outcome } = evaluateMissionRoll(diceRoll || 0, missionCalculationInputs);
				mission.finalOutcome = mission.potentialOutcomes.find((o) => o.tier === outcome) || null;

				// Update members accordingly, as well as grant them experience and remove any debt if the reward is higher than the cost
				dispatchedMembers.forEach((member: Character) => {
					member.activeMission = null;
					member.completedMissions.push(mission.id);
					const experienceGained = calculateExperienceGain(member, mission);
					member.experience = Math.min(member.experience + experienceGained, MAX_MEMBER_EXPERIENCE);

					// Remove debt if reward is higher than cost
					const goldReward = mission.finalOutcome?.reward.gold || 0;
					const memberDebt = member.debt || 0;
					if (goldReward > 0 && memberDebt > 0) {
						const debtPaid = Math.min(goldReward, memberDebt);
						member.debt = memberDebt - debtPaid;
						mission.finalOutcome!.reward.gold = goldReward + debtPaid;
					}
				});
			}
		}
	});

	return { completedMissionIds };
}
