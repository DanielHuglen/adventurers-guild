# Adventurers Guild (Eventyrerlauget)

A small campaign companion app for managing an adventurers’ guild: members (agents), missions, dispatching, and the in‑game calendar.

The UI is an Angular app, and the backend is an Express server (Angular SSR) that serves the app and exposes a simple JSON-file REST API.

## What it does

### For users

- Member overview: browse all guild members (agents) and open a member’s details.
- Mission overview: browse missions and open a mission’s full description and status.
- Adjust member debt and bonus: update a member’s debt (gold) and “equipment/bonus” flag + short description (requires login).
- Dispatch members on missions: pick available members, choose dispatch date and a d100 roll, and dispatch the party (requires login).
- See current employees: view the guild’s current employees and their effects.
- See founders and history: read the guild’s origin story and view founder details.
- See current reputation: view guild reputation by region/city and what different reputation bands mean.
- See system explanation: read the “System” page explaining classes/groups, dispatching modifiers, outcomes, XP, etc.

### For admins

- CRUD for members and missions.
- Adjust in-game date: change the guild’s current date; when the date moves forward, missions that should have completed are completed and the UI will surface the completed mission(s).

## Roles & login

The app has three roles:

- **guest**: can browse members/missions/pages.
- **editor**: can do “in-game operations” like dispatching missions and updating member debt/bonus.
- **admin**: everything above, plus CRUD and date adjustment.

When you attempt an action that requires permissions, the app prompts for a password and stores it in a cookie used for API requests.

Configure passwords via environment variables:

- `ADMIN_PASSWORD`
- `EDITOR_PASSWORD`

See [stack.env](stack.env) for an example.

## Pages (routes)

- `/members` and `/members/:id`
- `/missions` and `/missions/:id`
- `/employees`
- `/founders`
- `/reputation`
- `/system`

## Data storage

Data is stored as JSON files in [data/](data/):

- `data/adventurers.json` (members)
- `data/missions.json` (missions)
- `data/meta.json` (current date, reputation meta)

## Running locally

Prereqs: Node.js 20+.

Install deps:

```bash
npm install
```

Start dev server:

```bash
npm start
```

Production-like SSR server (serves the app + API on port 4000 by default):

```bash
npm run build
npm run server
```

## Docker

Run with docker compose (maps container port 4000 to host 8081, and persists JSON data in a volume):

```bash
docker compose up -d
```

Passwords are provided via [stack.env](stack.env).

## Tests

```bash
npm test
```

## Disclaimer (Generative AI)

This project was created with heavy use of generative AI for everything **except** frontend development. Treat non-frontend code and content (server/API logic, system rules text, data modeling, calculations, etc.) as AI-assisted and review it accordingly.

## API endpoints

The backend is implemented in [src/server.ts](src/server.ts) and stores data in JSON files under [data/](data/).

- `POST /api/login` → returns `{ role: 'admin' | 'editor' }` on success
- Members
  - `GET /api/members` → all members (JSON file)
  - `GET /api/members/available` → members not on an active mission and alive
  - `GET /api/members/ids` → list of member ids
  - `GET /api/members/:id` → member details
  - `PUT /api/members/:id/bonus` → update `debt` and bonus/equipment fields (editor or admin)
  - `POST /api/members` → create member (admin)
  - `PUT /api/members/:id` → update member (admin)
  - `DELETE /api/members/:id` → delete member (admin)
- Missions
  - `GET /api/missions` → all missions (JSON file)
  - `GET /api/missions/:id` → mission details
  - `GET /api/missions/:id/dispatched-members` → members dispatched on / completed this mission
  - `PUT /api/missions/:id/dispatch-mission` → dispatch members with `dispatchedMemberIds`, `diceRoll`, `dispatchDate` (editor or admin)
  - `POST /api/missions` → create mission (admin)
  - `PUT /api/missions/:id` → update mission (admin)
  - `DELETE /api/missions/:id` → delete mission (admin, only if not started)
- Meta / progression
  - `GET /api/date` → current in-game date
  - `POST /api/date` → set in-game date and complete missions up to that date (admin)
  - `GET /api/reputation` → computed city reputations
- Utility
  - `GET /api/dndbeyond/character/:id` → server-side proxy to D&D Beyond character JSON (avoids browser CORS)
