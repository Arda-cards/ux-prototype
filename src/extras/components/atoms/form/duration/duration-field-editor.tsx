import { useState, useRef, useEffect } from 'react';

import { cn } from '@/lib/utils';
import { FieldLabel, type FieldLabelProps } from '../field-label';
import type { Duration } from './duration-field-display';

/** Design-time configuration for duration field editor. */
export interface DurationFieldEditorStaticConfig extends FieldLabelProps {
  /** Unit options: key = unit code, value = display name. */
  unitOptions: Readonly<Record<string, string>>;
  /** Number of decimal places. */
  precision?: number;
  /** Placeholder text for the value input. */
  placeholder?: string;
}

/** Runtime configuration for duration field editor. */
export interface DurationFieldEditorRuntimeConfig {
  /** Current value. */
  value?: Duration;
  /** Called when value changes. Receives both original and current values. */
  onChange?: (original: Duration, current: Duration) => void;
  /** Called when editing completes (blur or Enter). */
  onComplete?: (value: Duration) => void;
  /** Called when editing is cancelled (Escape). */
  onCancel?: () => void;
  /** Whether the editor is disabled. */
  disabled?: boolean;
  /** Auto-focus on mount. */
  autoFocus?: boolean;
  /** Validation error messages. */
  errors?: string[];
  /** Whether to show error styling and messages. */
  showErrors?: boolean;
}

export interface ArdaDurationFieldEditorProps
  extends DurationFieldEditorStaticConfig, DurationFieldEditorRuntimeConfig {}

/** Editable duration input (value + unit selector) for form fields. */
export function ArdaDurationFieldEditor({
  value: durationValue,
  onChange,
  onComplete,
  onCancel,
  unitOptions,
  precision = 0,
  placeholder,
  disabled = false,
  autoFocus = false,
  errors,
  showErrors = false,
  label,
  labelPosition,
}: ArdaDurationFieldEditorProps) {
  const defaultUnit = Object.keys(unitOptions)[0] ?? '';
  const originalValue = useRef<Duration>(durationValue ?? { value: 0, unit: defaultUnit });
  const [localValue, setLocalValue] = useState(durationValue?.value.toString() ?? '');
  const [localUnit, setLocalUnit] = useState(durationValue?.unit ?? defaultUnit);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [autoFocus]);

  const currentDuration = (): Duration => {
    const parsed = parseFloat(localValue);
    return { value: isNaN(parsed) ? 0 : parsed, unit: localUnit };
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    const parsed = parseFloat(newValue);
    if (!isNaN(parsed)) {
      onChange?.(originalValue.current, { value: parsed, unit: localUnit });
    }
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUnit = e.target.value;
    setLocalUnit(newUnit);
    const parsed = parseFloat(localValue);
    const val = isNaN(parsed) ? 0 : parsed;
    onChange?.(originalValue.current, { value: val, unit: newUnit });
  };

  const handleBlur = () => {
    onComplete?.(currentDuration());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onComplete?.(currentDuration());
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel?.();
    }
  };

  const step = precision > 0 ? Math.pow(10, -precision).toFixed(precision) : '1';
  const hasErrors = showErrors && errors && errors.length > 0;

  const inputClass = cn(
    'flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border bg-white',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring',
    'placeholder:text-muted-foreground',
    hasErrors ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-border',
    disabled && 'opacity-50 cursor-not-allowed bg-muted/30',
  );

  const selectClass = cn(
    'w-[100px] shrink-0 px-2 py-2 text-sm rounded-lg border bg-white',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring',
    hasErrors ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-border',
    disabled && 'opacity-50 cursor-not-allowed bg-muted/30',
  );

  return (
    <FieldLabel label={label} labelPosition={labelPosition}>
      <div>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="number"
            value={localValue}
            onChange={handleValueChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            step={step}
            disabled={disabled}
            className={inputClass}
          />
          <select
            value={localUnit}
            onChange={handleUnitChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={selectClass}
          >
            {Object.entries(unitOptions).map(([code]) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </div>
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
