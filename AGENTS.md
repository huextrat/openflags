# OpenFlags — Guide for AI Agents

Use this file as context when working on OpenFlags. It summarizes the project, layout, and conventions so prompts stay aligned.

---

## Project in one sentence

**OpenFlags** is an open-source, self-hosted feature flag platform for modern JavaScript apps (Node, React, React Native, Next.js, Vite), designed as a simple, lightweight alternative to LaunchDarkly.

---

## Repository layout

- **`apps/`** — Runnable applications  
  - `server` — API + flag storage (REST, local evaluation)  
  - `dashboard` — Admin UI to manage flags (planned or in progress)
- **`packages/`** — Shared libraries  
  - `sdk-js` — JavaScript/TypeScript SDK (`@openflags/js`)  
  - `sdk-react` — React hooks (planned)  
  - `types` — Shared TypeScript types (planned)
- **`examples/`** — Sample apps (e.g. `react`, `nextjs`) (planned)
- **`docs/`** — Documentation
- **`infra/`** — Deployment / infra as code

Root is a **pnpm** monorepo. Scripts are at the root unless noted.

---

## Commands (root)

| Command | Purpose |
|--------|---------|
| `pnpm install` | Install all dependencies |
| `pnpm dev` | Start dev workflow (definition may vary) |
| `pnpm dev:server` | Run the API server |
| `pnpm dev:dashboard` | Run the dashboard |

Default API base URL in examples: `http://localhost:4000`.

---

## Core concepts

- **Feature flags** — Toggles keyed by flag name (e.g. `new_checkout`), evaluable per user/environment.
- **Environments** — dev / staging / prod; flags can differ per environment.
- **Percentage rollouts** — Gradual rollout by percentage of users.
- **Local evaluation** — SDK evaluates flags locally when possible (no round-trip for every check).

SDK usage pattern: `createClient({ apiUrl, userId })` then `flags.isEnabled("flag_key")`.

---

## Conventions for agents

1. **Read README first** — User-facing behavior, quick start, and roadmap are in [README.md](./README.md). Don’t contradict it unless the user asks for a change.
2. **Stack** — Prefer **TypeScript** for app and package code. Use **pnpm** for install/run. NPM package scope: **`@openflags/`** (e.g. `@openflags/js`).
3. **Naming** — Flag keys: `snake_case`. Env names: `dev` / `staging` / `prod` unless the codebase uses different ones.
4. **Where to put things**  
   - API and storage logic → `apps/server`  
   - Client SDK and evaluation → `packages/sdk-js` (and later `sdk-react`)  
   - Shared types → `packages/types` when it exists  
   - Docs and specs → `docs/`
5. **Roadmap** — v1: flags, rollouts, JS SDK, REST API, basic dashboard. v1.1: React hooks, caching, CLI. v2: user targeting, experimentation, analytics. Align new features with these phases when relevant.
6. **Security** — No secrets or API keys in repo. Validate and sanitize inputs; keep SDK and server contract explicit.

---

## Quick reference for prompts

- **“Add a flag / rollout / env”** → Server API + storage in `apps/server`, and SDK types/behavior in `packages/sdk-js` (and `packages/types` if present).
- **“Dashboard / admin UI”** → `apps/dashboard`.
- **“React / hooks”** → `packages/sdk-react` and examples in `examples/`.
- **“Docs”** → `docs/` and README; keep README as the main entry point for humans.

When in doubt, prefer consistency with existing code and README over introducing new patterns without being asked.
