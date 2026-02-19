# Alternatives Considered

## A1: Recursive Entity Viewers vs. Sub-Viewer Components
**Chosen:** Sub-viewers as AtomProps components that render their own fields using Phase 1 atoms.
**Alternative:** Recursive `createArdaEntityViewer` calls for nested types (ContactViewer, AddressViewer).
**Rationale:** Sub-viewers are simpler and avoid the complexity of nested factory calls, nested state machines, and nested validation pipelines. The reference pattern should be straightforward.

## A2: Roles as Standalone Component vs. CustomField Render Function
**Chosen:** Render function injected into `ArdaCustomFieldInteractive`.
**Alternative:** Standalone `RolesCheckboxGroup` component with its own AtomProps interface.
**Rationale:** The CustomField render prop approach follows Phase 1's design for custom rendering. A standalone component would duplicate the mode-switching and label-rendering logic already in the atom.

## A3: Keep Items Tab vs. Drop It
**Chosen:** Drop the Items tab from SupplierDrawer.
**Alternative:** Keep the Items tab alongside the viewer.
**Rationale:** The Items tab is orthogonal to the entity viewer pattern. Re-adding it later as a separate concern is cleaner than mixing it into the viewer migration.

## A4: Full Visual Parity vs. Functional Parity
**Chosen:** Functional parity — same user flows, different appearance.
**Alternative:** Match the exact visual design of the original form/drawer.
**Rationale:** The atom-based rendering produces a different visual style. Forcing visual parity would require custom styling that fights the design system, defeating the purpose of the abstraction.
