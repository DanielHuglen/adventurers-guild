import { Component } from '@angular/core';
import { Mission } from '../../../shared/mission-model';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs';
import { MissionCardComponent } from '../mission-card/mission-card.component';

@Component({
  selector: 'app-missions-deck',
  imports: [MissionCardComponent],
  templateUrl: './missions-deck.component.html',
  styleUrl: './missions-deck.component.scss',
})
export class MissionsDeckComponent {
  missions: Mission[] = [];

  constructor(private route: ActivatedRoute) {
    this.route.data.pipe(take(1)).subscribe((data) => {
      this.missions = data['missions'] as Mission[];
    });
  }
}
