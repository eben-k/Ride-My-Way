# Ride-My-Way

A carpooling application that provides drivers with the ability to create ride offers and passengers to join available ride offers.

## Status

The rebuild is feature-complete: a Postgres-backed, JWT-secured REST API, and a vanilla-JS frontend (`public/`) wired to it end to end — sign up, log in, offer a ride, browse rides, request to join, and accept/reject requests from your profile.

## Requirements

- Node.js 20+ (native ES modules, no Babel needed)
- PostgreSQL running locally

## Local database setup

```
createdb ride_my_way_dev
createdb ride_my_way_test
cp .env.example .env      # then fill in DATABASE_URL / JWT_SECRET for ride_my_way_dev
```

`DATABASE_URL` should point at `ride_my_way_dev` for local running, and a separate `.env.test` (same shape) should point at `ride_my_way_test` for running tests. Both files are gitignored.

Apply the schema:

```
npm run migrate
```

Migrations are plain `.sql` files in `server/db/migrations/`, applied in order and tracked in a `schema_migrations` table — safe to re-run.

## Running locally

```
npm install
npm run migrate
npm start
```

Then open `http://localhost:3000` in a browser. The same Express server serves the UI (from `public/`) and the API, so no separate frontend server is needed. Sign up, offer a ride from one account, then sign in as a second account to browse and request it.

## API

All endpoints are versioned under `/api/v1`. Every endpoint except signup/login requires `Authorization: Bearer <token>`, obtained from `/auth/login`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/signup` | none | Create an account |
| POST | `/api/v1/auth/login` | none | Log in, returns a JWT |
| GET | `/api/v1/rides` | required | List all ride offers |
| GET | `/api/v1/rides/:id` | required | Get a single ride offer |
| POST | `/api/v1/rides/:id/requests` | required | Request to join a ride (as the authenticated passenger) |
| POST | `/api/v1/users/rides` | required | Create a ride offer owned by the authenticated driver |
| GET | `/api/v1/users/rides/:id/requests` | required, owner only | List requests for a ride you created, with passenger names |
| PUT | `/api/v1/users/rides/:id/requests/:requestId` | required, owner only | Accept or reject a request (`{ "status": "accepted" \| "rejected" }`) |
| GET | `/api/v1/users/requests` | required | List the authenticated user's own join requests, with ride details |

Data is persisted in Postgres (raw SQL via `pg`, no ORM). Passwords are hashed with Node's built-in `crypto.scrypt`; tokens are signed JWTs valid for 1 day.

## Frontend

Plain HTML/CSS/vanilla JS in `public/`, no framework. `public/js/apiClient.js` wraps every endpoint above with `fetch`; `public/js/auth.js` handles token storage (`localStorage`) and reading the logged-in user from the JWT. Each page has a thin script in `public/js/pages/` that wires its form/list to those modules — `nav.js` runs on every page to show "Sign In" vs. "Hi, `<name>` / Sign Out". Errors are shown inline (`.error`/`.success` messages), never `alert()`.

## Tests

```
npm test
```

Runs migrations against `ride_my_way_test`, then the full suite with Node's built-in test runner (`node:test`): backend route/store tests via `supertest` against a real Postgres database (truncated between tests), plus frontend `apiClient`/`auth` unit tests with a mocked `fetch`. Test files run serially (`--test-concurrency=1`) since the backend tests share that database.

The DOM-facing page scripts (`public/js/pages/*.js`) aren't unit tested — they're thin glue verified manually in a browser (sign up → offer → browse → request → accept/reject → check both profiles).

## Lint

```
npm run lint
```

## GitHub Pages

The `public/` directory is also published to GitHub Pages as a static preview of the UI. Since Pages only serves static files, the hosted version can't reach a live API — run the app locally (see above) for the working end-to-end flow.
