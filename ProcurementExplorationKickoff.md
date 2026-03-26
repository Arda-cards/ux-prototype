# Procurement Exploration Kickoff

## What we're exploring

The current Arda procurement flow is split across three separate pages:

1. **Items** — Browse inventory, see what needs reordering
2. **Order Queue** — Items that have been flagged for ordering, grouped by supplier or order method
3. **Receiving** — Track items in transit, mark them as received

Each page is a full-screen view with its own sidebar, header, loading state, and API calls. Navigating between them is a full page transition.

**The question:** Is this the right UX? Could this be simpler? Could we merge some or all of these into a single "Work Orders" view? Could the flow be more continuous instead of jumping between pages?

---

## The current data lifecycle

An item moves through these statuses:

```
AVAILABLE → REQUESTING → REQUESTED → IN_PROCESS → READY → FULFILLING → FULFILLED
   (Items)     (Order Queue)   (Order Queue)   (Receiving)                (Receiving)
```

**Key data on an order item:**
- Name, quantity, SKU, image
- Supplier name
- Order method (Online, Purchase Order, Phone, Email, In Store, RFQ, Production, 3rd Party)
- Unit price, taxable flag
- Status (the lifecycle above)
- Notes, link (supplier URL)
- Location (facility, department, location)

**Key UI patterns in the current pages:**
- Items grouped by supplier OR by order method (collapsible groups)
- Tabs for different status buckets (Ready/Recent on Order Queue; In Transit/Received/Fulfilled on Receiving)
- Status badges with color coding
- Item detail panel (slides in from the right)
- Bulk actions (select multiple, email supplier, print labels)
- Search/filter across items

---

## Why Storybook (Option A) is the right approach

Instead of wiring up the vendored pages with real API calls and fighting flicker, we'll build **new standalone components** with:

- **Inline mock data** — no API calls, no MSW, no auth. Just arrays of realistic items defined in the story file.
- **Local React state** — moving an item from "queue" to "receiving" is just updating an array. Instant, no flicker.
- **Canary components** — use the existing design system (buttons, badges, grids, cards) as building blocks.
- **Fast iteration** — change the layout, add a tab, merge two views — it's just React. No vendored code to fight.

---

## Exploration ideas to try

These are starting points. You don't have to do all of them — pick whichever feels most promising and iterate.

### Idea 1: Unified "Work Orders" view
One page with a status pipeline. Instead of three separate pages, show all items in a single view with columns or tabs for each stage:

```
[ Needs Ordering | In Queue | Ordered / In Transit | Received ]
```

Drag-and-drop or click to advance items through stages. The sidebar/header stay mounted — no page transitions at all.

### Idea 2: Kanban board
A visual board (like Trello/Linear) where each column is a status. Cards represent order items. Drag to advance. Good for seeing the full pipeline at a glance.

### Idea 3: Simplified two-phase flow
Merge Order Queue + Receiving into one view with just two modes:
- **Ordering** — select items, group by supplier, send orders
- **Receiving** — check off items as they arrive

Items page stays separate but has a clear "Add to order" action.

### Idea 4: Timeline/activity view
Show each item's journey as a timeline. Focus on the history: when was it requested, ordered, shipped, received? Good for auditing and tracking delays.

---

## Implementation plan

### Phase 1: Scaffold and mock data (first commit)

**Create the mock data file:**
`src/use-cases/procurement/explorations/mock-data.ts`

Define ~15 realistic order items across all lifecycle stages with suppliers, quantities, prices, order methods. This is your "database" — every exploration pulls from it.

```tsx
// Example shape
interface WorkOrderItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  supplier: string;
  orderMethod: 'Online' | 'Purchase order' | 'Phone' | 'Email' | ...;
  status: 'needs-order' | 'queued' | 'ordered' | 'in-transit' | 'received' | 'restocked';
  unitPrice: number;
  sku: string;
  notes: string;
  location: string;
  orderedAt?: string;
  receivedAt?: string;
}
```

**Create the first exploration component:**
`src/use-cases/procurement/explorations/WorkOrdersExploration.tsx`

A single component that:
- Renders all items in a tabbed or columnar layout
- Manages status transitions via local state (click "Mark as Ordered" → item moves to next tab)
- Uses canary components for UI (Button, Badge, DataGrid or simple table)
- No sidebar, no header — just the content area, focused on the flow

**Create the story:**
`src/use-cases/procurement/explorations/work-orders.stories.tsx`

Stories for different states:
- `Default` — mix of items across all stages
- `EmptyQueue` — nothing to order
- `AllInTransit` — everything ordered, waiting on deliveries
- `Playground` — interactive, full lifecycle

### Phase 2: Iterate on the design

This is where you explore. For each idea you want to try:

1. Duplicate the exploration component (or branch it with a prop)
2. Rearrange the layout, add/remove sections, change the interaction model
3. Each version gets its own story so you can compare side-by-side

Name stories clearly so stakeholders can review:
- `Explorations/Work Orders V1 — Tabbed Pipeline`
- `Explorations/Work Orders V2 — Kanban Board`
- `Explorations/Work Orders V3 — Two Phase`

### Phase 3: Refine the winner

Once you've picked a direction:
1. Polish the component with real design tokens and spacing
2. Add interaction tests (play functions)
3. Consider which parts should become reusable canary components
4. Share with stakeholders via the deployed Storybook

---

## What to keep from the current work

The existing files we created are still useful:

| File | Keep? | Why |
|---|---|---|
| `canary-refactor/components/OrderQueuePage.tsx` | Yes | Reference for current behavior |
| `canary-refactor/components/ReceivingPage.tsx` | Yes | Reference for current behavior |
| `canary-refactor/components/TransactionsFlow.tsx` | Optional | Can remove if not using connected flow |
| `use-cases/procurement/explorations/*.stories.tsx` | Evolve | These become the home for new explorations |

---

## Suggested first session

1. Create the mock data file with ~15 items across all stages
2. Build a simple tabbed view component (4 tabs: Needs Order / Queued / In Transit / Received)
3. Add click-to-advance: clicking "Order" on an item moves it to the next tab
4. Review in Storybook and decide what to try next

This gets you a working interactive prototype in one session. From there you can reshape it however you want.
