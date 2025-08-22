import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
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
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterCardComponent {
	character = input.required<Character>();
	isNavigationEnabled = input<boolean>(true);
	isSelected = input<boolean>(false);

	characterClicked = output<number>();

	get characterName(): string {
		return this.character().name.split(' ')[0];
	}

	get availability(): string {
		if (this.character().activeMission) {
			return 'var(--warning)';
		} else if (this.character().isAlive) {
			return 'var(--success)';
		}

		return 'var(--error)';
	}

	get navigationLink(): [string] | null {
		return this.isNavigationEnabled() ? ['/members/' + this.character().id] : null;
	}
}
