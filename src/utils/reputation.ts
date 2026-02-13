import { CityReputation } from 'app/shared/api-models';
import { Mission } from 'app/shared/mission-model';

export function computeCityReputations(
	metaCityReputations: Record<string, number>,
	missions: Mission[],
	getCityKey: (city: string) => string,
): CityReputation[] {
	const reputationByCity = new Map<string, number>();

	Object.entries(metaCityReputations ?? {}).forEach(([city, reputation]) => {
		reputationByCity.set(city, reputation);
	});

	missions.forEach((mission) => {
		if (!mission.finalOutcome) {
			return;
		}
		const cityKey = getCityKey(mission.location);
		const reputationChange = mission.finalOutcome.reward.reputation ?? 0;
		reputationByCity.set(cityKey, (reputationByCity.get(cityKey) ?? 0) + reputationChange);
	});

	return Array.from(reputationByCity.entries()).map(([city, reputation]) => ({ city, reputation }));
}
