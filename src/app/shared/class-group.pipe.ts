import { Pipe, PipeTransform } from '@angular/core';
import { CharacterClass, ClassGroup } from './character-models';
import { getClassGroupFromCharacterClass } from './character-helper.service';

@Pipe({
	name: 'classGroup',
})
export class ClassGroupPipe implements PipeTransform {
	transform(characterClass: CharacterClass | undefined): ClassGroup | 'Unknown' {
		if (!characterClass) {
			return 'Unknown';
		}

		return getClassGroupFromCharacterClass(characterClass);
	}
}
