import { useState, useRef, useEffect } from 'react';

import { cn } from '@/lib/utils';
import { FieldLabel, type FieldLabelProps } from '../field-label';

/** Design-time configuration for enum field editor. */
export interface EnumFieldEditorStaticConfig<V extends string> extends FieldLabelProps {
  /* --- View / Layout / Controller --- */
  /** Mapping from enum value to human-readable display label. */
  options: Readonly<Record<V, string>>;
}

/** Runtime configuration for enum field editor. */
export interface EnumFieldEditorRuntimeConfig<V extends string> {
  /* --- Model / Data Binding --- */
  /** Current value. */
  value?: V;
  /** Called when value changes. Receives both original and current values. */
  onChange?: (original: V, current: V) => void;
  /** Called when editing completes (blur or change commit). */
  onComplete?: (value: V) => void;
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

export interface ArdaEnumFieldEditorProps<V extends string>
  extends EnumFieldEditorStaticConfig<V>, EnumFieldEditorRuntimeConfig<V> {}

/** Editable enum select for form fields. */
export function ArdaEnumFieldEditor<V extends string>({
  value,
  onChange,
  onComplete,
  onCancel,
  options,
  disabled = false,
  autoFocus = false,
  errors,
  showErrors = false,
  label,
  labelPosition,
}: ArdaEnumFieldEditorProps<V>) {
  const originalValue = useRef(value as V);
  const [localValue, setLocalValue] = useState(value as V);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (autoFocus) {
      selectRef.current?.focus();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value as V;
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

  const hasErrors = showErrors && errors && errors.length > 0;

  return (
    <FieldLabel label={label} labelPosition={labelPosition}>
      <div>
        <select
          ref={selectRef}
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            'w-full px-3 py-2 text-sm rounded-lg border bg-white',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring',
            hasErrors ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-border',
            disabled && 'opacity-50 cursor-not-allowed bg-muted/30',
          )}
        >
          {(Object.keys(options) as V[]).map((key) => (
            <option key={key} value={key}>
              {options[key]}
            </option>
          ))}
        </select>
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
