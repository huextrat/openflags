# @openflags/js

JavaScript/TypeScript SDK for OpenFlags. Fetches flags from the server and evaluates them locally (enabled, rollout percentage, user list).

## Install

In the monorepo: dependency on `@openflags/types`. From outside, install `@openflags/js` (when published).

## Usage

```ts
import { createClient } from "@openflags/js"

const client = await createClient({
  apiUrl: "https://flags.example.com",
  userId: "user-123",
  environment: "production", // optional, filters flags by environment
})

if (client.isEnabled("new_checkout")) {
  // show new checkout
}

const all = client.getAll() // { "new_checkout": true, "beta_ui": false }
```

## API

- **createClient(config)** — Fetches flags from `GET {apiUrl}/flags` (or project-scoped endpoint when configured). Returns a client with:
  - **isEnabled(flagKey)** — `true` if the flag is on for this user (respects rollout % and explicit user list).
  - **getAll()** — `Record<flagKey, boolean>` for all flags.

Config: `apiUrl` (string), `userId` (string), `environment` (optional string). The server API is project-scoped (`GET /projects/:idOrSlug/flags`); the SDK will support a project option in a future update.

## Scripts

- `bun run build` — Compile TypeScript to `dist/`
- `bun test` — Run tests

## Types

Flag shapes and evaluation rules come from `@openflags/types`.
