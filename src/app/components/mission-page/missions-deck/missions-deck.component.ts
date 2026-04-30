import { ChangeDetectionStrategy, Component, signal, inject, computed } from '@angular/core';
import { Mission } from '../../../shared/mission-model';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { take } from 'rxjs';
import { MissionCardComponent } from '../mission-card/mission-card.component';
import { getMissionAvailability } from 'app/shared/mission-helper.service';
import { LoginService } from 'app/services/login.service';
import { AsyncPipe } from '@angular/common';
import { MissionFormComponent } from '../mission-form/mission-form.component';

@Component({
	selector: 'app-missions-deck',
	imports: [MissionCardComponent, MissionFormComponent, AsyncPipe, RouterModule],
	templateUrl: './missions-deck.component.html',
	styleUrl: './missions-deck.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MissionsDeckComponent {
	private route = inject(ActivatedRoute);
	private loginService = inject(LoginService);
	role = this.loginService.role;

	missions = signal<Mission[]>([]);
	incompleteMissions = computed(() =>
		this.missions().filter((mission) => getMissionAvailability(mission) !== 'Completed'),
	);
	completedMissions = computed(() =>
		this.missions().filter((mission) => getMissionAvailability(mission) === 'Completed'),
	);

	totalGoldEarned = computed(() =>
		this.completedMissions().reduce((total, mission) => {
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

	constructor() {
		this.route.data.pipe(take(1)).subscribe((data) => {
			const missions = data['missions'] as Mission[];
			if (!missions) {
				return;
			}

			const sortedMissions = missions.sort((a, b) => {
				const aAvailability = getMissionAvailability(a);
				const bAvailability = getMissionAvailability(b);

				// If availability is the same, sort by level
				if (aAvailability === bAvailability) {
					return a.level - b.level;
				}

				// Sort by availability order
				const availabilityOrder = {
					Available: 0,
					Active: 1,
					Completed: 2,
					Unavailable: 3,
				};

				return availabilityOrder[aAvailability] - availabilityOrder[bAvailability];
			});

			this.missions.set(sortedMissions);
		});
	}
}
