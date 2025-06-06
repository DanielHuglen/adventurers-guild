export class GhostCharacter implements Character {
	id = 0;
	name = '';
	description = '';
	imageUrl = '';
	class = 'Artificer' as CharacterClass;
	race = '';
	age = 0;
	experience = 0;
	abilityScores = {
		strength: 0,
		dexterity: 0,
		constitution: 0,
		intelligence: 0,
		wisdom: 0,
		charisma: 0,
	};
	armorClass = 0;
	hitPoints = 0;
	speed = 0;
	savingThrows = [];
	languages = [];
	features = [];
	isAlive = false;
	hasBonus = false;
	activeMission = 0;
	completedMissions = [];
}

export interface Character {
	id: number;
	name: string;
	description: string;
	imageUrl: string;
	class: CharacterClass;
	race: string;
	age: number;
	experience: number;
	abilityScores: AbilityScores;
	armorClass: number;
	hitPoints: number;
	speed: number;
	savingThrows: Ability[];
	languages: Languages[];
	features: Feature[];
	isAlive: boolean;
	hasBonus: boolean;
	bonusDescription?: string;
	debt?: number;
	activeMission?: number;
	completedMissions: number[];
}

export interface AbilityScores {
	strength: number;
	dexterity: number;
	constitution: number;
	intelligence: number;
	wisdom: number;
	charisma: number;
}

export type Ability = keyof AbilityScores;

export type CharacterClass =
	| 'Artificer'
	| 'Barbarian'
	| 'Bard'
	| 'Cleric'
	| 'Druid'
	| 'Fighter'
	| 'Monk'
	| 'Paladin'
	| 'Ranger'
	| 'Rogue'
	| 'Sorcerer'
	| 'Warlock'
	| 'Wizard';

export type ClassGroup = 'Tank' | 'Martial' | 'Magic' | 'Healer';

export const classGroups: Record<CharacterClass, ClassGroup> = {
	Artificer: 'Magic',
	Barbarian: 'Tank',
	Bard: 'Healer',
	Cleric: 'Healer',
	Druid: 'Healer',
	Fighter: 'Martial',
	Monk: 'Martial',
	Paladin: 'Tank',
	Ranger: 'Martial',
	Rogue: 'Martial',
	Sorcerer: 'Magic',
	Warlock: 'Magic',
	Wizard: 'Magic',
};

export type Languages =
	| 'Common'
	| 'Dwarvish'
	| 'Elvish'
	| 'Giant'
	| 'Gnomish'
	| 'Goblin'
	| 'Halfling'
	| 'Orc'
	| 'Abyssal'
	| 'Celestial'
	| 'Draconic'
	| 'Deep Speech'
	| 'Infernal'
	| 'Primordial'
	| 'Sylvan'
	| 'Undercommon';

export type Feature =
	| 'Spellcasting'
	| 'Sneak Attack'
	| 'Lay on Hands'
	| 'Rage'
	| 'Unarmored Defense'
	| 'Wild Shape'
	| 'Extra Attack'
	| 'Divine Smite'
	| 'Channel Divinity'
	| 'Bardic Inspiration'
	| 'Action Surge'
	| 'Improved Critical'
	| 'Evasion';
