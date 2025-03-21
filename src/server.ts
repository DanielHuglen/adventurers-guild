import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Character } from './app/shared/character-models';
import { CharacterBonusUpdateResponse } from './app/shared/api-models';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

const fs = require('fs');

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

  const log = bonusDescription ? ` with description: ${bonusDescription}` : '';
  console.log(`Updating member ${id} with bonus: ${hasBonus}${log}`);

  const adventurers = require(resolve('data', 'adventurers.json'));
  const member = adventurers.find((a: Character) => a.id === id);
  member.hasBonus = hasBonus;
  member.bonusDescription = bonusDescription;
  member.debt = debt;
  fs.writeFileSync(
    resolve('data', 'adventurers.json'),
    JSON.stringify(adventurers, null, 2)
  );

  res.status(200).json({
    message: 'Member updated successfully',
  } as CharacterBonusUpdateResponse);
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
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next()
    )
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
