import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { of } from 'rxjs';

import { MissionFormComponent } from './mission-form.component';
import { MissionService } from 'app/services/mission.service';
import { ToastService } from 'app/services/toast.service';
import type { MissionDto } from 'app/shared/api-models';
import type { Mission } from 'app/shared/mission-model';

describe('MissionFormComponent', () => {
	let fixture: ComponentFixture<MissionFormComponent>;
	let component: MissionFormComponent;
	let missionService: jasmine.SpyObj<MissionService>;
	let toastService: jasmine.SpyObj<ToastService>;
	let reloadPageSpy: jasmine.Spy;

	const createDialogStub = () => {
		return {
			showModal: jasmine.createSpy('showModal'),
			close: jasmine.createSpy('close'),
		} as unknown as HTMLDialogElement;
	};

	beforeEach(async () => {
		missionService = jasmine.createSpyObj<MissionService>('MissionService', ['createMission', 'updateMission']);
		toastService = jasmine.createSpyObj<ToastService>('ToastService', ['createToast']);

		await TestBed.configureTestingModule({
			imports: [MissionFormComponent],
			providers: [
				{ provide: MissionService, useValue: missionService },
				{ provide: ToastService, useValue: toastService },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(MissionFormComponent);
		component = fixture.componentInstance;
		component.missionFormDialog = { nativeElement: createDialogStub() } as unknown as ElementRef<HTMLDialogElement>;
		reloadPageSpy = spyOn(component as unknown as { reloadPage: () => void }, 'reloadPage').and.stub();
	});

	it('opens the form dialog and builds a create form by default', () => {
		component.handleOpenForm();

		expect(component.missionForm).toBeTruthy();
		expect(component.isEditMode()).toBeFalse();
		expect(component.missionFormDialog?.nativeElement.showModal).toHaveBeenCalled();
	});

	it('submits a valid create form and calls MissionService.createMission with the expected DTO', () => {
		let capturedDto: MissionDto | undefined;
		missionService.createMission.and.callFake((dto) => {
			capturedDto = dto;
			return of({} as unknown as Mission);
		});

		component.handleOpenForm();
		component.missionForm!.setValue({
			title: 'Escort Caravan',
			description: 'Protect the merchants on the road',
			location: 'Waterdeep',
			level: '3',
			tankCount: '1',
			martialCount: '2',
			magicCount: '0',
			healerCount: '1',
			criticalSuccessDescription: 'Perfect escort',
			criticalSuccessGold: '300',
			criticalSuccessReputation: '15',
			successDescription: 'Safe arrival',
			successGold: '200',
			successReputation: '10',
			mixedDescription: 'Some losses',
			mixedGold: '120',
			mixedReputation: '5',
			failureDescription: 'Ambushed',
			failureGold: '30',
			failureReputation: '0',
			criticalFailureDescription: 'Disaster',
			criticalFailureGold: '0',
			criticalFailureReputation: '-10',
		});

		component.onSubmit();

		expect(missionService.createMission).toHaveBeenCalledTimes(1);
		expect(capturedDto).toEqual(
			jasmine.objectContaining({
				title: 'Escort Caravan',
				location: 'Waterdeep',
				level: 3,
				recommendedComposition: ['Tank', 'Martial', 'Martial', 'Healer'],
				potentialOutcomes: jasmine.any(Array),
			}),
		);
		expect(toastService.createToast).toHaveBeenCalledWith('Mission created successfully');
		expect(component.missionFormDialog?.nativeElement.close).toHaveBeenCalled();
		expect(reloadPageSpy).toHaveBeenCalled();
	});

	it('submits a valid edit form and calls MissionService.updateMission when the mission has not started', () => {
		const existingMission: Mission = {
			id: 9,
			title: 'Old title',
			description: 'Old desc',
			location: 'Neverwinter',
			level: 2,
			recommendedComposition: ['Tank'],
			potentialOutcomes: [
				{ tier: 'Critical Success', description: 'cs', reward: { gold: 1, reputation: 1 } },
				{ tier: 'Success', description: 's', reward: { gold: 1, reputation: 1 } },
				{ tier: 'Mixed', description: 'm', reward: { gold: 1, reputation: 1 } },
				{ tier: 'Failure', description: 'f', reward: { gold: 1, reputation: 1 } },
				{ tier: 'Critical Failure', description: 'cf', reward: { gold: 1, reputation: 1 } },
			],
			diceRoll: null,
			finalComposition: [],
			finalOutcome: null,
			dispatchDate: null,
			completionDate: null,
		};

		let capturedDto: MissionDto | undefined;
		missionService.updateMission.and.callFake((_id, dto) => {
			capturedDto = dto;
			return of({} as unknown as Mission);
		});

		fixture.componentRef.setInput('existingMission', existingMission);

		component.handleOpenForm();
		component.missionForm!.patchValue({
			title: 'Updated title',
			level: 4,
		});

		component.onSubmit();

		expect(missionService.updateMission).toHaveBeenCalledWith(9, jasmine.anything());
		expect(capturedDto).toEqual(jasmine.objectContaining({ title: 'Updated title', level: 4 }));
		expect(toastService.createToast).toHaveBeenCalledWith('Mission updated successfully');
		expect(component.missionFormDialog?.nativeElement.close).toHaveBeenCalled();
		expect(reloadPageSpy).toHaveBeenCalled();
	});

	it('does not allow editing a started/completed mission', () => {
		const startedMission: Mission = {
			id: 10,
			title: 'Started',
			description: 'Started desc',
			location: 'Luskan',
			level: 1,
			recommendedComposition: [],
			potentialOutcomes: [
				{ tier: 'Critical Success', description: 'cs', reward: { gold: 1, reputation: 1 } },
				{ tier: 'Success', description: 's', reward: { gold: 1, reputation: 1 } },
				{ tier: 'Mixed', description: 'm', reward: { gold: 1, reputation: 1 } },
				{ tier: 'Failure', description: 'f', reward: { gold: 1, reputation: 1 } },
				{ tier: 'Critical Failure', description: 'cf', reward: { gold: 1, reputation: 1 } },
			],
			diceRoll: 42,
			finalComposition: [],
			finalOutcome: null,
			dispatchDate: null,
			completionDate: null,
		};

		fixture.componentRef.setInput('existingMission', startedMission);

		component.handleOpenForm();
		component.missionForm!.patchValue({ title: 'Try update' });

		component.onSubmit();

		expect(toastService.createToast).toHaveBeenCalledWith(
			'Mission has started/completed and cannot be edited',
			'error',
		);
		expect(missionService.updateMission).not.toHaveBeenCalled();
		expect(missionService.createMission).not.toHaveBeenCalled();
	});

	it('does nothing if the form is invalid', () => {
		component.handleOpenForm();
		component.missionForm!.patchValue({ title: '' });

		component.onSubmit();

		expect(missionService.createMission).not.toHaveBeenCalled();
		expect(missionService.updateMission).not.toHaveBeenCalled();
	});
});
