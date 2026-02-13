import { ClassGroup } from './character-models';

export interface Mission {
	id: number;
	title: string;
	description: string;
	location: City;
	level: number; // Duration = level * 3 days
	recommendedComposition: ClassGroup[];
	potentialOutcomes: PotentialOutcomes<Outcome>;
	diceRoll: number | null; // 1d100
	finalComposition: ClassGroup[];
	finalOutcome: Outcome | null;
	dispatchDate: Date | null;
	completionDate: Date | null;
}

export type PotentialOutcomes<T> = [T, T, T, T, T];

export interface Outcome {
	tier: OutcomeTier;
	description: string;
	reward: Reward;
}

export interface Reward {
	gold: number;
	reputation: number;
}

export type OutcomeTier = 'Critical Success' | 'Success' | 'Mixed' | 'Failure' | 'Critical Failure';

export const cities = [
	'Waterdeep',
	'Neverwinter',
	"Baldur's Gate",
	'Luskan',
	'Mirabar',
	'Silverymoon',
	'Piltover',
	'Moonshae Isles',
] as const;

export type City = (typeof cities)[number];

export type CityVar =
	| 'waterdeep'
	| 'neverwinter'
	| 'baldursGate'
	| 'luskan'
	| 'mirabar'
	| 'silverymoon'
	| 'piltover'
	| 'moonsheaIsles';

export type MissionAvailability = 'Available' | 'Active' | 'Completed' | 'Unavailable';
