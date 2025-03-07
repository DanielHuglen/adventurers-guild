import { Mission } from './mission-model';

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
  isAlive = false;
  hasBonus = false;
  activeMission = null;
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
  isAlive: boolean;
  hasBonus: boolean; // TODO: Expand with bonus interface
  activeMission?: Mission | null;
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
