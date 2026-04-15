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

## [4.11.5] - 2026-04-14

### Fixed

- `ImageUploadDialog` edit-existing flow now prefetches the CDN image as a
  blob and uses the same-origin blob URL for both display (in the Cropper)
  and canvas operations (in `getCroppedImage`). This eliminates the CORS
  mismatch where the Cropper loaded with `crossOrigin: 'use-credentials'`
  but `getCroppedImage` re-fetched with `crossOrigin: 'anonymous'`, causing
  `canvas.toBlob()` to fail silently and the crop to no-op (Arda-cards/arda-frontend-app#750 issue 5c).
- Zoom-out (zoom < 1) no longer produces a black-square output. `getCroppedImage`
  now applies the zoom factor when drawing the source image; the output
  matches the editor preview, including transparent/black padding around
  the shrunken image (Option A semantics; Arda-cards/arda-frontend-app#750 issue 5a).
  The new API takes an options object: `getCroppedImage({ imageSrc, pixelCrop, rotation?, zoom?, outputFormat?, quality? })`.
- Zoom-only and rotation-only edits now produce visible changes. Refactored
  `ImagePreviewEditor` to fire three independent callbacks
  (`onCropComplete`, `onZoomChange`, `onRotationChange`) instead of a single
  `onCropChange`, so zoom/rotate adjustments no longer clobber the last
  valid pixelCrop with a zero-sized sentinel (Arda-cards/arda-frontend-app#750 issue 5b).
- Extracted shared `isCdnUrl` helper and new `prefetchImageAsBlob` helper
  to `src/types/canary/utilities/cdn-url.ts`.

## [4.11.4] - 2026-04-14

### Fixed

- Wire `getCroppedImage` result into the upload path in `ImageUploadDialog`
  edit-existing flow. Previously the cropped blob was discarded and the
  original URL was confirmed unchanged (`skipUpload: true`). Now: if
  crop/rotate produced a blob, it is uploaded as a new image; the new CDN
  URL is returned via `onConfirm`. Falls back to original URL only if
  canvas crop fails (e.g. CORS taint on non-production origins).

## [4.11.3] - 2026-04-14

### Fixed

- Flatten `createImageCellEditor` from double-forwardRef to single-forwardRef
  (FD-19). AG Grid 34.3.1's `TooltipService.setupCellEditorTooltip` reads
  `editor.isPopup?.()` synchronously; the nested forwardRef populated the
  handle one tick late, causing a crash in `AgTooltipFeature.postConstruct`.
- Add defensive `instanceof Blob` guard in `ImagePreviewEditor` before
  `URL.createObjectURL`. Prevents "Overload resolution failed" when
  `imageData` is null/undefined under transient lifecycle paths.
- Show "No Image Available" caption in `ImageHoverPreview` popover when
  the image URL is null, undefined, or empty string (Issue 2b).
- Normalize empty-string image URLs to null in `ImageCellDisplay` so the
  no-image state renders consistently across cell renderer and hover preview.

## [4.11.2] - 2026-04-10

### Fixed

- Pin TypeScript to ~5.9.3 — TypeScript 6.0 causes `vite-plugin-dts` to
  produce empty `.d.ts` files due to TS2882 errors on CSS side-effect
  imports, breaking all type exports from the published package.

## [4.11.1] - 2026-04-09

### Fixed

- Bump 13 dev dependencies: vitest 3→4, typescript 5.9→6.0, eslint 9→10,
  jsdom 26→29, lucide-react 0.x→1.x, express 4→5, and others. Includes
  compatibility fixes for vitest 4 mock types and @types/react title
  property conflict.

## [4.11.0] - 2026-04-09

### Added

- `ItemCardEditor` exported from canary barrel (`@arda-cards/design-system/canary`)
- `ItemCardFields`, `ItemCardEditorProps`, `ItemCardEditorInitProps`, and
  `ItemCardEditorRuntimeProps` types exported; `EMPTY_ITEM_CARD_FIELDS`
  exported as a value
- `onUpload` and `onCheckReachability` optional forwarding props on
  `ItemCardEditor` for production upload hook injection (Option B bridge —
  management#860)
- `TypeaheadInput` molecule: standalone async typeahead with debounced search,
  keyboard navigation, allow-create, and MSW-backed unit lookup matching the
  production API. Wired into `ItemCardEditor` units fields.
- `cellEditorMode` prop on `TypeaheadInput` for inline AG Grid editing
  (borderless input, blur-accepts-value, Popover dropdown for both modes)
- `createTypeaheadCellEditor` factory for AG Grid column definitions
- Unique IDs per `TypeaheadInput` instance via `useId()` — fixes ARIA when
  multiple typeaheads render on the same page
- `focus-ring` Tailwind utility in `globals.css` for consistent focus styling
- Clickable focus state on `ImageDropZone` to signal paste readiness (Ctrl+V)
- GitHub Actions dependency updates: `actions/upload-artifact` v4 → v7,
  `github/codeql-action` v3 → v4, `actions/deploy-pages` v4 → v5

### Fixed

- Drag-and-drop from Google Images now works — extracts image data from the
  HTML data URI the browser provides instead of using the unusable Google
  search result URL
- Deferred file rejection errors in `ImageDropZone` to allow URL/data URI
  fallback path before showing an error
- `ColorPicker` export was missing from 4.9.0 package due to publish race
  condition
- `make ci` port mismatch — aligned to port 6006 matching CI workflow and
  Playwright config

## [4.10.0] - 2026-04-08

### Added

- Pull Request Upkeep workflow to auto-assign new PRs to the GitHub Project
  board with the current iteration, matching arda-frontend-app and
  accounts-component conventions

## [4.9.0] - 2026-04-08

### Added

- `ColorPicker` atom: standalone swatch button with popover palette, arrow-key
  navigation, 44px touch targets, responsive wrapping for mobile.

### Deprecated

- `ColorSwatchPicker` — use `ColorPicker` instead. The old component coupled
  the swatch button with a color bar.

## [4.8.0] - 2026-04-08

### Added

- Edit Lifecycle framework types: `FieldError`, `ValidationResult`, `Validator<T>`,
  `EditPhase`, `EditLifecycleCallbacks<T>`, `EditableComponentProps<T>`
- `useDraft<T>` hook for managing edit draft state, validation, and lifecycle phases
- `setNestedField` utility for immutable dot-path field updates
- `UploadError` phase in `ImageUploadDialog` with retry and discard actions
- `contextErrors` prop on `ImageFormField` for parent-injected validation errors
- `initialValue` prop on `ImageFormField` as canonical data source
  (`imageUrl` deprecated)
- `ImageCellEditorConfig` interface with required typed provider hooks
  (`useImageUpload`, `useCheckReachability`) for FD-01/FD-15 compliance
- `ItemGridEditorHooks` interface with required typed provider hooks
- `ItemGridLookups` expanded to 9 lookup fields (was 2)
- `crossOrigin="use-credentials"` on `ImagePreviewEditor` crop canvas for
  CDN-hosted images (FD-17, requires infrastructure#439)

### Fixed

- `ImageUploadDialog` now shows an indeterminate spinner instead of a
  simulated progress percentage during upload (FD-04)
- `ImageUploadDialog` triggers upload directly on confirm instead of
  after a simulated delay

### Deprecated

- `ImageFormField.imageUrl` prop — use `initialValue` instead

## [4.7.0] - 2026-04-06

### Added

- Canary variants for all Business Affiliates use-case stories: 13 new story
  files covering Browse & Search, Create Supplier, Edit Supplier, Delete
  Supplier, and Affiliate Typeahead — each self-contained with canary
  components (Sidebar, AppHeader, createEntityDataGrid, ItemDetails) and no
  extras/vendored dependencies
- Play function parity: 21 additional story variants added to canary files to
  match original coverage (EmptyState, LoadingState, ErrorState, NoResults,
  HideAll, SelectAll, MinimalData, CloseDrawer, SectionCollapse,
  NetworkError, DuplicateNameError, CancelDiscards, BulkDelete, CancelDelete,
  KeyboardNavigation, EscapeDismiss, and more)
- Layout integrity smoke tests for canary suppliers page (sidebar visibility
  and AG Grid data visibility)

### Fixed

- Renamed `ArdaConfirmDialog` to `ConfirmDialog` for consistency with other canary library components. The old names (`ArdaConfirmDialog`, `ArdaConfirmDialogProps`, `ArdaConfirmDialogStaticConfig`, `ArdaConfirmDialogRuntimeConfig`) are still exported as deprecated aliases.

## [4.6.0] - 2026-04-06

### Added

- `ImageDropZone` redesign: upload icon, "Select file" outline button, simplified
  URL input, gray-50 background, and passive copyright subtext replacing the
  checkbox in `ImageUploadDialog`.
- HEIC-to-JPEG client-side conversion via `heic2any` — Apple photos now preview
  and store correctly across all browsers.
- `ItemCardEditor` organism: reusable WYSIWYG card editor with inline image
  upload (no dialog for new images, crop dialog for editing existing).
- Loading spinner on "Select file" button during HEIC conversion.
- Color swatch picker for `ItemCardEditor` — accent color selection for card
  dividers and branding elements.

### Fixed

- `ImageUploadDialog` too wide on mobile — responsive `max-w`, removed fixed
  `min-width` on crop area, wrapping action buttons.
- 14 Storybook play functions updated for redesigned `ImageDropZone` selectors.
- Global `heic2any` mock added to fix 6 test suite failures in jsdom.
- Flaky VRT timeout resolved by using `waitUntil: 'load'`.

## [4.5.0] - 2026-03-31

### Added

- `CLAUDE.md` quick-reference guide for Claude Code agents.

## [4.4.2] - 2026-03-28

### Fixed

- Hypothesis bridge not working on GitHub Pages: the bridge relied on a Vite
  dev server proxy (`/hypothesis-proxy`) that only exists in local development.
  In production builds, the client now calls the Hypothesis API directly via
  CORS with a per-user API token stored in localStorage, entered through a
  1Password-compatible login form.

## [4.4.1] - 2026-03-27

### Fixed

- Clarify StaticConfig vs InitConfig distinction in Component Guidelines (Section
  4.1): StaticConfig is system-level and release-gated; InitConfig carries
  user/tenant-configurable properties stable for the session. Added decision test
  and tenant-configurable examples (locale, displayName).

## [4.4.0] - 2026-03-26

### Added

- Entity Media use case stories (GEN-MEDIA-0001 Set Entity Image): 30 stories
  covering set image, input detection, format validation, URL validation,
  preview/crop, confirm/persist, and grid inline edit scenarios
- Entity Media use case stories (GEN-MEDIA-0002 Remove Entity Image): 3 stories
  for remove-from-form, cancel, and playground
- Entity Media use case stories (GEN-MEDIA-0003 View Entity Image): 10 stories
  for grid thumbnails, hover preview, inspector overlay, and thumbnail fallback
- Item integration stories (REF-ITM-0003::0010): vendored reference story and
  canary simplified-form story for set image during item creation
- Item integration stories (REF-ITM-0004::0006): 2 canary stories for change
  and remove item image via grid and detail panel
- 17 `description.mdx` files with scenario descriptions linking to product
  use case specifications
- Use-case mock data module (`_shared/mock-data.ts`) with File, Blob, URL,
  and upload-variant mocks for input method simulation
- Hierarchical sidebar ordering for Entity Media section with scenario-level
  fold/expand grouping in `preview.ts`
- Items use case index (`items.mdx`) updated with ITM-0003::0010 and
  ITM-0004::0006 entries

## [4.3.0] - 2026-03-25

### Added

- Agentation → Hypothesis bridge: the Copy feedback button now posts annotations to the
  Hypothesis API for persistent storage and threaded discussion in the `arda-products` group
- Hypothesis sidebar embedded in the Storybook preview iframe with per-story URL scoping
- Highlight layer renders numbered grey badges on elements with existing Hypothesis annotations
- Page notes fallback for annotations on elements without visible text content
- Vite server plugin proxying Hypothesis API requests with server-side token injection
- Agentation `onCopy` handler now posts to Hypothesis, clears localStorage, and resets
  the overlay in addition to copying markdown to clipboard
- Badges refresh on window focus to reflect deletions made in the Hypothesis sidebar
- Unit tests for annotation transform, HTTP client, and highlight utilities (34 tests)
- Workflow documentation page: Docs/Workflows/Providing Feedback

## [4.2.0] - 2026-03-25

### Added

- Generalized use-case story framework: `createWorkflowStories` factory accepts generic
  `renderScene`/`renderLive` callbacks, enabling any multi-step workflow (dialog flows,
  component interactions) to produce Interactive/Stepwise/Automated story variants
- ImageDisplay edit-flow stories: Interactive, Stepwise (8-scene walkthrough), and Automated
  (play-function-driven animation through the full edit-upload workflow)
- Entity Data Grid Shim MDX documentation

### Fixed

- ImageDropZone: `handlePaste` no longer intercepts text paste events targeting the URL input;
  lets native paste + onChange handle URL text normally
- ImageDropZone: `handleDrop` parses `text/uri-list` per RFC 2483 and auto-submits valid HTTPS
  URLs from browser drag-and-drop
- ImageDropZone: Go button changed from `secondary` to `primary` variant for clear visual
  distinction between enabled and disabled states
- ImageDropZone MDX updated with clipboard paste, URL drag-from-browser, and Go button
  documentation
- Entity Data Grid Kitchen Sink story title flattened to prevent folder icon in sidebar

## [4.1.0] - 2026-03-24

### Added

- Image upload component suite: 19 components across 6 tiers (utilities, primitives, atoms,
  molecules, organisms) implementing the Entity Media Management use cases (`GEN::MEDIA::0001`,
  `0002`, `0003`)
- New utilities: `getInitials` (extracted from item-grid-columns), `getCroppedImage` (canvas helper),
  `ImageFieldConfig` and related types (`ImageMimeType`, `ImageInput`, `ImageUploadResult`,
  `CropData`, `PixelCrop`)
- New ShadCN primitives: alert-dialog, checkbox, popover, progress, slider, aspect-ratio
- New atoms: `CopyrightAcknowledgment` (mandatory checkbox for image ownership confirmation),
  `ImageCellDisplay` (AG Grid cell renderer), `ImageCellEditor` with `createImageCellEditor` factory
- New molecules: `ImageDisplay` (foundational rendering with loaded/loading/error/no-image states),
  `ImageDropZone` (unified input surface: drag-drop, file picker, URL entry, paste),
  `ImagePreviewEditor` (crop/zoom/rotate/pan with react-easy-crop),
  `ImageHoverPreview` (500ms delay popover), `ImageInspectorOverlay` (full-size modal),
  `ImageComparisonLayout` (responsive desktop side-by-side / mobile tabs),
  `ImageFormField` (form field renderer with hover action icons and remove confirmation)
- New organism: `ImageUploadDialog` (state machine orchestrator: EmptyImage, ProvidedImage,
  FailedValidation, Uploading, Warn states with mock presigned-POST upload)
- Modified atoms: `Badge` error-overlay variant, `Avatar` entityName prop with auto-computed initials
- Modified molecules: `item-grid-columns` replaced inline `ImageCellRenderer` with `ImageCellDisplay`
- New dependencies: react-easy-crop, browser-image-compression, heic2any (lazy-loaded)
- MDX documentation for all new components, form guide, and updated primitives index
- Storybook `src/types/**/*.mdx` glob for utilities documentation
- Barrel exports in `canary.ts` for all new components, types, and utilities
- 112 new unit tests (96 test files / 1159 total tests)
- 76 new Storybook stories across 15 story files

### Fixed

- `src/types/canary/` restructured: `utils.ts`, `pagination.ts`, `date-time.ts` moved into
  `utilities/` subdirectory with barrel re-export (116 import paths updated)
- Primitives MDX: standalone `Meta title` (now appears in sidebar); added 6 new primitives to table
- Tabs primitive: `data-horizontal:flex-col` replaced with `data-[orientation=horizontal]:flex-col`
  (selector never matched because Radix sets `data-orientation="horizontal"`, not `data-horizontal`)
- Slider primitive: track height made unconditional (`h-1.5` instead of
  `data-[orientation=horizontal]:h-1.5`) so the track line is always visible

## [4.0.1] - 2026-03-24

### Fixed

- MSW service worker registration on GitHub Pages: use relative URL (`./mockServiceWorker.js`)
  instead of default absolute (`/mockServiceWorker.js`) so the worker resolves correctly under
  the `/ux-prototype/` base path. Fixes all stories with per-story MSW handlers (Business
  Affiliates, Dev Witness Items Grid, etc.) that showed `InvalidStateError` on the published site.

## [4.0.0] - 2026-03-20

### Added

- Canary primitives layer: 13 stock shadcn/ui components in `components/canary/primitives/`
  (collapsible, dropdown-menu, input, label, separator, sheet, sidebar, skeleton, table, tabs,
  textarea, toggle, tooltip) plus button primitive
- Canary atoms: avatar, badge (ArdaBadge), button (ArdaButton), card, dialog, drawer (ArdaDrawer),
  icon-button, icon-label, input-group, read-only-field, search-input, brand-logo
- Canary `SelectCellEditor` atom with custom listbox, keyboard navigation, checkmark indicator,
  ARIA roles, and `createSelectCellEditor` factory — replaces `EnumCellEditor`
- Canary sidebar organism (ArdaSidebar) with 5 sidebar molecules (header, nav, nav-item,
  nav-group, user-menu)
- Canary app-header organism with search, action buttons, leading content
- Canary item-details organism with drawer, field list, card preview, action toolbar
- Canary item-grid organism built on entity-data-grid factory — delegates all general-purpose
  capabilities (search, drag-to-scroll, auto-publish, pagination, toolbar, actions column)
- Entity-data-grid row-auto-publish lifecycle: `onRowPublish` async callback, pending changes
  accumulation per row, 50ms debounce on blur, row visual states (saving/error CSS classes),
  imperative `saveAll`/`discardAll`/`getDirtyRowIds` ref API
- Entity-data-grid search/filter UI: `searchConfig` factory config, 150ms debounce, count display
- Entity-data-grid actions column: `actionsColumn` InitConfig (mount-time ColDef)
- Entity-data-grid client-side pagination mode: `paginationMode: 'client'` StaticConfig
- Entity-data-grid toolbar slot, auto-height mode, drag-to-scroll opt-in
- Entity-data-grid `getGridApi()` on ref for imperative AG Grid access
- Use-case composition stories: items browse/view/edit (REF::ITM), suppliers browse/view (REF::BA),
  list view behaviors (GEN::LST), entity-data-grid KitchenSink
- MDX documentation for all new atoms, molecules, organisms, and primitives layer
- Arda orange design token system in globals.css + tokens.css (OKLch palette, control heights,
  state ramp, Geist Mono font, touch-device responsive sizing)
- `themeQuartz` AG Grid theming with design-system token mapping in DataGrid molecule

### Changed

- `canary.ts` barrel: added all new component exports; removed ArdaDetailField
- `tokens.css` is now single source of truth for token values; `globals.css` imports it
- DataGrid molecule uses `themeQuartz` (replaced `'legacy'` theme string)
- Entity-data-grid editing: row-auto-publish replaces cell-granular `onEntityUpdated`
- Entity-data-grid-shim: deprecated (kept for migration compatibility)

### Removed

- `ArdaDetailField` atom (replaced by `ReadOnlyField`)
- `EnumCellEditor` / `EnumCellDisplay` atoms (replaced by `SelectCellEditor` / `SelectCellDisplay`)
- `useDirtyTracking` as primary hook (superseded by `useRowAutoPublish`; kept as re-export)
- Legacy sidebar CSS (`.sidebar-menu-button-hover`, `[data-active='true']` styles)
- `@radix-ui/react-tooltip` production dependency (superseded by `radix-ui` unified package)

## [3.0.0] - 2026-03-17

### Added

- Canary cell atoms: text, number, boolean, date, enum (Display + Editor + factory each),
  memo (Display + Editor + MemoButtonCell + createMemoButtonCellEditor), color (Display + Editor + factory)
- Canary `ActionCellRenderer<T>` atom with portal dropdown menu
- Canary `DataGrid<T>` molecule with `SortMenuHeader` (portal dropdown), `useColumnPersistence`,
  AG Grid native row selection (`headerCheckbox: true`)
- Canary `createEntityDataGrid<T>()` factory with multi-sort, filtering, cell editing lifecycle, getRowClass
- Canary `createEntityDataGridShim<T>()` vendored-compatible wrapper with row actions, double-click,
  hasActiveSearch, initialState, extended ref (refreshData, getSelectedRows, selectAll, deselectAll)
- Canary `useDirtyTracking<T>()` composable hook
- `PaginationData` type in `types/canary/pagination.ts`
- Canary `formatters` utilities in `components/canary/atoms/shared/formatters.ts`
- Canary `ag-theme-arda.css` styles with SortMenuHeader CSS classes
- Canary-refactor stories for Items Grid and Item Detail (hybrid canary grid + vendored page chrome)
- ESLint boundary rule: canary code cannot import from extras

### Changed

- `canary.ts` barrel: added all new component, type, and hook exports
- `types/canary.ts`: added `PaginationData` export

### Removed

- `CanaryAtomPlaceholder`, `CanaryMoleculePlaceholder`, `CanaryOrganismPlaceholder` components and exports

## [2.1.0] - 2026-03-06

### Added

- Procurement use-case documentation pages: Context, References, Orders, and Receiving
- Persona documentation pages: Alan (Account Admin), David (Purchasing Manager),
  Irene (Inventory Manager), Keisha (Receiving Clerk), Sam (Shop-Floor Worker)
- Storybook sidebar ordering for procurement use-case section

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
