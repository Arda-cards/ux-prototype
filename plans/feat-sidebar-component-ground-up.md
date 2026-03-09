# feat: Rebuild ArdaSidebar from Ground-Up Using Core Foundations

> **Type:** enhancement / reference implementation
> **Branch:** `sidebar-component`
> **Date:** 2026-03-09

---

## Overview

Rebuild the `ArdaSidebar` organism from the ground up, establishing a clean layered architecture: **shadcn/ui primitives** (installed as the base layer) → **Arda design tokens** → **general-purpose Arda atoms** → **sidebar-specific molecules** → **sidebar organism**. No vendored component imports — everything built properly from the foundations.

The sidebar serves a dual purpose:

1. **A production-quality component** that replaces the current `ArdaSidebar` (extras) and eventually the vendored shadcn sidebar in arda-frontend-app.
2. **A reference implementation** — a documented, repeatable process for building any complex organism from atoms up. This process will be duplicated across the entire arda-app.

After implementation, we'll run `/design:audit` and `/design:critique` to validate quality.

---

## Problem Statement

The current sidebar landscape has three problems:

1. **arda-frontend-app** uses a vendored shadcn `Sidebar` primitive (726 lines) plus `AppSidebar` (605 lines) with heavy dependencies: Radix slot, Radix tooltip, Radix dropdown-menu, Sheet component, CVA variants baked into the primitive. The mobile implementation is a parallel fixed-div that bypasses the shadcn Sheet entirely.

2. **ux-prototype** has a simpler `ArdaSidebar` (134 lines) that follows Arda conventions but has accessibility gaps (no `<ul>/<li>` structure, no `aria-current`, labels vanish from DOM in collapsed mode, tooltip is a plain `<div>`, logout disappears when collapsed, no `prefers-reduced-motion`, no mobile/responsive).

3. **No documented process** for building an organism from atoms up. This sidebar rebuild creates that playbook.

---

## Proposed Solution

Build the sidebar as a **compound component** following atomic design, with each sub-component authored as an independent atom or molecule with its own story, tests, and docs. The organism composes them.

### Component Decomposition

The sidebar is an **organism** that composes **general-purpose atoms** and **sidebar-specific molecules**. The atoms are not sidebar-scoped — they're reusable UI primitives that live at the top level of the atoms directory, similar to how shadcn components are general-purpose primitives that get composed into specific contexts.

```
ArdaSidebar (organism)
│
├── uses existing + new general-purpose atoms:
│   ├── ArdaLogo / ArdaLogoFull (existing SVG atoms) — used directly, no wrapper needed
│   ├── ArdaNavItem (new atom) — icon + label link with active state, badge slot, tooltip — usable in sidebars, toolbars, mobile nav
│   └── ArdaCollapseToggle (new atom) — expand/collapse button with aria-expanded — usable in sidebars, panels, drawers
│
├── sidebar-specific molecules:
│   ├── ArdaSidebarNav (molecule) — nav list container (<nav> + <ul>), provides semantic structure
│   ├── ArdaSidebarNavGroup (molecule) — disclosure section with expandable children
│   └── ArdaSidebarUserMenu (molecule) — avatar + name + email + logout
│
└── organism assembly:
    └── ArdaSidebar — compound component with internal context, background chrome, transitions
```

### Consumer API

```tsx
<ArdaSidebar collapsed={collapsed} onCollapsedChange={setCollapsed} currentPath={pathname}>
  {/* ArdaLogo / ArdaLogoFull used directly inside the organism — no wrapper */}
  <ArdaSidebarNav>
    <ArdaNavItem href="/" icon={LayoutDashboard} label="Dashboard" exact />
    <ArdaNavItem href="/items" icon={Package} label="Items" />
    <ArdaNavItem href="/orders" icon={ShoppingCart} label="Order Queue" badge={3} />
    <ArdaSidebarNavGroup label="Reference" icon={Database}>
      <ArdaNavItem href="/suppliers" icon={Building2} label="Suppliers" />
    </ArdaSidebarNavGroup>
  </ArdaSidebarNav>
  <ArdaSidebarUserMenu
    user={{ name: 'Alex Rivera', email: 'alex@arda.cards' }}
    onLogout={handleLogout}
  />
</ArdaSidebar>
```

