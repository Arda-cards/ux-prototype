# CLAUDE.md

Storybook component library (`@arda-cards/design-system`) — React components built with Vite, Tailwind CSS v4, and Storybook 10.

## Commands

```bash
# Development
make dev                   # start Storybook dev server (port 6006)

# Build
make build                 # build Storybook for static hosting
make build-lib             # build component library to dist/

# Checks (run before pushing)
make lint                  # ESLint (zero warnings allowed)
make typecheck             # tsc --noEmit
make check                 # lint + typecheck

# Tests
make test                  # run unit tests (Vitest)
make test-coverage         # run with coverage thresholds
make ci                    # full CI pipeline: lint, typecheck, unit tests, Storybook build, play functions, VRT

# Publishing
make publish               # build library and publish to GitHub Packages
```

## Architecture

### Key concepts

- Storybook 10, Vite, React 19, Tailwind CSS v4, TypeScript 5.9
- Atomic design hierarchy: atoms, molecules, organisms (in `src/components/`)
- Factory pattern: component factories return `{ Component }` (not a bare component) — see `createArdaEntityDataGrid`
- `exactOptionalPropertyTypes: true` — omit keys entirely rather than passing `undefined`
- Vitest for unit tests — import `@testing-library/jest-dom/vitest` (not `@testing-library/jest-dom`)
- `eslint-plugin-react-hooks` is not installed — do not add `react-hooks/exhaustive-deps` disable comments
- VRT (visual regression tests) use Playwright against built Storybook

### Exports

The library has three source tracks: main (`index.ts`), `canary` (experimental), and `extras` (supplementary). Types mirror this split.

> **`extras/` is internal to this repo and must never form part of the published `@arda-cards/design-system` package.** Stories, `src/use-cases/`, tests and `src/archive/` may use it freely — none of them ship. But nothing reachable from `index.ts` or `canary.ts` may import from `@/components/extras` or `@/types/extras`, **including type-only imports** (they dangle in the emitted `.d.ts`). To use something from extras in shipping code, mirror it into the canary tree — see `src/types/canary/model/reference/items/item-domain.ts`. Enforced by `no-restricted-imports` in `eslint.config.mjs`. Full detail: `knowledge-base/component-tracks.md`.
>
> `extras` is still declared as a published entry point in `package.json` / `vite.config.ts`; removing it is tracked in PDEV-1332.

## Key directories

| Path | Purpose |
|---|---|
| `src/components/atoms/` | Atomic-level UI primitives |
| `src/components/molecules/` | Composed components |
| `src/components/organisms/` | Complex feature-level components |
| `src/components/canary/` | Experimental components not yet in main |
| `src/components/extras/` | Supplementary components |
| `src/types/` | Shared TypeScript types |
| `src/styles/` | Global CSS and Tailwind config |
| `src/use-cases/` | Use-case stories and MDX documentation |
| `src/docs/` | MDX documentation pages |
| `tools/` | Build scripts and helpers |


## PR workflow

Before creating a pull request, always ask the user if they want to add a new CHANGELOG version entry. Each PR should have its own version bump — do not add entries to an existing version that belongs to a different PR. Follow the categories in `.github/clq/changemap.json` (`Added` = minor, `Fixed` = patch, `Changed`/`Removed` = major).

## Knowledge base

The `knowledge-base/` directory contains repository-specific knowledge — recommended practices, patterns, insights, and lessons learned that are useful for working in this repo. Agents should:

- **Read** relevant files before starting work to understand repo-specific conventions.
- **Write** new insights discovered during implementation (patterns, gotchas, decisions) as Markdown files in this directory for future reference.
