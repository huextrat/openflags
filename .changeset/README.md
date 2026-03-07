# Changesets

This repo uses [Changesets](https://github.com/changesets/changesets) for versioning and changelogs.

## Adding a changeset

When you change a package that should be released (e.g. `@openflags/js`, `@openflags/types`, `@openflags/server`), add a changeset:

```bash
bun run changeset
```

Choose the packages to bump, the bump type (patch/minor/major), and write a short summary. A new file under `.changeset/` will be created.

## Releasing (version + changelog)

When ready to cut a release:

```bash
bun run version
```

This consumes the changesets, bumps versions, updates CHANGELOGs, and leaves the repo ready to publish (e.g. `bun run publish` in each package or via your CI).

## Ignored packages

`@openflags/example-react` and `@openflags/dashboard` are ignored by Changesets (examples and app, not published to npm). To publish other packages, remove them from `ignore` in `.changeset/config.json`.