This replaces the current `navItems` array prop with composition — enabling badges on individual items, nav groups, custom sections, and dividers without expanding the props interface. The atoms (`ArdaBrand`, `ArdaNavItem`, `ArdaCollapseToggle`) are general-purpose and will be reused when building other organisms (page headers, mobile nav, panel layouts).

---

## Technical Approach

### Phase 0: Install the shadcn/ui Base Layer

Before building anything, we need a **complete shadcn/ui base** installed at `src/components/ui/`. The `components.json` is already configured (new-york style, Lucide icons, CSS variables) but no components have actually been installed — they only exist in the vendored copy of the frontend app.

**Action:** Install the full shadcn component library into `src/components/ui/`:

```bash
npx shadcn@latest add --all
```

This gives us the complete set of accessible, Radix-backed primitives (tooltip, dropdown-menu, collapsible, separator, avatar, sheet, etc.) as our foundation layer. Every Arda atom/molecule wraps or extends these — we're not reinventing accessibility or interaction patterns, we're skinning and composing them with Arda conventions.

**Layer model:**
```
shadcn/ui primitives (src/components/ui/)     ← Radix + Tailwind, accessibility built in
  ↓ wrap/extend
Arda atoms (src/components/canary/atoms/)      ← Arda naming, tokens, CVA variants, StaticConfig/RuntimeConfig
  ↓ compose
Arda molecules (src/components/canary/molecules/)
  ↓ compose
Arda organisms (src/components/canary/organisms/)
```

The key insight: we're not avoiding shadcn — we're making it the **explicit foundation** and building a clean layer on top. The vendored copies in `src/vendored/arda-frontend/components/ui/` become redundant once the real ones are in `src/components/ui/`.

**Design tokens** already live in `src/styles/extras/globals.css` and are cataloged in `src/visual-elements/`. Any new tokens (sidebar layout dimensions, transition timings) go in `globals.css` alongside the existing ones.

### Architecture

General-purpose atoms live at the **atoms level** (not sidebar-scoped), so they're available for reuse across the entire design system. Sidebar-specific molecules and the organism live under their respective tiers.

```
src/components/canary/
  atoms/
    nav-item/                 ← general-purpose, used by sidebar + toolbars + mobile nav
      nav-item.tsx
      nav-item.stories.tsx
      nav-item.test.tsx
    collapse-toggle/          ← general-purpose, used by sidebar + panels + drawers
      collapse-toggle.tsx
      collapse-toggle.stories.tsx
      collapse-toggle.test.tsx
  molecules/
    sidebar-nav/              ← sidebar-specific: semantic <nav>+<ul> wrapper
      sidebar-nav.tsx
      sidebar-nav.stories.tsx
      sidebar-nav.test.tsx
    sidebar-nav-group/        ← sidebar-specific: disclosure pattern for nested items
      sidebar-nav-group.tsx
      sidebar-nav-group.stories.tsx
      sidebar-nav-group.test.tsx
    sidebar-user-menu/        ← sidebar-specific: avatar + name + logout
      sidebar-user-menu.tsx
      sidebar-user-menu.stories.tsx
      sidebar-user-menu.test.tsx
  organisms/
    sidebar/
      sidebar.tsx             ← rebuilt, replaces current
      sidebar.css             ← component-specific styles
      sidebar.stories.tsx     ← rebuilt with compound API
      sidebar.test.tsx
      sidebar-context.tsx     ← internal context provider
```

### Styling Rules (from Arda guidelines)

