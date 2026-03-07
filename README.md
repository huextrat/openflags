<p align="center">
  <img src="https://img.shields.io/badge/OpenFlags-feature%20flags-6366f1?style=for-the-badge&labelColor=1e1b4b" alt="OpenFlags" />
</p>

<h1 align="center">OpenFlags</h1>
<p align="center">
  <strong>Open source, self-hosted feature flags for modern JavaScript applications.</strong>
</p>

<p align="center">
  A lightweight alternative to LaunchDarkly — simple, fast, and built for developers.
</p>

---

## ✨ Why OpenFlags?

| Most platforms are… | OpenFlags is…       |
| ------------------- | ------------------- |
| 💸 Expensive        | 🆓 Self-hosted      |
| 🔧 Complex to run   | ⚡ Lightweight      |
| 🖥️ Backend-heavy    | 📦 JavaScript-first |

**Ideal for:** indie developers · startups · SaaS products · internal tools

**Works with:** Node.js · React · React Native · Next.js · Vite

**Tooling:** This monorepo uses [Bun](https://bun.sh) for package management and running apps (server, dashboard, examples).

---

## 🚀 Features

- **Feature flags** — Toggle features without deploys
- **Percentage rollouts** — Gradual releases
- **Environments** — dev / staging / prod
- **Local evaluation** — No extra latency
- **REST API** — Full control from any stack
- **JavaScript SDK** — TypeScript-ready
- **React hooks** — First-class React support
- **Self-hosted** — Your infra, your data

---

## ⚡ Quick Start

**1. Install [Bun](https://bun.sh)** (runtime + package manager)

**2. Install dependencies**

```bash
bun install
```

**3. Start development**

```bash
bun run dev
```

**4. Run server** (API + flag storage)

```bash
bun run dev:server
```

**5. Run dashboard** (admin UI)

```bash
bun run dev:dashboard
```

---

## 📖 Usage

### JavaScript / TypeScript

```ts
import { createClient } from "@openflags/js"

const flags = await createClient({
  apiUrl: "http://localhost:4000",
  userId: "123",
})

if (flags.isEnabled("new_checkout")) {
  showNewCheckout()
}
```

### React

```ts
import { createClient } from "@openflags/js"

const flags = await createClient({
  apiUrl: "http://localhost:4000",
  userId: "123",
})

if (flags.isEnabled("new_checkout")) {
  showNewCheckout()
}
```

---

## 🏗️ Architecture

OpenFlags is built around three parts:

| Component     | Role                                             |
| ------------- | ------------------------------------------------ |
| **Server**    | Flag storage and REST API                        |
| **Dashboard** | Admin UI to create and manage flags              |
| **SDK**       | Client libraries for your apps (JS, React, etc.) |

### Monorepo layout

```
apps/
  server      # API + storage
  dashboard   # Admin UI

packages/
  sdk-js      # JavaScript/TypeScript SDK
  sdk-react   # React bindings
  types       # Shared types

examples/
  react       # React app example
```

**Versioning:** [Changesets](https://github.com/changesets/changesets) — run `bun run changeset` when you change a package, then `bun run version` to update versions and changelogs.

---

## 🗺️ Roadmap

| Version  | Scope                                                                    |
| -------- | ------------------------------------------------------------------------ |
| **v1**   | Feature flags · rollout percentage · JS SDK · REST API · basic dashboard |
| **v1.1** | React hooks · caching · CLI                                              |
| **v2**   | User targeting · experimentation · analytics                             |

---

## 🤝 Contributing

Contributions are welcome.

For development setup and conventions, see **[AGENTS.md](./AGENTS.md)**.
