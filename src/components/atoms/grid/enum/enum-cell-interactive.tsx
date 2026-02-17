import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { AtomMode, AtomProps } from '@/lib/data-types/atom-types';
import { ArdaEnumCellDisplay } from './enum-cell-display';

export interface EnumCellStaticConfig<V extends string> {
  /** Mapping from enum value to human-readable display label. */
  options: Readonly<Record<V, string>>;
}

export interface ArdaEnumCellInteractiveProps<V extends string>
  extends AtomProps<V>, EnumCellStaticConfig<V> {}

export function ArdaEnumCellInteractive<V extends string>({
  value,
  onChange,
  onComplete,
  onCancel,
  mode,
  errors,
  editable,
  options,
}: ArdaEnumCellInteractiveProps<V>) {
  if (Object.keys(options).length > 100) {
    console.warn(
      'EnumCellInteractive: options has >100 entries. Consider using a typeahead instead.',
    );
  }

  const effectiveMode: AtomMode = editable === false ? 'display' : mode;

  if (effectiveMode === 'display') {
    return <ArdaEnumCellDisplay value={value} options={options} />;
  }

  return (
    <EnumCellInlineEditor
      value={value}
      onChange={onChange}
      onComplete={onComplete}
      onCancel={onCancel}
      options={options}
      showErrors={effectiveMode === 'error'}
      errors={errors}
      autoFocus
    />
  );
}

// Internal inline editor
function EnumCellInlineEditor<V extends string>({
  value,
  onChange,
  onComplete,
  onCancel,
  autoFocus,
  options,
  showErrors,
  errors,
}: {
  value?: V;
  onChange?: ((original: V, current: V) => void) | undefined;
  onComplete?: ((value: V) => void) | undefined;
  onCancel?: (() => void) | undefined;
  autoFocus?: boolean;
  options: Readonly<Record<V, string>>;
  showErrors?: boolean;
  errors?: string[] | undefined;
}) {
  const originalValue = useRef(value as V);
  const [localValue, setLocalValue] = useState(value as V);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (autoFocus) {
      selectRef.current?.focus();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value as V;
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
      <select
        ref={selectRef}
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={cn(
          'w-full h-full px-2 py-1 text-sm border-0 outline-none',
          'focus:ring-2 focus:ring-ring',
          'bg-white',
          hasErrors && 'ring-2 ring-red-500',
        )}
      >
        {(Object.keys(options) as V[]).map((key) => (
          <option key={key} value={key}>
            {options[key]}
          </option>
        ))}
      </select>
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