- **Tailwind utility classes** for layout and spacing
- **CSS custom properties** (`var(--sidebar-bg)`, etc.) for design tokens — all existing sidebar tokens in `globals.css` are reused
- **`cn()`** for conditional class composition
- **CVA** for multi-variant atoms (nav item states, toggle variants)
- **Component-specific `.css` file** with `arda-sidebar-*` prefixed classes for complex styles (background gradient, transitions)
- **No inline `style` objects** except the background gradient (truly dynamic)
- **No hardcoded hex values** — design tokens only

### New Design Tokens (additions to globals.css)

```css
:root {
  /* Layout */
  --sidebar-width-expanded: 240px;
  --sidebar-width-collapsed: 56px;
  --sidebar-header-height: 56px;

  /* Transitions */
  --sidebar-transition-duration: 200ms;
  --sidebar-transition-easing: ease-out;

  /* Spacing */
  --sidebar-nav-item-height: 36px;
  --sidebar-nav-item-gap: 4px;
  --sidebar-nav-group-gap: 16px;
}
```

Plus Tailwind `@theme inline` mappings so we can write `w-sidebar-expanded`, etc.

### State Management

| State | Owner | Persistence |
|---|---|---|
| `collapsed` | Consumer (controlled prop) | Consumer decides (cookie/localStorage) |
| `currentPath` | Consumer (controlled prop) | URL-derived |
| `activeItem` | Derived inside `SidebarContext` | None |
| `expandedGroups` | Internal `useState` in `ArdaSidebarNavGroup` | None |
| `isMobile` | Not managed here — sidebar is viewport-agnostic | N/A |

The sidebar exposes a `SidebarContext` internally (not exported) that provides `collapsed`, `currentPath` to children. Each child reads via `useSidebar()` internal hook.

**Mobile strategy:** The sidebar component itself doesn't handle mobile drawer behavior. A separate `ArdaMobileDrawer` molecule (or the consumer's layout) wraps the sidebar in a drawer when needed. This keeps the sidebar focused on navigation, not viewport detection.

### React Best Practices (Vercel guidelines)

- **Composition over configuration** — compound component pattern with `children`, not config objects
- **Server-compatible by default** — no `useEffect` for things CSS can handle (transitions, collapsed state via `data-*` attributes)
- **Minimize client-side state** — `collapsed` and `currentPath` are controlled props from the consumer; internal state only for ephemeral UI (disclosure open/close)
- **Avoid layout thrash** — CSS `contain: layout style`, `will-change` only when actively animating, `content-visibility: auto` for off-screen nav groups
- **Lazy boundaries** — nav groups with many children can use `React.lazy` if needed, but start simple
- **Keys on lists** — nav items keyed by `href` (stable, unique)
- **Ref forwarding** — React 19 style (ref as regular prop, no `forwardRef`)

---

## Implementation Phases

### Phase 1: Atoms (general-purpose foundation layer)

Build two general-purpose atoms. These are **not sidebar-specific** — they're reusable UI primitives that the sidebar happens to be the first consumer of. Each lives at the top level of `canary/atoms/`, follows shadcn-style wrapping conventions, and gets its own story + test.

The logo (`ArdaLogo` / `ArdaLogoFull`) already exists as simple SVG components — the sidebar uses them directly, no wrapper needed.

#### 1a. `ArdaNavItem`

The most important atom. A general-purpose navigation link with icon, label, optional badge, and tooltip support. Usable in sidebars, toolbars, bottom nav, mobile drawers.

```tsx
interface ArdaNavItemProps {
  /* --- Model / Data Binding --- */
  href: string;
  active?: boolean;         // controlled active state (consumer determines this)
  badge?: number | string;  // notification count or status text

  /* --- View / Layout / Controller --- */
  icon: LucideIcon;
  label: string;
  collapsed?: boolean;      // compact mode (icon-only with tooltip)
  variant?: 'dark' | 'light'; // color scheme context (dark sidebar vs light toolbar)
  className?: string;
}
```

**Visual anatomy:**
```
[active indicator] [icon 18px] [label text-sm] [badge]
                                                [tooltip on hover/focus when collapsed]
```

