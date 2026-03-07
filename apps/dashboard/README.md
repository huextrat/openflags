# OpenFlags Dashboard

Admin UI for managing projects and feature flags. React + Vite + Tailwind.

## Scripts

- `bun run dev` — Dev server (Vite)
- `bun run build` — TypeScript + Vite build
- `bun run preview` — Preview production build

## Setup

Set `VITE_API_URL` to your OpenFlags server URL (default: `http://localhost:4000`). The server must allow CORS with credentials from the dashboard origin (see [server README](../server/README.md)).

## Features

- **Auth** — Sign up, sign in, sign out. Session via cookie.
- **Projects** — List, create, open. Sidebar lists your projects.
- **Flags** — Per-project list with environment filter; create, toggle enabled, edit rollout %, delete.
- **Settings** — Project members: invite by email (role: viewer / member / admin), remove (admin only).

## For developers

- **Stack:** React 19, React Router 7, Vite 7, Tailwind 4, Radix UI primitives, Framer Motion, Lucide React.
- **UI:** Shadcn-style components in `src/components/ui/` (Button, Input, Card, Label, Checkbox) built with `class-variance-authority`, `clsx`, `tailwind-merge`. Design: soft shadows, rounded-xl/2xl, large spacing (p-6/p-8), minimal borders, Vercel/Stripe-like aesthetic.
- **Layout:** Responsive sidebar (toggle on mobile), page transition animations (Framer Motion).
- **API:** All calls go through `src/api.ts` with `credentials: "include"` for the session cookie.
- **Routes:** `/login`, `/signup`, `/` (projects list), `/projects/new`, `/projects/:id` (flags), `/projects/:id/settings`.
- **Setup:** Run `bun install` from the repo root so workspace dependencies (including Radix, Framer Motion, Lucide) are installed.
