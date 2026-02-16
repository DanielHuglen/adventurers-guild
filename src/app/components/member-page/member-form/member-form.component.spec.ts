import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { of } from 'rxjs';

import { MemberFormComponent } from './member-form.component';
import { CharacterService } from 'app/services/character.service';
import { ToastService } from 'app/services/toast.service';
import type { CharacterDto } from 'app/shared/api-models';
import type { Character } from 'app/shared/character-models';

describe('MemberFormComponent', () => {
	let fixture: ComponentFixture<MemberFormComponent>;
	let component: MemberFormComponent;
	let characterService: jasmine.SpyObj<CharacterService>;
	let toastService: jasmine.SpyObj<ToastService>;
	let reloadPageSpy: jasmine.Spy;

	const createDialogStub = () => {
		return {
			showModal: jasmine.createSpy('showModal'),
			close: jasmine.createSpy('close'),
		} as unknown as HTMLDialogElement;
	};

	beforeEach(async () => {
		characterService = jasmine.createSpyObj<CharacterService>('CharacterService', ['createMember', 'updateMember']);
		toastService = jasmine.createSpyObj<ToastService>('ToastService', ['createToast']);

		await TestBed.configureTestingModule({
			imports: [MemberFormComponent],
			providers: [
				{ provide: CharacterService, useValue: characterService },
				{ provide: ToastService, useValue: toastService },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(MemberFormComponent);
		component = fixture.componentInstance;

		component.memberFormDialog = { nativeElement: createDialogStub() } as unknown as ElementRef<HTMLDialogElement>;
		reloadPageSpy = spyOn(component as unknown as { reloadPage: () => void }, 'reloadPage').and.stub();
	});

	it('opens the form dialog and builds a create form by default', () => {
		component.handleOpenForm();

		expect(component.memberForm).toBeTruthy();
		expect(component.isEditMode()).toBeFalse();
		expect(component.memberFormDialog?.nativeElement.showModal).toHaveBeenCalled();
	});

	it('prefills the form and enables edit mode when existingMember is provided', () => {
		const existingMember: Character = {
			id: 123,
			name: 'Aria',
			description: 'A wizard',
			imageUrl: 'https://example.com/a.png',
			class: 'Wizard',
			race: 'Elf',
			age: 120,
			experience: 2500,
			abilityScores: {
				strength: 8,
				dexterity: 14,
				constitution: 12,
				intelligence: 18,
				wisdom: 13,
				charisma: 10,
			},
			armorClass: 12,
			hitPoints: 22,
			speed: 30,
			savingThrows: ['intelligence', 'wisdom'],
			languages: ['Common', 'Elvish'],
			features: ['Spellcasting'],
			isAlive: true,
			hasBonus: false,
			activeMission: null,
			completedMissions: [],
			debt: 7,
		};

		fixture.componentRef.setInput('existingMember', existingMember);

		component.handleOpenForm();

		expect(component.isEditMode()).toBeTrue();
		expect(component.memberForm?.get('name')?.value).toBe('Aria');
		expect(component.memberForm?.get('class')?.value).toBe('Wizard');
		expect(component.memberForm?.get('intelligenceSave')?.value).toBeTrue();
		expect(component.memberForm?.get('wisdomSave')?.value).toBeTrue();
		expect(component.memberForm?.get('strengthSave')?.value).toBeFalse();
	});

	it('submits a valid create form and calls CharacterService.createMember with the expected DTO', () => {
		let capturedDto: CharacterDto | undefined;
		characterService.createMember.and.callFake((dto) => {
			capturedDto = dto;
			return of({} as unknown as Character);
		});

		component.handleOpenForm();
		component.memberForm!.setValue({
			name: 'Borin',
			description: 'A fighter',
			imageUrl: 'https://example.com/b.png',
			class: 'Fighter',
			race: 'Human',
			age: '33',
			experience: '900',
			strength: '16',
			dexterity: '10',
			constitution: '14',
			intelligence: '8',
			wisdom: '12',
			charisma: '11',
			armorClass: '18',
			hitPoints: '34',
			speed: '25',
			strengthSave: true,
			dexteritySave: false,
			constitutionSave: true,
			intelligenceSave: false,
			wisdomSave: false,
			charismaSave: false,
			languages: ['Common'],
			features: ['Extra Attack'],
			isAlive: true,
			debt: '5',
		});

		component.onSubmit();

		expect(characterService.createMember).toHaveBeenCalledTimes(1);
		expect(capturedDto).toEqual(
			jasmine.objectContaining({
				name: 'Borin',
				class: 'Fighter',
				age: 33,
				experience: 900,
				armorClass: 18,
				hitPoints: 34,
				speed: 25,
				savingThrows: ['strength', 'constitution'],
				debt: 5,
			}),
		);
		expect(toastService.createToast).toHaveBeenCalledWith('Member created successfully');
		expect(component.memberFormDialog?.nativeElement.close).toHaveBeenCalled();
		expect(reloadPageSpy).toHaveBeenCalled();
	});

	it('submits a valid edit form and calls CharacterService.updateMember with the existing id', () => {
		const existingMember: Character = {
			id: 77,
			name: 'Cora',
			description: 'A rogue',
			imageUrl: 'https://example.com/c.png',
			class: 'Rogue',
			race: 'Halfling',
			age: 24,
			experience: 500,
			abilityScores: {
				strength: 10,
				dexterity: 16,
				constitution: 12,
				intelligence: 11,
				wisdom: 10,
				charisma: 13,
			},
			armorClass: 14,
			hitPoints: 18,
			speed: 30,
			savingThrows: ['dexterity'],
			languages: ['Common'],
			features: ['Sneak Attack'],
			isAlive: true,
			hasBonus: false,
			activeMission: null,
			completedMissions: [],
			debt: 0,
		};

		characterService.updateMember.and.returnValue(of({} as unknown as Character));

		fixture.componentRef.setInput('existingMember', existingMember);

		component.handleOpenForm();
		component.memberForm!.patchValue({
			name: 'Cora Updated',
			debt: 12,
		});

		component.onSubmit();

		expect(characterService.updateMember).toHaveBeenCalledTimes(1);
		expect(characterService.updateMember).toHaveBeenCalledWith(
			77,
			jasmine.objectContaining({ name: 'Cora Updated', debt: 12 }),
		);
		expect(toastService.createToast).toHaveBeenCalledWith('Member updated successfully');
		expect(component.memberFormDialog?.nativeElement.close).toHaveBeenCalled();
		expect(reloadPageSpy).toHaveBeenCalled();
	});

	it('does not submit if the form is invalid', () => {
		component.handleOpenForm();
		component.memberForm!.patchValue({ name: '' });

		component.onSubmit();

		expect(characterService.createMember).not.toHaveBeenCalled();
		expect(characterService.updateMember).not.toHaveBeenCalled();
	});
});
