import { NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Character } from 'app/shared/character-models';
import { getCompositionText, getMissionAvailability } from 'app/shared/mission-helper.service';
import { Mission, OutcomeTier, Reward } from 'app/shared/mission-model';

@Component({
	selector: 'app-mission-details',
	imports: [NgStyle],
	templateUrl: './mission-details.component.html',
	styleUrl: './mission-details.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MissionDetailsComponent {
	mission = input.required<Mission>();
	dispatchedMembers = input<Character[]>([]);

	getMissionAvailability = getMissionAvailability;
	getCompositionText = getCompositionText;

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
	get adjustedGoldReward(): number {
		const goldReward = this.finalOutcomeReward?.gold;

		if (goldReward && goldReward >= 0) {
			const totalDispatchedMemberLevels = this.dispatchedMembers().reduce(
				(sum, member) => sum + Math.floor(member.experience / 10),
				0,
			);

			return goldReward - Math.floor(goldReward * totalDispatchedMemberLevels * 0.01);
		}

		return goldReward || 0;
	}

	getNumberOfClassInGroup(classGroup: string): number {
		return parseInt(classGroup.split(' ')[0]);
	}
	getClassName(classGroup: string): string {
		return classGroup.split(' ')[1];
	}
}
