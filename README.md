# Ride-My-Way

A carpooling application that provides drivers with the ability to create ride offers and passengers to join available ride offers.

## Status

This is Phase 1 of a rebuild: static UI pages plus an in-memory REST API for ride offers and join requests. There's no database or authentication yet — those land in later phases (see below).

## Requirements

- Node.js 20+ (native ES modules, no Babel needed)

## Running locally

```
npm install
npm start
```

Then open `http://localhost:3000` in a browser. The same Express server serves the UI (from `public/`) and the API, so no separate frontend server is needed.

## API

All endpoints are versioned under `/api/v1`.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/rides` | List all ride offers |
| GET | `/api/v1/rides/:id` | Get a single ride offer |
| POST | `/api/v1/rides` | Create a ride offer |
| POST | `/api/v1/rides/:id/requests` | Request to join a ride |

Data is stored in memory and resets whenever the server restarts.

## Tests

```
npm test
```

Runs the API test suite with Node's built-in test runner (`node:test`) and `supertest`.

## Lint

```
npm run lint
```

## GitHub Pages

The `public/` directory is also published to GitHub Pages as a static preview of the UI. Since Pages only serves static files, the hosted version isn't wired to a live API — run the app locally (see above) to use the working rides API.

## Roadmap

- **Phase 2**: Postgres persistence (raw SQL, no ORM) and JWT-based signup/login/auth.
- **Phase 3**: Wire the frontend to the live API with `fetch`, replacing the static forms with working flows.
