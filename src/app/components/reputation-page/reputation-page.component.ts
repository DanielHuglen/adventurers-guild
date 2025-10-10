import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MetaService } from 'app/services/meta.service';
import { CityReputation } from 'app/shared/api-models';
import { getCityName } from 'app/shared/meta-helper.service';
import { CityVar } from 'app/shared/mission-model';
import { take } from 'rxjs';

@Component({
	selector: 'app-reputation-page',
	imports: [NgClass],
	templateUrl: './reputation-page.component.html',
	styleUrl: './reputation-page.component.scss',
})
export class ReputationPageComponent {
	metaService = inject(MetaService);

	cityReputations: CityReputation[] = [];
	showColours = true;

	constructor() {
		this.metaService
			.getReputation()
			.pipe(take(1))
			.subscribe((data) => {
				if (!data || !data.cityReputations) {
					return;
				}

				// TODO: Should this be a pipe?
				this.cityReputations = data.cityReputations.map((cr) => {
					const { city, reputation } = cr;
					return { city: getCityName(city as CityVar), reputation: reputation };
				});
			});
	}

	getReputationAttitude(reputation: number): string {
		if (!this.showColours) return 'indifferent';

		if (reputation >= 40) {
			return 'helpful';
		} else if (reputation >= 10) {
			return 'friendly';
		} else if (reputation >= -9) {
			return 'indifferent';
		} else if (reputation >= -39) {
			return 'unfriendly';
		} else {
			return 'hostile';
		}
	}
}
