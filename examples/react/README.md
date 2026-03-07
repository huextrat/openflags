# OpenFlags React example

Example React app using `@openflags/js` and `@openflags/react` to read feature flags from an OpenFlags server.

## Run

1. Start the OpenFlags server (from repo root: `bun run dev:server`, or see [server README](../../apps/server/README.md)).
2. From this directory or repo root: `bun run dev` (Vite dev server).
3. Open the URL shown (e.g. `http://localhost:5173`). The app will request flags from the server; configure the API URL in the app or env if needed.

## Scripts

- `bun run dev` — Vite dev server
- `bun run build` — Production build
- `bun run preview` — Preview the production build

## For developers

Use this as a reference for integrating OpenFlags in a React app: provider setup, `useFlag` / `useFlags` usage, and optional environment/project configuration.
