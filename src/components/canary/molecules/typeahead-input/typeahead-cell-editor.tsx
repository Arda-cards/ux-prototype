import { useState, useRef, useCallback } from 'react';
import { useGridCellEditor } from 'ag-grid-react';

import { TypeaheadInput, type TypeaheadSource } from './typeahead-input';

// --- Types ---

export interface TypeaheadCellEditorConfig {
  /**
   * Options source — an async lookup function, or a static list (`string[]` or
   * `TypeaheadOption[]`) filtered client-side by label.
   */
  lookup: TypeaheadSource;
  /** Allow creating new values not in the lookup results. */
  allowCreate?: boolean;
  /** Input placeholder text. */
  placeholder?: string;
  /** Maximum number of dropdown results to show. Defaults to 8. */
  maxResults?: number;
  /**
   * Clear the input on focus to show the full list; restore on Escape/blur.
   * Delete/Backspace on an empty input clears the value.
   */
  clearOnFocus?: boolean;
}

export interface TypeaheadCellEditorProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
  stopEditing: (cancel?: boolean) => void;
}

// --- Component ---

function TypeaheadCellEditorInner({
  value,
  onValueChange,
  stopEditing,
  config,
}: TypeaheadCellEditorProps & { config: TypeaheadCellEditorConfig }) {
  const [currentValue, setCurrentValue] = useState(value ?? '');
  const wasCancelledRef = useRef(false);

  useGridCellEditor({
    isCancelAfterEnd: () => wasCancelledRef.current,
  });

  const handleValueChange = useCallback(
    (val: string) => {
      setCurrentValue(val);
      onValueChange(val || null);
    },
    [onValueChange],
  );

  const handleCommit = useCallback(() => stopEditing(), [stopEditing]);

  return (
    <TypeaheadInput
      value={currentValue}
      onValueChange={handleValueChange}
      onCommit={handleCommit}
      lookup={config.lookup}
      allowCreate={config.allowCreate ?? false}
      placeholder={config.placeholder ?? 'Search…'}
      maxResults={config.maxResults ?? 8}
      clearOnFocus={config.clearOnFocus ?? false}
      cellEditorMode
      className="w-full"
    />
  );
}

// --- Factory ---

/**
 * Creates a TypeaheadCellEditor component configured for a specific entity.
 *
 * Usage:
 * ```tsx
 * const OrderMethodCellEditor = createTypeaheadCellEditor({
 *   lookup: ORDER_METHODS,
 *   placeholder: 'Order method...',
 *   maxResults: ORDER_METHODS.length,
 *   clearOnFocus: true,
 * });
 * ```
 */
export function createTypeaheadCellEditor(config: TypeaheadCellEditorConfig) {
  function CellEditor(props: TypeaheadCellEditorProps) {
    return <TypeaheadCellEditorInner {...props} config={config} />;
  }
  CellEditor.displayName = `TypeaheadCellEditor(${config.placeholder ?? 'Search'})`;
  return CellEditor;
}
