import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import { toDateInputValue } from '@/lib/data-types/formatters';

/** Design-time configuration for date cell editor. */
export interface DateCellEditorStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Placeholder text. */
  placeholder?: string;
  /** IANA timezone for this field (e.g. "America/New_York"). Shown as hint. */
  timezone?: string;
}

/** Props for ArdaDateCellEditor. */
export interface ArdaDateCellEditorProps extends DateCellEditorStaticConfig {
  /* --- Model / Data Binding --- */
  /** Initial value from AG Grid (ISO date string). */
  value?: string;
  /** AG Grid stopEditing callback. */
  stopEditing?: (cancel?: boolean) => void;
}

/** Ref handle exposing getValue for AG Grid. */
export interface DateCellEditorHandle {
  getValue: () => string | undefined;
}

/**
 * AG Grid cell editor for date values.
 *
 * Usage in column definitions:
 * ```ts
 * { field: 'startDate', cellEditor: createDateCellEditor() }
 * ```
 */
export const ArdaDateCellEditor = forwardRef<DateCellEditorHandle, ArdaDateCellEditorProps>(
  ({ value: initialValue, stopEditing, placeholder, timezone }, ref) => {
    const [currentValue, setCurrentValue] = useState(toDateInputValue(initialValue));
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      getValue: () => currentValue || undefined,
    }));

    useEffect(() => {
      inputRef.current?.focus();
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

    return (
      <div className="flex items-center gap-1 w-full h-full">
        <input
          ref={inputRef}
          type="date"
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'flex-1 h-full px-2 py-1 text-sm border-0 outline-none',
            'focus:ring-2 focus:ring-ring',
            'bg-white',
          )}
        />
        {timezone && (
          <span className="text-xs text-muted-foreground whitespace-nowrap px-1">
            {timezone.split('/').pop()?.replace(/_/g, ' ')}
          </span>
        )}
      </div>
    );
  },
);

ArdaDateCellEditor.displayName = 'ArdaDateCellEditor';

/**
 * Factory helper for creating a date cell editor with static config.
 *
 * @example
 * ```ts
 * const colDef = { field: 'startDate', cellEditor: createDateCellEditor() };
 * ```
 */
export function createDateCellEditor(config: DateCellEditorStaticConfig = {}) {
  return (props: Omit<ArdaDateCellEditorProps, keyof DateCellEditorStaticConfig>) => (
    <ArdaDateCellEditor {...config} {...props} />
  );
}