**States** (via CVA, parameterized by `variant`):
- `dark` variant (sidebar): `text-white/70 hover:bg-white/10`, active: `bg-white/10 text-white font-medium` + orange indicator
- `light` variant (toolbar): `text-foreground hover:bg-accent`, active: `bg-accent text-accent-foreground font-medium`
- Focused: `focus-visible:ring-2 ring-ring`

**Built on shadcn:**
- Uses `Tooltip` / `TooltipTrigger` / `TooltipContent` from `@/components/ui/tooltip` for collapsed-mode tooltips (Radix handles accessibility, positioning, keyboard)
- No need to hand-roll tooltip ARIA — Radix provides `role="tooltip"`, `aria-describedby`, focus+hover triggers out of the box

**Accessibility:**
- Renders as `<li>` containing `<a>` (the `<li>` makes it composable inside `<ul>`)
- Active item gets `aria-current="page"`
- Icon gets `aria-hidden="true"`
- Label uses `sr-only` class when `collapsed` (NOT conditional render — stays in DOM for screen readers)
- Tooltip behavior delegated to Radix via shadcn `Tooltip` primitive

**Files:** `atoms/nav-item/nav-item.tsx`, `nav-item.stories.tsx`, `nav-item.test.tsx`

#### 1b. `ArdaCollapseToggle`

A general-purpose expand/collapse trigger button. Used in the sidebar, but equally useful for collapsible panels, drawers, split views.

- Renders `ChevronsLeft` (expanded) / `ChevronsRight` (collapsed) icon
- `aria-label` and `aria-expanded` driven by `collapsed` prop
- Accepts custom `expandedLabel` / `collapsedLabel` for non-sidebar contexts
- **Files:** `atoms/collapse-toggle/collapse-toggle.tsx`, `collapse-toggle.stories.tsx`, `collapse-toggle.test.tsx`

```tsx
interface ArdaCollapseToggleProps {
  /* --- Model / Data Binding --- */
  collapsed: boolean;
  onToggle?: () => void;

  /* --- View / Layout / Controller --- */
  expandedLabel?: string;   // default: "Collapse"
  collapsedLabel?: string;  // default: "Expand"
  className?: string;
}
```

**Acceptance Criteria — Phase 1:**
- [x] Each atom renders correctly in isolation in Storybook
- [x] Each atom has unit tests covering all states
- [x] No imports of other Arda atoms/molecules/organisms (classification requirement)
- [x] All styling uses design tokens, not hardcoded hex
- [x] Atoms are general-purpose — no sidebar-specific naming or coupling
- [x] `ArdaNavItem` labels accessible in collapsed mode (sr-only, not removed from DOM)
- [x] `ArdaNavItem` supports `aria-current="page"` when active
- [x] `ArdaNavItem` tooltip accessible via keyboard (focus, not just hover)
- [x] `ArdaCollapseToggle` has correct `aria-expanded` state

---

### Phase 2: Molecules (composition layer)

Compose atoms into functional groups.

#### 2a. `ArdaSidebarNav`

- Wraps children in `<nav aria-label="Primary">` + `<ul role="list">`
- Provides semantic list structure
- Accepts `ArdaSidebarNavItem` and `ArdaSidebarNavGroup` as children
- **Files:** `sidebar-nav.tsx`, `sidebar-nav.stories.tsx`, `sidebar-nav.test.tsx`

#### 2b. `ArdaSidebarNavGroup`

- **Built on shadcn `Collapsible`** — wraps `Collapsible` / `CollapsibleTrigger` / `CollapsibleContent` from `@/components/ui/collapsible` (Radix handles `aria-expanded`, `aria-controls`, keyboard, animation)
- Auto-expands if a child item is active
- Escape key closes the group, returns focus to trigger (Radix built-in)
- **Files:** `sidebar-nav-group.tsx`, `sidebar-nav-group.stories.tsx`, `sidebar-nav-group.test.tsx`

