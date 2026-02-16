import { useState, useRef, useEffect } from 'react';

import { cn } from '@/lib/utils';
import { FieldLabel, type FieldLabelProps } from '../field-label';

/** Design-time configuration for image field editor. */
export interface ImageFieldEditorStaticConfig extends FieldLabelProps {
  /* --- View / Layout / Controller --- */
  /** Placeholder text for the input. */
  placeholder?: string;
  /** Maximum height for the preview. */
  maxPreviewHeight?: number;
}

/** Runtime configuration for image field editor. */
export interface ImageFieldEditorRuntimeConfig {
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

export interface ArdaImageFieldEditorProps
  extends ImageFieldEditorStaticConfig, ImageFieldEditorRuntimeConfig {}

/** Editable image URL input for form fields with preview. */
export function ArdaImageFieldEditor({
  value,
  onChange,
  onComplete,
  onCancel,
  placeholder = 'Enter image URL…',
  maxPreviewHeight = 80,
  disabled = false,
  autoFocus = false,
  label,
  labelPosition,
}: ArdaImageFieldEditorProps) {
  const [localValue, setLocalValue] = useState(value ?? '');
  const [imageValid, setImageValid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [autoFocus]);

  useEffect(() => {
    // Check if the URL is valid by trying to load it
    if (localValue) {
      const img = new Image();
      img.onload = () => setImageValid(true);
      img.onerror = () => setImageValid(false);
      img.src = localValue;
    } else {
      setImageValid(false);
    }
  }, [localValue]);

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
    <FieldLabel label={label} labelPosition={labelPosition}>
      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="url"
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
        {imageValid && localValue && (
          <div className="px-2 py-1 bg-muted/30 rounded border border-border">
            <img
              src={localValue}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: `${maxPreviewHeight}px`,
                objectFit: 'contain',
              }}
              className="rounded"
            />
          </div>
        )}
      </div>
    </FieldLabel>
  );
}
