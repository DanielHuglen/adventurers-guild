import { Component, input } from '@angular/core';
import { getMissionAvailability, Mission } from '../../../shared/mission-model';
import { NgStyle } from '@angular/common';
import { ClassGroup } from 'app/shared/character-models';

@Component({
  selector: 'app-mission-card',
  imports: [NgStyle],
  templateUrl: './mission-card.component.html',
  styleUrl: './mission-card.component.scss',
})
export class MissionCardComponent {
  mission = input.required<Mission>();
  private get successOutcome() {
    return this.mission().potentialOutcomes.find(
      (outcome) => outcome.tier === 'Success'
    );
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

    const tankRecommendations = recommendedComposition.filter(
      (rec) => rec === 'Tank'
    );
    const martialRecommendations = recommendedComposition.filter(
      (rec) => rec === 'Martial'
    );
    const magicRecommendations = recommendedComposition.filter(
      (rec) => rec === 'Magic'
    );
    const healerRecommendations = recommendedComposition.filter(
      (rec) => rec === 'Healer'
    );

    const roleRecommendationText = [];
    roleRecommendationText.push(this.getRoleText(tankRecommendations, 'Tank'));
    roleRecommendationText.push(
      this.getRoleText(martialRecommendations, 'Martial')
    );
    roleRecommendationText.push(
      this.getRoleText(magicRecommendations, 'Magic')
    );
    roleRecommendationText.push(
      this.getRoleText(healerRecommendations, 'Healer')
    );
    return roleRecommendationText.filter((text) => !!text).join(' 🞄 ');
  }

  get finalCompositionText(): string {
    const finalComposition = this.mission().finalComposition;
    if (!finalComposition?.length) {
      return '';
    }

    const finalTank = finalComposition.filter((rec) => rec === 'Tank');
    const finalMartial = finalComposition.filter((rec) => rec === 'Martial');
    const finalMagic = finalComposition.filter((rec) => rec === 'Magic');
    const finalHealer = finalComposition.filter((rec) => rec === 'Healer');

    const finalCompositionText = [];
    finalCompositionText.push(this.getRoleText(finalTank, 'Tank'));
    finalCompositionText.push(this.getRoleText(finalMartial, 'Martial'));
    finalCompositionText.push(this.getRoleText(finalMagic, 'Magic'));
    finalCompositionText.push(this.getRoleText(finalHealer, 'Healer'));
    return finalCompositionText.filter((text) => !!text).join(' 🞄 ');
  }

  private getRoleText(roles: ClassGroup[], role: string) {
    if (!roles?.length) {
      return '';
    }

    const recommendationCount = roles.length;
    const isPlural = recommendationCount > 1;
    const recommendationText = isPlural ? role + 's' : role;
    return `${recommendationCount} ${recommendationText}`;
  }
}
