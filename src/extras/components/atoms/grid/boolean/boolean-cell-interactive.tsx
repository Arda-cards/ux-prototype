import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { AtomMode, AtomProps } from '@/lib/data-types/atom-types';
import { ArdaBooleanCellDisplay } from './boolean-cell-display';

export interface BooleanCellStaticConfig {
  displayFormat?: 'checkbox' | 'yes-no';
}

export interface ArdaBooleanCellInteractiveProps
  extends AtomProps<boolean>, BooleanCellStaticConfig {}

export function ArdaBooleanCellInteractive({
  value,
  onChange,
  onComplete,
  onCancel,
  mode,
  errors,
  editable,
  displayFormat = 'checkbox',
}: ArdaBooleanCellInteractiveProps) {
  const effectiveMode: AtomMode = editable === false ? 'display' : mode;

  if (effectiveMode === 'display') {
    return <ArdaBooleanCellDisplay value={value} displayFormat={displayFormat} />;
  }

  return (
    <BooleanCellInlineEditor
      value={value}
      onChange={onChange}
      onComplete={onComplete}
      onCancel={onCancel}
      showErrors={effectiveMode === 'error'}
      errors={errors}
      autoFocus
    />
  );
}

// Internal inline editor
function BooleanCellInlineEditor({
  value,
  onChange,
  onComplete,
  onCancel,
  autoFocus,
  showErrors,
  errors,
}: {
  value?: boolean;
  onChange?: ((original: boolean, current: boolean) => void) | undefined;
  onComplete?: ((value: boolean) => void) | undefined;
  onCancel?: (() => void) | undefined;
  autoFocus?: boolean;
  showErrors?: boolean;
  errors?: string[] | undefined;
}) {
  const originalValue = useRef(value ?? false);
  const [localValue, setLocalValue] = useState(value ?? false);
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      checkboxRef.current?.focus();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setLocalValue(newValue);
    onChange?.(originalValue.current, newValue);
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

  const handleBlur = () => {
    onComplete?.(localValue);
  };

  const hasErrors = showErrors && errors && errors.length > 0;

  return (
    <div>
      <div className="flex items-center h-full">
        <input
          ref={checkboxRef}
          type="checkbox"
          checked={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className={cn(
            'h-4 w-4 rounded border-border text-primary',
            'focus:ring-2 focus:ring-ring focus:ring-offset-0',
            hasErrors && 'ring-2 ring-red-500',
          )}
        />
      </div>
      {hasErrors && (
        <div className="px-2 py-0.5">
          {errors.map((error, i) => (
            <p key={i} className="text-xs text-red-600">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
