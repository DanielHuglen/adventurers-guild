import { Character, ClassGroup, classGroups } from './character-models';
import { Mission, MissionAvailability } from './mission-model';

export function getMembersMatchingReccommendationsCount(
	members: Character[],
	reccommendedComposition: ClassGroup[],
): number {
	const selectedTanks = members.filter((member) => classGroups[member.class] === 'Tank').length;
	const selectedMartials = members.filter((member) => classGroups[member.class] === 'Martial').length;
	const selectedMagics = members.filter((member) => classGroups[member.class] === 'Magic').length;
	const selectedHealers = members.filter((member) => classGroups[member.class] === 'Healer').length;

	const reccommendedTanks = reccommendedComposition?.filter((role) => role === 'Tank').length || 0;
	const reccommendedMartials = reccommendedComposition?.filter((role) => role === 'Martial').length || 0;
	const reccommendedMagics = reccommendedComposition?.filter((role) => role === 'Magic').length || 0;
	const reccommendedHealers = reccommendedComposition?.filter((role) => role === 'Healer').length || 0;

	const totalSelectedCountingTowardsReccommendations =
		Math.min(selectedTanks, reccommendedTanks) +
		Math.min(selectedMartials, reccommendedMartials) +
		Math.min(selectedMagics, reccommendedMagics) +
		Math.min(selectedHealers, reccommendedHealers);

	return Math.max(totalSelectedCountingTowardsReccommendations, 0);
}

export function getMissionAvailability(mission: Mission): MissionAvailability {
	if (!mission) {
		return 'Unavailable';
	}

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

function getRoleText(roles: ClassGroup[], role: string): string {
	if (!roles?.length) {
		return '';
	}

	const recommendationCount = roles.length;
	const isPlural = recommendationCount > 1;
	const recommendationText = isPlural ? role + 's' : role;
	return `${recommendationCount} ${recommendationText}`;
}
