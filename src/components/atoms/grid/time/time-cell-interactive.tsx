import {
  createInteractive,
  type InteractiveEditorProps,
} from '@/lib/data-types/create-interactive';
import { ArdaTimeCellDisplay } from './time-cell-display';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * Inline time editor adapted for the createInteractive pattern.
 * Unlike the AG Grid cell editor, this uses onChange/onComplete/onCancel callbacks.
 */
function TimeCellInlineEditor({
  value,
  onChange,
  onComplete,
  onCancel,
  autoFocus,
}: InteractiveEditorProps<string>) {
  const [localValue, setLocalValue] = useState(value ?? '');
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

  return (
    <input
      ref={inputRef}
      type="time"
      value={localValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className={cn(
        'w-full h-full px-2 py-1 text-sm border-0 outline-none',
        'focus:ring-2 focus:ring-ring',
        'bg-white',
      )}
    />
  );
}

/**
 * Factory to create timezone-aware interactive time component.
 *
 * @example
 * ```ts
 * const TimeCellNY = createTimeCellInteractive({ timezone: 'America/New_York' });
 * ```
 */
export function createTimeCellInteractive(config: { timezone?: string } = {}) {
  const WrappedDisplay = ({ value }: { value?: string }) => {
    const displayProps: { value?: string; timezone?: string } = {};
    if (value !== undefined) {
      displayProps.value = value;
    }
    if (config.timezone !== undefined) {
      displayProps.timezone = config.timezone;
    }
    return <ArdaTimeCellDisplay {...displayProps} />;
  };

  return createInteractive<string>({
    DisplayComponent: WrappedDisplay,
    EditorComponent: TimeCellInlineEditor,
    displayName: 'ArdaTimeCellInteractive',
  });
}

/**
 * Interactive time cell: displays time by default, switches to inline editor
 * on double-click, commits on blur/Enter, cancels on Escape.
 */
export const ArdaTimeCellInteractive = createTimeCellInteractive();
