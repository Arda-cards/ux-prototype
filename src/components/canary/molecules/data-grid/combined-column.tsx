'use client';

import { useCallback, useRef, useState, type ComponentType } from 'react';
import type {
  ColDef,
  KeyCreatorParams,
  SuppressKeyboardEventParams,
  ValueFormatterParams,
  ValueGetterParams,
  ValueSetterParams,
} from 'ag-grid-community';
import type { CustomCellEditorProps } from 'ag-grid-react';
import { Input } from '@/components/canary/primitives/input';

// ============================================================================
// Combined column — display a group of fields as one line; edit them together
// in a popup, each field keeping its own editor / validation. Copy, fill and
// (same-grid) paste round-trip through the composed formatter/parser.
// ============================================================================

/** Props passed to a member's custom editor inside the popup. */
export interface CombinedFieldEditorProps {
  value: unknown;
  onChange: (value: unknown) => void;
  placeholder: string;
  /** Open the field's editor immediately (used for the first member). */
  autoFocus?: boolean;
}

export interface CombinedColumnMember {
  /** Row field this member reads from / writes back to. */
  field: string;
  /** Label beside the input and the empty-field placeholder. */
  headerName: string;
  /** Value → display text (one-line render + clipboard copy). Default `String(value)`. */
  toText?: (value: unknown) => string;
  /** Pasted fragment → field value (same-grid round-trip). Default identity. */
  fromText?: (text: string) => unknown;
  /** Render this field as a `<select>` of these options instead of a text input. */
  options?: readonly string[];
  /** Fully custom editor for this field (overrides the default input/select). */
  editor?: ComponentType<CombinedFieldEditorProps>;
}

export interface CombinedColumnConfig {
  /** Column id for the combined column. Defaults to `combined_<headerName>`. */
  colId?: string;
  /** Header label. */
  headerName: string;
  /** Member fields combined into this column, in display + form order. */
  members: CombinedColumnMember[];
  /** Joiner for the one-line display + clipboard. Default `", "`. */
  separator?: string;
}

type CombinedValue = Record<string, unknown>;

const defaultToText = (v: unknown): string => (v === null || v === undefined ? '' : String(v));

function formatLine(
  members: CombinedColumnMember[],
  value: CombinedValue | null | undefined,
  separator: string,
): string {
  if (!value) return '';
  return members
    .map((m) => (m.toText ?? defaultToText)(value[m.field]).trim())
    .filter(Boolean)
    .join(separator);
}

// --- Popup editor: one input per member; autosave on exit; Escape cancels ---

function makeCombinedCellEditor(members: CombinedColumnMember[]) {
  function CombinedCellEditor({
    value,
    onValueChange,
    stopEditing,
    api,
  }: CustomCellEditorProps<Record<string, unknown>, CombinedValue>) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [draft, setDraft] = useState<CombinedValue>(() => ({ ...(value ?? {}) }));

    const setField = useCallback(
      (field: string, fieldValue: unknown) => {
        setDraft((prev) => {
          const next = { ...prev, [field]: fieldValue };
          // AG Grid commits this value when editing stops (Enter / Tab / click-away).
          // Escape cancels (AG Grid default) — no Save button needed.
          onValueChange(next);
          return next;
        });
      },
      [onValueChange],
    );

    // The popup owns its keyboard:
    //  - Ctrl/Cmd+Z/Y → the focused field's native undo; must not reach the grid.
    //  - Tab / Shift+Tab → step through the member fields; only at the ends does
    //    it commit and fall back into the grid (next / previous cell).
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        const key = e.key.toLowerCase();
        if ((e.ctrlKey || e.metaKey) && (key === 'z' || key === 'y')) {
          e.stopPropagation();
          return;
        }
        if (e.key !== 'Tab') return;

        const fields = Array.from(
          containerRef.current?.querySelectorAll<HTMLElement>('input, select, textarea') ?? [],
        );
        const index = fields.indexOf(document.activeElement as HTMLElement);
        const lastIndex = fields.length - 1;

        e.stopPropagation();
        if (!e.shiftKey && index > -1 && index < lastIndex) {
          e.preventDefault();
          fields[index + 1]?.focus();
        } else if (e.shiftKey && index > 0) {
          e.preventDefault();
          fields[index - 1]?.focus();
        } else {
          // Boundary — commit, move to the adjacent cell, and resume editing there
          // (matches AG Grid's normal Tab-while-editing flow; the popup shouldn't
          // drop the user back into view mode). Deferred so the editor closes first.
          const toPrevious = e.shiftKey;
          e.preventDefault();
          stopEditing();
          setTimeout(() => {
            if (toPrevious) api.tabToPreviousCell();
            else api.tabToNextCell();
            const focused = api.getFocusedCell();
            if (focused) {
              api.startEditingCell({
                rowIndex: focused.rowIndex,
                colKey: focused.column.getColId(),
              });
            }
          }, 0);
        }
      },
      [api, stopEditing],
    );

    return (
      <div
        ref={containerRef}
        className="flex min-w-72 flex-col gap-2 rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-md"
        onKeyDown={handleKeyDown}
      >
        {members.map((m, i) => {
          const raw = draft[m.field];
          const strValue = raw === null || raw === undefined ? '' : String(raw);
          const Editor = m.editor;
          return (
            <label
              key={m.field}
              className="flex flex-col gap-1 text-xs font-medium text-muted-foreground"
            >
              <span>{m.headerName}</span>
              {Editor ? (
                <Editor
                  value={raw}
                  onChange={(v) => setField(m.field, v)}
                  placeholder={m.headerName}
                  autoFocus={i === 0}
                />
              ) : m.options ? (
                // Native <select> (not the Radix ArdaSelect): it keeps DOM focus
                // inside the popup, so `stopEditingWhenCellsLoseFocus` doesn't close
                // the editor when the dropdown opens. Styled to match the Input.
                <select
                  value={strValue}
                  onChange={(e) => setField(m.field, e.target.value || undefined)}
                  className="h-9 rounded-md border border-input bg-transparent px-2 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <option value="">{m.headerName}</option>
                  {m.options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  autoFocus={i === 0}
                  value={strValue}
                  placeholder={m.headerName}
                  onChange={(e) => setField(m.field, e.target.value || undefined)}
                />
              )}
            </label>
          );
        })}
      </div>
    );
  }
  CombinedCellEditor.displayName = 'CombinedCellEditor';
  return CombinedCellEditor;
}

