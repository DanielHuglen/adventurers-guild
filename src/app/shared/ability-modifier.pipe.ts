import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'abilityModifier',
})
export class AbilityModifierPipe implements PipeTransform {
	transform(abilityScore: number): string {
		const abilityModifier = Math.floor((abilityScore - 10) / 2);

		if (isNaN(abilityModifier)) {
			return '0';
		}

		if (abilityModifier > 0) {
			return `+${abilityModifier}`;
		}

		return `${abilityModifier}`;
	}
}
