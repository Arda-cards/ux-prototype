import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

/** Design-time configuration for boolean cell editor. */
export interface BooleanCellEditorStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Editor format: checkbox or yes-no toggle buttons. */
  displayFormat?: 'checkbox' | 'yes-no';
}

/** Props for ArdaBooleanCellEditor. */
export interface ArdaBooleanCellEditorProps extends BooleanCellEditorStaticConfig {
  /* --- Model / Data Binding --- */
  /** Initial value from AG Grid. */
  value?: boolean;
  /** AG Grid stopEditing callback. */
  stopEditing?: (cancel?: boolean) => void;
}

/** Ref handle exposing getValue for AG Grid. */
export interface BooleanCellEditorHandle {
  getValue: () => boolean | undefined;
}

/**
 * AG Grid cell editor for boolean values.
 *
 * Usage in column definitions:
 * ```ts
 * { field: 'active', cellEditor: createBooleanCellEditor({ displayFormat: 'checkbox' }) }
 * ```
 */
export const ArdaBooleanCellEditor = forwardRef<
  BooleanCellEditorHandle,
  ArdaBooleanCellEditorProps
>(({ value: initialValue, stopEditing, displayFormat = 'checkbox' }, ref) => {
  const [currentValue, setCurrentValue] = useState(initialValue ?? false);
  const checkboxRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    getValue: () => currentValue,
  }));

  useEffect(() => {
    checkboxRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      stopEditing?.(false);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      stopEditing?.(true);
    }
  };

  if (displayFormat === 'checkbox') {
    return (
      <div className="flex items-center justify-center h-full">
        <input
          ref={checkboxRef}
          type="checkbox"
          checked={currentValue}
          onChange={(e) => {
            setCurrentValue(e.target.checked);
            // Auto-commit on change for checkbox
            setTimeout(() => stopEditing?.(false), 0);
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            'h-4 w-4 rounded border-border text-primary',
            'focus:ring-2 focus:ring-ring focus:ring-offset-0',
          )}
        />
      </div>
    );
  }

  // yes-no format: toggle buttons
  return (
    <div className="flex gap-1 h-full items-center px-2">
      <button
        type="button"
        onClick={() => {
          setCurrentValue(true);
          setTimeout(() => stopEditing?.(false), 0);
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          'px-3 py-1 text-xs font-medium rounded',
          'border border-border',
          currentValue
            ? 'bg-primary text-primary-foreground'
            : 'bg-white text-foreground hover:bg-muted',
        )}
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => {
          setCurrentValue(false);
          setTimeout(() => stopEditing?.(false), 0);
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          'px-3 py-1 text-xs font-medium rounded',
          'border border-border',
          !currentValue
            ? 'bg-primary text-primary-foreground'
            : 'bg-white text-foreground hover:bg-muted',
        )}
      >
        No
      </button>
    </div>
  );
});

ArdaBooleanCellEditor.displayName = 'ArdaBooleanCellEditor';

/**
 * Factory helper for creating a boolean cell editor with static config.
 *
 * @example
 * ```ts
 * const colDef = { field: 'active', cellEditor: createBooleanCellEditor({ displayFormat: 'yes-no' }) };
 * ```
 */
export function createBooleanCellEditor(config: BooleanCellEditorStaticConfig = {}) {
  return (props: Omit<ArdaBooleanCellEditorProps, keyof BooleanCellEditorStaticConfig>) => (
    <ArdaBooleanCellEditor {...config} {...props} />
  );
}