```tsx
interface ArdaSidebarNavGroupProps {
  /* --- View / Layout / Controller --- */
  label: string;
  icon?: LucideIcon;
  defaultExpanded?: boolean;
  children: React.ReactNode; // ArdaSidebarNavItem children
}
```

#### 2c. `ArdaSidebarUserMenu`

- **Built on shadcn `Avatar`** + **`DropdownMenu`** — wraps `Avatar` / `AvatarFallback` from `@/components/ui/avatar` for the user icon, and `DropdownMenu` from `@/components/ui/dropdown-menu` for the actions menu (settings, logout)
- In collapsed mode: only avatar visible, name/email use `sr-only`, clicking avatar opens dropdown with logout + settings
- In expanded mode: avatar + name + email displayed, dropdown still accessible via click
- **Files:** `sidebar-user-menu.tsx`, `sidebar-user-menu.stories.tsx`, `sidebar-user-menu.test.tsx`

```tsx
interface ArdaSidebarUserMenuProps {
  /* --- Model / Data Binding --- */
  user: { name: string; email: string; avatar?: string; };
  onLogout?: () => void;
}
```

**Acceptance Criteria — Phase 2:**
- [x] `<nav>` landmark with `aria-label="Primary"`
- [x] `<ul>/<li>` structure in nav (screen readers announce "X of Y items")
- [x] Nav group uses disclosure pattern (not treeview)
- [ ] Nav group auto-expands when child is active
- [x] User menu logout accessible in collapsed mode
- [x] Each molecule composes only atoms from Phase 1
- [x] Stories show molecules in both collapsed and expanded states

---

### Phase 3: Organism (assembly)

#### 3a. `ArdaSidebar` (rebuilt)

- Internal `SidebarContext` providing `collapsed`, `currentPath` to all children
- `<aside>` element with `role` implied
- Background gradient (the only inline style, truly dynamic)
- CSS `contain: layout style` for paint isolation
- `data-collapsed` attribute for state-driven CSS
- Transition on `transform: translateX()` (NOT width — avoids layout thrash)
- `prefers-reduced-motion: reduce` disables all transitions

```tsx
interface ArdaSidebarStaticConfig {
  /* --- View / Layout / Controller --- */
  children: React.ReactNode;
  className?: string;
}

interface ArdaSidebarRuntimeConfig {
  /* --- Model / Data Binding --- */
  collapsed: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  currentPath?: string;
  onNavigate?: (href: string) => void;
}

type ArdaSidebarProps = ArdaSidebarStaticConfig & ArdaSidebarRuntimeConfig;
```

#### 3b. Sidebar CSS (`sidebar.css`)

```css
.arda-sidebar {
  position: fixed;
  inset-block: 0;
  inset-inline-start: 0;
  width: var(--sidebar-width-expanded);
  background-color: var(--sidebar-bg);
  display: flex;
  flex-direction: column;
  z-index: 50;
  contain: layout style;
  overflow: hidden;
  transition: width var(--sidebar-transition-duration) var(--sidebar-transition-easing);
}

.arda-sidebar[data-collapsed="true"] {
  width: var(--sidebar-width-collapsed);
}

@media (prefers-reduced-motion: reduce) {
  .arda-sidebar,
  .arda-sidebar * {
    transition: none !important;
    animation: none !important;
  }
}
```

#### 3c. Stories

- `Expanded` — full sidebar with all nav items, user menu
- `Collapsed` — icon-only mode with tooltips
- `WithBadges` — nav items with notification counts
- `WithGroups` — nested nav groups
- `WithToggle` — interactive collapse/expand demo
- `NoUserMenu` — sidebar without footer (composition flexibility)
- `Composition` — full page layout with sidebar + content area
- `Playground` — all controls exposed

**Acceptance Criteria — Phase 3:**
- [x] Compound component API (children, not navItems array)
- [ ] `data-collapsed` attribute drives styling (not class toggling)
- [ ] `contain: layout style` on sidebar root
- [ ] `prefers-reduced-motion` respected
- [x] Background gradient renders correctly
- [x] All existing sidebar tokens from globals.css used correctly
- [ ] Keyboard shortcut support (Cmd+B to toggle, document in story)
- [x] Pass `focus-visible` check — all interactive elements have visible focus rings

