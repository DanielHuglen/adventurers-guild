import { Component, OnDestroy, OnInit } from '@angular/core';
import { CharacterCardComponent } from '../../character-card/character-card.component';
import { CharacterService } from '../../../services/character.service';
import { Character } from '../../../shared/character-models';
import { take } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-members-deck',
  imports: [CharacterCardComponent],
  providers: [CharacterService],
  templateUrl: './members-deck.component.html',
  styleUrl: './members-deck.component.scss',
})
export class MembersDeckComponent implements OnInit, OnDestroy {
  members: Character[] = [];

  constructor(private route: ActivatedRoute) {
    this.route.data.pipe(take(1)).subscribe((data) => {
      this.members = data['members'] as Character[];
    });
  }

  ngOnInit(): void {
    window.onkeydown = (event: KeyboardEvent) => {
      // When both Ctrl and M are pressed, print all members to the console
      if (event.ctrlKey && event.key === 'm') {
        console.log(JSON.stringify(this.members, null, 2));
      }
    };
  }

  ngOnDestroy(): void {
    window.onkeydown = null;
  }
}
