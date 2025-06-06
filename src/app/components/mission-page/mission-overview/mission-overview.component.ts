import { Component, signal } from '@angular/core';
import { MissionDetailsComponent } from './mission-details/mission-details.component';
import { Mission } from 'app/shared/mission-model';
import { ActivatedRoute } from '@angular/router';
import { MissionService } from 'app/services/mission.service';
import { Character } from 'app/shared/character-models';
import { MembersDeckComponent } from '../../member-page/members-deck/members-deck.component';

@Component({
	selector: 'app-mission-overview',
	imports: [MissionDetailsComponent, MembersDeckComponent],
	templateUrl: './mission-overview.component.html',
	styleUrl: './mission-overview.component.scss',
})
export class MissionOverviewComponent {
	mission: Mission | null = null;
	dispatchedMembers = signal<Character[]>([]);

	constructor(private route: ActivatedRoute, private missionService: MissionService) {
		const queryParameter = this.route.snapshot.paramMap.get('id');
		if (!!queryParameter && !isNaN(+queryParameter)) {
			this.missionService.getMission(+queryParameter).subscribe((mission) => {
				this.mission = mission;

				if (this.mission?.finalComposition?.length) {
					this.missionService.getDispatchedMembers(this.mission.id).subscribe((members) => {
						this.dispatchedMembers.set(members);
					});
				}
			});
		}
	}
}
