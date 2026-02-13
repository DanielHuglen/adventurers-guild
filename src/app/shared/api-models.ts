import { Character } from './character-models';
import { Mission } from './mission-model';

export interface CharacterBonusUpdateRequest {
	hasBonus: boolean;
	bonusDescription: string;
	debt: number;
}

export interface CharacterBonusUpdateResponse {
	message: string;
	character: Character;
}

export interface CharacterDto extends Omit<Character, 'id' | 'hasBonus' | 'activeMission' | 'completedMissions'> {}

export type MissionDto = Pick<
	Mission,
	'title' | 'description' | 'location' | 'level' | 'recommendedComposition' | 'potentialOutcomes'
>;

export interface DispatchMissionRequest {
	dispatchedMemberIds: number[];
	diceRoll: number;
	dispatchDate: string;
}

export interface DispatchMissionResponse {
	message: string;
	mission: Mission;
	dispatchedMembers: Character[];
}

export interface LoginResponse {
	role: Role;
}

export type Role = 'guest' | 'editor' | 'admin';

export interface CityReputation {
	city: string;
	reputation: number;
}

export interface CityReputationResponse {
	cityReputations: CityReputation[];
}

export interface AdjustDateRequest {
	newDate: string;
}

export interface AdjustDateResponse {
	message: string;
	newDate: string;
	completedMissionIds: number[];
}
