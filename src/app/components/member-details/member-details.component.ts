import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Character } from '../../shared/character-models';
import { CharacterService } from '../../services/character.service';
import { ClassGroupPipe } from '../../shared/class-group.pipe';
import { LevelPipe } from '../../shared/level.pipe';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { CharacterBonusUpdateRequest } from '../../shared/api-models';

@Component({
  selector: 'app-member-details',
  imports: [ClassGroupPipe, LevelPipe, ReactiveFormsModule],
  templateUrl: './member-details.component.html',
  styleUrl: './member-details.component.scss',
})
export class MemberDetailsComponent {
  member: Character | undefined;
  memberId = 0;

  memberForm = new FormGroup({
    hasBonusControl: new FormControl(false),
    bonusDescriptionControl: new FormControl({ value: '', disabled: true }),
    debtControl: new FormControl(0),
  });
  get hasBonusControl(): FormControl {
    return this.memberForm.get('hasBonusControl') as FormControl;
  }
  get bonusDescriptionControl(): FormControl {
    return this.memberForm.get('bonusDescriptionControl') as FormControl;
  }
  get debtControl(): FormControl {
    return this.memberForm.get('debtControl') as FormControl;
  }

  constructor(
    private route: ActivatedRoute,
    private characterService: CharacterService
  ) {
    const queryParameter = this.route.snapshot.paramMap.get('id');
    if (!!queryParameter && !isNaN(+queryParameter)) {
      this.memberId = +queryParameter;

      // TODO: Unsubscribe
      this.characterService.getMember(this.memberId).subscribe((member) => {
        this.member = member;
        this.prefillForm();
      });
    }
  }

  ngOnInit(): void {
    this.hasBonusControl.valueChanges.subscribe((hasBonus) => {
      hasBonus
        ? this.bonusDescriptionControl.enable()
        : this.bonusDescriptionControl.disable();
    });
  }

  private prefillForm(): void {
    if (!this.member) {
      return;
    }

    const { hasBonus, bonusDescription, debt } = this.member;
    this.hasBonusControl.setValue(hasBonus);
    this.bonusDescriptionControl.setValue(bonusDescription);
    this.debtControl.setValue(debt);
  }

  get separatedLanguages(): string {
    if (!this.member?.languages?.length) {
      return 'None';
    }

    return [...this.member.languages].join(', ');
  }

  get separatedFeatures(): string {
    if (!this.member?.features?.length) {
      return 'None';
    }

    return this.member.features.join(', ');
  }

  get hasBonus(): boolean {
    return !!this.hasBonusControl.value;
  }

  submit(): void {
    const updateRequest = {
      hasBonus: this.hasBonus,
      bonusDescription: this.bonusDescriptionControl.value,
      debt: this.debtControl.value,
    } as CharacterBonusUpdateRequest;

    this.characterService
      .updateMemberBonus(this.memberId, updateRequest)
      .pipe(take(1))
      .subscribe();
  }
}
