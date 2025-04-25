import { Component, input } from '@angular/core';
import { Character } from '../../shared/character-models';
import { LevelPipe } from '../../shared/level.pipe';
import { ClassGroupPipe } from '../../shared/class-group.pipe';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-character-card',
  imports: [CommonModule, LevelPipe, ClassGroupPipe, RouterModule],
  templateUrl: './character-card.component.html',
  styleUrl: './character-card.component.scss',
})
export class CharacterCardComponent {
  character = input.required<Character>();

  get characterName(): string {
    return this.character().name.split(' ')[0];
  }

  get availability(): string {
    if (!!this.character().activeMission) {
      return 'var(--warning)';
    } else if (this.character().isAlive) {
      return 'var(--success)';
    }

    return 'var(--error)';
  }
}
