import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
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
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MembersDeckComponent {
	private route = inject(ActivatedRoute);

	@Input() members: Character[] = [];

	constructor() {
		this.route.data.pipe(take(1)).subscribe((data) => {
			this.members = data['members'] as Character[];
		});
	}
}
