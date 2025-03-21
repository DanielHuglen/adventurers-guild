import { Component, OnInit } from '@angular/core';
import { CharacterCardComponent } from '../character-card/character-card.component';
import { CharacterService } from '../../services/character.service';
import { Character, GhostCharacter } from '../../shared/character-models';
import { take } from 'rxjs';

@Component({
  selector: 'app-members-deck',
  imports: [CharacterCardComponent],
  templateUrl: './members-deck.component.html',
  styleUrl: './members-deck.component.scss',
})
export class MembersDeckComponent implements OnInit {
  members: Character[] = Array.from({ length: 6 }, (_, index) => ({
    ...new GhostCharacter(),
    id: index + 1,
  }));

  constructor(private characterService: CharacterService) {}

  ngOnInit(): void {
    this.characterService
      .getMembers()
      .pipe(take(1))
      .subscribe((characters) => {
        this.members = characters;
      });
  }
}
