import { Pipe, PipeTransform } from '@angular/core';
import { CharacterClass, ClassGroup } from './character-models';

@Pipe({
  name: 'classGroup',
})
export class ClassGroupPipe implements PipeTransform {
  transform(characterClass: CharacterClass): ClassGroup {
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
}
