import { Component, input, output } from '@angular/core';
import { Character } from 'app/shared/character-models';
import { CharacterCardComponent } from '../character-card/character-card.component';

@Component({
	selector: 'app-member-selection',
	imports: [CharacterCardComponent],
	templateUrl: './member-selection.component.html',
	styleUrl: './member-selection.component.scss',
})
export class MemberSelectionComponent {
	members = input<Character[]>([]);

	updateSelectedMembers = output<number[]>();

	private selectedMembers: number[] = [];

	toggleSelect(memberId: number): void {
		if (this.selectedMembers.includes(memberId)) {
			this.selectedMembers = this.selectedMembers.filter((id) => id !== memberId);
		} else {
			this.selectedMembers.push(memberId);
		}

		this.updateSelectedMembers.emit(this.selectedMembers);
	}

	isSelected(memberId: number): boolean {
		return this.selectedMembers.includes(memberId);
	}
}
