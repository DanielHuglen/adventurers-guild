import { Character } from 'app/shared/character-models';
import { Mission, Outcome, PotentialOutcomes } from 'app/shared/mission-model';
import { completeMissionsUpToDate, MAX_MEMBER_EXPERIENCE } from './mission-completion';
import { MissionCalculationInputs } from './mission-calculation';

function makeCharacter(overrides: Partial<Character> = {}): Character {
	return {
		id: 1,
		name: 'Test',
		description: '',
		imageUrl: '',
		class: 'Fighter',
		race: '',
		age: 30,
		experience: 0,
		abilityScores: {
			strength: 10,
			dexterity: 10,
			constitution: 10,
			intelligence: 10,
			wisdom: 10,
			charisma: 10,
		},
		armorClass: 10,
		hitPoints: 10,
		speed: 30,
		savingThrows: [],
		languages: [],
		features: [],
		isAlive: true,
		hasBonus: false,
		activeMission: null,
		completedMissions: [],
		...overrides,
	};
}

function makeOutcomes(overrides?: Partial<Record<Outcome['tier'], Partial<Outcome>>>): PotentialOutcomes<Outcome> {
	const base = (tier: Outcome['tier']): Outcome => ({
		tier,
		description: tier,
		reward: { gold: 0, reputation: 0 },
	});

	const outcomes: Outcome[] = [
		{ ...base('Critical Success'), ...(overrides?.['Critical Success'] ?? {}) },
		{ ...base('Success'), ...(overrides?.['Success'] ?? {}) },
		{ ...base('Mixed'), ...(overrides?.['Mixed'] ?? {}) },
		{ ...base('Failure'), ...(overrides?.['Failure'] ?? {}) },
		{ ...base('Critical Failure'), ...(overrides?.['Critical Failure'] ?? {}) },
	];

	return outcomes as PotentialOutcomes<Outcome>;
}

function makeMission(overrides: Partial<Mission> = {}): Mission {
	return {
		id: 1,
		title: 'Mission',
		description: 'Desc',
		location: 'Neverwinter',
		level: 2,
		recommendedComposition: ['Tank', 'Magic'],
		potentialOutcomes: makeOutcomes(),
		diceRoll: 50,
		finalComposition: ['Tank', 'Magic'],
		finalOutcome: null,
		dispatchDate: new Date('2026-01-01T00:00:00Z'),
		completionDate: new Date('2026-01-05T00:00:00Z'),
		...overrides,
	};
}

describe('completeMissionsUpToDate', () => {
	it('completes eligible missions and updates member + outcome', () => {
		const missions: Mission[] = [
			makeMission({
				potentialOutcomes: makeOutcomes({
					Success: { reward: { gold: 20, reputation: 2 } },
				}),
			}),
			makeMission({
				id: 2,
				finalOutcome: { tier: 'Success', description: '', reward: { gold: 0, reputation: 5 } },
			}),
		];

		const members: Character[] = [makeCharacter({ activeMission: 1, experience: 0 })];
		const adjustedDate = new Date('2026-02-01T00:00:00Z');

		let seenInputs: MissionCalculationInputs | undefined;
		const deps = {
			evaluateMissionRoll: (_roll: number, inputs: MissionCalculationInputs) => {
				seenInputs = inputs;
				return { outcome: 'Success' };
			},
			calculateExperienceGain: () => 6,
		};

		const { completedMissionIds } = completeMissionsUpToDate(
			{
				missions,
				members,
				adjustedDate,
				metaCityReputations: { neverwinter: 40 },
			},
			deps,
		);

		expect(completedMissionIds).toEqual([1]);
		expect(missions[0].finalOutcome?.tier).toBe('Success');
		expect(members[0].activeMission).toBeNull();
		expect(members[0].completedMissions).toContain(1);
		expect(members[0].experience).toBe(6);
		expect(seenInputs?.R).toBe(45); // 40 base + 5 from mission id=2
	});

	it('applies debt payoff logic (current behavior)', () => {
		const missions: Mission[] = [
			makeMission({
				potentialOutcomes: makeOutcomes({
					Success: { reward: { gold: 20, reputation: 0 } },
				}),
			}),
		];
		const members: Character[] = [makeCharacter({ activeMission: 1, debt: 30 })];
		const adjustedDate = new Date('2026-02-01T00:00:00Z');

		completeMissionsUpToDate(
			{ missions, members, adjustedDate, metaCityReputations: { neverwinter: 0 } },
			{
				evaluateMissionRoll: () => ({ outcome: 'Success' }),
				calculateExperienceGain: () => 0,
			},
		);

		// Debt paid up to gold reward; reward gold increases by the paid amount (as implemented)
		expect(members[0].debt).toBe(10);
		expect(missions[0].finalOutcome?.reward.gold).toBe(40);
	});

	it('caps experience so member level cannot exceed 8', () => {
		const missions: Mission[] = [
			makeMission({ potentialOutcomes: makeOutcomes({ Success: { reward: { gold: 0, reputation: 0 } } }) }),
		];
		const members: Character[] = [makeCharacter({ activeMission: 1, experience: MAX_MEMBER_EXPERIENCE - 1 })];
		const adjustedDate = new Date('2026-02-01T00:00:00Z');

		completeMissionsUpToDate(
			{ missions, members, adjustedDate, metaCityReputations: { neverwinter: 0 } },
			{
				evaluateMissionRoll: () => ({ outcome: 'Success' }),
				calculateExperienceGain: () => 10,
			},
		);

		expect(members[0].experience).toBe(MAX_MEMBER_EXPERIENCE);
	});

	it('skips missions missing completionDate', () => {
		const missions: Mission[] = [makeMission({ completionDate: null })];
		const members: Character[] = [makeCharacter({ activeMission: 1 })];
		const adjustedDate = new Date('2026-02-01T00:00:00Z');

		const { completedMissionIds } = completeMissionsUpToDate(
			{ missions, members, adjustedDate, metaCityReputations: { neverwinter: 0 } },
			{
				evaluateMissionRoll: () => ({ outcome: 'Success' }),
				calculateExperienceGain: () => 1,
			},
		);

		expect(completedMissionIds).toEqual([]);
		expect(missions[0].finalOutcome).toBeNull();
		expect(members[0].activeMission).toBe(1);
	});

	it('handles empty dispatched parties without throwing', () => {
		const missions: Mission[] = [makeMission()];
		const members: Character[] = [makeCharacter({ activeMission: null })];
		const adjustedDate = new Date('2026-02-01T00:00:00Z');

		let seenInputs: MissionCalculationInputs | undefined;
		const { completedMissionIds } = completeMissionsUpToDate(
			{ missions, members, adjustedDate, metaCityReputations: { neverwinter: 0 } },
			{
				evaluateMissionRoll: (_roll: number, inputs: MissionCalculationInputs) => {
					seenInputs = inputs;
					return { outcome: 'Success' };
				},
				calculateExperienceGain: () => 1,
			},
		);

		expect(completedMissionIds).toEqual([1]);
		expect(missions[0].finalOutcome?.tier).toBe('Success');
		expect(seenInputs?.Lp).toBe(0);
	});
});
