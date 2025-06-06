import { Component } from '@angular/core';
import { MissionDetailsComponent } from './mission-details/mission-details.component';
import { Mission } from 'app/shared/mission-model';
import { ActivatedRoute } from '@angular/router';
import { MissionService } from 'app/services/mission.service';

@Component({
	selector: 'app-mission-overview',
	imports: [MissionDetailsComponent],
	templateUrl: './mission-overview.component.html',
	styleUrl: './mission-overview.component.scss',
})
export class MissionOverviewComponent {
	mission: Mission | null = null;

	constructor(private route: ActivatedRoute, private missionService: MissionService) {
		const queryParameter = this.route.snapshot.paramMap.get('id');
		if (!!queryParameter && !isNaN(+queryParameter)) {
			this.missionService.getMission(+queryParameter).subscribe((mission) => {
				this.mission = mission;
			});
		}
	}
}
