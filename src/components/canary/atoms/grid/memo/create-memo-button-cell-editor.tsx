import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

import { MemoButtonCell } from './memo-button-cell';

/** Configuration for createMemoButtonCellEditor factory. */
export interface MemoButtonCellEditorConfig {
  /** Modal title. Default: "Note". */
  title?: string;
}

/** Props passed by AG Grid to the memo button cell editor. */
export interface MemoButtonCellEditorProps {
  /** Initial value from AG Grid. */
  value?: string;
  /** AG Grid stopEditing callback. */
  stopEditing?: (cancel?: boolean) => void;
}

/** Ref handle exposing getValue for AG Grid. */
export interface MemoButtonCellEditorHandle {
  getValue: () => string | undefined;
}

/**
 * Factory that wraps MemoButtonCell as an AG Grid-compatible cell editor.
 *
 * Integrates the modal save flow with AG Grid's getValue/stopEditing lifecycle.
 *
 * @example
 * ```ts
 * const colDef = { field: 'notes', cellEditor: createMemoButtonCellEditor({ title: 'Note' }) };
 * ```
 */
export function createMemoButtonCellEditor(config: MemoButtonCellEditorConfig = {}) {
  const MemoButtonCellEditorInner = forwardRef<
    MemoButtonCellEditorHandle,
    MemoButtonCellEditorProps
  >(({ value: initialValue, stopEditing }, ref) => {
    const [savedValue, setSavedValue] = useState(initialValue);
    const savedRef = useRef(initialValue);

    useImperativeHandle(ref, () => ({
      getValue: () => savedRef.current,
    }));

    const handleSave = (newValue: string) => {
      savedRef.current = newValue || undefined;
      setSavedValue(newValue || undefined);
      stopEditing?.(false);
    };

    // Build props object to satisfy exactOptionalPropertyTypes — omit keys that are undefined
    const cellProps: React.ComponentProps<typeof MemoButtonCell> = {
      editable: true,
      onSave: handleSave,
    };
    if (savedValue !== undefined) cellProps.value = savedValue;
    if (config.title !== undefined) cellProps.title = config.title;

    return <MemoButtonCell {...cellProps} />;
  });

  MemoButtonCellEditorInner.displayName = 'MemoButtonCellEditor';

  return MemoButtonCellEditorInner;
}
