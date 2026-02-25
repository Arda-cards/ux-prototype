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
