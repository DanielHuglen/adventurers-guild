import { Component, signal, OnInit, inject } from '@angular/core';
import { MissionDetailsComponent } from './mission-details/mission-details.component';
import { Mission } from 'app/shared/mission-model';
import { ActivatedRoute } from '@angular/router';
import { MissionService } from 'app/services/mission.service';
import { Character } from 'app/shared/character-models';
import { MembersDeckComponent } from '../../member-page/members-deck/members-deck.component';
import { getMembersMatchingReccommendationsCount, getMissionAvailability } from 'app/shared/mission-helper.service';
import { MemberSelectionComponent } from 'app/components/member-selection/member-selection.component';
import { CharacterService } from 'app/services/character.service';
import { take } from 'rxjs';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MetaService } from 'app/services/meta.service';
import { DispatchMissionRequest } from 'app/shared/api-models';
import { LoginService } from 'app/services/login.service';
import { AsyncPipe } from '@angular/common';

@Component({
	selector: 'app-mission-overview',
	imports: [MissionDetailsComponent, MembersDeckComponent, MemberSelectionComponent, ReactiveFormsModule, AsyncPipe],
	templateUrl: './mission-overview.component.html',
	styleUrl: './mission-overview.component.scss',
})
export class MissionOverviewComponent implements OnInit {
	loginService = inject(LoginService);

	getMissionAvailability = getMissionAvailability;

	mission: Mission | null = null;
	dispatchedMembers = signal<Character[]>([]);
	availableMembers = signal<Character[]>([]);
	selectedMemberIds: number[] = [];
	diceRoll = new FormControl(0, [Validators.min(1), Validators.max(100)]);
	dispatchDate = new FormControl('', [Validators.required]);
	currentDate = new Date('1497-03-13T12:00:00Z').toISOString().slice(0, 10);
	isSubmitting = signal<boolean>(false);

	constructor(
		private route: ActivatedRoute,
		private missionService: MissionService,
		private characterService: CharacterService,
		private metaService: MetaService
	) {
		const queryParameter = this.route.snapshot.paramMap.get('id');
		if (!!queryParameter && !isNaN(+queryParameter)) {
			this.missionService
				.getMission(+queryParameter)
				.pipe(take(1))
				.subscribe((mission) => {
					this.mission = mission;

					if (this.mission?.finalComposition?.length) {
						this.missionService
							.getDispatchedMembers(this.mission.id)
							.pipe(take(1))
							.subscribe((members) => {
								this.dispatchedMembers.set(members);
							});
					} else {
						this.characterService
							.getAvailableMembers()
							.pipe(take(1))
							.subscribe((members) => {
								this.availableMembers.set(members);
							});
					}
				});
		}
	}

	ngOnInit(): void {
		this.metaService
			.getCurrentDate()
			.pipe(take(1))
			.subscribe((date) => {
				if (date) {
					this.currentDate = new Date(date).toISOString().slice(0, 10);

					if (this.dispatchDate.pristine) {
						this.dispatchDate.setValue(this.currentDate);
					}
				}
			});
	}

	get selectedMembers(): Character[] {
		return this.availableMembers().filter((member) => this.selectedMemberIds.includes(member.id));
	}

	get selectedMembersMatchingReccommendationsCount(): number {
		return getMembersMatchingReccommendationsCount(this.selectedMembers, this.mission?.recommendedComposition || []);
	}

	get canSubmit(): boolean {
		return this.selectedMemberIds.length > 0 && this.diceRoll.valid && this.dispatchDate.valid && !this.isSubmitting();
	}

	submit(): boolean {
		if (!this.canSubmit || !this.mission?.id) return false;

		this.isSubmitting.set(true);

		const dispatchMissionRequest = {
			dispatchedMemberIds: this.selectedMemberIds,
			diceRoll: this.diceRoll.value || 0,
			dispatchDate: this.dispatchDate.value || '',
		} as DispatchMissionRequest;

		this.missionService
			.dispatchMission(this.mission.id, dispatchMissionRequest)
			.pipe(take(1))
			.subscribe({
				next: (response) => {
					this.mission = response.mission;
					this.dispatchedMembers.set(response.dispatchedMembers);
					this.selectedMemberIds = [];
					this.diceRoll.reset();
					this.dispatchDate.reset();
				},
				error: (error) => {
					console.error('Error dispatching mission:', error);
				},
				complete: () => {
					this.isSubmitting.set(false);
				},
			});

		return false; // Prevent default form submission
	}
}
