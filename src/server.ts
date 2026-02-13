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
import { completeMissionsUpToDate, getCityReputationKey } from './utils/mission-completion';
import { computeCityReputations } from 'utils/reputation';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(cookieParser());

const fs = require('fs') as typeof import('node:fs');

function readJsonFile<T>(filePath: string): T {
	return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

function writeJsonFile(filePath: string, data: unknown): void {
	fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

const ADVENTURERS_FILE_PATH = resolve('data', 'adventurers.json');
const MISSIONS_FILE_PATH = resolve('data', 'missions.json');
const META_FILE_PATH = resolve('data', 'meta.json');

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
	const adventurers = readJsonFile<Character[]>(ADVENTURERS_FILE_PATH);
	const availableMembers = adventurers.filter((member: Character) => !member.activeMission && member.isAlive);
	res.status(200).json(availableMembers);
});

app.get('/api/members/ids', (req, res) => {
	const adventurers = readJsonFile<Character[]>(ADVENTURERS_FILE_PATH);
	res.json(adventurers.map((a: Character) => a.id));
});

app.get('/api/members/:id', (req, res) => {
	const id = +req.params.id;
	const adventurers = readJsonFile<Character[]>(ADVENTURERS_FILE_PATH);
	res.json(adventurers.find((a: Character) => a.id === id));
});

app.get('/api/members', (req, res) => {
	res.sendFile(ADVENTURERS_FILE_PATH);
});

app.put('/api/members/:id/bonus', express.json(), (req, res) => {
	const id = +req.params.id;
	const hasBonus = req.body.hasBonus;
	const bonusDescription = req.body.bonusDescription;
	const debt = req.body.debt;

	const adventurers = readJsonFile<Character[]>(ADVENTURERS_FILE_PATH);
	const member = adventurers.find((a: Character) => a.id === id);
	if (!member) {
		return res.status(404).json({ error: 'Member not found' });
	}
	member.hasBonus = hasBonus;
	member.bonusDescription = bonusDescription;
	member.debt = debt;
	writeJsonFile(ADVENTURERS_FILE_PATH, adventurers);

	return res.status(200).json({
		message: 'Member updated successfully',
		character: member,
	} as CharacterBonusUpdateResponse);
});

app.post('/api/members', express.json(), (req, res) => {
	if (req.userRole !== 'admin') {
		return res.status(403).json({ error: 'Forbidden' });
	}

	const newMemberData = req.body as Omit<Character, 'id'>;
	const adventurers = readJsonFile<Character[]>(ADVENTURERS_FILE_PATH);
	const newId = Math.max(...adventurers.map((a: Character) => a.id)) + 1;
	const newMember: Character = { id: newId, ...newMemberData };
	adventurers.push(newMember);
	writeJsonFile(ADVENTURERS_FILE_PATH, adventurers);
	return res.status(201).json(newMember);
});

app.put('/api/members/:id', express.json(), (req, res) => {
	if (req.userRole !== 'admin') {
		return res.status(403).json({ error: 'Forbidden' });
	}

	const id = +req.params.id;
	const updatedMemberData = req.body as Omit<Character, 'id'>;

	const adventurers = readJsonFile<Character[]>(ADVENTURERS_FILE_PATH);
	const memberIndex = adventurers.findIndex((a: Character) => a.id === id);
	if (memberIndex === -1) {
		return res.status(404).json({ error: 'Member not found' });
	}

	const { hasBonus, activeMission, completedMissions } = adventurers[memberIndex];
	const updatedMember: Character = { id, ...updatedMemberData, hasBonus, activeMission, completedMissions };
	adventurers[memberIndex] = updatedMember;
	writeJsonFile(ADVENTURERS_FILE_PATH, adventurers);
	return res.status(200).json(updatedMember);
});

app.delete('/api/members/:id', (req, res) => {
	if (req.userRole !== 'admin') {
		return res.status(403).json({ error: 'Forbidden' });
	}

	const id = +req.params.id;
	const adventurers = readJsonFile<Character[]>(ADVENTURERS_FILE_PATH);
	const updatedAdventurers = adventurers.filter((a: Character) => a.id !== id);
	writeJsonFile(ADVENTURERS_FILE_PATH, updatedAdventurers);
	return res.status(204).send();
});

// Missions API
app.get('/api/missions', (req, res) => {
	return res.sendFile(MISSIONS_FILE_PATH);
});

