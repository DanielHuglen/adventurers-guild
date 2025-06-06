import { Component, input } from '@angular/core';
import { Mission } from '../../../shared/mission-model';
import { NgStyle } from '@angular/common';
import { RouterModule } from '@angular/router';
import { getCompositionText, getMissionAvailability } from 'app/shared/mission-helper.service';

@Component({
	selector: 'app-mission-card',
	imports: [NgStyle, RouterModule],
	templateUrl: './mission-card.component.html',
	styleUrl: './mission-card.component.scss',
})
export class MissionCardComponent {
	mission = input.required<Mission>();
	private get successOutcome() {
		return this.mission().potentialOutcomes.find((outcome) => outcome.tier === 'Success');
	}
	private get finalOutcome() {
		return this.mission().finalOutcome;
	}

	get status(): string {
		const availability = getMissionAvailability(this.mission());

		switch (availability) {
			case 'Available':
				return 'var(--success)';
			case 'Active':
				return 'var(--warning)';
			case 'Completed':
				return 'var(--grey-dark)';
			default:
				return 'var(--error)';
		}
	}

	get level(): string {
		return `Level  ${this.mission().level.toString()}`;
	}
	get gold(): string {
		let goldReward = 0;
		if (this.finalOutcome) {
			goldReward = this.finalOutcome.reward.gold;
		} else if (this.successOutcome) {
			goldReward = this.successOutcome.reward.gold;
		}
		return `${goldReward.toString()} Gold`;
	}

	get recommendationText(): string {
		const recommendedComposition = this.mission().recommendedComposition;
		return getCompositionText(recommendedComposition).join(' 🞄 ');
	}

	get finalCompositionText(): string {
		const finalComposition = this.mission().finalComposition;
		if (!finalComposition?.length) {
			return '';
		}
		return getCompositionText(finalComposition).join(' 🞄 ');
	}
}
