# Phase 2 Backflow Suggestions

## S1: Fix FieldDescriptor Component Type
The `component` property in `FieldDescriptor<V>` is typed as `ComponentType<AtomProps<V>>`. When the descriptor map uses `V = unknown`, atoms with extra props (like `placeholder`) are not assignable without casts. Consider:
- Using `ComponentType<any>` (matches the existing `viewerSelection` approach in MountConfig)
- Or a branded type with runtime validation

## S2: Add Sub-Viewer Validation Protocol
The shell detects sub-viewers by displayName heuristic. Consider:
- A formal `isSubViewer` flag in FieldDescriptor
- Or a `SubViewerFieldDescriptor<V>` type extending `FieldDescriptor<V>`

## S3: Support Nested Error Paths
Currently field errors use flat `fieldPath` strings like `'contact'`. Sub-viewers could benefit from dot-path notation (`'contact.email'`) to route errors to specific nested fields. The shell could split on `.` and pass sub-errors to sub-viewers.

## S4: Default Title from Entity
Consider adding an optional `getTitle?: (entity: T) => string` to DesignConfig so the viewer can derive its title from the loaded entity, reducing boilerplate at mount sites.

## S5: Tab Validation for Sub-Viewers
Tab-level validation (tab-validator.ts) only validates atom-level fields. Sub-viewers with their own internal validation are skipped. Consider a `validateSubViewer` callback in the descriptor.
