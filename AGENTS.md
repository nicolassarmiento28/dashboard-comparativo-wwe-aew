# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run from repo root, backend and frontend are separate npm projects with their own dependencies.

```bash
# Install
cd backend && npm install
cd frontend && npm install

# Dev (two terminals)
npm run backend    # from root: backend on http://localhost:3001 (nodemon)
npm run frontend   # from root: frontend on http://localhost:5173 (Vite, proxies /api -> :3001)

# Backend only
cd backend && npm run start   # node, no watch

# Frontend only
cd frontend && npm run build    # production build to dist/
cd frontend && npm run preview  # preview the build
cd frontend && npm run lint     # eslint

# Health check
curl http://localhost:3001/api/health
```

No test suite exists in either package (`npm test` is not defined).

## Architecture

Two independent apps, no shared package: `backend/` (Express) and `frontend/` (React + Vite). No database — the backend is a thin read-only REST layer over static JSON files.

### Backend (`backend/src/index.js`, single file, ~340 lines)

- All routes and the `loadData()` helper live in this one file. `loadData(filename)` does `require(path.join(__dirname, '..', 'data', filename))` — filenames are always hardcoded literals in route handlers, never derived from request input.
- Data lives in `backend/data/*.json`: `events.json`, `matches.json`, `tickets.json`, `viewership.json`, `wrestlers.json`. Filtering/joining across these files happens in-memory inside route handlers (e.g. `/api/compare` merges events + tickets + viewership by event id).
- Response shape convention: collections return `{ data: [], total: N }`, single resources return `{ data: {} }`, errors return `{ error: "..." }`.
- Middleware order matters: `helmet()` → `cors()` → `express-rate-limit` (300 req/15min) → `express.json()`.
- **`CORS_ORIGIN` env var**: defaults to `*` if unset. Must be set to the exact frontend origin in any real deployment.
- **Production backend runs on Northflank** (`https://site--wrestling-api--qd6hnmpb5l7w.code.run`), not Railway — an old Railway deployment exists but is abandoned (broken build, no env vars configured). Don't assume Railway is live.

### Frontend (`frontend/src/`)

- `api/wrestling.js` — single fetch wrapper, `BASE = import.meta.env.VITE_API_URL ?? '/api'`. In dev this resolves through the Vite proxy in `vite.config.js`; in prod (Vercel) `VITE_API_URL` must point at the Northflank backend and is baked in at build time (it's not a runtime secret despite being marked "Sensitive" in Vercel).
- `sections/` — one component per dashboard section (Hero, Economic, Viewership, Wrestlers), each responsible for fetching and rendering its own slice of the API.
- `components/` — small shared presentational pieces (`KpiCard`, `ConfidenceBadge`, `SectionHeader`).
- Data confidence is a first-class concept end to end: records carry `*_confidence` (`confirmed` / `estimated` / `no_data`) and `*_source` fields from the JSON data through to the API response; the frontend renders this via `ConfidenceBadge` rather than treating all numbers as equally reliable.
- Theme (`dark`/`light`) persists in `localStorage`.

### Adding a new event

Documented in README under "Flujo de trabajo para actualizar datos": add to `events.json`, then stub/fill `tickets.json` and `viewership.json` (use `no_data` confidence if unknown), optionally `matches.json` and `wrestlers.json`. Restart the backend in dev — `require()` caches JSON and won't pick up edits otherwise.
