# Phase 3 Learnings

## exactOptionalPropertyTypes Patterns
- When passing `editable?: boolean` from a parent AtomProps to a child atom, cannot spread directly if the value might be `undefined`. Must use conditional spread helpers: `editableProp(editable)` returns `{ editable: true }` or `{}`.
- Same applies to `errors?: string[]` — need `errorsProp(errors)` helper.
- The `withOptional()` helper from the original SupplierForm was reused in sub-viewers for the same reason.

## Component Type Assignability in FieldDescriptor
- `FieldDescriptor<unknown>` expects `ComponentType<AtomProps<unknown>>`, but atoms like `ArdaTextFieldInteractive` have additional static config props (`placeholder`, `maxLength`) that make them incompatible due to TypeScript's contravariance on function parameters.
- Sub-viewers accept `AtomProps<Contact | undefined>` etc., not `AtomProps<unknown>`.
- Workaround: `as AtomComponent` cast. This is safe because the shell only passes AtomProps properties.
- Proper fix: Phase 2 should use a more flexible component type, possibly `ComponentType<any>` with a runtime contract, or existential types when TypeScript supports them.

## Sub-Viewer Detection
- Phase 2 shell detects sub-viewers by checking `component.displayName` or `component.name` for "viewer"/"subviewer" (case-insensitive).
- All sub-viewers MUST have `displayName` set containing "SubViewer" for proper collapsible container wrapping.

## Factory Pattern: No Factory in Render
- `createArdaEntityViewer` must be called outside React render functions (at module scope). Calling it inside a component creates a new component identity on every render, destroying React's reconciliation.
- For stories with different configs (e.g., error viewer), create separate factory instances at module scope.

## Async Mock Delays
- The 300ms delay in `getSupplier()` means tests must use `waitFor` to handle the loading state.
- Create flow (no entityId) is synchronous — `newInstance()` runs immediately, no loading state.
