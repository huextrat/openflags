# @openflags/types

Shared TypeScript types for OpenFlags: flag shape, API payloads, and related structures. No runtime code; used by the server and SDKs.

## Contents

- **Flag** — `id`, `key`, `enabled`, `rolloutPercentage`, optional `users` (string[]).
- **CreateFlagInput** — `key`, optional `enabled`, `rolloutPercentage`, `users`.
- **UpdateFlagInput** — Optional `enabled`, `rolloutPercentage`, `users`.

Used by `@openflags/server`, `@openflags/js`, and `@openflags/react` to keep request/response and evaluation logic in sync.

## Scripts

- `bun run build` — Compile TypeScript to `dist/`
