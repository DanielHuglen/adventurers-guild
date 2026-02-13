import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { MissionDetailsComponent } from './mission-details.component';
import { MissionService } from 'app/services/mission.service';
import { ToastService } from 'app/services/toast.service';
import { LoginService } from 'app/services/login.service';
import type { Mission } from 'app/shared/mission-model';

describe('MissionDetailsComponent (delete)', () => {
	let fixture: ComponentFixture<MissionDetailsComponent>;
	let component: MissionDetailsComponent;
	let missionService: jasmine.SpyObj<MissionService>;
	let toastService: jasmine.SpyObj<ToastService>;
	let router: jasmine.SpyObj<Router>;

	beforeEach(async () => {
		missionService = jasmine.createSpyObj<MissionService>('MissionService', ['deleteMission']);
		toastService = jasmine.createSpyObj<ToastService>('ToastService', ['createToast']);
		router = jasmine.createSpyObj<Router>('Router', ['navigate']);

		const loginServiceStub = {
			role: new BehaviorSubject<'guest' | 'editor' | 'admin'>('admin'),
		} satisfies Partial<LoginService>;

		await TestBed.configureTestingModule({
			imports: [MissionDetailsComponent],
			providers: [
				{ provide: MissionService, useValue: missionService },
				{ provide: ToastService, useValue: toastService },
				{ provide: Router, useValue: router },
				{ provide: LoginService, useValue: loginServiceStub },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(MissionDetailsComponent);
		component = fixture.componentInstance;
	});

	it('deletes an available mission when confirmed', () => {
		spyOn(window, 'confirm').and.returnValue(true);
		missionService.deleteMission.and.returnValue(of(void 0));

		const availableMission: Mission = {
			id: 101,
			title: 'Test',
			description: 'Test',
			location: 'Waterdeep',
			level: 1,
			recommendedComposition: [],
			potentialOutcomes: [
				{ tier: 'Critical Success', description: 'cs', reward: { gold: 0, reputation: 0 } },
				{ tier: 'Success', description: 's', reward: { gold: 0, reputation: 0 } },
				{ tier: 'Mixed', description: 'm', reward: { gold: 0, reputation: 0 } },
				{ tier: 'Failure', description: 'f', reward: { gold: 0, reputation: 0 } },
				{ tier: 'Critical Failure', description: 'cf', reward: { gold: 0, reputation: 0 } },
			],
			diceRoll: null,
			finalComposition: [],
			finalOutcome: null,
			dispatchDate: null,
			completionDate: null,
		};

		fixture.componentRef.setInput('mission', availableMission);

		component.deleteMission();

		expect(missionService.deleteMission).toHaveBeenCalledWith(101);
		expect(toastService.createToast).toHaveBeenCalledWith('Mission deleted successfully', 'success');
		expect(router.navigate).toHaveBeenCalledWith(['/missions']);
	});

	it('does not delete if mission is active/completed', () => {
		const activeMission: Mission = {
			id: 202,
			title: 'Active',
			description: 'Active',
			location: 'Luskan',
			level: 1,
			recommendedComposition: [],
			potentialOutcomes: [
				{ tier: 'Critical Success', description: 'cs', reward: { gold: 0, reputation: 0 } },
				{ tier: 'Success', description: 's', reward: { gold: 0, reputation: 0 } },
				{ tier: 'Mixed', description: 'm', reward: { gold: 0, reputation: 0 } },
				{ tier: 'Failure', description: 'f', reward: { gold: 0, reputation: 0 } },
				{ tier: 'Critical Failure', description: 'cf', reward: { gold: 0, reputation: 0 } },
			],
			diceRoll: 12,
			finalComposition: [],
			finalOutcome: null,
			dispatchDate: null,
			completionDate: null,
		};

		fixture.componentRef.setInput('mission', activeMission);

		component.deleteMission();

		expect(toastService.createToast).toHaveBeenCalledWith(
			'Mission has started/completed and cannot be deleted',
			'error',
		);
		expect(missionService.deleteMission).not.toHaveBeenCalled();
		expect(router.navigate).not.toHaveBeenCalled();
	});

	it('does not delete when confirmation is cancelled', () => {
		spyOn(window, 'confirm').and.returnValue(false);
		missionService.deleteMission.and.returnValue(of(void 0));

		const availableMission: Mission = {
			id: 303,
			title: 'Test',
			description: 'Test',
			location: 'Waterdeep',
			level: 1,
			recommendedComposition: [],
			potentialOutcomes: [
				{ tier: 'Critical Success', description: 'cs', reward: { gold: 0, reputation: 0 } },
				{ tier: 'Success', description: 's', reward: { gold: 0, reputation: 0 } },
				{ tier: 'Mixed', description: 'm', reward: { gold: 0, reputation: 0 } },
				{ tier: 'Failure', description: 'f', reward: { gold: 0, reputation: 0 } },
				{ tier: 'Critical Failure', description: 'cf', reward: { gold: 0, reputation: 0 } },
			],
			diceRoll: null,
			finalComposition: [],
			finalOutcome: null,
			dispatchDate: null,
			completionDate: null,
		};

		fixture.componentRef.setInput('mission', availableMission);

		component.deleteMission();

		expect(missionService.deleteMission).not.toHaveBeenCalled();
		expect(router.navigate).not.toHaveBeenCalled();
	});
});
