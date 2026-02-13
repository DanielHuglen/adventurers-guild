import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { CharacterCardComponent } from '../../character-card/character-card.component';
import { CharacterService } from '../../../services/character.service';
import { Character } from '../../../shared/character-models';
import { take } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { LoginService } from 'app/services/login.service';
import { MemberFormComponent } from '../member-form/member-form.component';
import { AsyncPipe } from '@angular/common';

@Component({
	selector: 'app-members-deck',
	imports: [CharacterCardComponent, MemberFormComponent, AsyncPipe],
	providers: [CharacterService],
	templateUrl: './members-deck.component.html',
	styleUrl: './members-deck.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MembersDeckComponent {
	private route = inject(ActivatedRoute);
	private loginService = inject(LoginService);
	role = this.loginService.role;

	@Input() members: Character[] = [];

	constructor() {
		this.route.data.pipe(take(1)).subscribe((data) => {
			this.members = data['members'] as Character[];
		});
	}
}
