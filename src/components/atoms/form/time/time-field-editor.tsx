import { useState, useRef, useEffect } from 'react';

import { cn } from '@/lib/utils';
import { getBrowserTimezone, getTimezoneAbbreviation } from '@/lib/data-types/formatters';
import { FieldLabel, type FieldLabelProps } from '../field-label';

/** Design-time configuration for time field editor. */
export interface TimeFieldEditorStaticConfig extends FieldLabelProps {
  /* --- View / Layout / Controller --- */
  /** Placeholder text for the input. */
  placeholder?: string;
}

/** Runtime configuration for time field editor. */
export interface TimeFieldEditorRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** Current value (HH:mm format). */
  value?: string;
  /** Called when value changes. Receives both the original and current value. */
  onChange?: (original: string, current: string) => void;
  /** Called when editing completes (blur or Enter). */
  onComplete?: (value: string) => void;
  /** Called when editing is cancelled (Escape). */
  onCancel?: () => void;

  /* --- View / Layout / Controller --- */
  /** Whether the editor is disabled. */
  disabled?: boolean;
  /** Auto-focus on mount. */
  autoFocus?: boolean;
  /** IANA timezone for display formatting. Defaults to browser timezone. */
  timezone?: string;
  /** Validation error messages. */
  errors?: string[];
  /** Whether to show error styling and messages. */
  showErrors?: boolean;
}

export interface ArdaTimeFieldEditorProps
  extends TimeFieldEditorStaticConfig, TimeFieldEditorRuntimeConfig {}

/** Editable time input for form fields. */
export function ArdaTimeFieldEditor({
  value,
  onChange,
  onComplete,
  onCancel,
  placeholder,
  disabled = false,
  autoFocus = false,
  timezone,
  label,
  labelPosition,
  errors,
  showErrors = false,
}: ArdaTimeFieldEditorProps) {
  const [localValue, setLocalValue] = useState(value ?? '');
  const inputRef = useRef<HTMLInputElement>(null);
  const originalValue = useRef(value ?? '');
  const tz = timezone ?? getBrowserTimezone();
  const tzLabel = tz.split('/').pop()?.replace(/_/g, ' ');
  const tzAbbr = getTimezoneAbbreviation(tz);

  const hasErrors = showErrors && errors && errors.length > 0;

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange?.(originalValue.current, newValue);
  };

  const handleBlur = () => {
    onComplete?.(localValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onComplete?.(localValue);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel?.();
    }
  };

  return (
    <FieldLabel label={label} labelPosition={labelPosition}>
      <div>
        <input
          ref={inputRef}
          type="time"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full px-3 py-2 text-sm rounded-lg border bg-white',
            hasErrors ? 'border-destructive' : 'border-border',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring',
            'placeholder:text-muted-foreground',
            disabled && 'opacity-50 cursor-not-allowed bg-muted/30',
          )}
        />
        <span className="text-xs text-muted-foreground mt-1 block">
          Timezone: {tzAbbr || tzLabel}
        </span>
        {hasErrors && (
          <div className="mt-1 space-y-0.5">
            {errors.map((error) => (
              <p key={error} className="text-xs text-destructive">
                {error}
              </p>
            ))}
          </div>
        )}
      </div>
    </FieldLabel>
  );
}
