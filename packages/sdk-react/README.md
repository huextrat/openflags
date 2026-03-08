# @openflagsdev/react

React bindings for OpenFlags. Uses `@openflagsdev/js` under the hood.

## Install

In the monorepo: depends on `@openflagsdev/js` and `@openflagsdev/types`. Peer: `react`. From outside, install `@openflagsdev/react` and `react`.

## Usage

Wrap your app (or a subtree) with `OpenFlagsProvider`, then use hooks.

```tsx
import { OpenFlagsProvider, useFlag, useFlags, useOpenFlagsClient } from "@openflagsdev/react"

// At root or a parent (userId optional; use identify() when the user logs in or changes)
;<OpenFlagsProvider apiUrl="https://flags.example.com" project="my-app">
  <App />
</OpenFlagsProvider>

// In a component
function Feature() {
  const enabled = useFlag("new_checkout")
  const flags = useFlags() // Record<string, boolean>
  if (enabled) return <NewCheckout />
  return <OldCheckout />
}

// When the user logs in or logs out
function Auth() {
  const openFlags = useOpenFlagsClient()
  function onLogin(userId: string) {
    openFlags?.identify(userId)
  }
  function onLogout() {
    openFlags?.identify(null)
  }
}
```

## API

- **OpenFlagsProvider** — Props: `apiUrl`, `project`, optional `userId`. Fetches flags once; syncs `userId` prop and exposes `identify()`.
- **useFlag(flagKey)** — Returns `boolean` for that flag.
- **useFlags()** — Returns `Record<string, boolean>` for all flags.
- **useOpenFlagsClient()** — Returns `{ client, identify }` or `null`. Call `identify(userId)` when the user logs in or changes, `identify(null)` on logout.

## Scripts

- `bun run build` — Compile TypeScript to `dist/`
