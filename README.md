<p align="center">
  <img src="https://img.shields.io/badge/OpenFlags-feature%20flags-6366f1?style=for-the-badge&labelColor=1e1b4b" alt="OpenFlags" />
</p>

<p align="center">
  <img src="https://img.shields.io/github/license/huextrat/openflags?style=flat-square&color=6366f1" alt="License" />
  <img src="https://img.shields.io/badge/Bun-%3E%3D1.0.0-fbf0df?style=flat-square&logo=bun&logoColor=000" alt="Bun" />
  <img src="https://img.shields.io/github/stars/huextrat/openflags?style=flat-square&color=6366f1" alt="Stars" />
  <img src="https://img.shields.io/github/forks/huextrat/openflags?style=flat-square&color=6366f1" alt="Forks" />
  <img src="https://img.shields.io/badge/PRs-welcome-6366f1?style=flat-square" alt="PRs Welcome" />
</p>

<h1 align="center">OpenFlags</h1>

<p align="center">
  <strong>Fast, self-hosted, edge-ready feature flags for modern teams.</strong>
</p>

<p align="center">
  The lightweight alternative to LaunchDarkly — built for React, Bun, and Node.js. 
</p>

<p align="center">
  <a href="https://railway.com/deploy/IOxrOx?referralCode=Xxs5kf&utm_medium=integration&utm_source=template&utm_campaign=generic" target="_blank" rel="noopener noreferrer">
    <img src="https://railway.app/button.svg" alt="Deploy on Railway" height="30" />
  </a>
  &nbsp;
  <a href="https://zeabur.com/templates/NMMXD0" target="_blank" rel="noopener noreferrer">
    <img src="https://zeabur.com/button.svg" alt="Deploy on Zeabur" height="30" />
  </a>
</p>

---

## ✨ Why OpenFlags?

Most feature flag platforms are expensive, enterprise-heavy, and add unnecessary network latency to your app.

**OpenFlags is different:**

- **Local Evaluation:** Flags are evaluated instantly (`0ms` latency) inside your client SDK.
- **Edge-Ready:** Cache-Control built-in. Easily hide the SQLite server behind Cloudflare or Vercel.
- **Self-Hosted:** Full ownership of your audit trails and users inside your own infrastructure.
- **Progressive Delivery:** Run percentage rollouts, kill switches, and targeted beta tests effortlessly.

**Tech Stack:** `Bun` · `React` · `Tailwind v4` · `SQLite`

---

## ⚡ Deploy with Docker

### Option A — All-in-one image (recommended)

A single container serves the API + Dashboard on one port. No nginx needed.

```bash
docker run -d \
  --name openflags \
  -p 4000:4000 \
  -v openflags_data:/app/data \
  -e CORS_ORIGIN=https://flags.yourcompany.com \
  huextrat/openflags:latest
```

Open **`http://localhost:4000`**.

### Option B — Multi-container (docker compose)

Run the API and Dashboard as two separate services behind an nginx reverse proxy:

```bash
git clone https://github.com/huextrat/openflags.git
cd openflags
docker compose up -d
```

Open **`http://localhost:8080`**.

> The first user to sign up automatically becomes the **Platform Admin**.

### Environment variables

| Variable      | Default                 | Description                                          |
| ------------- | ----------------------- | ---------------------------------------------------- |
| `PORT`        | `4000`                  | Server port                                          |
| `CORS_ORIGIN` | `http://localhost:4000` | Allowed origin for cookies (set your domain in prod) |
| `DATA_DIR`    | `/app/data`             | SQLite database directory — mount a volume here      |

_See [docs/deployment](https://openflags.dev/docs/deployment) for production tips and reverse proxy setup._

---

## 🚀 Local Development (Manual)

If you want to contribute, develop, or run natively without Docker:

**1. Install [Bun](https://bun.sh)**
**2. Install dependencies & Start**

```bash
bun install
bun run dev
```

_This starts the Dashboard on `localhost:5173` and the API/Server on `localhost:4000`._

---

## 📖 SDK Usage

### JavaScript / TypeScript

```ts
import { createClient } from "@openflagsdev/js"

const flags = await createClient({
  apiUrl: "http://localhost:4000",
  project: "my-app",
  userId: "user_123",
  refreshIntervalMs: 60_000, // Polls Edge/CDN every 60s
})

if (flags.isEnabled("new_checkout")) {
  showNewCheckout()
}
```

### React / Next.js

Wrap your application with the provider, and use the hook anywhere.

```tsx
import { OpenFlagsProvider, useFlag } from "@openflagsdev/react"

// 1. Setup Provider
root.render(
  <OpenFlagsProvider
    apiUrl="https://flags.mycompany.com"
    project="frontend-app"
    userId={user?.id}
    refreshIntervalMs={30_000}
  >
    <App />
  </OpenFlagsProvider>
)

// 2. Consume flag
function App() {
  const showAI = useFlag("ai_assistant")
  return showAI ? <AIAssistant /> : <StandardChat />
}
```

---

## 🏗️ Monorepo Architecture

OpenFlags is structured beautifully as a Turborepo.

| Package          | Path                 | Description                            |
| ---------------- | -------------------- | -------------------------------------- |
| **Server**       | `apps/server`        | `Bun.serve` + SQLite API               |
| **Dashboard**    | `apps/dashboard`     | React SPA for Flag Management          |
| **Docs Vitrine** | `apps/docs`          | Next.js Landing + Fumadocs             |
| **React**        | `packages/sdk-react` | `@openflagsdev/react` Provider & Hooks |
| **JS**           | `packages/sdk-js`    | Core string-hashing evaluation         |

---

## 🤝 Contributing & Licensing

Contributions to the codebase, SDKs, or Dashboard UI are highly welcome!  
Please read our **[Contributing Guide](./CONTRIBUTING.md)** to get started.  
See **[AGENTS.md](./AGENTS.md)** for AI Agent / Workspace context.

Licensed under MIT.
