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
import { Character } from './app/shared/character-models';
import { CharacterBonusUpdateResponse } from './app/shared/api-models';
import { Mission } from 'app/shared/mission-model';
import cookieParser from 'cookie-parser';

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
app.get('/api/members', (req, res) => {
	res.sendFile(resolve('data', 'adventurers.json'));
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

// Meta API
app.get('/api/date', (req, res) => {
	const meta = require(resolve('data', 'meta.json'));
	const currentDate = new Date(meta.currentDate);
	res.status(200).json(currentDate);
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
app.use('/**', (req, res, next) => {
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
	const port = process.env['PORT'] || 4000;
	app.listen(port, () => {
		console.log(`Node Express server listening on http://localhost:${port}`);
	});
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
