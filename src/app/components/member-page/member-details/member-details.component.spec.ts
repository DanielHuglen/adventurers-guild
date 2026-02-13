import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { MemberDetailsComponent } from './member-details.component';
import { CharacterService } from 'app/services/character.service';
import { ToastService } from 'app/services/toast.service';
import { LoginService } from 'app/services/login.service';
import type { Character } from 'app/shared/character-models';

describe('MemberDetailsComponent (delete)', () => {
	let fixture: ComponentFixture<MemberDetailsComponent>;
	let component: MemberDetailsComponent;
	let characterService: jasmine.SpyObj<CharacterService>;
	let toastService: jasmine.SpyObj<ToastService>;
	let router: jasmine.SpyObj<Router>;

	beforeEach(async () => {
		characterService = jasmine.createSpyObj<CharacterService>('CharacterService', [
			'getMember',
			'deleteMember',
			'updateMemberBonus',
		]);
		toastService = jasmine.createSpyObj<ToastService>('ToastService', ['createToast']);
		router = jasmine.createSpyObj<Router>('Router', ['navigate']);

		const loginServiceStub = {
			role: new BehaviorSubject<'guest' | 'editor' | 'admin'>('admin'),
		} satisfies Partial<LoginService>;

		const member: Character = {
			id: 55,
			name: 'Test',
			description: 'Test member',
			imageUrl: 'x',
			class: 'Fighter',
			race: 'Human',
			age: 10,
			experience: 0,
			abilityScores: { strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0 },
			armorClass: 0,
			hitPoints: 0,
			speed: 0,
			savingThrows: [],
			languages: [],
			features: [],
			isAlive: true,
			hasBonus: false,
			activeMission: null,
			completedMissions: [],
			debt: 0,
		};

		characterService.getMember.and.returnValue(of(member));

		await TestBed.configureTestingModule({
			imports: [MemberDetailsComponent],
			providers: [
				{ provide: CharacterService, useValue: characterService },
				{ provide: ToastService, useValue: toastService },
				{ provide: Router, useValue: router },
				{ provide: LoginService, useValue: loginServiceStub },
				{
					provide: ActivatedRoute,
					useValue: {
						snapshot: {
							paramMap: {
								get: (key: string) => (key === 'id' ? '55' : null),
							},
						},
					},
				},
			],
		}).compileComponents();

		fixture = TestBed.createComponent(MemberDetailsComponent);
		component = fixture.componentInstance;
	});

	it('calls CharacterService.deleteMember and navigates when confirmed', () => {
		spyOn(window, 'confirm').and.returnValue(true);
		characterService.deleteMember.and.returnValue(of(void 0));

		component.deleteMember();

		expect(characterService.deleteMember).toHaveBeenCalledWith(55);
		expect(toastService.createToast).toHaveBeenCalledWith('Member deleted successfully', 'success');
		expect(router.navigate).toHaveBeenCalledWith(['/members']);
	});

	it('does not delete when confirmation is cancelled', () => {
		spyOn(window, 'confirm').and.returnValue(false);

		component.deleteMember();

		expect(characterService.deleteMember).not.toHaveBeenCalled();
		expect(router.navigate).not.toHaveBeenCalled();
	});
});
