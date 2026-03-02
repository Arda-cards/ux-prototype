import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import { getBrowserTimezone, getTimezoneAbbreviation } from '@/lib/data-types/formatters';

/** Design-time configuration for time cell editor. */
export interface TimeCellEditorStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Placeholder text. */
  placeholder?: string;
}

/** Props for ArdaTimeCellEditor. */
export interface ArdaTimeCellEditorProps extends TimeCellEditorStaticConfig {
  /* --- Model / Data Binding --- */
  /** Initial value from AG Grid (HH:mm format). */
  value?: string;
  /** AG Grid stopEditing callback. */
  stopEditing?: (cancel?: boolean) => void;
  /** IANA timezone for this field (e.g. "America/New_York"). Defaults to browser timezone. Shown as hint. */
  timezone?: string;
}

/** Ref handle exposing getValue for AG Grid. */
export interface TimeCellEditorHandle {
  getValue: () => string | undefined;
}

/**
 * AG Grid cell editor for time values.
 *
 * Usage in column definitions:
 * ```ts
 * { field: 'startTime', cellEditor: createTimeCellEditor() }
 * ```
 */
export const ArdaTimeCellEditor = forwardRef<TimeCellEditorHandle, ArdaTimeCellEditorProps>(
  ({ value: initialValue, stopEditing, placeholder, timezone }, ref) => {
    const [currentValue, setCurrentValue] = useState(initialValue ?? '');
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
          type="time"
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
  },
);

ArdaTimeCellEditor.displayName = 'ArdaTimeCellEditor';

/**
 * Factory helper for creating a time cell editor with static config.
 *
 * @example
 * ```ts
 * const colDef = { field: 'startTime', cellEditor: createTimeCellEditor() };
 * ```
 */
export function createTimeCellEditor(config: TimeCellEditorStaticConfig = {}) {
  return (props: Omit<ArdaTimeCellEditorProps, keyof TimeCellEditorStaticConfig>) => (
    <ArdaTimeCellEditor {...config} {...props} />
  );
}
