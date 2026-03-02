import { useState, useRef, useEffect } from 'react';

import { cn } from '@/lib/utils';
import { FieldLabel, type FieldLabelProps } from '../field-label';

/** Design-time configuration for number field editor. */
export interface NumberFieldEditorStaticConfig extends FieldLabelProps {
  /* --- View / Layout / Controller --- */
  /** Number of decimal places. */
  precision?: number;
  /** Minimum allowed value. */
  min?: number;
  /** Maximum allowed value. */
  max?: number;
  /** Placeholder text for the input. */
  placeholder?: string;
}

/** Runtime configuration for number field editor. */
export interface NumberFieldEditorRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** Current value. */
  value?: number;
  /** Called when value changes. Receives both original and current values. */
  onChange?: (original: number, current: number) => void;
  /** Called when editing completes (blur or Enter). */
  onComplete?: (value: number) => void;
  /** Called when editing is cancelled (Escape). */
  onCancel?: () => void;

  /* --- View / Layout / Controller --- */
  /** Whether the editor is disabled. */
  disabled?: boolean;
  /** Auto-focus on mount. */
  autoFocus?: boolean;
  /** Validation error messages. */
  errors?: string[];
  /** Whether to show error styling and messages. */
  showErrors?: boolean;
}

export interface ArdaNumberFieldEditorProps
  extends NumberFieldEditorStaticConfig, NumberFieldEditorRuntimeConfig {}

/** Editable number input for form fields. */
export function ArdaNumberFieldEditor({
  value,
  onChange,
  onComplete,
  onCancel,
  precision = 0,
  min,
  max,
  placeholder,
  disabled = false,
  autoFocus = false,
  errors,
  showErrors = false,
  label,
  labelPosition,
}: ArdaNumberFieldEditorProps) {
  const originalValue = useRef(value ?? 0);
  const [localValue, setLocalValue] = useState(value?.toString() ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    const parsed = parseFloat(newValue);
    if (!isNaN(parsed)) {
      onChange?.(originalValue.current, parsed);
    }
  };

  const handleBlur = () => {
    const parsed = parseFloat(localValue);
    onComplete?.(isNaN(parsed) ? 0 : parsed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const parsed = parseFloat(localValue);
      onComplete?.(isNaN(parsed) ? 0 : parsed);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel?.();
    }
  };

  const step = precision > 0 ? Math.pow(10, -precision).toFixed(precision) : '1';
  const hasErrors = showErrors && errors && errors.length > 0;

  return (
    <FieldLabel label={label} labelPosition={labelPosition}>
      <div>
        <input
          ref={inputRef}
          type="number"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          step={step}
          min={min}
          max={max}
          disabled={disabled}
          className={cn(
            'w-full px-3 py-2 text-sm rounded-lg border bg-white',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring',
            'placeholder:text-muted-foreground',
            hasErrors ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-border',
            disabled && 'opacity-50 cursor-not-allowed bg-muted/30',
          )}
        />
        {hasErrors && (
          <div className="mt-1 space-y-0.5">
            {errors.map((error, i) => (
              <p key={i} className="text-xs text-red-600">
                {error}
              </p>
            ))}
          </div>
        )}
      </div>
    </FieldLabel>
  );
}
