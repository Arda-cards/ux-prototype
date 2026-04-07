import { useState, useRef, useCallback } from 'react';
import { useGridCellEditor } from 'ag-grid-react';

import { TypeaheadInput, type TypeaheadOption } from './typeahead-input';

// --- Types ---

export interface TypeaheadCellEditorConfig {
  /** Async lookup function for options. */
  lookup: (search: string) => Promise<TypeaheadOption[]>;
  /** Allow creating new values not in the lookup results. */
  allowCreate?: boolean;
  /** Input placeholder text. */
  placeholder?: string;
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
  config,
}: Omit<TypeaheadCellEditorProps, 'stopEditing'> & { config: TypeaheadCellEditorConfig }) {
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

  return (
    <TypeaheadInput
      value={currentValue}
      onValueChange={handleValueChange}
      lookup={config.lookup}
      allowCreate={config.allowCreate ?? false}
      placeholder={config.placeholder ?? 'Search\u2026'}
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
 * const UnitCellEditor = createTypeaheadCellEditor({
 *   lookup: lookupUnits,
 *   allowCreate: true,
 *   placeholder: 'Search units...',
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
