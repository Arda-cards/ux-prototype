# Plan: Order Sidebar Panel (Purchase Order Flow)

## Context

Building the core PO creation workflow: a right-side sidebar panel where users create/edit purchase orders from order queue items. This is the central piece of the "Order Queue → Side Panel → Generate PO" flow from the Simplified PO Spec V1. Prototype-quality — mock data, no persistence, Storybook-driven.

**Figma reference:** `JJJ5Yb7t8hMe2LfCX0W5gQ` node `3791:158620`

**Deferred:** Item details/Cards tabs, Documint PDF generation, email clipboard copy.

**Approach:** Use the project's canary components (atoms/molecules/primitives). Be smart about picking the right one for each interaction — don't force-fit an overlay when we need a sidebar.

**Key UX decision:** This is a **sidebar panel that pushes content**, not an overlay/drawer/sheet. It sits inline in the page layout and compresses the main content area when open. No backdrop overlay, no slide-over.

---

## Step 1 — Add missing shadcn primitive: Select

Run `npx shadcn@latest add select` to add the Select component (needed for Order Type dropdown).

File: `src/components/canary/primitives/select.tsx`

---

## Step 2 — Order draft types

**Create** `src/types/orders/order-draft.ts`

Reuse `OrderMechanism` and `QuantityUnit` from `src/types/extras/reference/items/item-domain.ts`.

```
OrderDraftLine {
  id: string
  itemName: string
  imageUrl?: string
  sku?: string
  note?: string
  qty: number
  unit: string
  costPerUnit?: number
  lineCost?: number       // computed: qty × costPerUnit
  itemRef?: string        // source item entityId
  cardRefs?: string[]     // source kanban card IDs
}

OrderDraft {
  id: string
  orderType: OrderMechanism
  supplierName: string
  supplierAddress?: string
  supplierContact?: string
  deliverBy?: string
  deliverTo?: string
  lines: OrderDraftLine[]
  subtotal: number
  notes?: string
}
```

---

## Step 3 — OrderSheet sub-component (AG Grid line items)

**Create** `src/components/canary/molecules/order-sheet/order-sheet.tsx`
**Create** `src/components/canary/molecules/order-sheet/order-sheet-columns.ts`

Use the existing `DataGrid` from `src/components/canary/molecules/data-grid/data-grid.tsx` with custom column defs following the pattern in `src/components/canary/molecules/item-grid/item-grid-columns.tsx`.

**Column definitions** (order-sheet-columns.ts):

| Column | Field | Editable | Cell type | Width |
|---|---|---|---|---|
| ☐ | (selection) | — | checkbox | 40 |
| Item | itemName | no | image thumbnail + text | 160 |
| SKU | sku | yes | text editor | 120 |
| Note | note | — | NotesCellRenderer (icon button) | 50 |
| Qty | qty | yes | number editor | 70 |
| Unit | unit | yes | text editor | 100 |
| Cost/Ea | costPerUnit | yes | number editor w/ $ prefix | 90 |
| Cost | lineCost | no | currency formatter (computed) | 80 |

Reuse from item-grid:
- `NotesCellRenderer` pattern for the notes icon column
- `formatCurrencyValue` for Cost/Cost/Ea display
- `ImageCellDisplay` for item thumbnail (if available)

**Grid config:** compact row height (40px), no pagination, header checkbox for select-all, `domLayout='autoHeight'` to fit panel.

**Subtotal row:** Use AG Grid `pinnedBottomRowData` for the subtotal.

**Actions above grid:** "× Remove" button (removes selected rows) + "+ Add item" dropdown button.

**Props:**
```
OrderSheetProps {
  lines: OrderDraftLine[]
  onLinesChange: (lines: OrderDraftLine[]) => void
  onAddItem: () => void
}
```

---

## Step 4 — OrderPanel component (push-content sidebar)

**Create** `src/components/canary/organisms/order-panel/order-panel.tsx`

This is **not** a Sheet/Drawer overlay. It's an inline sidebar that pushes the main content when open. Built with plain `div` + CSS transitions.

**Layout pattern:**
```
{/* In the page layout */}
<div className="flex h-full">
  {/* Main content — shrinks when panel is open */}
  <div className="flex-1 min-w-0 transition-all">
    {/* Order Queue grid, etc. */}
  </div>

  {/* Order Panel — slides in from right, pushes content */}
  {panelOpen && (
    <div className="w-[680px] flex-shrink-0 border-l flex flex-col h-full
                    animate-in slide-in-from-right duration-200">
      ...
    </div>
  )}
</div>
```

