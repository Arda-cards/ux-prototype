import { forwardRef, useImperativeHandle, useState } from 'react';

import type { AtomMode } from '@/lib/data-types/atom-types';

/** Design-time configuration for custom cell editor. */
export interface CustomCellEditorStaticConfig {
  /** Render function that receives field-level context only. */
  render: (
    value: unknown,
    mode: AtomMode,
    onChange: (original: unknown, current: unknown) => void,
    errors?: string[],
  ) => React.ReactNode;
}

/** Props for ArdaCustomCellEditor. */
export interface ArdaCustomCellEditorProps extends CustomCellEditorStaticConfig {
  /** Initial value from AG Grid. */
  value?: unknown;
  /** AG Grid stopEditing callback. */
  stopEditing?: (cancel?: boolean) => void;
}

/** Ref handle exposing getValue for AG Grid. */
export interface CustomCellEditorHandle {
  getValue: () => unknown;
}

/**
 * AG Grid cell editor for custom values.
 * Delegates rendering to the provided `render` prop.
 */
export const ArdaCustomCellEditor = forwardRef<CustomCellEditorHandle, ArdaCustomCellEditorProps>(
  ({ value: initialValue, render: renderFn }, ref) => {
    const [currentValue, setCurrentValue] = useState(initialValue);

    useImperativeHandle(ref, () => ({
      getValue: () => currentValue,
    }));

    const handleChange = (_original: unknown, current: unknown) => {
      setCurrentValue(current);
    };

    return <div>{renderFn(currentValue, 'edit', handleChange)}</div>;
  },
);

ArdaCustomCellEditor.displayName = 'ArdaCustomCellEditor';

/**
 * Factory helper for creating a custom cell editor with a static render function.
 */
export function createCustomCellEditor(config: CustomCellEditorStaticConfig) {
  return (props: Omit<ArdaCustomCellEditorProps, keyof CustomCellEditorStaticConfig>) => (
    <ArdaCustomCellEditor {...config} {...props} />
  );
}
