# Plan: Canary Refactor — Order Queue & Receiving Flow

## Goal

Create a connected Canary Refactor flow where you can **click between Order Queue, Receiving, and Items** using the app sidebar — just like the real app. For this first commit, the pages render identically to Dev Witness. Then you iterate from there.

---

## How navigation will work

Right now, each Storybook story is isolated. When you click "Receiving" in the sidebar, it just logs to the console and nothing happens.

To fix this, we'll create a **flow wrapper component** that:
- Manages the current page as state (starts on `/order-queue`, `/receiving`, or `/items`)
- Listens for sidebar navigation clicks (Order Queue, Receiving, Items)
- Swaps the rendered page when you click — no page reload, just a React state change

This means you'll have one story called something like **"Transactions Flow"** where you can freely navigate between all three pages.

---

## Files to create

### 1. Flow wrapper (the mini router)

**`src/canary-refactor/components/TransactionsFlow.tsx`**

This is a new component that:
- Accepts a `startingPage` prop (so you can have stories that start on different pages)
- Renders `OrderQueuePage`, `ReceivingPage`, or `ItemsPage` based on current pathname
- Provides a real `NavigationContext` where `push('/receiving')` actually changes the page

```
pathname === '/order-queue'  →  renders OrderQueuePage
pathname === '/receiving'    →  renders ReceivingPage
pathname === '/items'        →  renders ItemsPage
```

### 2. Forked page components (copies of vendored pages)

These are straight copies for now. Later you'll swap in canary components.

| File to create | Copied from |
|---|---|
| `src/canary-refactor/components/OrderQueuePage.tsx` | `src/vendored/arda-frontend/app/order-queue/page.tsx` |
| `src/canary-refactor/components/ReceivingPage.tsx` | `src/vendored/arda-frontend/app/receiving/page.tsx` |

The Items page fork already exists at `src/canary-refactor/components/ItemsPage.tsx`.

### 3. Story file

**`src/canary-refactor/transactions/transactions-flow.stories.tsx`**

One story file with multiple entry points:

| Story | Starts on | What you see first |
|---|---|---|
| `StartAtOrderQueue` | `/order-queue` | Order Queue page, sidebar highlights "Order Queue" |
| `StartAtReceiving` | `/receiving` | Receiving page, sidebar highlights "Receiving" |
| `StartAtItems` | `/items` | Items page, sidebar highlights "Items" |

From any starting point, you can click the sidebar to navigate to the other two pages.

We'll also keep the individual standalone stories (Order Queue, Receiving) for isolated testing and the EmptyQueue variant.

### 4. Individual story files (for isolated testing)

| File to create | Based on |
|---|---|
| `src/canary-refactor/transactions/orders/order-queue.stories.tsx` | Dev Witness version |
| `src/canary-refactor/transactions/receiving.stories.tsx` | Dev Witness version |

These are simpler — single-page stories without navigation, good for focused testing and empty state variants.

---

## Summary of all files

```
src/canary-refactor/
  components/
    TransactionsFlow.tsx          ← NEW: mini router between 3 pages
    OrderQueuePage.tsx            ← NEW: copy of vendored order-queue/page.tsx
    ReceivingPage.tsx             ← NEW: copy of vendored receiving/page.tsx
    ItemsPage.tsx                 ← EXISTING: already forked

  transactions/
    transactions-flow.stories.tsx ← NEW: connected flow story
    orders/
      order-queue.stories.tsx     ← NEW: standalone Order Queue story
    receiving.stories.tsx         ← NEW: standalone Receiving story
```

---

## What we're NOT doing (yet)

- No component swaps — pages are 1:1 copies of production
- No new canary components
- No CSS changes — using vendored styles to match production exactly

---

## How to verify it works

1. Run `npm run build-storybook` (installs vendored deps + builds)
2. Run `npm run storybook`
3. Navigate to **Canary Refactor → Transactions → Transactions Flow → Start At Order Queue**
4. Click "Receiving" in the app sidebar → page should switch to Receiving
5. Click "Items" in the app sidebar → page should switch to Items
6. Click "Order Queue" → back to Order Queue

---

## After this commit

You'll have a connected flow to iterate on. From here you can:
- Swap vendored components with canary versions (one at a time, one commit each)
- Redesign layouts or interactions
- Add new pages to the flow
- Test the full user journey between pages
