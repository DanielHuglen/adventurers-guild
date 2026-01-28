import { CharacterClass } from './character-models';
import { DndBeyondModifier, StatId } from 'app/services/founders.service';

export interface AbilityScores {
	strength: number;
	dexterity: number;
	constitution: number;
	intelligence: number;
	wisdom: number;
	charisma: number;
}

export function getHighestLevelClass(classes: { definition: { name: string }; level: number }[]): CharacterClass {
	return classes.reduce((prev, current) => (current.level > prev.level ? current : prev), {
		definition: { name: '' },
		level: 0,
	}).definition.name as CharacterClass;
}

export function getTotalLevel(classes: { definition: { name: string }; level: number }[]): number {
	return classes.reduce((total, current) => total + current.level, 0);
}

export function mapAbilityScores(
	stats: { id: number; value: number }[],
	options?: {
		bonusStats?: { id: number; value: number | null }[];
		overrideStats?: { id: number; value: number | null }[];
		modifiers?: {
			race?: DndBeyondModifier[];
			class?: DndBeyondModifier[];
			feat?: DndBeyondModifier[];
			item?: DndBeyondModifier[];
			background?: DndBeyondModifier[];
			condition?: DndBeyondModifier[];
		};
	},
): AbilityScores {
	const getFromArray = (arr: { id: number; value: number | null }[] | undefined, statId: StatId): number => {
		const value = arr?.find((s) => s.id === statId)?.value;
		return typeof value === 'number' ? value : 0;
	};

	const getOverrideValue = (
		arr: { id: number; value: number | null }[] | undefined,
		statId: StatId,
	): number | undefined => {
		const value = arr?.find((s) => s.id === statId)?.value;
		return typeof value === 'number' ? value : undefined;
	};

	const getBaseStat = (statId: StatId): number => {
		const overrideValue = getOverrideValue(options?.overrideStats, statId);
		if (typeof overrideValue === 'number') {
			return overrideValue;
		}

		const base = stats.find((s) => s.id === statId)?.value ?? 0;
		const bonus = getFromArray(options?.bonusStats, statId);
		return base + bonus;
	};

	const allModifiers: DndBeyondModifier[] = [
		...(options?.modifiers?.race ?? []),
		...(options?.modifiers?.class ?? []),
		...(options?.modifiers?.feat ?? []),
		...(options?.modifiers?.item ?? []),
		...(options?.modifiers?.background ?? []),
		...(options?.modifiers?.condition ?? []),
	];

	const isAbilityScoreSubType = (subType: string, abilityName: string): boolean => {
		const normalized = subType.toLowerCase();
		const ability = abilityName.toLowerCase();
		return (
			normalized === `${ability}-score` ||
			normalized.endsWith(`-${ability}-score`) ||
			normalized === `${ability}score` ||
			normalized.endsWith(`-${ability}score`)
		);
	};

	const sumBonuses = (abilityName: string): number => {
		return allModifiers
			.filter(
				(mod) =>
					mod?.type === 'bonus' && typeof mod.subType === 'string' && isAbilityScoreSubType(mod.subType, abilityName),
			)
			.reduce((sum, mod) => sum + (mod.value ?? 0), 0);
	};

	const getSetScoreFloor = (abilityName: string): number | undefined => {
		const candidates = allModifiers
			.filter(
				(mod) =>
					mod?.type === 'set' && typeof mod.subType === 'string' && isAbilityScoreSubType(mod.subType, abilityName),
			)
			.map((mod) => (typeof mod.value === 'number' ? mod.value : undefined))
			.filter((v): v is number => typeof v === 'number');

		if (candidates.length === 0) {
			return undefined;
		}

		return Math.max(...candidates);
	};

	const applySetFloor = (abilityName: string, computedScore: number): number => {
		const floor = getSetScoreFloor(abilityName);
		return typeof floor === 'number' ? Math.max(computedScore, floor) : computedScore;
	};

	const strength = applySetFloor('strength', getBaseStat(StatId.Strength) + sumBonuses('strength'));
	const dexterity = applySetFloor('dexterity', getBaseStat(StatId.Dexterity) + sumBonuses('dexterity'));
	const constitution = applySetFloor('constitution', getBaseStat(StatId.Constitution) + sumBonuses('constitution'));
	const intelligence = applySetFloor('intelligence', getBaseStat(StatId.Intelligence) + sumBonuses('intelligence'));
	const wisdom = applySetFloor('wisdom', getBaseStat(StatId.Wisdom) + sumBonuses('wisdom'));
	const charisma = applySetFloor('charisma', getBaseStat(StatId.Charisma) + sumBonuses('charisma'));

	return {
		strength,
		dexterity,
		constitution,
		intelligence,
		wisdom,
		charisma,
	};
}
