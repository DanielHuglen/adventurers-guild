export interface CharacterBonusUpdateRequest {
  hasBonus: boolean;
  bonusDescription: string;
  debt: number;
}

export interface CharacterBonusUpdateResponse {
  message: string;
}