**OrderPanel internal structure:**
```
<div className="flex flex-col h-full border-l bg-background">

  {/* Header — sticky */}
  <div className="sticky top-0 border-b px-5 py-3 flex items-center justify-between">
    <h2>"Purchase order"</h2>
    <button>✕</button>
  </div>

  {/* Scrollable body */}
  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
    — Order Type: Select dropdown (EMAIL, ONLINE, IN_STORE, PHONE, PURCHASE_ORDER, RFQ)
    — To *: TypeaheadInput for supplier (pre-filled from group)
    — Deliver by: <input type="date"> (optional)
    — Deliver to: Textarea (optional)
    — <OrderSheet /> (AG Grid line items)
    — Taxes, Fees, and Discounts (deferred)
  </div>

  {/* Footer — sticky */}
  <div className="sticky bottom-0 border-t px-5 py-3 flex justify-between">
    Cancel | Preview | Primary action (varies by orderType)
  </div>

</div>
```

**Supplier typeahead behavior:**
- Reuse `TypeaheadInput` from `src/components/canary/molecules/typeahead-input/typeahead-input.tsx`
- Shows all suppliers
- If user picks a supplier different from items' current supplier → confirm dialog:
  - "Yes" → mark all items to use this supplier
  - "No" → one-off for this order

**Footer primary action by orderType:**
| Type | Button |
|---|---|
| EMAIL | "Send" (split button w/ "Save as draft") |
| PURCHASE_ORDER | "Create PDF" |
| ONLINE | "Create shopping list" |
| IN_STORE | "Create shopping list" |
| PHONE | "Create order script" |
| RFQ | "Create quote request" |

All actions are stubs for the prototype (toast notification).

**Props (following StaticConfig/RuntimeConfig convention):**
```
OrderPanelInitProps {
  supplierLookup: (search: string) => Promise<TypeaheadOption[]>
}
OrderPanelRuntimeProps {
  open: boolean
  onClose: () => void
  draft: OrderDraft
  onChange: (draft: OrderDraft) => void
  onSubmit: (draft: OrderDraft) => void
}
```

---

## Step 5 — Stories + mock data

**Create** `src/components/canary/organisms/order-panel/__mocks__/order-mock-data.ts`
- `MOCK_ORDER_DRAFT` — 4 line items matching Figma (Titanium-Gold P..., 1" Raw Aluminu..., etc.)
- `MOCK_SUPPLIERS` — supplier list for typeahead
- `mockSupplierLookup` — async lookup function

**Create** `src/components/canary/organisms/order-panel/order-panel.stories.tsx`
- Controlled state wrapper
- Stories: Empty draft, Pre-filled draft, Different order types

---

## File Creation Order

| # | File | Purpose |
|---|---|---|
| 1 | `src/components/canary/primitives/select.tsx` | Select primitive (via CLI) |
| 2 | `src/types/orders/order-draft.ts` | Draft types |
| 3 | `src/components/canary/molecules/order-sheet/order-sheet-columns.ts` | AG Grid column defs |
| 4 | `src/components/canary/molecules/order-sheet/order-sheet.tsx` | AG Grid line items wrapper |
| 5 | `src/components/canary/organisms/order-panel/order-panel.tsx` | Push-content order sidebar |
| 6 | `src/components/canary/organisms/order-panel/__mocks__/order-mock-data.ts` | Mock data |
| 7 | `src/components/canary/organisms/order-panel/order-panel.stories.tsx` | Stories |

---

## Canary primitives used (already available)

| Component | Path |
|---|---|
| Button | `canary/primitives/button.tsx` / `canary/atoms/button/button.tsx` |
| Input | `canary/primitives/input.tsx` |
| Textarea | `canary/primitives/textarea.tsx` |
| Checkbox | `canary/primitives/checkbox.tsx` |
| Label | `canary/primitives/label.tsx` |
| DropdownMenu | `canary/primitives/dropdown-menu.tsx` |
| AlertDialog | `canary/primitives/alert-dialog.tsx` |

## To install (missing primitive)

| Primitive | Command |
|---|---|
| Select | `npx shadcn@latest add select` |

## Project components reused

| Component | Path |
|---|---|
| DataGrid (AG Grid wrapper) | `molecules/data-grid/data-grid.tsx` |
| Item grid columns (pattern reference) | `molecules/item-grid/item-grid-columns.tsx` |
| TypeaheadCellEditor | `molecules/item-grid/typeahead-cell-editor.tsx` |
| NotesCellRenderer pattern | `molecules/item-grid/item-grid-columns.tsx` |
| ImageCellDisplay | `atoms/grid/image/image-cell-display.tsx` |
| formatCurrencyValue | `molecules/item-grid/item-grid-columns.tsx` |
| TypeaheadInput | `molecules/typeahead-input/typeahead-input.tsx` |

---

## Verification

1. `npx tsc --noEmit` — no type errors
2. Storybook — OrderPanel stories render and interact correctly
3. Sidebar opens/closes, order type dropdown changes footer action
4. Supplier typeahead works, confirm dialog fires on mismatch
5. Line items editable (qty, cost/ea, sku, unit, note)
6. Subtotal auto-calculates on line changes
7. Remove selected lines works
8. "+ Add item" button present (stub action for now)
