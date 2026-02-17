import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import {
  toDateTimeInputValue,
  getBrowserTimezone,
  getTimezoneAbbreviation,
} from '@/lib/data-types/formatters';

/** Design-time configuration for date-time cell editor. */
export interface DateTimeCellEditorStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Placeholder text. */
  placeholder?: string;
}

/** Props for ArdaDateTimeCellEditor. */
export interface ArdaDateTimeCellEditorProps extends DateTimeCellEditorStaticConfig {
  /* --- Model / Data Binding --- */
  /** Initial value from AG Grid (ISO datetime string). */
  value?: string;
  /** AG Grid stopEditing callback. */
  stopEditing?: (cancel?: boolean) => void;
  /** IANA timezone for this field (e.g. "America/New_York"). Defaults to browser timezone. Shown as hint. */
  timezone?: string;
}

/** Ref handle exposing getValue for AG Grid. */
export interface DateTimeCellEditorHandle {
  getValue: () => string | undefined;
}

/**
 * AG Grid cell editor for datetime values.
 *
 * Usage in column definitions:
 * ```ts
 * { field: 'createdAt', cellEditor: createDateTimeCellEditor() }
 * ```
 */
export const ArdaDateTimeCellEditor = forwardRef<
  DateTimeCellEditorHandle,
  ArdaDateTimeCellEditorProps
>(({ value: initialValue, stopEditing, placeholder, timezone }, ref) => {
  const [currentValue, setCurrentValue] = useState(toDateTimeInputValue(initialValue));
  const inputRef = useRef<HTMLInputElement>(null);
  const tz = timezone ?? getBrowserTimezone();
  const tzLabel = tz.split('/').pop()?.replace(/_/g, ' ');
  const tzAbbr = getTimezoneAbbreviation(tz);

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
        type="datetime-local"
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
      <span className="text-xs text-muted-foreground whitespace-nowrap px-1">
        {tzAbbr || tzLabel}
      </span>
    </div>
  );
});

ArdaDateTimeCellEditor.displayName = 'ArdaDateTimeCellEditor';

/**
 * Factory helper for creating a datetime cell editor with static config.
 *
 * @example
 * ```ts
 * const colDef = { field: 'createdAt', cellEditor: createDateTimeCellEditor() };
 * ```
 */
export function createDateTimeCellEditor(config: DateTimeCellEditorStaticConfig = {}) {
  return (props: Omit<ArdaDateTimeCellEditorProps, keyof DateTimeCellEditorStaticConfig>) => (
    <ArdaDateTimeCellEditor {...config} {...props} />
  );
}
