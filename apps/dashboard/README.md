# OpenFlags Dashboard

Admin UI for managing projects and feature flags. React + Vite.

## Scripts

- `bun run dev` — Dev server (Vite)
- `bun run build` — TypeScript + Vite build
- `bun run preview` — Preview production build

## Setup

Point the app at the OpenFlags server (see [server README](../server/README.md)). Configure the API base URL where the dashboard is built or served (e.g. env or config so requests go to `http://localhost:4000` or your server URL).

## For developers

This app is intended to provide:

- Login / signup and session handling
- Project list and creation
- Per-project flags CRUD (create, edit, delete flags; toggle enabled, rollout %, user targeting)
- Project settings and members (invite, remove, roles)

UI stack: React, Vite. Styling and design system to be added (e.g. Tailwind).
