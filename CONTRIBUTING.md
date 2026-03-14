# Contributing to OpenFlags

First off, thank you for considering contributing to OpenFlags! It's people like you that make OpenFlags such a great tool.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. (In short: be kind, be professional, and respect others).

## Prerequisites

OpenFlags is a **Bun** monorepo. You will need:

- [Bun](https://bun.sh) installed on your machine.
- Docker (optional, for testing production builds).

## Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/openflags.git
   cd openflags
   ```
3. **Install dependencies**:
   ```bash
   bun install
   ```

## Development Workflow

### Running Locally

To start the development environment (Dashboard + API Server) in parallel:

```bash
bun run dev
```

- **Dashboard**: `http://localhost:5173`
- **API Server**: `http://localhost:4000`

### Testing

Run all tests across the monorepo:

```bash
bun run test
```

### Linting and Formatting

We use [Oxc](https://oxc.rs/) for blazing fast linting and formatting. Please ensure your code passes these checks before submitting a PR.

- **Lint**: `bun run lint`
- **Auto-fix**: `bun run lint:fix`
- **Format check**: `bun run fmt:check`
- **Format**: `bun run fmt`

### Changesets

We use [Changesets](https://github.com/changesets/changesets) to manage versioning and changelogs. If your change should be included in a release, add a changeset:

```bash
bun run changeset
```

Follow the prompts to select the packages and the type of change (patch, minor, or major).

## Pull Request Process

1. **Create a new branch** for your feature or bugfix: `git checkout -b feat/your-feature-name`.
2. **Commit your changes** with descriptive commit messages.
3. **Add a changeset** if applicable.
4. **Push to your fork** and **submit a Pull Request**.
5. Once your PR is merged, your changes will be part of the next release!

## Repository Structure

- `apps/server`: Fastify API (Bun + SQLite).
- `apps/dashboard`: React + Vite admin UI.
- `packages/sdk-js`: Core JavaScript/TypeScript SDK.
- `packages/sdk-react`: React hooks and provider.
- `packages/types`: Shared TypeScript types.

---

Need help? Feel free to open an issue or reach out to the maintainers!
