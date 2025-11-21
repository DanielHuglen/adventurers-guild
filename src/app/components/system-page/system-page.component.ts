import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import { form } from '@angular/forms/signals';

interface ExperienceFormData {
	level: 0 | 1 | 2 | null;
	missionResult: 0 | 1 | 2 | null;
}

@Component({
	selector: 'app-system-page',
	templateUrl: './system-page.component.html',
	styleUrl: './system-page.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemPageComponent {
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
