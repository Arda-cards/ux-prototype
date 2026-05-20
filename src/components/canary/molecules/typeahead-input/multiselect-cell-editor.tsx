import { useState, useRef, useCallback } from 'react';
import { useGridCellEditor } from 'ag-grid-react';

import { MultiSelectTypeaheadInput, type MultiSelectSource } from './multiselect-typeahead-input';

// --- Types ---

export interface MultiSelectCellEditorConfig {
  /**
   * Options source — an async lookup function, or a static list (`string[]` or
   * `MultiSelectOption[]`) filtered client-side by label.
   */
  lookup: MultiSelectSource;
  /** Input placeholder text. */
  placeholder?: string;
  /** Maximum number of dropdown results to show. Defaults to 8. */
  maxResults?: number;
  /**
   * When true (default), Enter selects the highlighted item and exits edit mode.
   * When false, Enter adds items additively — user must Tab or click away to exit.
   */
  defaultOne?: boolean;
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
  stopEditing,
  config,
}: MultiSelectCellEditorProps & {
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

  const handleCommit = useCallback(() => {
    stopEditing();
  }, [stopEditing]);

  return (
    <MultiSelectTypeaheadInput
      value={currentValue}
      onValueChange={handleValueChange}
      lookup={config.lookup}
      placeholder={config.placeholder ?? 'Search\u2026'}
      defaultOne={config.defaultOne ?? true}
      {...(config.maxResults !== undefined ? { maxResults: config.maxResults } : {})}
      onCommit={handleCommit}
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
