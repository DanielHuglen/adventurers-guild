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
  members: Character[] = [
    {
      ...new GhostCharacter(),
      id: 1,
    },
    {
      ...new GhostCharacter(),
      id: 2,
    },
    {
      ...new GhostCharacter(),
      id: 3,
    },
    {
      ...new GhostCharacter(),
      id: 4,
    },
    {
      ...new GhostCharacter(),
      id: 5,
    },
    {
      ...new GhostCharacter(),
      id: 6,
    },
  ];

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
