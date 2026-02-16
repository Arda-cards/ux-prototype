import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArdaDateTimeFieldDisplay,
  type ArdaDateTimeFieldDisplayProps,
} from './date-time-field-display';
import {
  ArdaDateTimeFieldEditor,
  type ArdaDateTimeFieldEditorProps,
} from './date-time-field-editor';

export interface ArdaDateTimeFieldInteractiveProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  /** IANA timezone for display formatting (design-time config). */
  timezone?: string;
}

/**
 * Interactive datetime form field: displays datetime in read-only mode by default,
 * switches to an editable input on double-click, and commits on blur/Enter.
 */
export function ArdaDateTimeFieldInteractive({
  value,
  onValueChange,
  disabled = false,
  className,
  timezone,
}: ArdaDateTimeFieldInteractiveProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleDoubleClick = useCallback(() => {
    if (!disabled) setIsEditing(true);
  }, [disabled]);

  const handleComplete = useCallback(
    (newValue: string) => {
      setLocalValue(newValue);
      setIsEditing(false);
      onValueChange?.(newValue);
    },
    [onValueChange],
  );

  const handleCancel = useCallback(() => {
    setLocalValue(value);
    setIsEditing(false);
  }, [value]);

  // Build props conditionally for exactOptionalPropertyTypes compliance
  const optionalProps: Pick<ArdaDateTimeFieldEditorProps, 'value' | 'timezone'> &
    Pick<ArdaDateTimeFieldDisplayProps, 'value' | 'timezone'> = {};
  if (localValue !== undefined) optionalProps.value = localValue;
  if (timezone !== undefined) optionalProps.timezone = timezone;

  if (isEditing) {
    return (
      <div ref={wrapperRef} className={className}>
        <ArdaDateTimeFieldEditor
          {...optionalProps}
          onChange={setLocalValue}
          onComplete={handleComplete}
          onCancel={handleCancel}
          autoFocus
        />
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      onDoubleClick={handleDoubleClick}
      className={className}
      style={{ cursor: disabled ? 'default' : 'pointer' }}
    >
      <ArdaDateTimeFieldDisplay {...optionalProps} />
    </div>
  );
}
