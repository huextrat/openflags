# @openflags/react

React bindings for OpenFlags. Uses `@openflags/js` under the hood.

## Install

In the monorepo: depends on `@openflags/js` and `@openflags/types`. Peer: `react`. From outside, install `@openflags/react` and `react`.

## Usage

Wrap your app (or a subtree) with `OpenFlagsProvider`, then use hooks.

```tsx
import { OpenFlagsProvider, useFlag, useFlags } from "@openflags/react"

// At root or a parent
<OpenFlagsProvider
  apiUrl="https://flags.example.com"
  userId={user.id}
  environment="production"
>
  <App />
</OpenFlagsProvider>

// In a component
function Feature() {
  const enabled = useFlag("new_checkout")
  const flags = useFlags() // Record<string, boolean>
  if (enabled) return <NewCheckout />
  return <OldCheckout />
}
```

## API

- **OpenFlagsProvider** — Props: `apiUrl`, `userId`, `environment?`. Fetches flags once and provides them to children.
- **useFlag(flagKey)** — Returns `boolean` for that flag.
- **useFlags()** — Returns `Record<string, boolean>` for all flags.

Requires a project-scoped server endpoint when the server is configured for projects; provider props may be extended with `project` (slug or id) in a future version.

## Scripts

- `bun run build` — Compile TypeScript to `dist/`
