import { ClassGroup } from './character-models';
import { Mission, MissionAvailability } from './mission-model';

export function getMissionAvailability(mission: Mission): MissionAvailability {
	const { finalOutcome, diceRoll } = mission;

	if (finalOutcome) {
		return 'Completed';
	} else if (diceRoll) {
		return 'Active';
	} else {
		return 'Available';
	}
}

export function getCompositionText(composition: ClassGroup[]): string[] {
	const roles = ['Tank', 'Martial', 'Magic', 'Healer'];
	return roles
		.map((role) => {
			const filteredRoles = composition.filter((rec) => rec === role);
			return getRoleText(filteredRoles, role);
		})
		.filter((text) => !!text);
}

function getRoleText(roles: ClassGroup[], role: string) {
	if (!roles?.length) {
		return '';
	}

	const recommendationCount = roles.length;
	const isPlural = recommendationCount > 1;
	const recommendationText = isPlural ? role + 's' : role;
	return `${recommendationCount} ${recommendationText}`;
}
