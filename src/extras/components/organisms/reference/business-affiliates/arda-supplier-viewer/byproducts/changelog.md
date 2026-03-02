# Phase 3 Changelog

## New Files
- `ArdaSupplierViewer.tsx` — Main viewer component using `createArdaEntityViewer` factory
- `ArdaSupplierViewer.stories.tsx` — 6 Storybook stories (DisplayModeStepped, EditModeStepped, CreateFlow, ErrorStates, ContinuousScrollEdit, SubViewerExpansion)
- `ArdaSupplierViewer.test.tsx` — 11 unit tests covering rendering, layout, validation, sub-viewers, and create flow
- `ArdaSupplierViewer.mdx` — Component documentation
- `index.ts` — Public exports barrel
- `configs/stepped-layout.ts` — 4-tab TabConfig (Identity, Contact, Address & Legal, Notes)
- `configs/continuous-scroll-layout.ts` — Field order for continuous-scroll layout
- `configs/roles-custom-field.tsx` — Checkbox group render function for BusinessRoleType
- `configs/sub-viewers.tsx` — ContactSubViewer, PostalAddressSubViewer, CompanyInfoSubViewer
- `mocks/supplier-data.ts` — Mock data, validation, async get/update mocks
- `src/docs/patterns/creating-entity-viewers.mdx` — Step-by-step pattern guide

## Modified Files
- `supplier-drawer/supplier-drawer.tsx` — Replaced internal view/edit logic with `<ArdaSupplierViewer>`; dropped Items tab, SuppliedItemRow, form state management
- `supplier-drawer/supplier-drawer.stories.tsx` — Simplified to ViewMode, AddMode, Closed, Interactive
- `supplier-form/supplier-form.tsx` — Replaced form internals with thin `<ArdaSupplierViewer>` wrapper
- `supplier-form/supplier-form.stories.tsx` — Simplified to SingleScroll, Stepped, Empty
- `supplier-form/supplier-form.test.tsx` — Rewritten to test new wrapper behavior
- `stepped-viewer/stepped-viewer.mdx` — Added deprecation notice
- `src/docs/component-guidelines.mdx` — Added entity viewer reference section
