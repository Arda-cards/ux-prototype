import { useState, useRef, useEffect } from 'react';

import { cn } from '@/lib/utils';
import { toDateInputValue } from '@/lib/data-types/formatters';

/** Design-time configuration for date field editor. */
export interface DateFieldEditorStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Placeholder text for the input. */
  placeholder?: string;
  /** IANA timezone for display formatting (design-time config). */
  timezone?: string;
}

/** Runtime configuration for date field editor. */
export interface DateFieldEditorRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** Current value (ISO date string). */
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

export interface ArdaDateFieldEditorProps
  extends DateFieldEditorStaticConfig, DateFieldEditorRuntimeConfig {}

/** Editable date input for form fields. */
export function ArdaDateFieldEditor({
  value,
  onChange,
  onComplete,
  onCancel,
  placeholder,
  disabled = false,
  autoFocus = false,
  timezone,
}: ArdaDateFieldEditorProps) {
  const [localValue, setLocalValue] = useState(toDateInputValue(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
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
    <div>
      <input
        ref={inputRef}
        type="date"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'w-full px-3 py-2 text-sm rounded-lg border border-border bg-white',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring',
          'placeholder:text-muted-foreground',
          disabled && 'opacity-50 cursor-not-allowed bg-muted/30',
        )}
      />
      {timezone && (
        <span className="text-xs text-muted-foreground mt-1 block">
          Timezone: {timezone.split('/').pop()?.replace(/_/g, ' ')}
        </span>
      )}
    </div>
  );
}
