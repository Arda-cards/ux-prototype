import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { AtomMode, AtomProps } from '@/lib/data-types/atom-types';
import { ArdaDateTimeCellDisplay } from './date-time-cell-display';
import {
  toDateTimeInputValue,
  getBrowserTimezone,
  getTimezoneAbbreviation,
} from '@/lib/data-types/formatters';

export interface DateTimeCellStaticConfig {
  timezone?: string;
}

export interface ArdaDateTimeCellInteractiveProps
  extends AtomProps<string>, DateTimeCellStaticConfig {}

export function ArdaDateTimeCellInteractive({
  value,
  onChange,
  onComplete,
  onCancel,
  mode,
  errors,
  editable,
  timezone,
}: ArdaDateTimeCellInteractiveProps) {
  const effectiveMode: AtomMode = editable === false ? 'display' : mode;

  if (effectiveMode === 'display') {
    const displayProps: { value: string } & { timezone?: string } = { value };
    if (timezone !== undefined) displayProps.timezone = timezone;
    return <ArdaDateTimeCellDisplay {...displayProps} />;
  }

  return (
    <DateTimeCellInlineEditor
      value={value}
      onChange={onChange}
      onComplete={onComplete}
      onCancel={onCancel}
      timezone={timezone}
      showErrors={effectiveMode === 'error'}
      errors={errors}
      autoFocus
    />
  );
}

// Internal inline editor
function DateTimeCellInlineEditor({
  value,
  onChange,
  onComplete,
  onCancel,
  autoFocus,
  timezone,
  showErrors,
  errors,
}: {
  value?: string;
  onChange?: ((original: string, current: string) => void) | undefined;
  onComplete?: ((value: string) => void) | undefined;
  onCancel?: (() => void) | undefined;
  autoFocus?: boolean;
  timezone?: string | undefined;
  showErrors?: boolean;
  errors?: string[] | undefined;
}) {
  const originalValue = useRef(value ?? '');
  const [localValue, setLocalValue] = useState(toDateTimeInputValue(value));
  const inputRef = useRef<HTMLInputElement>(null);
  const tz = timezone ?? getBrowserTimezone();
  const tzLabel = tz.split('/').pop()?.replace(/_/g, ' ');
  const tzAbbr = getTimezoneAbbreviation(tz);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
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
      <div className="flex items-center gap-1 w-full h-full">
        <input
          ref={inputRef}
          type="datetime-local"
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className={cn(
            'flex-1 h-full px-2 py-1 text-sm border-0 outline-none',
            'focus:ring-2 focus:ring-ring',
            'bg-white',
            hasErrors && 'ring-2 ring-red-500',
          )}
        />
        <span className="text-xs text-muted-foreground whitespace-nowrap px-1">
          {tzAbbr || tzLabel}
        </span>
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
