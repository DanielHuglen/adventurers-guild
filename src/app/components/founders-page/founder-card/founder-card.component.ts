import { Component, effect, inject, input, signal } from '@angular/core';
import { AbilityModifierPipe } from '../../../shared/ability-modifier.pipe';
import { DndBeyondCharacterResponse, FoundersService } from 'app/services/founders.service';
import { take } from 'rxjs';
import {
	AbilityScores,
	getHighestLevelClass,
	getTotalLevel,
	mapAbilityScores,
} from 'app/shared/founders-helper.service';
import { NgClass } from '@angular/common';

interface Founder {
	id: number;
	name: string;
	class: string;
	level: number;
	race: string;
	background: string;
	sex: string;
	eyes: string;
	age: number;
	height: string;
	abilityScores: AbilityScores;
	avatarUrl?: string;
}

@Component({
	selector: 'app-founder-card',
	imports: [AbilityModifierPipe, NgClass],
	templateUrl: './founder-card.component.html',
	styleUrl: './founder-card.component.scss',
})
export class FounderCardComponent {
	foundersService = inject(FoundersService);

	founderId = input.required<number>();

	founder = signal<Founder | null>(null);
	isModPreferred = signal(false);
	isLoading = signal(false);

	get scores(): AbilityScores | null {
		return this.founder()?.abilityScores || null;
	}

	constructor() {
		effect(() => {
			this.isLoading.set(true);

			this.foundersService
				.fetchDndBeyondCharacter(this.founderId())
				.pipe(take(1))
				.subscribe((character: DndBeyondCharacterResponse) => {
					this.isLoading.set(false);

					const { classes, name, race, background, gender, eyes, age, height, decorations } = character.data;

					const mainClass = getHighestLevelClass(classes || []);
					const totalLevel = getTotalLevel(classes || []);
					const abilityScores = mapAbilityScores(character.data.stats || [], {
						bonusStats: character.data.bonusStats,
						overrideStats: character.data.overrideStats,
						modifiers: character.data.modifiers,
					});

					const founderData: Founder = {
						id: this.founderId(),
						name: name,
						class: mainClass,
						level: totalLevel,
						race: race?.baseName || 'Unknown',
						background: background?.definition?.name || 'Unknown',
						sex: gender,
						eyes: eyes,
						age: age,
						height: height,
						abilityScores: abilityScores,
						avatarUrl: decorations?.avatarUrl,
					};

					this.founder.set(founderData);
				});
		});
	}
}
