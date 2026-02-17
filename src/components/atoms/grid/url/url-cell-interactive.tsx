import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { AtomMode, AtomProps } from '@/lib/data-types/atom-types';
import { ArdaUrlCellDisplay } from './url-cell-display';

export interface ArdaUrlCellInteractiveProps extends AtomProps<string> {}

export function ArdaUrlCellInteractive({
  value,
  onChange,
  onComplete,
  onCancel,
  mode,
  errors,
  editable,
}: ArdaUrlCellInteractiveProps) {
  const effectiveMode: AtomMode = editable === false ? 'display' : mode;

  if (effectiveMode === 'display') {
    return <ArdaUrlCellDisplay value={value} />;
  }

  return (
    <UrlCellInlineEditor
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
function UrlCellInlineEditor({
  value,
  onChange,
  onComplete,
  onCancel,
  autoFocus,
  showErrors,
  errors,
}: {
  value?: string;
  onChange?: ((original: string, current: string) => void) | undefined;
  onComplete?: ((value: string) => void) | undefined;
  onCancel?: (() => void) | undefined;
  autoFocus?: boolean;
  showErrors?: boolean;
  errors?: string[] | undefined;
}) {
  const originalValue = useRef(value ?? '');
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
      <input
        ref={inputRef}
        type="url"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Enter URL…"
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
