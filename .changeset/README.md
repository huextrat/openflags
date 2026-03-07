# Changesets

This repo uses [Changesets](https://github.com/changesets/changesets) for versioning and changelogs.

## Adding a changeset

When you change a package under `packages/` (e.g. `@openflags/js`, `@openflags/react`, `@openflags/types`), you must add a changeset:

```bash
bun run changeset
```

Choose the packages to bump, the bump type (patch/minor/major), and write a short summary. A new file under `.changeset/` will be created.

- **PRs**: The [changeset-bot](https://github.com/apps/changeset-bot) comments on PRs to remind you. CI blocks the PR if `packages/*` was modified but no new `.changeset/*.md` file was added.
- You can also [create a changeset file from the GitHub UI](https://github.com/apps/changeset-bot) via the link the bot adds.

## Releasing (automated)

Releases are handled by GitHub Actions (`.github/workflows/release.yml`):

1. On **push to `main`** (e.g. after merging a PR that has changesets), the [changesets/action](https://github.com/changesets/action) runs.
2. It creates or updates a **"Version Packages"** PR that bumps versions and updates CHANGELOGs.
3. When you merge that PR, the action runs again and **publishes** the updated packages to npm (requires `NPM_TOKEN` secret).

To release manually: `bun run version` then `bun run release` (build + publish).

## Ignored packages

`@openflags/example-react` is in `ignore` in `.changeset/config.json` (example app, not published). Add or remove packages there as needed.
