# @openflags/js

JavaScript/TypeScript SDK for OpenFlags. Fetches flags from the server and evaluates them locally (enabled, rollout percentage, user list).

## Install

In the monorepo: dependency on `@openflags/types`. From outside, install `@openflags/js` (when published).

## Usage

```ts
import { createClient } from "@openflags/js"

const client = await createClient({
  apiUrl: "https://flags.example.com",
  project: "my-app", // project slug or id from the dashboard
  userId: "user-123", // optional; call client.identify(userId) when the user logs in or changes
})

if (client.isEnabled("new_checkout")) {
  // show new checkout
}

const all = client.getAll() // { "new_checkout": true, "beta_ui": false }

// When the user logs in or changes (e.g. logout → identify(null))
client.identify("user-456")
client.identify(null) // clear user (anonymous)
```

## API

- **createClient(config)** — Fetches flags from `GET {apiUrl}/projects/:project/flags`. Returns a client with:
  - **isEnabled(flagKey)** — `true` if the flag is on for this user (respects rollout % and explicit user list).
  - **getAll()** — `Record<flagKey, boolean>` for all flags.
  - **identify(userId)** — Set or update the current user. Pass `null` to clear (e.g. logout). Evaluation uses the new user on the next call.

Config: `apiUrl`, `project` (slug or id from the dashboard), `userId` (optional).

## Scripts

- `bun run build` — Compile TypeScript to `dist/`
- `bun test` — Run tests

## Types

Flag shapes and evaluation rules come from `@openflags/types`.
