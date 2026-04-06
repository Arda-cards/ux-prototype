# Plan: Add TypeaheadInput molecule and wire into ItemCardEditor units fields

## Context
The `ItemCardEditor` currently uses plain `<Input>` for the units fields (minUnit, orderUnit). In the production frontend app, these are `UnitTypeahead` components — async typeaheads that search an API, show filtered results, and allow creating new units. We need a canary molecule that replicates this behavior standalone (no AG Grid dependency), then swap the units inputs in `ItemCardEditor`.

## Reference implementations
- **Vendored**: `vendored/arda-frontend/components/items/UnitTypeahead.tsx` — production implementation, tightly coupled to Arda API
- **Callil's branch**: `canary/molecules/item-grid/typeahead-cell-editor.tsx` — clean implementation but coupled to AG Grid's `useGridCellEditor` hook

## Approach: Build a standalone `TypeaheadInput` molecule

Take the UI/behavior from Callil's `TypeaheadCellEditor` (debounced async search, keyboard nav, create option, loading/error states) but remove the AG Grid dependency so it works as a regular form input.

### Phase 1: Create `TypeaheadInput` molecule
**New file:** `src/components/canary/molecules/typeahead-input/typeahead-input.tsx`

**Props interface:**
```typescript
interface TypeaheadOption {
  label: string;
  value: string;
}

interface TypeaheadInputProps {
  value: string;
  onChange: (value: string) => void;
  lookup: (search: string) => Promise<TypeaheadOption[]>;
  allowCreate?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}
```

**Behavior (matching vendored UnitTypeahead):**
- Debounced search (150ms) on input change
- Dropdown shows up to 8 results
- "New: {typed value}" option when `allowCreate=true` and no exact match
- Arrow Up/Down to navigate, Enter to select, Escape to close dropdown
- AbortController for request cancellation
- Loading spinner during fetch, error state with retry
- Uses Arda design tokens (`bg-popover`, `border-input`, `text-muted-foreground`, etc.)
- Renders as a Popover-style dropdown below the input (no AG Grid popup)

**Reuse from existing codebase:**
- `Input` primitive from `@/components/canary/primitives/input`
- `Loader2`, `Plus`, `AlertCircle` icons from `lucide-react`
- `cn()` utility for class merging

### Phase 2: Create stories
**New file:** `src/components/canary/molecules/typeahead-input/typeahead-input.stories.tsx`

Stories:
- **Default** — mock async lookup with unit options (each, case, box, pallet, pair, kg, lb, oz)
- **AllowCreate** — same but with `allowCreate={true}`
- **Loading** — slow lookup to show spinner
- **PrePopulated** — starts with a value

### Phase 3: Wire into ItemCardEditor
**File:** `src/components/canary/organisms/item-card-editor/item-card-editor.tsx`

- Add `unitLookup` prop to `ItemCardEditorInitProps` — the async lookup function
- Replace the units `<Input>` fields (lines ~185-190) with `<TypeaheadInput>`
- Pass `allowCreate={true}` so users can add custom units

**Updated props:**
```typescript
interface ItemCardEditorInitProps {
  imageConfig: ImageFieldConfig;
  unitLookup: (search: string) => Promise<TypeaheadOption[]>;
}
```

### Phase 4: Update stories with mock lookup
**File:** `src/components/canary/organisms/item-card-editor/item-card-editor.stories.tsx`

- Create a `mockUnitLookup` function that filters a static list (matching vendored mock data)
- Pass it to `ItemCardEditor` in both stories

## Files to create/modify
1. **Create** `src/components/canary/molecules/typeahead-input/typeahead-input.tsx`
2. **Create** `src/components/canary/molecules/typeahead-input/typeahead-input.stories.tsx`
3. **Modify** `src/components/canary/organisms/item-card-editor/item-card-editor.tsx` — add `unitLookup` prop, swap Input → TypeaheadInput for unit fields
4. **Modify** `src/components/canary/organisms/item-card-editor/item-card-editor.stories.tsx` — add mock lookup
5. **Modify** `src/use-cases/reference/items/create-item/0010-set-image/during-creation-inline.stories.tsx` — add mock lookup

## Verification
1. Storybook: TypeaheadInput stories — type to search, select, create new, keyboard nav
2. Storybook: ItemCardEditor stories — units fields show typeahead dropdown
3. Type check: `npx tsc --noEmit`
4. Tests: `npx vitest run src/components/canary/`
