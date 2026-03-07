# changelog

[Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
[Semantic Versioning](https://semver.org/spec/v2.0.0.html)
clq validated

Keep the newest entry at top, format date according to ISO 8601: `YYYY-MM-DD`.

Categories, defined in [changemap.json](.github/clq/changemap.json):

- _major_ release trigger:
  - `Changed` for changes in existing functionality.
  - `Removed` for now removed features.
- _minor_ release trigger:
  - `Added` for new features.
  - `Deprecated` for soon-to-be removed features.
- _bugfix_ release trigger:
  - `Fixed` for any bugfixes.
  - `Security` in case of vulnerabilities.

## [2.0.1] - 2026-03-06

### Fixed

- Disabled HTTP Basic Authentication on Vercel Edge middleware, Express server, and Storybook
  dev middleware — the Storybook site is now publicly accessible without credentials
- Updated stakeholder instructions, README, and Makefile to reflect removal of auth

## [2.0.0] - 2026-03-05

### Added

- Dedicated type barrel entry points following the three-tier maturity model:
  `types`, `types/canary`, `types/extras`, `types/date-time`, `types/canary-date-time`,
  `types/extras-date-time` — each with ESM, CJS, and `.d.ts` outputs
- `package.json` subpath exports and `typesVersions` entries for all six type barrels
- Vite build entry points for type barrels in `vite.config.ts`
- "Importing Types" documentation section in the "Using the Design System" workflow page
- Co-located mock data files for stories and tests under
  `organisms/reference/business-affiliates/mocks/` and `organisms/reference/items/mocks/`

### Changed

- Domain model types (`BusinessAffiliate`, `Item`, `Money`, `PaginationData`, etc.)
  are now published from `types/extras` barrel instead of the `extras` component barrel —
  consumers should import types from `@arda-cards/design-system/types/extras`
- Timezone utilities (`IANA_TIMEZONES`, `searchTimezones`, etc.) moved to
  `types/extras-date-time` barrel to avoid bundling ~66 KB of IANA data with basic types
- All internal component, story, test, and mock imports updated to use type barrels
  instead of leaf-path imports
- "Package Exports" documentation reorganized into Components / Types / Styles subsections

### Removed

- `sampleAffiliates` and `sampleItemSupplies` removed from published type files and
  the `extras` barrel — replaced by co-located mock files for stories/tests
- `ModelCurrency`, `ModelMoney`, `ModelTimeUnit`, `ModelDuration` aliased re-exports
  removed from `extras` barrel
- Duplicate type definitions (`Currency`, `Money`, `TimeUnit`, `Duration`,
  `OrderMechanism`, `ItemClassification`, `Locator`) removed from `item-drawer.tsx` —
  now imported from `types/extras` barrel
- Domain type re-exports removed from `extras` component barrel (types are now in
  dedicated type barrels only)

### Fixed

- Added missing `@testing-library/dom` dev dependency (peer dependency of
  `@testing-library/react` that was never installed, causing test file load failures)

## [1.18.0] - 2026-03-05

### Added

- TypeScript declaration files (`.d.ts`) now emitted alongside JS/CJS outputs via `vite-plugin-dts`
  with rolled-up declarations per entry point (`index.d.ts`, `canary.d.ts`, `extras.d.ts`)
- `tsconfig.build.json` for library-only declaration generation (excludes stories, tests, vendored)
- CSS design tokens preset: `styles/tokens.css` (Nominal) and `styles/canary/tokens.css` (Canary)
  providing minimal CSS custom properties for consumers with their own Tailwind setup
- Consumer documentation: peer dependencies table, CSS token reference, and token import options
  in README and Storybook "Using the Design System" workflow page
- Coverage thresholds enforced via Vitest: statements 85%, branches 75%, functions 65%, lines 85%
- `coverage:summary` script and `make coverage-summary` target

### Fixed

- Moved `ag-grid-community`, `ag-grid-react`, and `lucide-react` from `dependencies` to
  `peerDependencies` to prevent version conflicts with consuming applications
  (kept in `devDependencies` for local Storybook development)
- Externalized `ag-grid-community`, `ag-grid-react`, and `lucide-react` in Vite build —
  extras bundle reduced ~90% (extras.js 1,607 kB to 162 kB)
- `ArdaDetailField` `fallback` prop JSDoc now clarifies it has no effect when `children` is provided

## [1.17.0] - 2026-03-04

### Added

- CSS architecture: three-theme system (Nominal, Canary, Vendored) with dedicated `src/styles/` directories
  and CSS layer system (`base` and `theme-override` layers)
- CSS Layer System documentation page explaining the cascade architecture
- Canary visual elements: Colors, Icons, and Assets stories mirroring vendored versions
- Vendored visual elements: Colors, Icons, and Assets stories separated from nominal
- Canary and vendored image assets under `public/canary/images/` and `public/vendored/images/`
- Using the Design System documentation page: installation, exports, styles, assets, and
  auto-generated "Current Content" inventory
- `tools/update-package-contents.js`: script to regenerate the package contents inventory
  from barrel files, styles, and assets
- `tools/copy-dist-assets.js`: post-build script to copy styles and assets into `dist/`
- Package exports for styles (`./styles`, `./styles/*`) and assets (`./assets/*`)
- ArdaDetailField exported from `src/canary.ts` barrel (first real canary component export)
- Publishing workflow: barrel export instructions, package contents regeneration guide,
  concrete code example for adding canary exports
- Canary components workflow: Phase 4 now includes barrel file export step with
  `update-package-contents.js` regeneration
- Canary components example: Phase 4 barrel export section and lesson learned about
  the barrel export gap
- Layout integrity smoke tests: sidebar visibility (5 stories) and AG Grid data
  visibility (2 stories) using `elementFromPoint`
- Storybook render smoke tests: batched into groups of 20 for better timeout handling

### Fixed

- Suppliers List View: AG Grid zero-height rows caused by flex chain break
  (`min-h-0 overflow-hidden` on parent containers)
- Suppliers List View: invisible sidebar caused by missing vendored CSS import
- Smoke test timeout: increased from 5 to 10 minutes, stories batched to avoid
  single-test timeout
- AG Grid theme: added `--ag-row-hover-color` token for row hover styling
- Storybook preview: normalized decorator to use Nominal theme by default
- Renamed `src/styles/extras/` to track-specific directories (`src/styles/`,
  `src/styles/canary/`, `src/styles/vendored/`)
- Dev Witness stories: consistent `@/styles/vendored/globals.css` imports
- Documentation terminology: standardized "stable" to "Nominal" across all docs
- Package name references: updated to `@arda-cards/design-system` in docs

## [1.16.0] - 2026-03-02

### Added

- Arda Style Guide documentation page: comprehensive design system reference covering design tokens,
  typography scale, page layout, component library conventions, icon system, screen patterns, and
  implementation guidance (first page in the Docs sidebar)
- From Figma documentation page: design system reference extracted from the Figma Hi-Fi Mockups
  with color palette, typography, spacing tokens, component inventory, screen patterns, icon system,
  and brand assets
- Updated About page: added Arda Style Guide, Component Classification, Agentation, Creating Entity
  Viewers, and From Figma entries to the Docs table; added design tokens quick link; fixed section
  count from eight to seven
- Storybook sidebar: Arda Style Guide now appears as the first page under the Docs section
- Component library reorganization: canary/extras subpath exports, Dev Witness section, Canary
  Refactor section, Playwright smoke tests

## [1.15.0] - 2026-03-02

### Added

- Sync vendored code from arda-frontend-app@02a31c4
  - 1 file(s) added
  - 2 file(s) modified

## [1.14.0] - 2026-02-28

### Added

- Sync vendored code from arda-frontend-app@8ce6887
  - 2 file(s) modified
  - 1 file(s) removed

## [1.13.0] - 2026-02-28

### Added

- Sync vendored code from arda-frontend-app@9297c1f
  - 1 file(s) added
  - 2 file(s) modified

## [1.12.0] - 2026-02-27

### Added

- Sync vendored code from arda-frontend-app@a01b1db
  - 6 file(s) modified

## [1.11.0] - 2026-02-27

### Added

- Sync vendored code from arda-frontend-app@cc48539
  - 2 file(s) added
  - 2 file(s) modified

## [1.10.0] - 2026-02-27

### Added

- Sync vendored code from arda-frontend-app@ce59316
  - 1 file(s) added
  - 1 file(s) modified

## [1.9.0] - 2026-02-26

### Added

- Sync vendored code from arda-frontend-app@89faa31
  - 3 file(s) modified

## [1.8.0] - 2026-02-26

### Added

- Sync vendored code from arda-frontend-app@eb1a0a0
  - 4 file(s) modified

## [1.7.0] - 2026-02-25

### Added

- Sync vendored code from arda-frontend-app@0c7abda
  - 1 file(s) added

## [1.6.0] - 2026-02-25

### Added

- Sync vendored code from arda-frontend-app@9c20765
  - 1 file(s) modified

## [1.5.0] - 2026-02-25

### Added

- Sync vendored code from arda-frontend-app@2aa6226
  - 1 file(s) modified

## [1.4.0] - 2026-02-25

### Added

- Sync vendored code from arda-frontend-app@8545227
  - 23 file(s) modified

## [1.3.0] - 2026-02-24

### Added

- Full App integration: vendored production page components from arda-frontend-app into Storybook
  - Pages: Dashboard, Items Grid, Item Detail, Order Queue, Receiving, Account Profile, Company Settings, Sign In, Kanban Card, Scan
  - Next.js shims for Storybook: next/navigation, next/image, next/font, next/headers
  - Composite decorator `withFullAppProviders` for Redux store, auth context, navigation, and sidebar
  - MSW request handlers for API mocking in Full App stories
  - Interactive play functions exercising use cases (UC-NEW-001, UC-AUTH-001, etc.)
- Visual Regression Testing (VRT) pipeline with Playwright
  - 10 full-page screenshot tests for Full App stories
  - CI workflow with baseline generation and diff artifact upload
  - Platform-independent snapshot paths for cross-OS compatibility
- Storybook test runner integration: 347 interaction tests across 73 story suites
- CI workflow: auto-merge for labeled PRs
- Documentation: Full App Integration architecture guide and Contributing guide

### Fixed

- ESLint configuration: added ignores for vendored code, test files, and Playwright config
- Shim and decorator files excluded from no-console rule

## [1.2.0] - 2026-02-18

### Added

- Molecule component: ArdaDataGrid with AG Grid integration, column persistence, and preset system
  - Items data grid preset with domain-specific column definitions and cell renderers
  - Suppliers data grid preset with business affiliate column definitions
  - Common cell renderers (badge, image, money, quantity) and column utilities
- Organism component: Entity Viewer (`createArdaEntityViewer`) with tabbed sub-viewers, continuous-scroll and stepped layouts, and container query responsive breakpoints
- Organism component: Entity Data Grid (`createArdaEntityDataGrid`) factory for domain-specific data grids
- Organism component: Stepped Viewer for multi-section vertical layouts
- Reference organism: ArdaSupplierViewer (Phase 3 entity-viewer reference usage) with custom fields, sub-viewer configs, and mock data
- Reference organism: Suppliers Data Grid with suppliers preset
- Reference organism: Supplier Form with form field atoms
- Atom components: 13 form field types (boolean, custom, date, date-time, duration, enum, image, money, number, quantity, text, time, url) each with Display, Editor, and Interactive variants
- Atom components: 10 grid cell types (boolean, custom, date, date-time, enum, image, number, text, time, url) each with Display, Editor, and Interactive variants
- Atom components: SelectCellEditor and TypeaheadCellEditor for AG Grid inline editing
- Atom component: FieldLabel with static label support for all form atoms
- Shared data type library (`src/lib/data-types/`) with formatters, atom type registry, and `createInteractive` factory
- Custom AG Grid theme (`ag-theme-arda.css`) with Arda brand colors and styling
- Agentation visual annotation tool integration:
  - Custom Storybook toolbar addon (`.storybook/addons/agentation-toggle/`) with ChatIcon toggle and Ctrl+Shift+A shortcut
  - Conditional decorator rendering Agentation overlay only when enabled via globals
  - Clipboard integration: "Copy JSON" for full annotation batch, per-annotation markdown copy
  - Claude Code skill (`tools/agentation-feedback/SKILL.md`) for parsing annotations into GitHub issues
  - Test stories and MDX documentation under `src/docs/agentation/`
- Documentation: About page, Component Classification guide, Atoms/Molecules/Organisms guide pages
- Documentation: Creating Entity Viewers pattern guide
- Documentation: expanded Use Cases documentation with framework DSL reference
- ESLint custom rule: `no-hardcoded-colors` for enforcing CSS variable usage
- Items data grid stories and documentation
- Use case: Create Supplier (happy path) with interactive and stepwise stories
- Exported additional public types: PostalAddress, Contact, BusinessAffiliate, ItemDomain, Locator, Pagination, Timezone

### Fixed

- Upgraded Storybook from 8.6 to 10.2.8 (ESM-only, updated addon APIs)
- Refactored SupplierDrawer to use ArdaSupplierViewer (entity-viewer pattern)
- Improved sidebar with updated navigation items and styling
- Updated application mock stories to use new DataGrid and entity viewer components
- Enhanced component documentation with lifecycle phase examples
- Moved server tools to `tools/` directory (`server.js`, `watch-rebuild.js`)
- Updated CI workflows for Node.js 22
- Removed reference to non-existent WithPagination story in items-data-grid MDX
- Fixed dependencies and imports for Storybook 10 compatibility

## [1.1.0] - 2026-02-13

### Added

- Atom component: ArdaConfirmDialog for cancel-with-confirmation flows
- Organism component: ArdaItemDrawer with view, add, and edit modes for inventory items
- Exported public types: ItemData, Supply, Money, Quantity, Duration, Locator, ItemClassification, OrderMechanism, Currency, TimeUnit, ItemDrawerMode

## [1.0.0] - 2026-02-12

### Added

- Migrated from Next.js to Storybook 8 + Vite as the UX prototype gallery framework
- Component library with Atomic Design hierarchy (atoms, molecules, organisms)
- Interface separation by lifecycle phase (StaticConfig, RuntimeConfig, InitConfig)
- Atom components: ArdaBadge, ArdaButton
- Molecule components: ArdaItemCard, ArdaTable (composite with six sub-components)
- Organism components: ArdaSidebar with collapsible navigation
- MDX documentation for every component with configuration lifecycle, usage examples, and accessibility notes
- Component Guidelines documentation page
- Application mock stories (Dashboard, Items, Order Queue) across Desktop, Tablet, and Mobile viewports
- Visual element stories for Colors, Icons, and Assets
- Use Case framework DSL with createUseCaseStories factory, useWizard hook, and UseCaseShell component
- Sample use case: Add New Inventory Item (Happy Path) with Interactive, Stepwise, and Automated stories
- Password protection via HTTP Basic Auth for dev server, Vercel Edge Middleware, and Express production server
- Vercel deployment configuration with static Storybook build
- CI workflow with lint, TypeScript check, unit tests, Storybook build, and Storybook test runner
- 43 unit tests (Vitest + Testing Library)
- Tailwind CSS 4 with PostCSS integration
- Custom Arda Storybook theme
