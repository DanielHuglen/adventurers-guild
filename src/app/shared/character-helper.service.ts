import { CharacterClass, ClassGroup } from './character-models';

export function getClassGroupFromCharacterClass(characterClass: CharacterClass | undefined): ClassGroup | 'Unknown' {
	if (!characterClass) {
		return 'Unknown';
	}

	switch (characterClass) {
		case 'Ranger':
		case 'Fighter':
		case 'Monk':
		case 'Rogue':
			return 'Martial';
		case 'Bard':
		case 'Druid':
		case 'Cleric':
			return 'Healer';
		case 'Sorcerer':
		case 'Wizard':
		case 'Warlock':
		case 'Artificer':
			return 'Magic';
		case 'Paladin':
		case 'Barbarian':
			return 'Tank';
		default:
			throw new Error(`Unknown class: ${characterClass}`);
	}
}
