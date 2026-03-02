import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

/** Design-time configuration for number cell editor. */
export interface NumberCellEditorStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Number of decimal places. */
  precision?: number;
  /** Minimum allowed value. */
  min?: number;
  /** Maximum allowed value. */
  max?: number;
}

/** Props for ArdaNumberCellEditor. */
export interface ArdaNumberCellEditorProps extends NumberCellEditorStaticConfig {
  /* --- Model / Data Binding --- */
  /** Initial value from AG Grid. */
  value?: number;
  /** AG Grid stopEditing callback. */
  stopEditing?: (cancel?: boolean) => void;
}

/** Ref handle exposing getValue for AG Grid. */
export interface NumberCellEditorHandle {
  getValue: () => number | undefined;
}

/**
 * AG Grid cell editor for numeric values.
 *
 * Usage in column definitions:
 * ```ts
 * { field: 'price', cellEditor: createNumberCellEditor({ precision: 2, min: 0 }) }
 * ```
 */
export const ArdaNumberCellEditor = forwardRef<NumberCellEditorHandle, ArdaNumberCellEditorProps>(
  ({ value: initialValue, stopEditing, precision = 0, min, max }, ref) => {
    const [currentValue, setCurrentValue] = useState(initialValue?.toString() ?? '');
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      getValue: () => {
        const parsed = parseFloat(currentValue);
        return isNaN(parsed) ? undefined : parsed;
      },
    }));

    useEffect(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        stopEditing?.(false);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        stopEditing?.(true);
      }
    };

    const step = precision > 0 ? Math.pow(10, -precision).toFixed(precision) : '1';

    return (
      <input
        ref={inputRef}
        type="number"
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onKeyDown={handleKeyDown}
        step={step}
        min={min}
        max={max}
        className={cn(
          'w-full h-full px-2 py-1 text-sm border-0 outline-none',
          'focus:ring-2 focus:ring-ring',
          'bg-white',
        )}
      />
    );
  },
);

ArdaNumberCellEditor.displayName = 'ArdaNumberCellEditor';

/**
 * Factory helper for creating a number cell editor with static config.
 *
 * @example
 * ```ts
 * const colDef = { field: 'price', cellEditor: createNumberCellEditor({ precision: 2, min: 0 }) };
 * ```
 */
export function createNumberCellEditor(config: NumberCellEditorStaticConfig = {}) {
  return (props: Omit<ArdaNumberCellEditorProps, keyof NumberCellEditorStaticConfig>) => (
    <ArdaNumberCellEditor {...config} {...props} />
  );
}
