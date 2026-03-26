# Storybook Guide for Designers

A plain-language walkthrough of how this project works, written for designers who want to build and iterate on components.

---

## What is Storybook?

Storybook is a tool that lets you build and preview UI components in isolation — outside of the full Arda application. Think of it like an interactive style guide where every component has its own page showing all its variations (sizes, states, colors, etc.).

When you run `npm run storybook`, it opens a local website at http://localhost:6006 where you can browse, interact with, and test components.

---

## How this project is organized

Everything you'll work with lives inside the `src/` folder:

```
src/
  components/          ← The component library (what you'll mostly work in)
    atoms/             ← Small building blocks (buttons, badges, inputs)
    molecules/         ← Groups of atoms (data grids, cards, tables)
    organisms/         ← Full features (sidebars, drawers, complex forms)
    canary/            ← Components still being refined (see below)
    extras/            ← Reference implementations, not on the promotion track

  use-cases/           ← Multi-step user workflows (create flows, wizards)
  dev-witness/         ← Snapshots of the live Arda app (see below)
  canary-refactor/     ← Testing canary components inside real app pages
  visual-elements/     ← Color palettes, icons, brand assets
  styles/              ← CSS themes and design tokens
  docs/                ← Documentation pages (show up under "Docs" in Storybook)
  vendored/            ← A copy of the real Arda app code (don't edit directly)
```

---

## The three component tiers

Components in this project follow a maturity pipeline — like a design going from sketch to final spec:

### 1. Canary (in development)
**Location:** `src/components/canary/`

These are components actively being designed and built. The API (props, behavior) might still change. This is where you'll do most of your work when creating new components.

Think of canary as "draft" — it works, it's testable, but it hasn't been formally approved for production use.

### 2. Nominal (production-ready)
**Location:** `src/components/atoms/`, `molecules/`, `organisms/`

These are the final, stable components. Once a canary component is reviewed and approved, it gets "promoted" here. These are what the real Arda app will eventually import.

Right now, most nominal slots are placeholders — the real work is happening in canary.

### 3. Extras (reference only)
**Location:** `src/components/extras/`

These are older or experimental implementations kept around as reference. They're not on the promotion track — think of them as archived explorations.

**The flow:** You build in **Canary** → it gets promoted to **Nominal** → the Arda app uses it.

---

## Where does the data come from?

This depends on what type of story you're looking at:

### Component stories (most common for your work)
**Data is passed in as props.** When you write a story for a Button or a Card, you define the data right in the story file:

```tsx
export const Primary: Story = {
  args: {
    label: 'Add item',
    variant: 'primary',
    disabled: false,
  },
};
```

This shows up in Storybook's **Controls panel** (bottom of the page), where you can change values live. Nothing is fetched from a server — it's all defined in the story.

### Use Case stories
**Data is defined inline as sample fixtures.** These are realistic-looking fake data arrays written directly in the story file:

```tsx
const demoData = [
  { id: '1', name: 'Nitrile Gloves', category: 'PPE', quantity: 500 },
  { id: '2', name: 'Safety Goggles', category: 'PPE', quantity: 200 },
];
```

Again, no real server — just realistic sample data to demonstrate workflows.

### Dev Witness stories (the live app pages)
**Data comes from mock API handlers.** These stories render actual Arda app pages, which try to fetch data from APIs. A tool called **MSW (Mock Service Worker)** intercepts those API calls and returns fake data instead of hitting a real server.

The mock data lives in `src/vendored/arda-frontend/mocks/data/`:
- `mockItems.ts` — 5 sample items
- `mockUser.ts` — A fake logged-in user
- `mockLookups.ts` — Dropdown options (suppliers, units, etc.)
- `mockKanbanCards.ts` — Kanban board cards

**Bottom line:** Nothing in Storybook connects to a real database or server. All data is either hardcoded in the story, or provided by mock handlers that simulate the real API.

---

## What is "Dev Witness"?

Dev Witness is a **live mirror of the real Arda application** running inside Storybook. It takes actual production page code from the Arda app and renders it here with mock data.

**Why it exists:**
- Designers can review what the actual app looks like without running the full app
- Developers can catch visual regressions when code changes
- PMs can validate that acceptance criteria are met

**What's in it:** 12 pages from the real app, including Dashboard, Items Grid, Item Detail, Kanban Cards, Sign In, Settings, Order Queue, and more.

**You probably won't edit Dev Witness directly.** It's auto-synced from the production codebase. Think of it as a "read-only reference" of what the app currently looks like.

---

## What is "Canary Refactor"?

Canary Refactor is where you **test new canary components inside real app pages**. It mirrors Dev Witness pages but progressively swaps out old inline components with your new canary versions.

**The workflow:**
1. You see a pattern in Dev Witness (e.g., a button style used everywhere)
2. You build a canary component for it (`src/components/canary/atoms/button/`)
3. You create a Canary Refactor story that uses your new component in the real page context
4. You compare the two visually — does the new component look the same?

This lets you validate that your new components work correctly in context before promoting them.

