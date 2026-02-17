# Decision Log

## DL1: Sub-viewers as AtomProps components
**Decision:** Sub-viewers implement `AtomProps<V>`, not recursive entity viewers.
**Rationale:** Simpler, avoids nested state machines. Sub-viewers render their own fields using Phase 1 atoms and call parent onChange with updated objects.

## DL2: Roles as simplified BusinessRole[]
**Decision:** Checkbox per BusinessRoleType, creates `{ role: type }` objects. No per-role notes.
**Rationale:** Simplifies the UI. Per-role notes can be added later if needed.

## DL3: Drop Items tab from drawer
**Decision:** Drawer shows only ArdaSupplierViewer.
**Rationale:** Simplifies migration. Items tab is orthogonal to entity viewing.

## DL4: Functional parity for migration
**Decision:** Same user flows, different visual appearance.
**Rationale:** Atom-based rendering produces different visuals. Forcing visual parity fights the design system.

## DL5: Use actual type names
**Decision:** `postalCode` (not zipCode), `VENDOR`/`CUSTOMER`/etc. (not Supplier/Manufacturer/etc.)
**Rationale:** Matches the TypeScript type definitions exactly.

## DL6: CustomField render function for roles
**Decision:** Render function injected into ArdaCustomFieldInteractive via wrapper component.
**Rationale:** Follows Phase 1 CustomField design. Wrapper needed because shell doesn't know about render prop.

## DL7: Type assertions for FieldDescriptor components
**Decision:** Use `as AtomComponent` casts for component properties in field descriptors.
**Rationale:** TypeScript contravariance prevents direct assignment when atoms have extra props beyond AtomProps. The cast is safe because the shell only passes AtomProps properties. Filed as Phase 2 backflow item (S1).

## DL8: SupplierDrawer mode simplified to view/add
**Decision:** Removed explicit `edit` mode from drawer; viewer handles edit internally.
**Rationale:** The entity viewer has its own Edit button and edit state management. An external `edit` mode would conflict.
