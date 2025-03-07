import { ClassGroup } from './character-models';

export interface Mission {
  id: number;
  title: string;
  description: string;
  location: City;
  level: number;
  recommendedComposition: ClassGroup[];
  reward: Reward;
}

export interface Reward {
  gold: number;
  reputation: number;
}

export type City =
  | 'Waterdeep'
  | 'Neverwinter'
  | "Baldur's Gate"
  | 'Luskan'
  | 'Mirabar'
  | 'Silverymoon'
  | 'Piltover';
