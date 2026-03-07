# OpenFlags Server

API and storage for OpenFlags. Bun + SQLite, no external runtime.

## Scripts

- `bun run dev` — Watch mode (restart on file change)
- `bun run start` — Run once
- `bun run build` — TypeScript check (`tsc --noEmit`)
- `bun test` — Run tests

## Environment

- `PORT` — HTTP port (default: 4000)
- `CORS_ORIGIN` — Allowed origin for credentials (default: `http://localhost:5173`)

Data is stored in `data/flags.db` (created next to the built app).

## API overview

All JSON; auth uses cookie `openflags_session` (session ID).

### Auth (no auth required for signup/login)

- `POST /auth/signup` — Body: `{ email, password }`. Returns user + sets session cookie.
- `POST /auth/login` — Body: `{ email, password }`. Returns user + sets session cookie.
- `POST /auth/logout` — Clears session cookie.
- `GET /auth/me` — Returns `{ user: { id, email } }` or 401.

### Projects (authenticated)

- `GET /projects` — List projects the user is a member of.
- `POST /projects` — Body: `{ name, slug? }`. Create project (caller becomes admin).
- `GET /projects/:idOrSlug` — Get one project (by id or slug). Requires membership.

### Members (authenticated)

- `GET /projects/:id/members` — List members.
- `POST /projects/:id/members` — Body: `{ email, role? }`. Invite by email (admin only). Role: `admin` | `member` | `viewer`.
- `DELETE /projects/:id/members/:userId` — Remove member (admin only).

### Flags (project-scoped)

- `GET /projects/:idOrSlug/flags?environment=` — **Public** (no auth). List flags for SDK. Filter by `environment` query param.
- `POST /projects/:idOrSlug/flags` — Create flag (admin/member). Body: `CreateFlagInput` from `@openflags/types`.
- `PATCH /projects/:id/flags/:flagId` — Update flag (admin/member). Body: `UpdateFlagInput`.
- `DELETE /projects/:id/flags/:flagId` — Delete flag (admin/member).

## Migrations

Schema version is stored in `schema_version`. On startup, any migration with index &gt; current version runs once. To add a migration: append a function to the `MIGRATIONS` array in `src/db.ts` (see comment there).
