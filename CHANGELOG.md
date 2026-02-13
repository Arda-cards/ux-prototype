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
