import { useState, useRef, useCallback } from 'react';
import { useGridCellEditor } from 'ag-grid-react';

import { MultiSelectTypeaheadInput, type MultiSelectOption } from './multiselect-typeahead-input';

// --- Types ---

export interface MultiSelectCellEditorConfig {
  /** Async lookup function for options. */
  lookup: (search: string) => Promise<MultiSelectOption[]>;
  /** Input placeholder text. */
  placeholder?: string;
  /** Maximum visible tokens before "+N more". Defaults to 2. */
  maxVisible?: number;
}

export interface MultiSelectCellEditorProps {
  value: string[] | null;
  onValueChange: (value: string[] | null) => void;
  stopEditing: (cancel?: boolean) => void;
}

// --- Component ---

function MultiSelectCellEditorInner({
  value,
  onValueChange,
  config,
}: Omit<MultiSelectCellEditorProps, 'stopEditing'> & {
  config: MultiSelectCellEditorConfig;
}) {
  const [currentValue, setCurrentValue] = useState<string[]>(value ?? []);
  const wasCancelledRef = useRef(false);

  useGridCellEditor({
    isCancelAfterEnd: () => wasCancelledRef.current,
  });

  const handleValueChange = useCallback(
    (val: string[]) => {
      setCurrentValue(val);
      onValueChange(val.length > 0 ? val : null);
    },
    [onValueChange],
  );

  return (
    <MultiSelectTypeaheadInput
      value={currentValue}
      onValueChange={handleValueChange}
      lookup={config.lookup}
      placeholder={config.placeholder ?? 'Search\u2026'}
      maxVisible={config.maxVisible ?? 2}
      cellEditorMode
      className="w-full"
    />
  );
}

// --- Factory ---

/**
 * Creates a MultiSelectCellEditor component configured for a specific entity.
 *
 * Usage:
 * ```tsx
 * const RoleCellEditor = createMultiSelectCellEditor({
 *   lookup: lookupRoles,
 *   placeholder: 'Select roles...',
 *   maxVisible: 2,
 * });
 * ```
 */
export function createMultiSelectCellEditor(config: MultiSelectCellEditorConfig) {
  function CellEditor(props: MultiSelectCellEditorProps) {
    return <MultiSelectCellEditorInner {...props} config={config} />;
  }
  CellEditor.displayName = `MultiSelectCellEditor(${config.placeholder ?? 'Search'})`;
  return CellEditor;
}
