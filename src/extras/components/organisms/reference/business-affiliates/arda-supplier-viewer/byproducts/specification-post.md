# Phase 3 Specification Post-Mortem

## Specification Accuracy
The implementation plan was highly accurate. All 10 tasks were implemented as specified with minimal deviations.

## Deviations from Plan

### D1: RolesFieldWrapper Component
**Plan:** Use `ArdaCustomFieldInteractive` directly in field descriptors with a render prop.
**Actual:** Created a thin `RolesFieldWrapper` component that injects the render function, because the shell calls the component without knowledge of the render prop.

### D2: Type Assertions for Field Descriptors
**Plan:** Straightforward component assignment in field descriptors.
**Actual:** Required `as AtomComponent` casts due to `exactOptionalPropertyTypes` + TypeScript contravariance with `FieldDescriptor<unknown>`. Documented as Phase 2 backflow item.

### D3: Supplier Form Test Rewrite
**Plan:** Update supplier-form stories only.
**Actual:** Also had to rewrite `supplier-form.test.tsx` since the old tests tested internal form elements that no longer exist after migration.

### D4: SupplierDrawer Mode Simplification
**Plan:** Keep view/add/edit modes.
**Actual:** Simplified to view/add only, since edit mode is handled internally by the viewer's Edit button.

## What Went Well
- Sub-viewer pattern worked as designed — displayName detection, collapsible containers, nested onChange propagation
- Dual layout (stepped + continuous-scroll) worked out of the box with the factory
- Validation pipeline (field-level + entity-level) integrated cleanly
- All 719 existing tests continued to pass after migration

## What Could Improve
- The `FieldDescriptor` component type needs better ergonomics (see suggestions.md S1)
- Nested error routing (dot-path) would improve sub-viewer error display (see S3)
