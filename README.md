# Ride-My-Way

A carpooling application that provides drivers with the ability to create ride offers and passengers to join available ride offers.

## Status

Phase 2 of a rebuild: Postgres-backed REST API with JWT authentication, plus the static UI from Phase 1. Ride creation and management are tied to real user accounts now — see the API table below. The frontend isn't wired to the live API yet (Phase 3).

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

Then open `http://localhost:3000` in a browser. The same Express server serves the UI (from `public/`) and the API, so no separate frontend server is needed.

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

Data is persisted in Postgres (raw SQL via `pg`, no ORM). Passwords are hashed with Node's built-in `crypto.scrypt`; tokens are signed JWTs valid for 1 day.

## Tests

```
npm test
```

Runs migrations against `ride_my_way_test`, then the full suite with Node's built-in test runner (`node:test`) and `supertest`, against a real Postgres database (truncated between tests). Test files run serially (`--test-concurrency=1`) since they share that database.

## Lint

```
npm run lint
```

## GitHub Pages

The `public/` directory is also published to GitHub Pages as a static preview of the UI. Since Pages only serves static files, the hosted version isn't wired to a live API — run the app locally (see above) to use the working API.

## Roadmap

- **Phase 3**: Wire the frontend to the live API with `fetch` — login/signup forms, token storage, and working offer/request/accept flows.
