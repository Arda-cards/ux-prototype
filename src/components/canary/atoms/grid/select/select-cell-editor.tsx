'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGridCellEditor } from 'ag-grid-react';
import { Check } from 'lucide-react';

// --- Types ---

export interface SelectOption {
  label: string;
  value: string;
}

/**
 * Options can be provided as an array of SelectOption objects or as a plain
 * Record<string, string> where keys are stored values and values are display
 * labels. The Record format is a convenience for simple enum-like columns.
 */
export type SelectOptions = SelectOption[] | Record<string, string>;

/** Design-time configuration baked into the factory. */
export interface SelectCellEditorStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Available options. Accepts SelectOption[] or Record<string, string>. */
  options: SelectOptions;
  /**
   * Placeholder shown when no option is selected.
   * Currently reserved; the list always shows all options.
   */
  placeholder?: string;
  /** Whether to allow creating a new value not in the list. Reserved for future use. */
  allowCreate?: boolean;
}

/** Runtime props injected by AG Grid. */
export interface SelectCellEditorProps extends SelectCellEditorStaticConfig {
  /* --- Model / Data Binding --- */
  /** Current cell value from AG Grid. */
  value: string | null;
  /** AG Grid callback to update the cell value. */
  onValueChange: (value: string | null) => void;
  /** AG Grid callback to stop editing. Pass true to cancel. */
  stopEditing: (cancel?: boolean) => void;
}

/** Handle exposed via useGridCellEditor (used by AG Grid to check for cancel). */
export interface SelectCellEditorHandle {
  isCancelAfterEnd: () => boolean;
}

// --- Internal helpers ---

/** Normalizes options to SelectOption[] regardless of input format. */
export function normalizeOptions(options: SelectOptions): SelectOption[] {
  if (Array.isArray(options)) return options;
  return Object.entries(options).map(([value, label]) => ({ value, label }));
}

// --- Component ---
// Used with cellEditorPopup: true — AG Grid handles popup positioning.

/**
 * AG Grid cell editor for fixed-list select values.
 *
 * Renders a keyboard-navigable custom dropdown with:
 * - Arrow Up/Down to cycle through options (wraps around)
 * - Enter to select the highlighted option
 * - Escape to cancel without changing the value
 * - Checkmark indicator on the currently selected option
 * - Scroll-into-view for highlighted option
 * - ARIA listbox/option roles
 *
 * Usage in column definitions:
 * ```ts
 * { field: 'status', cellEditor: createSelectCellEditor({ options }), cellEditorPopup: true }
 * ```
 */
export function SelectCellEditor({
  value,
  onValueChange,
  stopEditing,
  options,
}: SelectCellEditorProps) {
  const normalizedOptions = normalizeOptions(options);

  const [highlightedIndex, setHighlightedIndex] = useState(() =>
    Math.max(
      normalizedOptions.findIndex((v) => v.value === value),
      0,
    ),
  );

  const listRef = useRef<HTMLDivElement>(null);
  const wasCancelledRef = useRef(false);

  useGridCellEditor({
    isCancelAfterEnd: () => wasCancelledRef.current,
  });

  // Focus + scroll on mount
  useEffect(() => {
    requestAnimationFrame(() => listRef.current?.focus());
  }, []);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[highlightedIndex] as HTMLElement;
    item?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex]);

  const selectAndClose = useCallback(
    (val: string) => {
      onValueChange(val);
      requestAnimationFrame(() => stopEditing());
    },
    [onValueChange, stopEditing],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.stopPropagation();
          e.preventDefault();
          setHighlightedIndex((i) => (i + 1) % normalizedOptions.length);
          break;
        case 'ArrowUp':
          e.stopPropagation();
          e.preventDefault();
          setHighlightedIndex((i) => (i - 1 + normalizedOptions.length) % normalizedOptions.length);
          break;
        case 'Enter':
          e.stopPropagation();
          e.preventDefault();
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          selectAndClose(normalizedOptions[highlightedIndex]!.value);
          break;
        case 'Escape':
          e.stopPropagation();
          wasCancelledRef.current = true;
          stopEditing(true);
          break;
      }
    },
    [normalizedOptions, highlightedIndex, selectAndClose, stopEditing],
  );

  return (
    <div
      ref={listRef}
      className="flex w-60 flex-col overflow-y-auto bg-popover py-1 focus:outline-none"
      style={{ maxHeight: 240 }}
      tabIndex={0}
      role="listbox"
      aria-label="Select a value"
      onKeyDownCapture={handleKeyDown}
    >
      {normalizedOptions.map((option, index) => (
        <div
          key={option.value}
          role="option"
          aria-selected={option.value === value}
          onMouseDown={(e) => {
            e.preventDefault();
            selectAndClose(option.value);
          }}
          onMouseEnter={() => setHighlightedIndex(index)}
          className={`flex cursor-pointer items-center justify-between px-3 py-1.5 text-sm transition-colors ${
            index === highlightedIndex ? 'bg-accent text-accent-foreground' : 'text-foreground'
          }`}
        >
          {option.label}
          {option.value === value && (
            <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          )}
        </div>
      ))}
    </div>
  );
}

SelectCellEditor.displayName = 'SelectCellEditor';

/**
 * Factory helper that bakes static config (options list) into a cell editor
 * component, matching the convention of createTextCellEditor, createNumberCellEditor,
 * etc.
 *
 * @example
 * ```ts
 * const colDef = {
 *   field: 'status',
 *   cellEditor: createSelectCellEditor({ options: statusOptions }),
 *   cellEditorPopup: true,
 * };
 * ```
 */
export function createSelectCellEditor(
  staticConfig: SelectCellEditorStaticConfig,
): React.ComponentType<Omit<SelectCellEditorProps, keyof SelectCellEditorStaticConfig>> {
  const Editor = (props: Omit<SelectCellEditorProps, keyof SelectCellEditorStaticConfig>) => (
    <SelectCellEditor {...staticConfig} {...props} />
  );
  Editor.displayName = 'SelectCellEditor';
  return Editor;
}
