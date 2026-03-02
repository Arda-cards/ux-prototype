import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { AtomMode, AtomProps } from '@/lib/data-types/atom-types';
import { ArdaNumberCellDisplay } from './number-cell-display';

export interface NumberCellStaticConfig {
  precision?: number;
  min?: number;
  max?: number;
}

export interface ArdaNumberCellInteractiveProps extends AtomProps<number>, NumberCellStaticConfig {}

export function ArdaNumberCellInteractive({
  value,
  onChange,
  onComplete,
  onCancel,
  mode,
  errors,
  editable,
  precision = 0,
  min,
  max,
}: ArdaNumberCellInteractiveProps) {
  const effectiveMode: AtomMode = editable === false ? 'display' : mode;

  if (effectiveMode === 'display') {
    return <ArdaNumberCellDisplay value={value} precision={precision} />;
  }

  return (
    <NumberCellInlineEditor
      value={value}
      onChange={onChange}
      onComplete={onComplete}
      onCancel={onCancel}
      precision={precision}
      min={min}
      max={max}
      showErrors={effectiveMode === 'error'}
      errors={errors}
      autoFocus
    />
  );
}

// Internal inline editor
function NumberCellInlineEditor({
  value,
  onChange,
  onComplete,
  onCancel,
  autoFocus,
  precision,
  min,
  max,
  showErrors,
  errors,
}: {
  value?: number;
  onChange?: ((original: number, current: number) => void) | undefined;
  onComplete?: ((value: number) => void) | undefined;
  onCancel?: (() => void) | undefined;
  autoFocus?: boolean;
  precision?: number;
  min?: number | undefined;
  max?: number | undefined;
  showErrors?: boolean;
  errors?: string[] | undefined;
}) {
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

  const handleBlur = () => {
    const parsed = parseFloat(localValue);
    onComplete?.(isNaN(parsed) ? 0 : parsed);
  };

  const step = precision && precision > 0 ? Math.pow(10, -precision).toFixed(precision) : '1';
  const hasErrors = showErrors && errors && errors.length > 0;

  return (
    <div>
      <input
        ref={inputRef}
        type="number"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        step={step}
        min={min}
        max={max}
        className={cn(
          'w-full h-full px-2 py-1 text-sm border-0 outline-none',
          'focus:ring-2 focus:ring-ring',
          'bg-white',
          hasErrors && 'ring-2 ring-red-500',
        )}
      />
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
