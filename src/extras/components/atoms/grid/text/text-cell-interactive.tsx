import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { AtomMode, AtomProps } from '@/lib/data-types/atom-types';
import { ArdaTextCellDisplay } from './text-cell-display';

export interface TextCellStaticConfig {
  placeholder?: string;
  maxLength?: number;
}

export interface ArdaTextCellInteractiveProps extends AtomProps<string>, TextCellStaticConfig {}

export function ArdaTextCellInteractive({
  value,
  onChange,
  onComplete,
  onCancel,
  mode,
  errors,
  editable,
  placeholder,
  maxLength,
}: ArdaTextCellInteractiveProps) {
  const effectiveMode: AtomMode = editable === false ? 'display' : mode;

  if (effectiveMode === 'display') {
    return <ArdaTextCellDisplay value={value} />;
  }

  return (
    <TextCellInlineEditor
      value={value}
      onChange={onChange}
      onComplete={onComplete}
      onCancel={onCancel}
      placeholder={placeholder}
      maxLength={maxLength}
      showErrors={effectiveMode === 'error'}
      errors={errors}
      autoFocus
    />
  );
}

// Internal inline editor
function TextCellInlineEditor({
  value,
  onChange,
  onComplete,
  onCancel,
  autoFocus,
  placeholder,
  maxLength,
  showErrors,
  errors,
}: {
  value?: string;
  onChange?: ((original: string, current: string) => void) | undefined;
  onComplete?: ((value: string) => void) | undefined;
  onCancel?: (() => void) | undefined;
  autoFocus?: boolean;
  placeholder?: string | undefined;
  maxLength?: number | undefined;
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
        type="text"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        maxLength={maxLength}
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
