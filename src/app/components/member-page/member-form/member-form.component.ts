import { CommonModule } from '@angular/common';
import { Component, effect, ElementRef, inject, input, output, signal, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import {
	Character,
	type CharacterClass,
	characterClasses,
	features,
	Languages,
	languages,
} from '../../../shared/character-models';
import { CharacterService } from 'app/services/character.service';
import { AbilityScores } from 'app/shared/founders-helper.service';
import { take } from 'rxjs';
import { CharacterDto } from 'app/shared/api-models';
import { ToastService } from 'app/services/toast.service';

@Component({
	selector: 'app-member-form',
	imports: [CommonModule, ReactiveFormsModule],
	templateUrl: './member-form.component.html',
	styleUrl: './member-form.component.scss',
})
export class MemberFormComponent {
	characterService = inject(CharacterService);
	toastService = inject(ToastService);

	existingMember = input<Character | undefined>();

	memberForm: FormGroup | undefined;
	isEditMode = signal(false);

	@ViewChild('memberFormDialog') memberFormDialog: ElementRef<HTMLDialogElement> | undefined;

	readonly characterClasses = characterClasses;
	readonly languages = languages;
	readonly features = features;

	private buildForm(): void {
		this.isEditMode.set(!!this.existingMember());

		const {
			name,
			description,
			imageUrl,
			class: CharacterClass,
			race,
			age,
			experience,
			abilityScores,
			armorClass,
			hitPoints,
			speed,
			savingThrows,
			languages,
			features,
			isAlive,
			debt,
		} = this.existingMember() || {};
		const lowerCaseSavingThrows = savingThrows?.map((s) => s.toLowerCase() as keyof AbilityScores) || [];

		this.memberForm = new FormGroup({
			name: new FormControl(name || '', Validators.required),
			description: new FormControl(description || '', Validators.required),
			imageUrl: new FormControl(imageUrl || '', Validators.required),
			class: new FormControl<CharacterClass | null>(CharacterClass || null, Validators.required),
			race: new FormControl(race || '', Validators.required),
			age: new FormControl(age || 0, Validators.required),
			experience: new FormControl(experience || 0, Validators.required),
			strength: new FormControl(abilityScores?.strength || 0, Validators.required),
			dexterity: new FormControl(abilityScores?.dexterity || 0, Validators.required),
			constitution: new FormControl(abilityScores?.constitution || 0, Validators.required),
			intelligence: new FormControl(abilityScores?.intelligence || 0, Validators.required),
			wisdom: new FormControl(abilityScores?.wisdom || 0, Validators.required),
			charisma: new FormControl(abilityScores?.charisma || 0, Validators.required),
			armorClass: new FormControl(armorClass || 0, Validators.required),
			hitPoints: new FormControl(hitPoints || 0, Validators.required),
			speed: new FormControl(speed || 0, Validators.required),
			strengthSave: new FormControl(lowerCaseSavingThrows?.includes('strength') || false),
			dexteritySave: new FormControl(lowerCaseSavingThrows?.includes('dexterity') || false),
			constitutionSave: new FormControl(lowerCaseSavingThrows?.includes('constitution') || false),
			intelligenceSave: new FormControl(lowerCaseSavingThrows?.includes('intelligence') || false),
			wisdomSave: new FormControl(lowerCaseSavingThrows?.includes('wisdom') || false),
			charismaSave: new FormControl(lowerCaseSavingThrows?.includes('charisma') || false),
			languages: new FormControl(languages || [], Validators.required),
			features: new FormControl(features || [], Validators.required),
			isAlive: new FormControl(isAlive ?? true, Validators.required),
			debt: new FormControl(debt || 0, Validators.required),
		});
	}

	onSubmit(): void {
		if (this.memberForm!.valid) {
			const requestData = this.buildCharacterDataFromForm();

			if (this.isEditMode()) {
				this.characterService
					.updateMember(this.existingMember()!.id, requestData)
					.pipe(take(1))
					.subscribe({
						next: (_) => {
							this.toastService.createToast('Member updated successfully');
							this.handleCloseForm();
							window.location.reload(); // Lazy solution because I'm the only one who will submit this
						},
					});
			} else {
				this.characterService
					.createMember(requestData)
					.pipe(take(1))
					.subscribe({
						next: (_) => {
							this.toastService.createToast('Member created successfully');
							this.handleCloseForm();
							window.location.reload(); // Lazy solution because I'm the only one who will submit this
						},
					});
			}
		} else {
			console.log('Form is invalid');
		}
	}

	handleOpenForm(): void {
		this.buildForm();
		this.memberFormDialog?.nativeElement.showModal();
	}
	handleCloseForm(): void {
		this.memberFormDialog?.nativeElement.close();
	}

	buildCharacterDataFromForm(): CharacterDto {
		const formValue = this.memberForm!.value;

		return {
			name: formValue.name!,
			description: formValue.description!,
			imageUrl: formValue.imageUrl!,
			class: formValue.class!,
			race: formValue.race!,
			age: +formValue.age!,
			experience: +formValue.experience!,
			abilityScores: {
				strength: +formValue.strength!,
				dexterity: +formValue.dexterity!,
				constitution: +formValue.constitution!,
				intelligence: +formValue.intelligence!,
				wisdom: +formValue.wisdom!,
				charisma: +formValue.charisma!,
			},
			armorClass: +formValue.armorClass!,
			hitPoints: +formValue.hitPoints!,
			speed: +formValue.speed!,
			savingThrows: [
				formValue.strengthSave ? 'strength' : null,
				formValue.dexteritySave ? 'dexterity' : null,
				formValue.constitutionSave ? 'constitution' : null,
				formValue.intelligenceSave ? 'intelligence' : null,
				formValue.wisdomSave ? 'wisdom' : null,
				formValue.charismaSave ? 'charisma' : null,
			].filter((s): s is keyof AbilityScores => s !== null),
			languages: formValue.languages!,
			features: formValue.features!,
			isAlive: formValue.isAlive!,
			debt: formValue.debt!,
		};
	}
}
