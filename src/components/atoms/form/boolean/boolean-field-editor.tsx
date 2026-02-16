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
  /** Called when value changes. */
  onChange?: (value: boolean) => void;
  /** Called when editing completes (blur or Enter). */
  onComplete?: (value: boolean) => void;
  /** Called when editing is cancelled (Escape). */
  onCancel?: () => void;

  /* --- View / Layout / Controller --- */
  /** Whether the editor is disabled. */
  disabled?: boolean;
  /** Auto-focus on mount. */
  autoFocus?: boolean;
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
  label,
  labelPosition,
}: ArdaBooleanFieldEditorProps) {
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
    onChange?.(newValue);
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

  if (displayFormat === 'checkbox') {
    return (
      <FieldLabel label={label} labelPosition={labelPosition}>
        <div className="px-3 py-2 rounded-lg border border-border bg-white flex items-center min-h-[36px]">
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
      </FieldLabel>
    );
  }

  // yes-no format: toggle buttons
  return (
    <FieldLabel label={label} labelPosition={labelPosition}>
      <div className="flex gap-2 px-3 py-2 rounded-lg border border-border bg-white min-h-[36px]">
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
    </FieldLabel>
  );
}
