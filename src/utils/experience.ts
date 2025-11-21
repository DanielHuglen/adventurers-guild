// Utility function to calculate experience for a guild member after completing a mission
// A single experience point is awarded for each of the following criteria:
// - Agent level is two below or lower below mission level
// - Agent level is one below or lower mission level
// - Agent level is equal to or lower than mission level
// - Mission was a mixed result or better
// - Mission was a success or better
// - Mission was a critical success

import { Character } from 'app/shared/character-models';
import { Mission } from 'app/shared/mission-model';

export function calculateExperienceGain(member: Character, mission: Mission): number {
	if (!mission || !member) {
		throw new Error('Invalid data');
	}

	let experience = 0;
	const memberLevel = Math.floor(member.experience / 10);
	const missionLevel = mission.level;

	if (memberLevel <= missionLevel - 2) {
		experience += 1;
	}
	if (memberLevel <= missionLevel - 1) {
		experience += 1;
	}
	if (memberLevel <= missionLevel) {
		experience += 1;
	}
	if (['Mixed', 'Success', 'Critical Success'].includes(mission.finalOutcome?.tier || '')) {
		experience += 1;
	}
	if (['Success', 'Critical Success'].includes(mission.finalOutcome?.tier || '')) {
		experience += 1;
	}
	if (mission.finalOutcome?.tier === 'Critical Success') {
		experience += 1;
	}

	console.log(
		`Member ${member.name} (Level ${memberLevel}) gained ${experience} experience from mission "${mission.id}" (Level ${missionLevel}) with outcome "${mission.finalOutcome?.tier}"`,
	);

	return experience;
}