---

### Phase 4: Documentation (deferred — done last)

Documentation is written **after** implementation is complete, summarizing what we actually did rather than what we planned to do.

#### 4a. Update existing Storybook docs

Rather than creating new docs files, update the existing docs in `src/docs/` to reflect the new sidebar and the process we followed:
- Update `src/docs/components/guidelines.mdx` if our process surfaced new conventions
- Update `src/docs/arda-style-guide.mdx` sidebar section if visual specs changed
- Add sidebar MDX inline with the component (following existing pattern)

#### 4b. Process notes

Capture the atoms-up build process as a workflow doc, but write it at the end based on what actually happened — not a speculative guide. This becomes the template for rebuilding other complex components across the arda-app.

**Acceptance Criteria — Phase 4:**
- [ ] Existing Storybook docs updated where needed
- [ ] Component MDX written reflecting final implementation
- [ ] Process notes captured for reuse

---

### Phase 5: Design Review

After implementation, run the design review skills:

- [ ] `/design:critique` — spacing, typography, contrast, alignment, visual hierarchy
- [ ] `/design:audit` — accessibility, responsiveness, design system adherence

Fix any issues found before considering the sidebar complete.

---

## Dependencies & Prerequisites

**Required (already available):**
- Design tokens in `globals.css` (sidebar token set exists)
- `cn()` utility
- `ArdaLogo` / `ArdaLogoFull` SVG components (in current sidebar directory)
- `lucide-react` icons
- Storybook 10 running
- `components.json` configured for shadcn (new-york style)

**Phase 0 installs:**
- Full shadcn/ui component library to `src/components/ui/` (brings Radix primitives as peer deps)
- This is a one-time setup that benefits all future component work, not just the sidebar

## Risk Analysis

| Risk | Mitigation |
|---|---|
| Breaking existing stories that import current `ArdaSidebar` | Keep the old component in place, build new one alongside. Swap exports once validated. |
| Compound component API is more verbose for simple cases | Provide a `<ArdaSidebarSimple navItems={[...]} />` convenience wrapper later if needed |
| Over-engineering atoms that are only used in sidebar | Each atom is genuinely reusable (nav items, tooltips, brand areas appear elsewhere). If an atom truly only serves the sidebar, make it a private sub-component instead. |

## Success Metrics

- All 10 accessibility gaps from the current sidebar are fixed
- Clean layer model: shadcn base → Arda atoms → molecules → organism (no skipping layers, no vendored imports)
- General-purpose atoms (`ArdaNavItem`, `ArdaCollapseToggle`) reusable outside sidebar context
- Every sub-component has isolated Storybook stories + Vitest tests
- Process is clear enough to repeat for the next organism (page header, drawer, etc.)
- `/design:critique` and `/design:audit` pass with no critical issues

## References

### Internal
- Current sidebar: `src/components/canary/organisms/sidebar/sidebar.tsx`
- Design tokens: `src/styles/extras/globals.css`
- Component guidelines: `src/docs/components/guidelines.mdx`
- Classification guide: `src/docs/components/classification.mdx`
- Style guide: `src/docs/arda-style-guide.mdx`
- Canary extraction workflow: `src/docs/workflows/canary-components/how-to-extract-and-publish.mdx`
- Vendored shadcn sidebar: `src/vendored/arda-frontend/components/ui/sidebar.tsx`
- Production AppSidebar: `arda-frontend-app/src/components/app-sidebar.tsx`

### External
- [W3C Disclosure Navigation Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/)
- [Don't Use ARIA Menu Roles for Site Nav](https://adrianroselli.com/2017/10/dont-use-aria-menu-roles-for-site-nav.html)
- [Sidebar Animation Performance](https://www.joshuawootonn.com/sidebar-animation-performance)
