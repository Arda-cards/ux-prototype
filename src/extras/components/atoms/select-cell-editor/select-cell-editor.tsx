import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

export interface SelectCellEditorStaticConfig {
  /* --- Model / Data Binding --- */
  /** Array of options to display in the select dropdown. */
  options: Array<{ value: string; label: string }>;

  /* --- View / Layout / Controller --- */
  /** Placeholder text shown when no value is selected. */
  placeholder?: string;
}

export interface ArdaSelectCellEditorProps extends SelectCellEditorStaticConfig {
  /* --- Model / Data Binding --- */
  /** Initial value passed by AG Grid. */
  value?: string;
  /** Callback invoked when editing stops. */
  stopEditing?: () => void;
  /** Callback invoked when editing is cancelled. */
  stopEditingOnCancel?: () => void;

  /* --- View / Layout / Controller --- */
  // (View props inherited from SelectCellEditorStaticConfig)
}

export interface SelectCellEditorHandle {
  getValue: () => string | undefined;
}

/**
 * AG Grid cell editor component that renders a `<select>` dropdown.
 *
 * This component replaces inline select editors from the source app.
 * It auto-focuses on mount and commits the value on change.
 *
 * Usage in AG Grid column definition:
 * ```typescript
 * const colDef = {
 *   cellEditor: createSelectCellEditor([
 *     { value: 'active', label: 'Active' },
 *     { value: 'inactive', label: 'Inactive' }
 *   ])
 * };
 * ```
 */
export const ArdaSelectCellEditor = forwardRef<SelectCellEditorHandle, ArdaSelectCellEditorProps>(
  ({ options, placeholder, value: initialValue, stopEditing }, ref) => {
    const [currentValue, setCurrentValue] = useState<string | undefined>(initialValue);
    const selectRef = useRef<HTMLSelectElement>(null);

    useImperativeHandle(ref, () => ({
      getValue: () => currentValue,
    }));

    useEffect(() => {
      // Auto-focus the select on mount
      selectRef.current?.focus();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = e.target.value;
      setCurrentValue(newValue === '' ? undefined : newValue);

      // Commit immediately on change
      if (stopEditing) {
        // Small delay to ensure state update
        setTimeout(() => stopEditing(), 0);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLSelectElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (stopEditing) {
          stopEditing();
        }
      }
    };

    return (
      <select
        ref={selectRef}
        value={currentValue ?? ''}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full h-full px-2 py-1 text-sm border-0 outline-none',
          'focus:ring-2 focus:ring-ring',
          'bg-white cursor-pointer',
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  },
);

ArdaSelectCellEditor.displayName = 'ArdaSelectCellEditor';

/**
 * Factory helper for creating a select cell editor with static options.
 *
 * @param options - Array of option objects with value and label
 * @param placeholder - Optional placeholder text
 * @returns A component function suitable for AG Grid's cellEditor property
 *
 * @example
 * ```typescript
 * const colDef = {
 *   field: 'status',
 *   cellEditor: createSelectCellEditor([
 *     { value: 'pending', label: 'Pending' },
 *     { value: 'approved', label: 'Approved' },
 *     { value: 'rejected', label: 'Rejected' }
 *   ], 'Select status...')
 * };
 * ```
 */
export function createSelectCellEditor(
  options: Array<{ value: string; label: string }>,
  placeholder?: string,
) {
  return (props: Omit<ArdaSelectCellEditorProps, keyof SelectCellEditorStaticConfig>) => (
    <ArdaSelectCellEditor
      options={options}
      {...(placeholder !== undefined ? { placeholder } : {})}
      {...props}
    />
  );
}
