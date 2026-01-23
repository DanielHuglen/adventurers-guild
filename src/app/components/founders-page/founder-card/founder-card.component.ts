import { Component, effect, inject, input, signal } from '@angular/core';
import { AbilityModifierPipe } from '../../../shared/ability-modifier.pipe';
import { DndBeyondCharacterResponse, FoundersService, StatId } from 'app/services/founders.service';
import { take } from 'rxjs';
import { CharacterClass } from 'app/shared/character-models';

interface AbilityScores {
	strength: number;
	dexterity: number;
	constitution: number;
	intelligence: number;
	wisdom: number;
	charisma: number;
}

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
	imports: [AbilityModifierPipe],
	templateUrl: './founder-card.component.html',
	styleUrl: './founder-card.component.scss',
})
export class FounderCardComponent {
	foundersService = inject(FoundersService);

	founderId = input.required<number>();

	founder = signal<Founder | null>(null);
	isModPreferred = signal(false);

	get scores(): AbilityScores | null {
		return this.founder()?.abilityScores || null;
	}

	getHighestLevelClass(classes: { definition: { name: string }; level: number }[]): CharacterClass {
		return classes.reduce((prev, current) => (current.level > prev.level ? current : prev), {
			definition: { name: '' },
			level: 0,
		}).definition.name as CharacterClass;
	}

	getTotalLevel(classes: { definition: { name: string }; level: number }[]): number {
		return classes.reduce((total, current) => total + current.level, 0);
	}

	mapAbilityScores(
		stats: { id: number; value: number }[],
		raceModifiers: { type?: string; subType?: string; value?: number }[] = [],
	): AbilityScores {
		const getBase = (statId: StatId): number => stats.find((s) => s.id === statId)?.value ?? 0;

		const getRaceBonus = (abilityName: string): number => {
			const needle = abilityName.toLowerCase();
			return raceModifiers
				.filter(
					(mod) =>
						mod?.type === 'bonus' && typeof mod.subType === 'string' && mod.subType.toLowerCase().includes(needle),
				)
				.reduce((sum, mod) => sum + (mod.value ?? 0), 0);
		};

		const abilityScores: AbilityScores = {
			strength: getBase(StatId.Strength) + getRaceBonus('strength'),
			dexterity: getBase(StatId.Dexterity) + getRaceBonus('dexterity'),
			constitution: getBase(StatId.Constitution) + getRaceBonus('constitution'),
			intelligence: getBase(StatId.Intelligence) + getRaceBonus('intelligence'),
			wisdom: getBase(StatId.Wisdom) + getRaceBonus('wisdom'),
			charisma: getBase(StatId.Charisma) + getRaceBonus('charisma'),
		};
		return abilityScores;
	}

	constructor() {
		effect(() => {
			this.foundersService
				.fetchDndBeyondCharacter(this.founderId())
				.pipe(take(1))
				.subscribe((character: DndBeyondCharacterResponse) => {
					const { classes, name, race, background, gender, eyes, age, height, decorations } = character.data;

					const mainClass = this.getHighestLevelClass(classes || []);
					const totalLevel = this.getTotalLevel(classes || []);
					const abilityScores = this.mapAbilityScores(character.data.stats || [], character.data.modifiers?.race || []);

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
