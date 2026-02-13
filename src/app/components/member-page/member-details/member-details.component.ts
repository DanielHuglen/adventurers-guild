import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription, take } from 'rxjs';
import { CharacterService } from '../../../services/character.service';
import { CharacterBonusUpdateRequest } from '../../../shared/api-models';
import { Character } from '../../../shared/character-models';
import { ClassGroupPipe } from '../../../shared/class-group.pipe';
import { LevelPipe } from '../../../shared/level.pipe';
import { AbilityModifierPipe } from '../../../shared/ability-modifier.pipe';
import { DisableIfGuestDirective } from 'app/directives/disable-if-guest.directive';
import { ToastService } from 'app/services/toast.service';
import { LoginService } from 'app/services/login.service';
import { MemberFormComponent } from '../member-form/member-form.component';
import { AsyncPipe } from '@angular/common';

@Component({
	selector: 'app-member-details',
	imports: [
		ClassGroupPipe,
		LevelPipe,
		AsyncPipe,
		ReactiveFormsModule,
		AbilityModifierPipe,
		DisableIfGuestDirective,
		MemberFormComponent,
	],
	templateUrl: './member-details.component.html',
	styleUrl: './member-details.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberDetailsComponent implements OnInit, OnDestroy {
	private route = inject(ActivatedRoute);
	private router = inject(Router);
	private characterService = inject(CharacterService);
	private loginService = inject(LoginService);
	role = this.loginService.role;

	toastService = inject(ToastService);

	member = signal<Character | undefined>(undefined);
	memberId = 0;
	isEditing = false;
	isLoading = false;

	isModPreferred = signal(false);

	memberForm = new FormGroup({
		hasBonusControl: new FormControl(false),
		bonusDescriptionControl: new FormControl({ value: '', disabled: true }),
		debtControl: new FormControl(0),
	});
	get hasBonusControl(): FormControl {
		return this.memberForm.get('hasBonusControl') as FormControl;
	}
	get bonusDescriptionControl(): FormControl {
		return this.memberForm.get('bonusDescriptionControl') as FormControl;
	}
	get debtControl(): FormControl {
		return this.memberForm.get('debtControl') as FormControl;
	}

	subscription: Subscription = new Subscription();

	constructor() {
		const queryParameter = this.route.snapshot.paramMap.get('id');
		if (!!queryParameter && !isNaN(+queryParameter)) {
			this.memberId = +queryParameter;

			this.characterService.getMember(this.memberId).subscribe((member) => {
				this.member.set(member);
				this.prefillForm();
			});
		}
	}

	ngOnInit(): void {
		this.hasBonusControl.valueChanges.subscribe((hasBonus) => {
			if (hasBonus) this.bonusDescriptionControl.enable();
			else this.bonusDescriptionControl.disable();
		});
	}

	private prefillForm(): void {
		if (!this.member()) {
			return;
		}

		const { hasBonus, bonusDescription, debt } = this.member() as Character;
		this.hasBonusControl.setValue(hasBonus);
		if (hasBonus) this.bonusDescriptionControl.enable();
		this.bonusDescriptionControl.setValue(bonusDescription);
		this.debtControl.setValue(debt);
	}

	get separatedLanguages(): string {
		if (!this.member()?.languages?.length) {
			return 'None';
		}

		const { languages } = this.member() as Character;
		return [...languages].join(', ');
	}

	get separatedFeatures(): string {
		if (!this.member()?.features?.length) {
			return 'None';
		}

		const { features } = this.member() as Character;
		return features.join(', ');
	}

	get hasBonus(): boolean {
		return !!this.hasBonusControl.value;
	}

	submit(): void {
		this.isLoading = true;

		const updateRequest = {
			hasBonus: this.hasBonus,
			bonusDescription: this.bonusDescriptionControl.value,
			debt: this.debtControl.value,
		} as CharacterBonusUpdateRequest;

		this.characterService
			.updateMemberBonus(this.memberId, updateRequest)
			.pipe(take(1))
			.subscribe((response) => {
				this.member.set(response.character);
				this.isEditing = false;
				this.isLoading = false;
				this.toastService.createToast('Member bonus updated successfully', 'success');
			});
	}

	deleteMember(): void {
		if (confirm('Are you sure you want to delete this member?')) {
			this.characterService
				.deleteMember(this.memberId)
				.pipe(take(1))
				.subscribe(() => {
					this.toastService.createToast('Member deleted successfully', 'success');
					this.router.navigate(['/members']);
				});
		}
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}
}
