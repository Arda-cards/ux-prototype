import { useState, useRef, useEffect } from 'react';

import { cn } from '@/lib/utils';

/** Design-time configuration for text field editor. */
export interface TextFieldEditorStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Placeholder text for the input. */
  placeholder?: string;
  /** Maximum allowed length. */
  maxLength?: number;
}

/** Runtime configuration for text field editor. */
export interface TextFieldEditorRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** Current value. */
  value?: string;
  /** Called when value changes. */
  onChange?: (value: string) => void;
  /** Called when editing completes (blur or Enter). */
  onComplete?: (value: string) => void;
  /** Called when editing is cancelled (Escape). */
  onCancel?: () => void;

  /* --- View / Layout / Controller --- */
  /** Whether the editor is disabled. */
  disabled?: boolean;
  /** Auto-focus on mount. */
  autoFocus?: boolean;
}

export interface ArdaTextFieldEditorProps
  extends TextFieldEditorStaticConfig, TextFieldEditorRuntimeConfig {}

/** Editable text input for form fields. */
export function ArdaTextFieldEditor({
  value,
  onChange,
  onComplete,
  onCancel,
  placeholder,
  maxLength,
  disabled = false,
  autoFocus = false,
}: ArdaTextFieldEditorProps) {
  const [localValue, setLocalValue] = useState(value ?? '');
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

  return (
    <input
      ref={inputRef}
      type="text"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      maxLength={maxLength}
      disabled={disabled}
      className={cn(
        'w-full px-3 py-2 text-sm rounded-lg border border-border bg-white',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring',
        'placeholder:text-muted-foreground',
        disabled && 'opacity-50 cursor-not-allowed bg-muted/30',
      )}
    />
  );
}
