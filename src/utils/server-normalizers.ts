import type { CharacterDto, MissionDto } from 'app/shared/api-models';
import type { Character } from 'app/shared/character-models';
import type { Mission } from 'app/shared/mission-model';

export function createMemberFromDto(id: number, dto: CharacterDto): Character {
	return {
		id,
		...dto,
		hasBonus: false,
		activeMission: null,
		completedMissions: [],
	};
}

export function updateMemberFromDto(id: number, dto: CharacterDto, existing: Character): Character {
	return {
		id,
		...dto,
		hasBonus: existing.hasBonus ?? false,
		activeMission: existing.activeMission ?? null,
		completedMissions: Array.isArray(existing.completedMissions) ? existing.completedMissions : [],
	};
}

export function createMissionFromDto(id: number, dto: MissionDto): Mission {
	return {
		id,
		...dto,
		diceRoll: null,
		finalComposition: [],
		finalOutcome: null,
		dispatchDate: null,
		completionDate: null,
	};
}

export function updateMissionFromDto(dto: MissionDto, existing: Mission): Mission {
	return {
		...existing,
		...dto,
		// UI omits these fields; preserve existing values (and default if data is malformed)
		diceRoll: existing.diceRoll ?? null,
		finalComposition: Array.isArray(existing.finalComposition) ? existing.finalComposition : [],
		finalOutcome: existing.finalOutcome ?? null,
		dispatchDate: existing.dispatchDate ?? null,
		completionDate: existing.completionDate ?? null,
	};
}
