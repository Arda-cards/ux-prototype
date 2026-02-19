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
  components/
    atoms/            # Buttons, inputs, badges, etc.
    molecules/        # Cards, form groups, nav items, etc.
    organisms/        # Headers, sidebars, data tables, etc.
  visual-elements/    # Design tokens, colors, typography
  applications/       # Full-page application mocks
  use-cases/          # User workflow scenarios
  docs/               # Documentation pages (MDX)
  lib/                # Shared utilities
  styles/             # Global CSS
```

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
