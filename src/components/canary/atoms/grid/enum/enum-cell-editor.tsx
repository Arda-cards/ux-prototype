import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { cn } from '@/utils';

/** Design-time configuration for enum cell editor. */
export interface EnumCellEditorStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Mapping from enum value to human-readable display label. */
  options: Readonly<Record<string, string>>;
}

/** Props for EnumCellEditor. */
export interface EnumCellEditorProps extends EnumCellEditorStaticConfig {
  /* --- Model / Data Binding --- */
  /** Initial value from AG Grid. */
  value?: string;
  /** AG Grid stopEditing callback. */
  stopEditing?: (cancel?: boolean) => void;
}

/** Ref handle exposing getValue for AG Grid. */
export interface EnumCellEditorHandle {
  getValue: () => string | undefined;
}

/**
 * AG Grid cell editor for enum values using a select dropdown.
 *
 * Usage in column definitions:
 * ```ts
 * { field: 'mechanism', cellEditor: createEnumCellEditor({ options }) }
 * ```
 */
export const EnumCellEditor = forwardRef<EnumCellEditorHandle, EnumCellEditorProps>(
  ({ value: initialValue, stopEditing, options }, ref) => {
    const [currentValue, setCurrentValue] = useState(initialValue ?? '');
    const selectRef = useRef<HTMLSelectElement>(null);

    useImperativeHandle(ref, () => ({
      getValue: () => currentValue || undefined,
    }));

    useEffect(() => {
      selectRef.current?.focus();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setCurrentValue(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        stopEditing?.(false);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        stopEditing?.(true);
      }
    };

    return (
      <select
        ref={selectRef}
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full h-full px-2 py-1 text-sm border-0 outline-none',
          'focus:ring-2 focus:ring-ring',
          'bg-white',
        )}
      >
        {Object.keys(options).map((key) => (
          <option key={key} value={key}>
            {options[key]}
          </option>
        ))}
      </select>
    );
  },
);

EnumCellEditor.displayName = 'EnumCellEditor';

/**
 * Factory helper for creating an enum cell editor with static config.
 *
 * @example
 * ```ts
 * const colDef = { field: 'mechanism', cellEditor: createEnumCellEditor({ options }) };
 * ```
 */
export function createEnumCellEditor(config: EnumCellEditorStaticConfig) {
  return (props: Omit<EnumCellEditorProps, keyof EnumCellEditorStaticConfig>) => (
    <EnumCellEditor {...config} {...props} />
  );
}