---

## What is a "Story"?

A story is a single view of a component in a specific state. One component can have many stories:

```
Button/
  ├── Primary          ← Orange filled button
  ├── Secondary        ← Gray outlined button
  ├── Destructive      ← Red button for delete actions
  ├── Disabled         ← Grayed out, not clickable
  └── Playground       ← Interactive version with Controls panel
```

Each story is defined in a `.stories.tsx` file that lives next to the component:

```
src/components/canary/atoms/button/
  ├── button.tsx              ← The actual component code
  ├── button.stories.tsx      ← The Storybook stories
  ├── button.test.tsx         ← Automated tests
  └── button.mdx              ← Documentation page
```

---

## How stories are structured

Here's a minimal story file explained:

```tsx
// 1. Import the Storybook types and your component
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';

// 2. Define metadata — this controls where it appears in the sidebar
const meta = {
  title: 'Components/Canary/Atoms/Button',   // Sidebar path (folders separated by /)
  component: Button,                          // The component to render
  parameters: { layout: 'centered' },         // Center it on the page
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// 3. Define individual stories as named exports
export const Primary: Story = {
  args: {                          // Props passed to the component
    children: 'Add item',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Cancel',
    variant: 'secondary',
  },
};
```

**The `title` field** determines the sidebar hierarchy. `Components/Canary/Atoms/Button` creates:
```
Components
  └── Canary
       └── Atoms
            └── Button
```

**The `args` field** is where you define the component's props (the data). These become editable in the Controls panel.

---

## Use Case stories (user workflows)

Use Cases demonstrate multi-step workflows like "Create a new supplier" or "Edit an item." They use a shared framework that generates three versions of each workflow:

| Version | What it does | Who it's for |
|---------|-------------|-------------|
| **Interactive** | You fill in the form yourself | Exploring the flow hands-on |
| **Stepwise** | Click through pre-filled scenes | Presenting in a demo |
| **Automated** | Runs itself end-to-end | Regression testing |

Use cases live in `src/use-cases/` organized by feature area (reference, procurement, etc.).

---

## Styling and design tokens

This project uses **Tailwind CSS v4** with custom design tokens defined as CSS variables. The key files:

- `src/styles/globals.css` — The main theme (design tokens, base styles)
- `src/styles/tokens.css` — CSS custom properties (colors, spacing, etc.)

**Key tokens:**
- Primary color: `--base-primary` (#fc5a29 — Arda orange)
- Destructive: `--base-destructive` (#dc2626 — red)
- Background/foreground: `--base-background`, `--base-foreground`
- Spacing scale: `--spacing-1` through `--spacing-6` (4px to 24px)

Components use Tailwind classes like `bg-primary`, `text-foreground`, `rounded-md` that map to these tokens. If the tokens change, all components update automatically.

---

## Common commands

| Command | What it does |
|---------|-------------|
| `npm run storybook` | Start Storybook with live reload (http://localhost:6006) |
| `npm run build-storybook` | Build a static version (also installs vendored deps) |
| `npm test` | Run automated tests |
| `make check` | Run linting + type checking |
| `make help` | Show all available commands |

---

## Quick start: Creating a new component

1. **Create the component file:**
   `src/components/canary/atoms/my-component/my-component.tsx`

2. **Create the story file:**
   `src/components/canary/atoms/my-component/my-component.stories.tsx`

3. **Start Storybook:**
   `npm run storybook`

4. **Find your component** in the sidebar under Components → Canary → Atoms → My Component

5. **Iterate** — changes to the files auto-reload in the browser

For a detailed walkthrough of the component creation process, see the "Creating Stories" docs page inside Storybook (Docs → Workflows → Creating Stories).

---

## Tips for working with Claude

The recommended workflow when using Claude to build components:

1. **Story first** — Describe the component API and variants you want in a story file. This gives Claude a clear contract to build against.
2. **Component second** — Ask Claude to implement the component to match the story.
3. **Tests last** — Generate tests based on the finalized behavior.

Tip: Show Claude an existing story file from this project as a reference so it follows the same conventions.

---

## Glossary

| Term | Meaning |
|------|---------|
| **Story** | A single rendered state of a component |
| **Args** | The props/data passed to a component in a story |
| **Controls** | The interactive panel at the bottom of Storybook for tweaking args |
| **Play function** | An automated script that interacts with a story (clicks, types, etc.) |
| **MSW** | Mock Service Worker — intercepts API calls and returns fake data |
| **Vendored** | Code copied from the real Arda app into this project |
| **Decorator** | A wrapper that adds context around stories (auth, routing, etc.) |
| **MDX** | Markdown + JSX — used for documentation pages in Storybook |
| **CVA** | Class Variance Authority — a utility for managing component style variants |
| **Design tokens** | CSS variables that define colors, spacing, etc. (the "source of truth" for the theme) |
| **Barrel file** | An `index.ts` that re-exports components (e.g., `src/canary.ts`) |
| **HMR** | Hot Module Reload — changes appear instantly without a full page refresh |
