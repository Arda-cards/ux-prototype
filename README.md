# @arda-cards/ui-components

![CI](https://github.com/Arda-cards/ux-prototype/actions/workflows/ci.yml/badge.svg)
![Deploy](https://github.com/Arda-cards/ux-prototype/actions/workflows/deploy-pages.yml/badge.svg)
![Publish](https://github.com/Arda-cards/ux-prototype/actions/workflows/publish.yml/badge.svg)

A shared React component library and interactive prototype gallery for Arda, built with Storybook 8, TypeScript, and Tailwind CSS v4. Components are developed in isolation, documented with stories, tested with Vitest and Playwright, and published to GitHub Packages for consumption by `arda-frontend-app`.

## Deployed Sites

The Storybook gallery is deployed to two environments:

| Environment                 | URL                                        | Access                               | Deploys on                   |
| --------------------------- | ------------------------------------------ | ------------------------------------ | ---------------------------- |
| **Vercel** (external)       | https://ux-prototype-tau.vercel.app/       | Password-protected (HTTP Basic Auth) | CLI deploy (`vercel --prod`) |
| **GitHub Pages** (internal) | https://arda-cards.github.io/ux-prototype/ | Repo collaborators via GitHub login  | Push to `main`               |

**Vercel** is the primary site for sharing with stakeholders. Credentials are stored in **1Password** under the **Arda-SystemsOAM** vault.

**GitHub Pages** is for team-internal use. Access is restricted to repository collaborators who authenticate with their GitHub account (Settings > Pages > visibility).

For instructions on accessing the Vercel prototype and using the built-in commenting/feedback tool, see **[Storybook Instructions](storybook-instructions.md)**.

## Quick Start

```bash
npm install          # Install dependencies
npm run storybook    # Start Storybook at http://localhost:6006
npm test             # Run unit tests
```

## Documentation

Detailed guides are available inside Storybook under the **Docs** section:

- **Getting Started** — prerequisites, installation, project structure
- **Component Guidelines** — interface separation, Storybook meta, MDX docs, anti-patterns
- **Developer Workflow** — component development flow, AI-assisted workflow, running tests
- **Application Mocks** — how to create full-page application mocks
- **Use Cases** — user workflow scenarios with interaction tests
- **Publishing** — GitHub Packages setup, versioning, consuming the package

## Development

All common tasks are available via the Makefile:

```bash
make help             # Show all available targets
make install          # Install dependencies
make dev              # Start Storybook dev server (port 6006)
make build            # Build Storybook for static hosting
make build-lib        # Build component library (dist/)
make lint             # Run ESLint (zero warnings)
make lint-fix         # Run ESLint with auto-fix
make typecheck        # Run TypeScript type checks
make check            # Run all checks (lint + typecheck)
make test             # Run unit tests
make test-coverage    # Run unit tests with coverage
make test-storybook   # Run Storybook interaction tests
make serve            # Serve built Storybook with basic auth
make preview          # Build then serve Storybook
make publish          # Build library and publish to GitHub Packages
make clean            # Remove build artifacts and node_modules
```

## Project Structure

```
src/
  index.ts            # Stable entry point
  canary.ts           # Canary entry point
  extras.ts           # Extras entry point
  components/         # Stable components
    atoms/            #   Buttons, inputs, badges, etc.
    molecules/        #   Cards, form groups, nav items, etc.
    organisms/        #   Headers, sidebars, data tables, etc.
  canary/             # Experimental components (canary → stable OK, not reverse)
    components/       #   atoms/, molecules/, organisms/
  extras/             # Supplementary components (extras → stable OK, not reverse)
    components/       #   atoms/, molecules/, organisms/
  visual-elements/    # Design tokens, colors, typography
  applications/       # Full-page application mocks
  use-cases/          # User workflow scenarios
  docs/               # Documentation pages (MDX)
  lib/                # Shared utilities
  styles/             # Global CSS
```

## Published Package

The library is published to GitHub Packages as `@arda-cards/ui-components`. It is built with Vite 6 in library mode (ESM + CJS) from three entry points: `src/index.ts` (stable), `src/canary.ts` (experimental), and `src/extras.ts` (supplementary).

### Export Paths

| Export | Resolves to | Description |
|---|---|---|
| `@arda-cards/ui-components` | `dist/index.js` (ESM) / `dist/index.cjs` (CJS) | Stable components, types, and utilities |
| `@arda-cards/ui-components/canary` | `dist/canary.js` (ESM) / `dist/canary.cjs` (CJS) | Experimental components (API may change) |
| `@arda-cards/ui-components/extras` | `dist/extras.js` (ESM) / `dist/extras.cjs` (CJS) | Supplementary components |
| `@arda-cards/ui-components/styles` | `dist/styles/globals.css` | Tailwind CSS v4 stylesheet |

### Exported Components

**Atoms** — `ArdaBadge`, `ArdaButton`, `ArdaConfirmDialog`, `ArdaTypeahead`

**Molecules** — `ArdaItemCard`, `ArdaTable` (+ Header/Body/Row/Head/Cell), `ArdaSupplyCard`

**Organisms** — `ArdaSidebar`, `ArdaItemDrawer`, `ArdaSupplierForm`, `ArdaSupplierDrawer`, `ArdaItemsDataGrid`, `ArdaSupplierDataGrid`, `ArdaItemSupplySection`, `ArdaItemSupplyFormDialog`, `createArdaEntityDataGrid` (factory)

**Domain types** — `BusinessAffiliate`, `ItemSupply`, `PostalAddress`, `Contact`, `Money`, `Duration`, and related model/reference types

**Utilities** — `cn` (class name merge), `getBrowserTimezone`, `getTimezoneAbbreviation`

### What Goes Into the Package

Only `src/components/`, `src/types/`, `src/lib/`, and `src/styles/` are compiled into `dist/`. The following directories are **excluded** from the published package:

- `src/vendored/` — Production app code used only for Storybook Full App stories
- `src/applications/` — Full-page application mocks (Storybook only)
- `src/use-cases/` — User workflow scenarios (Storybook only)
- `src/docs/` — Documentation pages (Storybook only)
- `src/visual-elements/` — Design token demos (Storybook only)

### Canary Export Path

The `./canary` subpath contains experimental components that are not yet part of the stable API. Canary components may change or be removed without a major version bump.

```typescript
// Consumer usage
import { CanaryAtomPlaceholder } from '@arda-cards/ui-components/canary';
```

**Dependency direction**: canary components may import from stable (`@/components/`, `@/lib/`), but stable code must never import from `@/canary/`. This is enforced by an ESLint `no-restricted-imports` rule.

**Promotion path**: move the component from `src/canary/components/` to `src/components/`, re-export from `src/index.ts`, remove from `src/canary.ts`.

### Extras Export Path

The `./extras` subpath contains supplementary components that extend the core library with additional functionality.

```typescript
// Consumer usage
import { ExtrasAtomPlaceholder } from '@arda-cards/ui-components/extras';
```

**Dependency direction**: extras components may import from stable (`@/components/`, `@/lib/`), but stable code must never import from `@/extras/`. This is enforced by an ESLint `no-restricted-imports` rule.

### Peer Dependencies

React 18 or 19 (`react`, `react-dom`). Bundled dependencies include AG Grid, Lucide icons, `class-variance-authority`, `clsx`, and `tailwind-merge`.

## Changelog

This project uses [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) with [Semantic Versioning](https://semver.org/spec/v2.0.0.html). The changelog is validated by [CLQ](https://github.com/denisa/clq-action) on every pull request targeting a protected branch.

### How it works

1. Before opening a PR, add a new entry at the **top** of [`CHANGELOG.md`](CHANGELOG.md).
2. Use one of the six categories defined in [`.github/clq/changemap.json`](.github/clq/changemap.json):

   | Category       | Version bump | When to use                       |
   | -------------- | ------------ | --------------------------------- |
   | **Added**      | minor        | New features                      |
   | **Changed**    | major        | Changes to existing functionality |
   | **Deprecated** | minor        | Soon-to-be removed features       |
   | **Fixed**      | patch        | Bug fixes                         |
   | **Removed**    | major        | Removed features                  |
   | **Security**   | patch        | Vulnerability fixes               |

3. Format the entry as:

   ```markdown
   ## [x.y.z] - YYYY-MM-DD

   ### Added

   - Description of the change
   ```

4. CI validates the changelog entry and semantic version on PRs to protected branches.
5. On merge to `main`:
   - A **GitHub Release** is created with the version tag and changelog body.
   - The library is **published to GitHub Packages** using the version from the changelog (the `version` field in `package.json` is not used for publishing).

## CI/CD

- **CI** — runs on every push: lint, type-check, unit tests, Storybook build, interaction tests, and changelog validation
- **Publish** — publishes the library to GitHub Packages on push to `main`; version is extracted from `CHANGELOG.md`
- **Deploy** — deploys Storybook to GitHub Pages on push to `main`
- **Release** — creates a GitHub Release from the changelog on push to protected branches
- **Dependabot** — weekly npm updates, monthly GitHub Actions updates

## Technology Stack

- **React 19** with TypeScript (strict mode)
- **Storybook 8** (React + Vite)
- **Tailwind CSS v4** with `@tailwindcss/postcss`
- **Vitest** + React Testing Library for unit tests
- **Storybook Test Runner** (Playwright) for interaction tests
- **ESLint v9** + Prettier for code quality
- **Vite** for library builds

## Contributing

1. Create a feature branch from `main`.
2. Follow the component development flow: component, story, tests.
3. Add a changelog entry to `CHANGELOG.md`.
4. Run `make check` and `make test` before pushing.
5. Open a pull request — CI will run automatically.
6. Get a review and merge to `main`.
