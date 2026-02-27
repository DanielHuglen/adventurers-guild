import { Character } from './character-models';
import { City, Mission } from './mission-model';

export interface CharacterBonusUpdateRequest {
	hasBonus: boolean;
	bonusDescription: string;
	debt: number;
}

export interface CharacterBonusUpdateResponse {
	message: string;
	character: Character;
}

export type CharacterDto = Omit<Character, 'id' | 'hasBonus' | 'activeMission' | 'completedMissions'>;

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

export interface EconomyMissionGoldRange {
	missionId: number;
	title: string;
	location: City;
	level: number;
	minGold: number;
	maxGold: number;
	expectedGold: number;
}

export interface EconomyDebtEntry {
	memberId: number;
	name: string;
	debt: number;
}

export interface EconomyEarningsEntry {
	memberId: number;
	name: string;
	earnings: number;
}

export class EconomyStatistics {
	currentDate = '';
	taxOwed = 0;

	topEarner: EconomyEarningsEntry | null = null;
	bottomEarner: EconomyEarningsEntry | null = null;

	missions = {
		total: 0,
		completed: 0,
		inFlight: 0,
		backlog: 0,
	};

	completedEconomy = {
		netGold: 0,
		avgGold: 0,
		medianGold: 0,
		minGold: 0,
		maxGold: 0,
	};

	completedDistribution = {
		byTier: {} as Record<string, { missions: number; gold: number }>,
		byLocation: {} as Record<string, { missions: number; gold: number }>,
		byLevel: {} as Record<string, { missions: number; gold: number }>,
	};

	pipeline = {
		count: 0,
		minGold: 0,
		maxGold: 0,
		expectedGold: 0,
		items: [] as EconomyMissionGoldRange[],
	};

	backlogOpportunity = {
		count: 0,
		minGold: 0,
		maxGold: 0,
		expectedGold: 0,
		items: [] as EconomyMissionGoldRange[],
	};

	debt = {
		total: 0,
		nonZeroCount: 0,
		topDebtors: [] as EconomyDebtEntry[],
	};

	staffing = {
		activeAssignments: 0,
		byMissionId: [] as { missionId: number; assigned: number }[],
	};

	constructor(init?: Partial<EconomyStatistics>) {
		Object.assign(this, init);
	}
}
