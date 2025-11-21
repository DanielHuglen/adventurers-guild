import {
	AngularNodeAppEngine,
	createNodeRequestHandler,
	isMainModule,
	writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';

// Extend Express Request type to include userRole
declare module 'express-serve-static-core' {
	interface Request {
		userRole?: 'admin' | 'editor';
	}
}

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Character, classGroups } from './app/shared/character-models';
import { CharacterBonusUpdateResponse, CityReputation, CityReputationResponse } from './app/shared/api-models';
import { Mission } from 'app/shared/mission-model';
import cookieParser from 'cookie-parser';
import { MissionCalculationInputs } from 'utils/mission-calculation';
import { getMembersMatchingReccommendationsCount } from 'app/shared/mission-helper.service';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(cookieParser());

const fs = require('fs');

require('dotenv').config();
const ADMIN_PASSWORD = process.env['ADMIN_PASSWORD'] || 'your_admin_password';
const EDITOR_PASSWORD = process.env['EDITOR_PASSWORD'] || 'your_editor_password';

// Add endpoint to login. This should just check the password and return either success with the role or failure.
app.post('/api/login', express.json(), (req, res) => {
	const password = req.body.password;

	if (password === ADMIN_PASSWORD) {
		res.status(200).json({ role: 'admin' });
	} else if (password === EDITOR_PASSWORD) {
		res.status(200).json({ role: 'editor' });
	} else {
		res.status(403).json({ error: 'Forbidden' });
	}
});

