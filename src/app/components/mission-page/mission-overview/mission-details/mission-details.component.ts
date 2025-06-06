import { NgStyle } from '@angular/common';
import { Component, input, OnInit } from '@angular/core';
import { MissionService } from 'app/services/mission.service';
import { Character } from 'app/shared/character-models';
import { getCompositionText, getMissionAvailability } from 'app/shared/mission-helper.service';
import { Mission, OutcomeTier, Reward } from 'app/shared/mission-model';

@Component({
	selector: 'app-mission-details',
	imports: [NgStyle],
	templateUrl: './mission-details.component.html',
	styleUrl: './mission-details.component.scss',
})
export class MissionDetailsComponent implements OnInit {
	mission = input.required<Mission>();

	getMissionAvailability = getMissionAvailability;
	getCompositionText = getCompositionText;

	dispatchedMembers: Character[] = [];

	get missionStatus(): string {
		const availability = getMissionAvailability(this.mission());

		switch (availability) {
			case 'Available':
				return 'var(--success)';
			case 'Active':
				return 'var(--warning)';
			case 'Completed':
				return 'var(--grey)';
			default:
				return 'var(--error)';
		}
	}

	get finalOutcomeStatus(): string {
		const outcome = this.mission().finalOutcome?.tier as OutcomeTier;

		switch (outcome) {
			case 'Critical Success':
				return 'var(--success)';
			case 'Success':
				return 'var(--success)';
			case 'Mixed':
				return 'var(--grey)';
			case 'Failure':
				return 'var(--error)';
			case 'Critical Failure':
				return 'var(--error)';
			default:
				return '';
		}
	}

	get successOutcomeReward(): Reward | undefined {
		return this.mission().potentialOutcomes.find((outcome) => outcome.tier === 'Success')?.reward;
	}
	get finalOutcomeReward(): Reward | undefined {
		return this.mission().finalOutcome?.reward;
	}

	constructor(private missionService: MissionService) {}

	ngOnInit(): void {
		if (this.getMissionAvailability(this.mission()) !== 'Available') {
			this.missionService.getDispatchedMembers(this.mission().id).subscribe((members) => {
				this.dispatchedMembers = members;
			});
		}
	}

	getNumberOfClassInGroup(classGroup: string): number {
		return parseInt(classGroup.split(' ')[0]);
	}
	getClassName(classGroup: string): string {
		return classGroup.split(' ')[1];
	}
}
