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

export interface AdjustDateRequest {
	newDate: string;
}

export interface AdjustDateResponse {
	message: string;
	newDate: string;
}
