import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, ElementRef, signal, ViewChild } from '@angular/core';
import { form } from '@angular/forms/signals';
import { City } from 'app/shared/mission-model';

interface ExperienceFormData {
	level: 0 | 1 | 2 | null;
	missionResult: 0 | 1 | 2 | null;
}

@Component({
	selector: 'app-system-page',
	templateUrl: './system-page.component.html',
	styleUrl: './system-page.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [NgClass],
})
export class SystemPageComponent {
	protected isCriticalSuccessSelected = signal(false);
	protected isSuccessSelected = signal(false);
	protected isMixedSelected = signal(false);
	protected isFailureSelected = signal(false);
	protected isCriticalFailureSelected = signal(false);

	protected cities: City[] = [
		'Waterdeep',
		'Neverwinter',
		"Baldur's Gate",
		'Luskan',
		'Mirabar',
		'Silverymoon',
		'Piltover',
		'Moonshae Isles',
	];
	protected selectedCity = signal<City | null>(null);

	@ViewChild('cityPopover') cityPopover: ElementRef<HTMLSpanElement> | undefined;

	closePopover(): void {
		this.cityPopover?.nativeElement.hidePopover();
	}

	isButtonDisabled(selectedButton: string): boolean {
		switch (selectedButton) {
			case 'criticalSuccess':
				return (
					this.isSuccessSelected() ||
					this.isMixedSelected() ||
					this.isFailureSelected() ||
					this.isCriticalFailureSelected()
				);
			case 'success':
				return (
					this.isCriticalSuccessSelected() ||
					this.isMixedSelected() ||
					this.isFailureSelected() ||
					this.isCriticalFailureSelected()
				);
			case 'mixed':
				return (
					this.isCriticalSuccessSelected() ||
					this.isSuccessSelected() ||
					this.isFailureSelected() ||
					this.isCriticalFailureSelected()
				);
			case 'failure':
				return (
					this.isCriticalSuccessSelected() ||
					this.isSuccessSelected() ||
					this.isMixedSelected() ||
					this.isCriticalFailureSelected()
				);
			case 'criticalFailure':
				return (
					this.isCriticalSuccessSelected() ||
					this.isSuccessSelected() ||
					this.isMixedSelected() ||
					this.isFailureSelected()
				);
			default:
				return false;
		}
	}

	get cityDescription(): string {
		switch (this.selectedCity()) {
			case 'Waterdeep':
				return 'The City of Splendors, a bustling metropolis known for its wealth, diversity, and political intrigue.';
			case 'Neverwinter':
				return 'The Jewel of the North, a city renowned for its resilience and beauty, recovering from past calamities.';
			case "Baldur's Gate":
				return 'A major port city on the Sword Coast, famous for its commerce, adventurers, and complex politics.';
			case 'Luskan':
				return 'A rough-and-tumble city known for its pirates, mercenaries, and lawlessness, situated at the mouth of the River Mirar.';
			case 'Mirabar':
				return 'A wealthy mining city located in the northern region, known for its strong defenses and industrious populace.';
			case 'Silverymoon':
				return 'The Gem of the North, a city celebrated for its magical academies, culture, and harmony between nature and civilization.';
			case 'Piltover':
				return 'A notorious drow city located deep underground, known for its matriarchal society and ruthless politics.';
			case 'Moonshae Isles':
				return 'A group of islands rich in druidic tradition and natural beauty, home to various clans and mystical creatures.';
			default:
				return '';
		}
	}

	get outcomeText(): string {
		if (this.isCriticalSuccessSelected()) {
			return 'Agents performing beyond expectations are often rewarded generously. This extra reward sometimes manifests as extra gold or reputation, but more often means they bring back a magic item, potion, new member, or even plot-relevant information from their adventure!';
		}
		if (this.isSuccessSelected()) {
			return 'The rewards for this outcome is exactly what was promised when embarking on the mission. A positive amount of gold and reputation.';
		}
		if (this.isMixedSelected()) {
			return 'When not everything goes according to plan, the employer might be reluctant to award the guild their promised rewards, considering the outcome a breach of contract. Some gold will most likely be given to the agents, though the reputation will suffer, sometimes even moving into the negatives!';
		}
		if (this.isFailureSelected()) {
			return 'Failing a mission means no rewards. For a few missions, it even means the guild will owe gold to the employer. Either way, the guild reputation is certain to take a hit.';
		}
		if (this.isCriticalFailureSelected()) {
			return 'The worst possible outcome requires intervention by the party. There will be different levels of detriment though, as some issues could be solved by casting a simple spell, while others might require travelling to a different city and responding to threats face-to-face. Regardless, negative gold and reputation is to be expected.';
		}

		return 'No Outcome Selected';
	}

	experienceModel = signal<ExperienceFormData>({
		level: null,
		missionResult: null,
	});

	// TODO: Cleanup vibed comments and console.logs later
	// Derived signals (booleans). They are false when level is null.
	isWithinTwoLevels = computed(() => (this.experienceModel().level ?? -1) >= 2);
	isWithinOneLevel = computed(() => (this.experienceModel().level ?? -1) >= 1);
	isSameLevelOrHigher = computed(() => (this.experienceModel().level ?? -1) >= 0);

	experienceForm = form(this.experienceModel);

	/** UI click helper — sets a NEW LEVEL instead of toggling booleans */
	setLevelDifference(checked: boolean, level: 0 | 1 | 2) {
		if (checked) {
			// user checked a box -> set level exactly
			this.experienceModel.update((m) => ({ ...m, level }));
			return;
		}

		// user unchecked a box -> fall back one level
		const fallback = level > 0 ? ((level - 1) as 0 | 1) : null;
		this.experienceModel.update((m) => ({ ...m, level: fallback }));
	}

	// Derived booleans
	wasMissionCriticalSuccess = computed(() => (this.experienceModel().missionResult ?? -1) >= 2);
	wasMissionSuccessOrBetter = computed(() => (this.experienceModel().missionResult ?? -1) >= 1);
	wasMissionMixedOrBetter = computed(() => (this.experienceModel().missionResult ?? -1) >= 0);

	/** Same behavior as with level difference */
	setMissionResult(checked: boolean, result: 0 | 1 | 2) {
		if (checked) {
			// checking higher always forces lower true via derived computations
			this.experienceModel.update((m) => ({ ...m, missionResult: result }));
			return;
		}

		// unchecking -> fallback one level
		const fallback = result > 0 ? ((result - 1) as 0 | 1) : null;
		this.experienceModel.update((m) => ({ ...m, missionResult: fallback }));
	}

	totalExperience = computed(() => {
		let experience = 0;

		if (this.isWithinTwoLevels()) {
			experience += 1;
		}
		if (this.isWithinOneLevel()) {
			experience += 1;
		}
		if (this.isSameLevelOrHigher()) {
			experience += 1;
		}
		if (this.wasMissionMixedOrBetter()) {
			experience += 1;
		}
		if (this.wasMissionSuccessOrBetter()) {
			experience += 1;
		}
		if (this.wasMissionCriticalSuccess()) {
			experience += 1;
		}

		return experience;
	});
}
