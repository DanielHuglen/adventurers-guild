import type { CharacterDto, MissionDto } from 'app/shared/api-models';
import type { Character } from 'app/shared/character-models';
import type { Mission, Outcome, PotentialOutcomes } from 'app/shared/mission-model';
import {
	createMemberFromDto,
	createMissionFromDto,
	updateMemberFromDto,
	updateMissionFromDto,
} from './server-normalizers';

// --- Compile-time guards ---
// These intentionally fail compilation if the model/DTO contract changes,
// forcing an explicit decision on what the server must initialize/preserve.

type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Assert<T extends true> = T;

type MemberServerManagedKeys = Exclude<keyof Character, keyof CharacterDto | 'id'>;
type _MemberServerManagedKeysAreExpected = Assert<
	Equals<MemberServerManagedKeys, 'hasBonus' | 'activeMission' | 'completedMissions'>
>;

type MissionServerManagedKeys = Exclude<keyof Mission, keyof MissionDto | 'id'>;
type _MissionServerManagedKeysAreExpected = Assert<
	Equals<MissionServerManagedKeys, 'diceRoll' | 'finalComposition' | 'finalOutcome' | 'dispatchDate' | 'completionDate'>
>;

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
		bonusDescription: '',
		debt: 0,
		activeMission: null,
		completedMissions: [],
		...overrides,
	};
}

function makeCharacterDto(overrides: Partial<CharacterDto> = {}): CharacterDto {
	const full = makeCharacter();
	const {
		id: _id,
		hasBonus: _hasBonus,
		activeMission: _activeMission,
		completedMissions: _completedMissions,
		...dto
	} = full;
	return { ...(dto as CharacterDto), ...overrides };
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
		diceRoll: null,
		finalComposition: [],
		finalOutcome: null,
		dispatchDate: null,
		completionDate: null,
		...overrides,
	};
}

function makeMissionDto(overrides: Partial<MissionDto> = {}): MissionDto {
	return {
		title: 'Mission',
		description: 'Desc',
		location: 'Neverwinter',
		level: 2,
		recommendedComposition: ['Tank', 'Magic'],
		potentialOutcomes: makeOutcomes(),
		...overrides,
	};
}

describe('server-normalizers', () => {
	describe('members', () => {
		it('createMemberFromDto initializes UI-omitted fields', () => {
			const dto = makeCharacterDto({ name: 'New' });
			const created = createMemberFromDto(123, dto);

			expect(created.id).toBe(123);
			expect(created.hasBonus).toBeFalse();
			expect(created.activeMission).toBeNull();
			expect(created.completedMissions).toEqual([]);
		});

		it('updateMemberFromDto preserves UI-omitted fields', () => {
			const existing = makeCharacter({ hasBonus: true, activeMission: 7, completedMissions: [2, 4] });
			const dto = makeCharacterDto({ name: 'Updated name' });
			const updated = updateMemberFromDto(existing.id, dto, existing);

			expect(updated.id).toBe(existing.id);
			expect(updated.name).toBe('Updated name');
			expect(updated.hasBonus).toBeTrue();
			expect(updated.activeMission).toBe(7);
			expect(updated.completedMissions).toEqual([2, 4]);
		});

		it('updateMemberFromDto defaults malformed existing UI-omitted fields', () => {
			const existing = makeCharacter({ hasBonus: false }) as unknown as Record<string, unknown>;
			delete existing['completedMissions'];
			(existing as any).activeMission = undefined;
			(existing as any).hasBonus = undefined;

			const dto = makeCharacterDto({ name: 'Updated name' });
			const updated = updateMemberFromDto(1, dto, existing as unknown as Character);

			expect(updated.hasBonus).toBeFalse();
			expect(updated.activeMission).toBeNull();
			expect(updated.completedMissions).toEqual([]);
		});
	});

	describe('missions', () => {
		it('createMissionFromDto initializes UI-omitted fields', () => {
			const dto = makeMissionDto({ title: 'New mission' });
			const created = createMissionFromDto(99, dto);

			expect(created.id).toBe(99);
			expect(created.diceRoll).toBeNull();
			expect(created.finalOutcome).toBeNull();
			expect(created.finalComposition).toEqual([]);
			expect(created.dispatchDate).toBeNull();
			expect(created.completionDate).toBeNull();
		});

		it('updateMissionFromDto preserves UI-omitted fields', () => {
			const existing = makeMission({
				diceRoll: 42,
				finalComposition: ['Tank'],
				dispatchDate: new Date('2026-01-01T00:00:00Z'),
				completionDate: new Date('2026-01-05T00:00:00Z'),
			});
			const dto = makeMissionDto({ title: 'Updated title' });
			const updated = updateMissionFromDto(dto, existing);

			expect(updated.id).toBe(existing.id);
			expect(updated.title).toBe('Updated title');
			expect(updated.diceRoll).toBe(42);
			expect(updated.finalComposition).toEqual(['Tank']);
			expect(updated.dispatchDate?.toISOString()).toBe(existing.dispatchDate?.toISOString());
			expect(updated.completionDate?.toISOString()).toBe(existing.completionDate?.toISOString());
		});

		it('updateMissionFromDto defaults malformed existing finalComposition', () => {
			const existing = makeMission() as any;
			existing.finalComposition = undefined;

			const updated = updateMissionFromDto(makeMissionDto(), existing as Mission);
			expect(updated.finalComposition).toEqual([]);
		});
	});
});