// ============================================================================
// Factory
// ============================================================================

/**
 * Builds a `ColDef` for a **combined column**: it shows several row fields as one
 * formatted line and, on double-click, opens a popup with one input per member —
 * each keeping its own editor, validation and placeholder. Edits write straight
 * back to the underlying fields (`valueSetter`); copy/fill/(same-grid) paste
 * round-trip through the composed `valueFormatter`/`valueParser`.
 *
 * Members reference existing row fields, so any group of columns can be combined
 * (Address is just the first consumer). Hide the member columns and add this one,
 * or keep both.
 *
 * ```tsx
 * const addressColumn = createCombinedColumn<Vendor>({
 *   headerName: 'Address',
 *   members: [
 *     { field: 'addressLine1', headerName: 'Street' },
 *     { field: 'city', headerName: 'City' },
 *     { field: 'state', headerName: 'State' },
 *     { field: 'postalCode', headerName: 'ZIP' },
 *     { field: 'country', headerName: 'Country', options: COUNTRY_SYMBOLS },
 *   ],
 * });
 * ```
 */
export function createCombinedColumn<T extends Record<string, any> = Record<string, any>>(
  config: CombinedColumnConfig,
): ColDef<T> {
  const { members, headerName } = config;
  const separator = config.separator ?? ', ';
  const colId = config.colId ?? `combined_${headerName.toLowerCase().replace(/\s+/g, '_')}`;

  return {
    colId,
    headerName,
    editable: true,
    cellEditor: makeCombinedCellEditor(members),
    cellEditorPopup: true,
    // While the popup is open, the editor owns Tab (steps through member fields,
    // then commits + moves to the next/previous cell at the ends). Suppress AG
    // Grid's own Tab-to-next-cell so the two don't both fire.
    suppressKeyboardEvent: (p: SuppressKeyboardEventParams<T>) =>
      p.editing && (p.event as KeyboardEvent).key === 'Tab',
    valueGetter: (p: ValueGetterParams<T>): CombinedValue | null => {
      if (!p.data) return null;
      const data = p.data as Record<string, unknown>;
      const obj: CombinedValue = {};
      for (const m of members) obj[m.field] = data[m.field];
      return obj;
    },
    valueSetter: (p: ValueSetterParams<T>): boolean => {
      const next = p.newValue as CombinedValue | null | undefined;
      if (!next) return false;
      const data = p.data as Record<string, unknown>;
      for (const m of members) data[m.field] = next[m.field];
      return true;
    },
    valueFormatter: (p: ValueFormatterParams<T>) =>
      formatLine(members, p.value as CombinedValue, separator),
    valueParser: (p): CombinedValue | null => {
      // Same-grid clipboard round-trip: split the formatted line back into fields.
      // (High-fidelity external paste is deferred — see the clipboard discussion.)
      const text = p.newValue === null || p.newValue === undefined ? '' : String(p.newValue);
      if (!text.trim()) return null;
      const parts = text.split(separator);
      const obj: CombinedValue = {};
      members.forEach((m, i) => {
        const fragment = (parts[i] ?? '').trim();
        obj[m.field] = fragment ? (m.fromText ? m.fromText(fragment) : fragment) : undefined;
      });
      return obj;
    },
    keyCreator: (p: KeyCreatorParams<T>) =>
      formatLine(members, p.value as CombinedValue, separator),
  };
}
