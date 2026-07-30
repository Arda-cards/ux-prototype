# Component tracks: stable, canary, extras

`ux-prototype` organizes components into three tracks. The distinction that
matters most is **which of them ship**.

| Track | Location | Entry point | Ships to consumers? |
|-------|----------|-------------|---------------------|
| stable | `src/components/{atoms,molecules,organisms}/` | `src/index.ts` | **Yes** |
| canary | `src/components/canary/` | `src/canary.ts` | **Yes** (experimental, but published) |
| extras | `src/components/extras/` | `src/extras.ts` | **No — internal only** |

## extras is internal to this repo

**`extras/` must never form part of the published `@arda-cards/design-system`
package.** It is the off-maturity-track area for examples and reference
implementations; publishing it invites consumers to depend on components that
are on no stability track at all.

What that does **not** mean: `extras/` is perfectly fine to use from anything
that does not ship — Storybook stories, `src/use-cases/`, tests, and
`src/archive/`. Roughly 30 files legitimately import extras this way.

What it **does** mean: nothing reachable from `src/index.ts` or `src/canary.ts`
may import from `@/components/extras` or `@/types/extras`.

### New components go on the right track

Anything intended for consumers goes in `canary/` (or stable `index.ts`), never
`extras/`. Before changing a component, check which track it is on — a change
under `extras/` does not reach consumers at all.

## Porting a dependency out of extras

When shipping code needs something that currently lives in extras, **mirror it
into the canary tree** rather than importing across the boundary. Precedents:

- `src/types/canary/model/general/geo/postal-address.ts` (geo model)
- `src/types/canary/model/reference/items/item-domain.ts` (`Item` and its graph)

Each mirrored file carries a header comment naming its extras origin.

## The lint guard, and the gap that let a leak through

`eslint.config.mjs` enforces both boundaries (stable → canary/extras, and
canary → extras) via `no-restricted-imports`.

**Gotcha:** glob patterns like `@/types/extras/*` and `@/types/extras/**` only
match specifiers with a path segment *after* `extras`. They do **not** match the
bare barrel `@/types/extras`. For several releases that gap let

```ts
import type { Item } from '@/types/extras'; // ← slipped past the rule
```

survive in three shipping canary files, leaking extras types into the published
`canary.d.ts`. Bare barrel specifiers must therefore be listed explicitly in the
pattern group, and they now are.

If you add a new barrel (`src/types/<track>-something.ts`), add its exact
specifier to the guard — the globs will not cover it.

## Type-only imports are not exempt

`import type` is erased at runtime, so a cross-track type import looks harmless.
It is not: the emitted `.d.ts` still references the type, so if the source
barrel stops being published the consumer's typecheck breaks on a dangling
reference. Treat type imports exactly like value imports for track boundaries.

## Verify by artifact, not by intent

Config and lint state intent; only the build proves it. After changes that touch
packaging or track boundaries:

```bash
make build-lib
ls dist/            # extras.* / types-extras.* must be absent once PDEV-1332 lands
```

Then typecheck a real consumer against the built package.