// Add middleware to check for admin or editor access using cookies
app.use((req, res, next) => {
	// Allow all GET requests without authentication
	if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
		const password = JSON.parse(req.cookies['authInfo'] || '{}').apiPassword; // Extract password from cookie

		if (password === ADMIN_PASSWORD) {
			req.userRole = 'admin';
			return next();
		}
		if (password === EDITOR_PASSWORD) {
			req.userRole = 'editor';
			return next();
		}
		return res.status(403).json({ error: 'Forbidden' });
	}
	return next();
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/**', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */
// Members API

app.get('/api/members/available', (req, res) => {
	const adventurers = require(resolve('data', 'adventurers.json')) as Character[];
	const availableMembers = adventurers.filter((member: Character) => !member.activeMission && member.isAlive);
	res.status(200).json(availableMembers);
});

app.get('/api/members/ids', (req, res) => {
	const adventurers = require(resolve('data', 'adventurers.json'));
	res.json(adventurers.map((a: Character) => a.id));
});

app.get('/api/members/:id', (req, res) => {
	const id = +req.params.id;
	const adventurers = require(resolve('data', 'adventurers.json'));
	res.json(adventurers.find((a: Character) => a.id === id));
});

app.get('/api/members', (req, res) => {
	res.sendFile(resolve('data', 'adventurers.json'));
});

app.put('/api/members/:id/bonus', express.json(), (req, res) => {
	const id = +req.params.id;
	const hasBonus = req.body.hasBonus;
	const bonusDescription = req.body.bonusDescription;
	const debt = req.body.debt;

	const adventurers = require(resolve('data', 'adventurers.json'));
	const member = adventurers.find((a: Character) => a.id === id);
	member.hasBonus = hasBonus;
	member.bonusDescription = bonusDescription;
	member.debt = debt;
	fs.writeFileSync(resolve('data', 'adventurers.json'), JSON.stringify(adventurers, null, 2));

	res.status(200).json({
		message: 'Member updated successfully',
		character: member,
	} as CharacterBonusUpdateResponse);
});

// Missions API
app.get('/api/missions', (req, res) => {
	return res.sendFile(resolve('data', 'missions.json'));
});

app.get('/api/missions/:id', (req, res) => {
	const id = +req.params.id;
	const missions = require(resolve('data', 'missions.json'));
	res.json(missions.find((m: Mission) => m.id === id));
});

app.get('/api/missions/:id/dispatched-members', (req, res) => {
	const id = +req.params.id;
	const missions = require(resolve('data', 'missions.json'));

	const mission = missions.find((m: Mission) => m.id === id);
	if (!mission) {
		return res.status(404).json({ error: 'Mission not found' });
	}

	const members = require(resolve('data', 'adventurers.json')) as Character[];
	const dispatchedMembers = members.filter(
		(member: Character) => member.activeMission === id || member.completedMissions.includes(id)
	);

	return res.status(200).json(dispatchedMembers);
});

app.put('/api/missions/:id/dispatch-mission', express.json(), (req, res) => {
	const id = +req.params.id;
	const missions = require(resolve('data', 'missions.json')) as Mission[];
	const mission = missions.find((m: Mission) => m.id === id);

	if (!mission) {
		return res.status(404).json({ error: 'Mission not found' });
	}

	if (mission.finalComposition?.length) {
		return res.status(400).json({ error: 'Mission has already begun' });
	}

	const members = require(resolve('data', 'adventurers.json')) as Character[];
	const dispatchedMemberIds = req.body.dispatchedMemberIds as number[];
	const dispatchedMembers = members.filter((member: Character) => dispatchedMemberIds.includes(member.id));

	if (dispatchedMemberIds.length === 0) {
		return res.status(400).json({ error: 'No members dispatched' });
	}

	const availableMembers = members.filter((member: Character) => !member.activeMission && member.isAlive);
	if (!dispatchedMemberIds.every((id) => availableMembers.some((member) => member.id === id))) {
		return res.status(400).json({ error: 'Some members are not available for dispatch' });
	}

	if (req.body.diceRoll < 1 || req.body.diceRoll > 100) {
		return res.status(400).json({ error: 'Dice roll must be between 1 and 100' });
	}

	const currentDate = require(resolve('data', 'meta.json')).currentDate;
	if (!req.body.dispatchDate || new Date(req.body.dispatchDate).getTime() < new Date(currentDate).getTime()) {
		return res.status(400).json({ error: 'Dispatch date cannot be in the past' });
	}

	mission.finalComposition = dispatchedMembers.map((member: Character) => classGroups[member.class]);
	mission.diceRoll = req.body.diceRoll;
	mission.dispatchDate = new Date(req.body.dispatchDate);
	// Duration = level * 3 days
	const dispatchDate = new Date(mission.dispatchDate);
	const completionDate = new Date(dispatchDate);
	completionDate.setDate(completionDate.getDate() + mission.level * 3);
	mission.completionDate = completionDate;

	dispatchedMembers.forEach((member: Character) => {
		member.activeMission = id;
	});

	// Write updated members and missions back to the JSON files and return the updated mission
	fs.writeFileSync(resolve('data', 'adventurers.json'), JSON.stringify(members, null, 2));
	fs.writeFileSync(resolve('data', 'missions.json'), JSON.stringify(missions, null, 2));
	return res.status(200).json({
		message: 'Mission dispatched successfully',
		mission: {
			...mission,
			dispatchedMembers: dispatchedMembers.map((member: Character) => member.id),
		},
		dispatchedMembers: dispatchedMembers,
	});
});

// Meta API
app.get('/api/reputation', (req, res) => {
	let cityReputation: CityReputation[] = [];

	const meta = require(resolve('data', 'meta.json'));
	Object.keys(meta.cityReputations).forEach((city) => {
		cityReputation.push({ city, reputation: meta.cityReputations[city] });
	});

	const missions = require(resolve('data', 'missions.json')) as Mission[];
	missions.forEach((mission) => {
		if (mission.finalOutcome) {
			const location = mission.location;
			const reputationChange = mission.finalOutcome.reward.reputation;
			const existingCityRep = cityReputation.find((cr) => cr.city.toLowerCase() === location.toLowerCase());

			if (existingCityRep) {
				existingCityRep.reputation += reputationChange;
			} else {
				cityReputation.push({ city: location, reputation: reputationChange });
			}
		}
	});

	return res.status(200).json({ cityReputations: cityReputation } as CityReputationResponse);
});

app.get('/api/date', (req, res) => {
	const meta = require(resolve('data', 'meta.json'));
	const currentDate = new Date(meta.currentDate);
	res.status(200).json(currentDate);
});

app.post('/api/date', express.json(), (req, res) => {
	if (req.userRole !== 'admin') {
		return res.status(403).json({ error: 'Forbidden' });
	}

	const newDate = req.body.newDate;
	if (!newDate || isNaN(new Date(newDate).getTime())) {
		return res.status(400).json({ error: 'Invalid date' });
	}
	const meta = require(resolve('data', 'meta.json'));
	const currentDate = new Date(meta.currentDate);
	const adjustedDate = new Date(newDate);
	if (adjustedDate.getTime() < currentDate.getTime()) {
		return res.status(400).json({ error: 'New date cannot be in the past' });
	}

	const missions = require(resolve('data', 'missions.json')) as Mission[];
	const members = require(resolve('data', 'adventurers.json')) as Character[];
	const { calculateExperienceGain } = require('./utils/experience');
	const { evaluateMissionRoll } = require('./utils/mission-calculation');
	let completedMissionIds: number[] = [];

	// Complete any missions that ended before the new date
	missions.forEach((mission: Mission) => {
		if (mission.dispatchDate && !mission.finalOutcome) {
			const missionEndDate = new Date(mission.completionDate);
			if (missionEndDate.getTime() <= adjustedDate.getTime()) {
				completedMissionIds.push(mission.id);

				// Complete the mission
				const { level, recommendedComposition, finalComposition, diceRoll } = mission;
				const totalReputationInCity = missions
					.filter((m) => m.location === mission.location && m.finalOutcome)
					.reduce((sum, m) => sum + (m.finalOutcome?.reward.reputation || 0), 0);
				const dispatchedMembers = members.filter((member: Character) => member.activeMission === mission.id);
				const totalPartyLevel = dispatchedMembers.reduce((sum, member) => sum + Math.floor(member.experience / 10), 0);
				const averagePartyLevel = Math.floor(totalPartyLevel / dispatchedMembers.length);
				const totalBonus = dispatchedMembers.reduce((sum, member) => sum + (member.hasBonus ? 1 : 0), 0);
				const missionCalculationInputs = {
					LM: level,
					NM: recommendedComposition.length,
					Np: finalComposition?.length ?? 0,
					Lp: averagePartyLevel,
					Pp: getMembersMatchingReccommendationsCount(dispatchedMembers, recommendedComposition),
					R: totalReputationInCity,
					O: totalBonus,
				} as MissionCalculationInputs;

				const { outcome } = evaluateMissionRoll(diceRoll || 0, missionCalculationInputs);
				mission.finalOutcome = mission.potentialOutcomes.find((o) => o.tier === outcome) || null;

				// Update members accordingly, as well as grant them experience and remove any debt if the reward is higher than the cost
				dispatchedMembers.forEach((member: Character) => {
					// For simplicity, let's assume all members survive and gain experience based on mission outcome
					member.activeMission = null;
					member.completedMissions.push(mission.id);
					const experienceGained = calculateExperienceGain(member, mission);
					member.experience += experienceGained;

					// Remove debt if reward is higher than cost
					const goldReward = mission.finalOutcome?.reward.gold || 0;
					const memberDebt = member.debt || 0;
					if (goldReward > 0 && memberDebt > 0) {
						// Remove as much debt as possible, and add it to the gold reward
						const debtPaid = Math.min(goldReward, memberDebt);
						member.debt = memberDebt - debtPaid;
						mission.finalOutcome!.reward.gold = goldReward + debtPaid;
					}
				});
			}
		}
	});

	// TODO: Write updated members and missions back to the JSON files
	fs.writeFileSync(resolve('data', 'adventurers.json'), JSON.stringify(members, null, 2));
	fs.writeFileSync(resolve('data', 'missions.json'), JSON.stringify(missions, null, 2));

	// Update the current date in meta.json
	meta.currentDate = adjustedDate.toISOString().slice(0, 10);
	fs.writeFileSync(resolve('data', 'meta.json'), JSON.stringify(meta, null, 2));
	return res.status(200).json({ message: 'Date updated successfully', newDate: meta.currentDate, completedMissionIds });
});

/**
 * Serve static files from /browser
 */
app.use(
	express.static(browserDistFolder, {
		maxAge: '1y',
		index: false,
		redirect: false,
	})
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
	angularApp
		.handle(req)
		.then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
		.catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
	const port = Number(process.env['PORT']) || 4000;
	app.listen(port, '0.0.0.0', () => {
		console.log(`Node Express server listening on http://localhost:${port}`);
	});
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
