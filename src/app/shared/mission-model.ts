import { ClassGroup } from './character-models';

export interface Mission {
  id: number;
  title: string;
  description: string;
  location: City;
  level: number; // Duration = level * 3 days
  recommendedComposition: ClassGroup[];
  potentialOutcomes: PotentialOutcomes<Outcome>;
  diceRoll: number; // 1d100
  finalComposition: ClassGroup[];
  finalOutcome: Outcome;
  dispatchDate: Date;
  completionDate: Date;
}

type PotentialOutcomes<Outcome> = [Outcome, Outcome, Outcome, Outcome, Outcome];

interface Outcome {
  tier: OutcomeTier;
  description: string;
  reward: Reward;
}

export interface Reward {
  gold: number;
  reputation: number;
}

export type OutcomeTier =
  | 'Critical Success'
  | 'Success'
  | 'Mixed'
  | 'Failure'
  | 'Critical Failure';

export type City =
  | 'Waterdeep'
  | 'Neverwinter'
  | "Baldur's Gate"
  | 'Luskan'
  | 'Mirabar'
  | 'Silverymoon'
  | 'Piltover';
