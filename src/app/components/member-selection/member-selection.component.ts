import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Character } from 'app/shared/character-models';
import { CharacterCardComponent } from '../character-card/character-card.component';
import { getClassGroupFromCharacterClass } from 'app/shared/character-helper.service';
import { NgClass } from '@angular/common';

const SORTING_TYPES = ['NameAsc', 'NameDesc', 'LevelAsc', 'LevelDesc', 'ClassAsc', 'ClassDesc', 'None'] as const;
type SortingType = (typeof SORTING_TYPES)[number];

const SORTING_STORAGE_KEY = 'member-selection-sorting';

@Component({
	selector: 'app-member-selection',
	imports: [CharacterCardComponent, NgClass],
	templateUrl: './member-selection.component.html',
	styleUrl: './member-selection.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberSelectionComponent {
	members = input<Character[]>([]);

	updateSelectedMembers = output<number[]>();

	private _sortingType: SortingType = this.loadSortingType();

	get sortingType(): SortingType {
		return this._sortingType;
	}

	set sortingType(sortingType: SortingType) {
		this._sortingType = sortingType;
		localStorage.setItem(SORTING_STORAGE_KEY, sortingType);
	}

	private selectedMembers: number[] = [];

	private loadSortingType(): SortingType {
		const stored = localStorage.getItem(SORTING_STORAGE_KEY);
		return stored && (SORTING_TYPES as readonly string[]).includes(stored) ? (stored as SortingType) : 'ClassAsc';
	}

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

	isActiveSort(sortBy: 'Name' | 'Level' | 'Class'): boolean {
		return this.sortingType.includes(sortBy);
	}
	isReverseActiveSort(sortBy: 'Name' | 'Level' | 'Class'): boolean {
		return this.sortingType === sortBy + 'Desc';
	}

	sortMembers(sortBy: 'Name' | 'Level' | 'Class' | 'Reset'): void {
		if (sortBy === 'Reset') {
			this.sortingType = 'None';
			return;
		}

		if (this.sortingType.includes(sortBy)) {
			this.sortingType = this.sortingType.endsWith('Asc')
				? ((sortBy + 'Desc') as SortingType)
				: ((sortBy + 'Asc') as SortingType);
		} else {
			this.sortingType = (sortBy + 'Asc') as SortingType;
		}
	}

	get sortedMembers(): Character[] {
		switch (this.sortingType) {
			case 'NameAsc':
				return [...this.members()].sort((a, b) => a.name.localeCompare(b.name));
			case 'NameDesc':
				return [...this.members()].sort((a, b) => b.name.localeCompare(a.name));
			case 'LevelAsc':
				return [...this.members()].sort((a, b) => a.experience - b.experience);
			case 'LevelDesc':
				return [...this.members()].sort((a, b) => b.experience - a.experience);
			case 'ClassAsc':
				return [...this.members()].sort((a, b) =>
					getClassGroupFromCharacterClass(a.class).localeCompare(getClassGroupFromCharacterClass(b.class)),
				);
			case 'ClassDesc':
				return [...this.members()].sort((a, b) =>
					getClassGroupFromCharacterClass(b.class).localeCompare(getClassGroupFromCharacterClass(a.class)),
				);
			case 'None':
				return this.members();
		}
	}
}
