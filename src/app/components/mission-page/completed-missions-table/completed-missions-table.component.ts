import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Mission } from '../../../shared/mission-model';

@Component({
	selector: 'app-completed-missions-table',
	imports: [RouterModule],
	templateUrl: './completed-missions-table.component.html',
	styleUrl: './completed-missions-table.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompletedMissionsTableComponent {
	missions = input.required<Mission[]>();

	totalGoldEarned = computed(() =>
		this.missions().reduce((total, mission) => {
			const outcome = mission.finalOutcome;
			if (outcome) {
				return total + outcome.reward.gold;
			}
			return total;
		}, 0),
	);

	copyToClipboard(text: string | undefined): void {
		if (!text) return;

		navigator.clipboard.writeText(text).catch((err) => {
			console.error('Failed to copy text: ', err);
		});
	}
}
