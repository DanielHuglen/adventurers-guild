import { Mission } from 'app/shared/mission-model';
import { computeCityReputations } from './reputation';

describe('computeCityReputations', () => {
	it('aggregates mission reputation (including negatives) onto meta city keys', () => {
		const meta = { neverwinter: 40, baldursGate: 0 };
		const missions: Mission[] = [
			{
				id: 1,
				title: '',
				description: '',
				location: "Baldur's Gate",
				level: 1,
				recommendedComposition: [],
				potentialOutcomes: [] as any,
				diceRoll: 10,
				finalComposition: [],
				finalOutcome: { tier: 'Failure', description: '', reward: { gold: 0, reputation: -15 } },
				dispatchDate: new Date(),
				completionDate: new Date(),
			},
		];

		const result = computeCityReputations(meta, missions, (city) => {
			if (city === "Baldur's Gate") return 'baldursGate';
			return city.toLowerCase();
		});

		const repByCity = new Map(result.map((r) => [r.city, r.reputation] as const));
		expect(repByCity.get('baldursGate')).toBe(-15);
		expect(repByCity.get('neverwinter')).toBe(40);
	});
});
