import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, input, signal, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { take } from 'rxjs';

import { MissionService } from 'app/services/mission.service';
import { ToastService } from 'app/services/toast.service';
import { MissionDto } from 'app/shared/api-models';
import { cities, type City, type OutcomeTier, type PotentialOutcomes, type Mission } from 'app/shared/mission-model';
import type { ClassGroup } from 'app/shared/character-models';
import type { Outcome } from 'app/shared/mission-model';

const outcomeTiers: OutcomeTier[] = ['Critical Success', 'Success', 'Mixed', 'Failure', 'Critical Failure'];
const classGroups: ClassGroup[] = ['Tank', 'Martial', 'Magic', 'Healer'];

@Component({
	selector: 'app-mission-form',
	imports: [CommonModule, ReactiveFormsModule],
	templateUrl: './mission-form.component.html',
	styleUrl: './mission-form.component.scss',
})
export class MissionFormComponent {
	private missionService = inject(MissionService);
	private toastService = inject(ToastService);

	existingMission = input<Mission | undefined>();

	missionForm: FormGroup | undefined;
	isEditMode = signal(false);

	@ViewChild('missionFormDialog') missionFormDialog: ElementRef<HTMLDialogElement> | undefined;

	readonly cities = cities;
	readonly outcomeTiers = outcomeTiers;
	readonly classGroups = classGroups;

	protected reloadPage(): void {
		window.location.reload();
	}

	private buildForm(): void {
		const mission = this.existingMission();
		this.isEditMode.set(!!mission);

		const composition = mission?.recommendedComposition ?? [];
		const getCount = (group: ClassGroup) => composition.filter((c) => c === group).length;

		const outcomesByTier = new Map<OutcomeTier, Outcome>();
		(mission?.potentialOutcomes ?? []).forEach((o) => outcomesByTier.set(o.tier, o));

		this.missionForm = new FormGroup({
			title: new FormControl(mission?.title ?? '', Validators.required),
			description: new FormControl(mission?.description ?? '', Validators.required),
			location: new FormControl<City | null>(mission?.location ?? null, Validators.required),
			level: new FormControl(mission?.level ?? 1, [Validators.required, Validators.min(1)]),

			tankCount: new FormControl(getCount('Tank'), [Validators.required, Validators.min(0)]),
			martialCount: new FormControl(getCount('Martial'), [Validators.required, Validators.min(0)]),
			magicCount: new FormControl(getCount('Magic'), [Validators.required, Validators.min(0)]),
			healerCount: new FormControl(getCount('Healer'), [Validators.required, Validators.min(0)]),

			criticalSuccessDescription: new FormControl(
				outcomesByTier.get('Critical Success')?.description ?? '',
				Validators.required,
			),
			criticalSuccessGold: new FormControl(
				outcomesByTier.get('Critical Success')?.reward.gold ?? 0,
				Validators.required,
			),
			criticalSuccessReputation: new FormControl(
				outcomesByTier.get('Critical Success')?.reward.reputation ?? 0,
				Validators.required,
			),

			successDescription: new FormControl(outcomesByTier.get('Success')?.description ?? '', Validators.required),
			successGold: new FormControl(outcomesByTier.get('Success')?.reward.gold ?? 0, Validators.required),
			successReputation: new FormControl(outcomesByTier.get('Success')?.reward.reputation ?? 0, Validators.required),

			mixedDescription: new FormControl(outcomesByTier.get('Mixed')?.description ?? '', Validators.required),
			mixedGold: new FormControl(outcomesByTier.get('Mixed')?.reward.gold ?? 0, Validators.required),
			mixedReputation: new FormControl(outcomesByTier.get('Mixed')?.reward.reputation ?? 0, Validators.required),

			failureDescription: new FormControl(outcomesByTier.get('Failure')?.description ?? '', Validators.required),
			failureGold: new FormControl(outcomesByTier.get('Failure')?.reward.gold ?? 0, Validators.required),
			failureReputation: new FormControl(outcomesByTier.get('Failure')?.reward.reputation ?? 0, Validators.required),

			criticalFailureDescription: new FormControl(
				outcomesByTier.get('Critical Failure')?.description ?? '',
				Validators.required,
			),
			criticalFailureGold: new FormControl(
				outcomesByTier.get('Critical Failure')?.reward.gold ?? 0,
				Validators.required,
			),
			criticalFailureReputation: new FormControl(
				outcomesByTier.get('Critical Failure')?.reward.reputation ?? 0,
				Validators.required,
			),
		});
	}

	handleOpenForm(): void {
		this.buildForm();
		this.missionFormDialog?.nativeElement.showModal();
	}

	handleCloseForm(): void {
		this.missionFormDialog?.nativeElement.close();
	}

	onSubmit(): void {
		if (!this.missionForm?.valid) {
			return;
		}

		const requestData = this.buildMissionDataFromForm();
		const existing = this.existingMission();

		if (existing && (existing.diceRoll || existing.finalOutcome)) {
			this.toastService.createToast('Mission has started/completed and cannot be edited', 'error');
			return;
		}

		if (this.isEditMode() && existing) {
			this.missionService
				.updateMission(existing.id, requestData)
				.pipe(take(1))
				.subscribe({
					next: () => {
						this.toastService.createToast('Mission updated successfully');
						this.handleCloseForm();
						this.reloadPage();
					},
				});
		} else {
			this.missionService
				.createMission(requestData)
				.pipe(take(1))
				.subscribe({
					next: () => {
						this.toastService.createToast('Mission created successfully');
						this.handleCloseForm();
						this.reloadPage();
					},
				});
		}
	}

	private buildMissionDataFromForm(): MissionDto {
		const formValue = this.missionForm!.value;

		const tankCount = +formValue.tankCount!;
		const martialCount = +formValue.martialCount!;
		const magicCount = +formValue.magicCount!;
		const healerCount = +formValue.healerCount!;

		const recommendedComposition: ClassGroup[] = [
			...Array(Math.max(tankCount, 0)).fill('Tank'),
			...Array(Math.max(martialCount, 0)).fill('Martial'),
			...Array(Math.max(magicCount, 0)).fill('Magic'),
			...Array(Math.max(healerCount, 0)).fill('Healer'),
		];

		const outcomes: Outcome[] = [
			{
				tier: 'Critical Success',
				description: formValue.criticalSuccessDescription!,
				reward: { gold: +formValue.criticalSuccessGold!, reputation: +formValue.criticalSuccessReputation! },
			},
			{
				tier: 'Success',
				description: formValue.successDescription!,
				reward: { gold: +formValue.successGold!, reputation: +formValue.successReputation! },
			},
			{
				tier: 'Mixed',
				description: formValue.mixedDescription!,
				reward: { gold: +formValue.mixedGold!, reputation: +formValue.mixedReputation! },
			},
			{
				tier: 'Failure',
				description: formValue.failureDescription!,
				reward: { gold: +formValue.failureGold!, reputation: +formValue.failureReputation! },
			},
			{
				tier: 'Critical Failure',
				description: formValue.criticalFailureDescription!,
				reward: { gold: +formValue.criticalFailureGold!, reputation: +formValue.criticalFailureReputation! },
			},
		];

		return {
			title: formValue.title!,
			description: formValue.description!,
			location: formValue.location!,
			level: +formValue.level!,
			recommendedComposition,
			potentialOutcomes: outcomes as PotentialOutcomes<Outcome>,
		};
	}
}
