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
export class MembersDeckComponent {
	members: Character[] = [];

	constructor(private route: ActivatedRoute) {
		this.route.data.pipe(take(1)).subscribe((data) => {
			this.members = data['members'] as Character[];
		});
	}
}
