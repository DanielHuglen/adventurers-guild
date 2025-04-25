import { Component, OnDestroy, OnInit } from '@angular/core';
import { getMissionAvailability, Mission } from '../../../shared/mission-model';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs';
import { MissionCardComponent } from '../mission-card/mission-card.component';

@Component({
  selector: 'app-missions-deck',
  imports: [MissionCardComponent],
  templateUrl: './missions-deck.component.html',
  styleUrl: './missions-deck.component.scss',
})
export class MissionsDeckComponent implements OnInit, OnDestroy {
  missions: Mission[] = [];

  constructor(private route: ActivatedRoute) {
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
        };

        return (
          availabilityOrder[aAvailability] - availabilityOrder[bAvailability]
        );
      });

      this.missions = sortedMissions;
    });
  }

  ngOnInit(): void {
    window.onkeydown = (event: KeyboardEvent) => {
      // When both Ctrl and M are pressed, print all missions to the console
      if (event.ctrlKey && event.key === 'm') {
        console.log(JSON.stringify(this.missions, null, 2));
      }
    };
  }

  ngOnDestroy(): void {
    window.onkeydown = null;
  }
}
