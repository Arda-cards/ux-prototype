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

The library has three entry points: main (`index.ts`), `canary` (experimental), and `extras` (supplementary). Types mirror this split.

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

## Coding principles

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.