app.get('/api/missions/:id', (req, res) => {
	const id = +req.params.id;
	const missions = readJsonFile<Mission[]>(MISSIONS_FILE_PATH);
	res.json(missions.find((m: Mission) => m.id === id));
});

app.get('/api/missions/:id/dispatched-members', (req, res) => {
	const id = +req.params.id;
	const missions = readJsonFile<Mission[]>(MISSIONS_FILE_PATH);

	const mission = missions.find((m: Mission) => m.id === id);
	if (!mission) {
		return res.status(404).json({ error: 'Mission not found' });
	}

	const members = readJsonFile<Character[]>(ADVENTURERS_FILE_PATH);
	const dispatchedMembers = members.filter(
		(member: Character) => member.activeMission === id || member.completedMissions.includes(id),
	);

	return res.status(200).json(dispatchedMembers);
});

app.post('/api/missions', express.json(), (req, res) => {
	if (req.userRole !== 'admin') {
		return res.status(403).json({ error: 'Forbidden' });
	}

	const missions = readJsonFile<Mission[]>(MISSIONS_FILE_PATH);
	const newId = missions.length ? Math.max(...missions.map((m: Mission) => m.id)) + 1 : 1;

	const body = req.body as Partial<Mission>;
	if (
		!body.title ||
		!body.description ||
		!body.location ||
		!body.level ||
		!body.recommendedComposition ||
		!body.potentialOutcomes
	) {
		return res.status(400).json({ error: 'Invalid mission data' });
	}

	const newMission: Mission = {
		id: newId,
		title: body.title,
		description: body.description,
		location: body.location,
		level: body.level,
		recommendedComposition: body.recommendedComposition,
		potentialOutcomes: body.potentialOutcomes,
		diceRoll: null,
		finalComposition: [],
		finalOutcome: null,
		dispatchDate: null,
		completionDate: null,
	};

	missions.push(newMission);
	writeJsonFile(MISSIONS_FILE_PATH, missions);
	return res.status(201).json(newMission);
});

app.put('/api/missions/:id', express.json(), (req, res) => {
	if (req.userRole !== 'admin') {
		return res.status(403).json({ error: 'Forbidden' });
	}

	const id = +req.params.id;
	const missions = readJsonFile<Mission[]>(MISSIONS_FILE_PATH);
	const missionIndex = missions.findIndex((m: Mission) => m.id === id);
	if (missionIndex === -1) {
		return res.status(404).json({ error: 'Mission not found' });
	}

	const existingMission = missions[missionIndex];
	if (existingMission.finalOutcome || existingMission.diceRoll) {
		return res.status(400).json({ error: 'Mission has started or completed and cannot be edited' });
	}

	const body = req.body as Partial<Mission>;
	if (
		!body.title ||
		!body.description ||
		!body.location ||
		!body.level ||
		!body.recommendedComposition ||
		!body.potentialOutcomes
	) {
		return res.status(400).json({ error: 'Invalid mission data' });
	}

	const updatedMission: Mission = {
		...existingMission,
		title: body.title,
		description: body.description,
		location: body.location,
		level: body.level,
		recommendedComposition: body.recommendedComposition,
		potentialOutcomes: body.potentialOutcomes,
	};

	missions[missionIndex] = updatedMission;
	writeJsonFile(MISSIONS_FILE_PATH, missions);
	return res.status(200).json(updatedMission);
});

app.delete('/api/missions/:id', (req, res) => {
	if (req.userRole !== 'admin') {
		return res.status(403).json({ error: 'Forbidden' });
	}

	const id = +req.params.id;
	const missions = readJsonFile<Mission[]>(MISSIONS_FILE_PATH);
	const mission = missions.find((m: Mission) => m.id === id);
	if (!mission) {
		return res.status(404).json({ error: 'Mission not found' });
	}

	if (mission.finalOutcome || mission.diceRoll) {
		return res.status(400).json({ error: 'Mission has started or completed and cannot be deleted' });
	}

	const updatedMissions = missions.filter((m: Mission) => m.id !== id);
	writeJsonFile(MISSIONS_FILE_PATH, updatedMissions);
	return res.status(204).send();
});

