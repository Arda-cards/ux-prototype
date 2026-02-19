import { useState, useRef, useEffect } from 'react';

import { cn } from '@/lib/utils';
import { FieldLabel, type FieldLabelProps } from '../field-label';

/** Design-time configuration for boolean field editor. */
export interface BooleanFieldEditorStaticConfig extends FieldLabelProps {
  /* --- View / Layout / Controller --- */
  /** Editor format: checkbox or yes-no toggle buttons. */
  displayFormat?: 'checkbox' | 'yes-no';
}

/** Runtime configuration for boolean field editor. */
export interface BooleanFieldEditorRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** Current value. */
  value?: boolean;
  /** Called when value changes. Receives both original and current values. */
  onChange?: (original: boolean, current: boolean) => void;
  /** Called when editing completes (blur or Enter). */
  onComplete?: (value: boolean) => void;
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

export interface ArdaBooleanFieldEditorProps
  extends BooleanFieldEditorStaticConfig, BooleanFieldEditorRuntimeConfig {}

/** Editable boolean input for form fields. */
export function ArdaBooleanFieldEditor({
  value,
  onChange,
  onComplete,
  onCancel,
  displayFormat = 'checkbox',
  disabled = false,
  autoFocus = false,
  errors,
  showErrors = false,
  label,
  labelPosition,
}: ArdaBooleanFieldEditorProps) {
  const originalValue = useRef(value ?? false);
  const [localValue, setLocalValue] = useState(value ?? false);
  const checkboxRef = useRef<HTMLInputElement>(null);
  const yesButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (autoFocus) {
      if (displayFormat === 'checkbox') {
        checkboxRef.current?.focus();
      } else {
        yesButtonRef.current?.focus();
      }
    }
  }, [autoFocus, displayFormat]);

  const handleChange = (newValue: boolean) => {
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

  if (displayFormat === 'checkbox') {
    return (
      <FieldLabel label={label} labelPosition={labelPosition}>
        <div>
          <div
            className={cn(
              'px-3 py-2 rounded-lg border bg-white flex items-center min-h-[36px]',
              hasErrors ? 'border-red-500' : 'border-border',
            )}
          >
            <input
              ref={checkboxRef}
              type="checkbox"
              checked={localValue}
              onChange={(e) => handleChange(e.target.checked)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              className={cn(
                'h-4 w-4 rounded border-border text-primary',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0',
                disabled && 'opacity-50 cursor-not-allowed',
              )}
            />
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

  // yes-no format: toggle buttons
  return (
    <FieldLabel label={label} labelPosition={labelPosition}>
      <div>
        <div
          className={cn(
            'flex gap-2 px-3 py-2 rounded-lg border bg-white min-h-[36px]',
            hasErrors ? 'border-red-500' : 'border-border',
          )}
        >
          <button
            ref={yesButtonRef}
            type="button"
            onClick={() => {
              handleChange(true);
              onComplete?.(true);
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={cn(
              'px-3 py-1 text-sm font-medium rounded',
              'border border-border',
              'focus:outline-none focus:ring-2 focus:ring-ring',
              localValue
                ? 'bg-primary text-primary-foreground'
                : 'bg-white text-foreground hover:bg-muted',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => {
              handleChange(false);
              onComplete?.(false);
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={cn(
              'px-3 py-1 text-sm font-medium rounded',
              'border border-border',
              'focus:outline-none focus:ring-2 focus:ring-ring',
              !localValue
                ? 'bg-primary text-primary-foreground'
                : 'bg-white text-foreground hover:bg-muted',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
          >
            No
          </button>
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
