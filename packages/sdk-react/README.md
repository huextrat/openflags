# @openflags/react

React bindings for OpenFlags. Uses `@openflags/js` under the hood.

## Install

In the monorepo: depends on `@openflags/js` and `@openflags/types`. Peer: `react`. From outside, install `@openflags/react` and `react`.

## Usage

Wrap your app (or a subtree) with `OpenFlagsProvider`, then use hooks.

```tsx
import { OpenFlagsProvider, useFlag, useFlags } from "@openflags/react"

// At root or a parent
;<OpenFlagsProvider apiUrl="https://flags.example.com" project="my-app" userId={user.id}>
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

- **OpenFlagsProvider** — Props: `apiUrl`, `userId`. Fetches flags once and provides them to children.
- **useFlag(flagKey)** — Returns `boolean` for that flag.
- **useFlags()** — Returns `Record<string, boolean>` for all flags.

Props: `apiUrl`, `project` (slug or id), `userId`, `environment` (optional).

## Scripts

- `bun run build` — Compile TypeScript to `dist/`