app.put('/api/missions/:id/dispatch-mission', express.json(), (req, res) => {
	const id = +req.params.id;
	const missions = readJsonFile<Mission[]>(MISSIONS_FILE_PATH);
	const mission = missions.find((m: Mission) => m.id === id);

	if (!mission) {
		return res.status(404).json({ error: 'Mission not found' });
	}

	if (mission.finalComposition?.length) {
		return res.status(400).json({ error: 'Mission has already begun' });
	}

	const members = readJsonFile<Character[]>(ADVENTURERS_FILE_PATH);
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

	const currentDate = readJsonFile<{ currentDate: string }>(META_FILE_PATH).currentDate;
	if (!req.body.dispatchDate || new Date(req.body.dispatchDate).getTime() < new Date(currentDate).getTime()) {
		return res.status(400).json({ error: 'Dispatch date cannot be in the past' });
	}

	mission.finalComposition = dispatchedMembers.map((member: Character) => classGroups[member.class]);
	mission.diceRoll = req.body.diceRoll;
	mission.dispatchDate = new Date(req.body.dispatchDate);
	// Duration = level * 3 days
	const dispatchDate = new Date(req.body.dispatchDate);
	const completionDate = new Date(dispatchDate);
	completionDate.setDate(completionDate.getDate() + mission.level * 3);
	mission.completionDate = completionDate;

	dispatchedMembers.forEach((member: Character) => {
		member.activeMission = id;
	});

	// Write updated members and missions back to the JSON files and return the updated mission
	writeJsonFile(ADVENTURERS_FILE_PATH, members);
	writeJsonFile(MISSIONS_FILE_PATH, missions);
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
	const meta = readJsonFile<{ cityReputations: Record<string, number> }>(META_FILE_PATH);
	const missions = readJsonFile<Mission[]>(MISSIONS_FILE_PATH);

	const cityReputations = computeCityReputations(meta.cityReputations ?? {}, missions, getCityReputationKey);
	return res.status(200).json({ cityReputations } as CityReputationResponse);
});

app.get('/api/date', (req, res) => {
	const meta = readJsonFile<{ currentDate: string }>(META_FILE_PATH);
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
	const meta = readJsonFile<{ currentDate: string; cityReputations?: Record<string, number> }>(META_FILE_PATH);
	const currentDate = new Date(meta.currentDate);
	const adjustedDate = new Date(newDate);
	if (adjustedDate.getTime() < currentDate.getTime()) {
		return res.status(400).json({ error: 'New date cannot be in the past' });
	}

	const missions = readJsonFile<Mission[]>(MISSIONS_FILE_PATH);
	const members = readJsonFile<Character[]>(ADVENTURERS_FILE_PATH);
	const { calculateExperienceGain } = require('./utils/experience');
	const { evaluateMissionRoll } = require('./utils/mission-calculation');
	const { completedMissionIds } = completeMissionsUpToDate(
		{
			missions,
			members,
			adjustedDate,
			metaCityReputations: meta.cityReputations,
		},
		{ evaluateMissionRoll, calculateExperienceGain },
	);

	// Write updated members and missions back to the JSON files
	writeJsonFile(ADVENTURERS_FILE_PATH, members);
	writeJsonFile(MISSIONS_FILE_PATH, missions);

	// Update the current date in meta.json
	meta.currentDate = adjustedDate.toISOString().slice(0, 10);
	writeJsonFile(META_FILE_PATH, meta);
	return res.status(200).json({ message: 'Date updated successfully', newDate: meta.currentDate, completedMissionIds });
});

// DnDBeyond proxy (avoids browser CORS by calling upstream from the server)
app.get('/api/dndbeyond/character/:id', async (req, res) => {
	const rawId = req.params.id;
	const characterId = Number(rawId);

	if (!Number.isFinite(characterId) || !Number.isInteger(characterId) || characterId <= 0) {
		return res.status(400).json({ error: 'Invalid character id' });
	}

	const url = `https://character-service.dndbeyond.com/character/v5/character/${characterId}`;

	try {
		const upstream = await fetch(url, {
			headers: {
				Accept: 'application/json',
			},
		});

		const contentType = upstream.headers.get('content-type') ?? 'application/json';
		res.status(upstream.status);
		res.setHeader('Content-Type', contentType);

		const bodyText = await upstream.text();
		return res.send(bodyText);
	} catch (error) {
		return res.status(502).json({
			error: 'Failed to fetch DnDBeyond character',
			details: error instanceof Error ? error.message : String(error),
		});
	}
});

/**
 * Serve static files from /browser
 */
app.use(
	express.static(browserDistFolder, {
		maxAge: '1y',
		index: false,
		redirect: false,
	}),
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
