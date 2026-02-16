import { useState, useEffect, useCallback, useRef } from 'react';
import { ArdaTimeFieldDisplay, type ArdaTimeFieldDisplayProps } from './time-field-display';
import { ArdaTimeFieldEditor, type ArdaTimeFieldEditorProps } from './time-field-editor';

export interface ArdaTimeFieldInteractiveProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  /** IANA timezone for display formatting (design-time config). */
  timezone?: string;
}

/**
 * Interactive time form field: displays time in read-only mode by default,
 * switches to an editable input on double-click, and commits on blur/Enter.
 */
export function ArdaTimeFieldInteractive({
  value,
  onValueChange,
  disabled = false,
  className,
  timezone,
}: ArdaTimeFieldInteractiveProps) {
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
  const optionalProps: Pick<ArdaTimeFieldEditorProps, 'value' | 'timezone'> &
    Pick<ArdaTimeFieldDisplayProps, 'value' | 'timezone'> = {};
  if (localValue !== undefined) optionalProps.value = localValue;
  if (timezone !== undefined) optionalProps.timezone = timezone;

  if (isEditing) {
    return (
      <div ref={wrapperRef} className={className}>
        <ArdaTimeFieldEditor
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
      <ArdaTimeFieldDisplay {...optionalProps} />
    </div>
  );
}
