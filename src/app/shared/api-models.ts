import { Character } from './character-models';

export interface CharacterBonusUpdateRequest {
  hasBonus: boolean;
  bonusDescription: string;
  debt: number;
}

export interface CharacterBonusUpdateResponse {
  message: string;
  character: Character;
}
