# OpenFlags — Guide for AI Agents

Use this file as context when working on OpenFlags. It summarizes the project, layout, and conventions so prompts stay aligned.

---

## Project in one sentence

**OpenFlags** is an open-source, self-hosted feature flag platform for modern JavaScript apps (Node, React, React Native, Next.js, Vite), designed as a simple, lightweight alternative to LaunchDarkly.

---

## Repository layout

- **`apps/`** — Runnable applications
  - `server` — Fastify API on **Bun**, SQLite via `bun:sqlite`, GET/POST/PATCH /flags, environment + user targeting
  - `dashboard` — React + Vite admin UI to list flags and toggle enabled
- **`packages/`** — Shared libraries
  - `sdk-js` — JavaScript/TypeScript SDK (`@openflags/js`): `createClient()` async, `isEnabled()` sync, `getAll()`
  - `sdk-react` — React hooks (`@openflags/react`): `OpenFlagsProvider`, `useFlag()`, `useFlags()`
  - `types` — Shared TypeScript types (`@openflags/types`): Flag, CreateFlagInput, UpdateFlagInput
- **`examples/`** — Sample apps (e.g. `examples/react` — React + Vite using `@openflags/react`)
- **`infra/`** — Deployment / infra as code
- **`.changeset/`** — [Changesets](https://github.com/changesets/changesets) for versioning and changelogs. Use `bun run changeset` and `bun run version`.

Root is a **Bun** monorepo (Bun for install, run, and server runtime). Scripts are at the root unless noted.

---

## Commands (root)

| Command                 | Purpose                                                      |
| ----------------------- | ------------------------------------------------------------ |
| `bun install`           | Install all dependencies                                     |
| `bun run dev`           | Start dev workflow (turbo, parallel)                         |
| `bun run dev:server`    | Run the API server                                           |
| `bun run dev:dashboard` | Run the dashboard                                            |
| `bun run test`          | Run all tests (server + sdk-js)                              |
| `bun run compile`       | Build all packages (turbo); avoids conflict with `bun build` |
| `bun run changeset`     | Add a changeset for versioning                               |
| `bun run version`       | Apply changesets, bump versions, update changelogs           |
| `bun run lint`          | Lint with [Oxc](https://oxc.rs/) (oxlint)                    |
| `bun run lint:fix`      | Lint and auto-fix (oxlint --fix)                             |
| `bun run fmt`           | Format code (oxfmt)                                          |
| `bun run fmt:check`     | Check formatting without writing                             |

Default API base URL in examples: `http://localhost:4000`.

---

## Core concepts

- **Feature flags** — Toggles keyed by flag name (e.g. `new_checkout`), evaluable per user/environment.
- **Environments** — dev / staging / prod; flags can differ per environment.
- **Percentage rollouts** — Gradual rollout by percentage of users.
- **Local evaluation** — SDK evaluates flags locally when possible (no round-trip for every check).

SDK usage: `const flags = await createClient({ apiUrl, userId, environment? })`; then `flags.isEnabled("flag_key")` (sync). User targeting: if `userId` is in `flag.users`, the flag is on for that user.

---

## Conventions for agents

1. **Read README first** — User-facing behavior, quick start, and roadmap are in [README.md](./README.md). Don’t contradict it unless the user asks for a change.
2. **Stack** — Prefer **TypeScript** for app and package code. Use **Bun** for install and run (`bun install`, `bun run <script>`). NPM package scope: **`@openflags/`** (e.g. `@openflags/js`).
3. **Naming** — Flag keys: `snake_case`. Env names: `dev` / `staging` / `prod` unless the codebase uses different ones.
4. **Where to put things**
   - API and storage logic → `apps/server`
   - Client SDK and evaluation → `packages/sdk-js` (and later `sdk-react`)
   - Shared types → `packages/types` when it exists
   - Docs and specs → README and repo root
5. **Roadmap** — v1: flags, rollouts, JS SDK, REST API, basic dashboard. v1.1: React hooks, caching, CLI. v2: user targeting, experimentation, analytics. Align new features with these phases when relevant.
6. **Security** — No secrets or API keys in repo. Validate and sanitize inputs; keep SDK and server contract explicit.

---

## Quick reference for prompts

- **“Add a flag / rollout / env”** → Server API + storage in `apps/server`, and SDK types/behavior in `packages/sdk-js` (and `packages/types` if present).
- **“Dashboard / admin UI”** → `apps/dashboard`.
- **“React / hooks”** → `packages/sdk-react` and examples in `examples/`.
- **“Docs”** → README; keep README as the main entry point for humans.

When in doubt, prefer consistency with existing code and README over introducing new patterns without being asked.
