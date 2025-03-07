import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Character } from '../../shared/character-models';
import { CharacterService } from '../../services/character.service';

@Component({
  selector: 'app-member-details',
  imports: [],
  templateUrl: './member-details.component.html',
  styleUrl: './member-details.component.scss',
})
export class MemberDetailsComponent {
  member: Character | undefined;
  memberId = 0;

  constructor(
    private route: ActivatedRoute,
    private characterService: CharacterService
  ) {
    const queryParameter = this.route.snapshot.paramMap.get('id');
    if (!!queryParameter && !isNaN(+queryParameter)) {
      this.memberId = +queryParameter;

      this.characterService.getMember(this.memberId).subscribe((member) => {
        this.member = member;
      });
    }
  }
}
