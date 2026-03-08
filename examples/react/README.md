# OpenFlags React example

Example React app using `@openflags/js` and `@openflags/react` to read feature flags from an OpenFlags server.

## Run

1. Start the OpenFlags server (from repo root: `bun run dev:server`, or see [server README](../../apps/server/README.md)).
2. Create a project in the dashboard (e.g. slug `my-app`) and add flags. Set `VITE_OPENFLAGS_PROJECT` to that slug, or leave the default `my-app`.
3. From this directory or repo root: `bun run dev` (Vite dev server).
4. Open the URL shown (e.g. `http://localhost:5173`). The app fetches flags from `GET /projects/:project/flags`. Optionally set `VITE_API_URL` (default `http://localhost:4000`).

## Scripts

- `bun run dev` — Vite dev server
- `bun run build` — Production build
- `bun run preview` — Preview the production build

## For developers

Use this as a reference for integrating OpenFlags in a React app: provider setup, `useFlag` / `useFlags` usage, and project configuration.
