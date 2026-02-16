import { useState, useEffect, useCallback, useRef } from 'react';
import type { FieldLabelProps } from '../field-label';
import { ArdaDateFieldDisplay, type ArdaDateFieldDisplayProps } from './date-field-display';
import { ArdaDateFieldEditor, type ArdaDateFieldEditorProps } from './date-field-editor';

export interface ArdaDateFieldInteractiveProps extends FieldLabelProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  /** IANA timezone for display formatting. Defaults to browser timezone. */
  timezone?: string;
}

/**
 * Interactive date form field: displays date in read-only mode by default,
 * switches to an editable input on double-click, and commits on blur/Enter.
 */
export function ArdaDateFieldInteractive({
  value,
  onValueChange,
  disabled = false,
  className,
  timezone,
  label,
  labelPosition,
}: ArdaDateFieldInteractiveProps) {
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
  const optionalProps: Pick<
    ArdaDateFieldEditorProps,
    'value' | 'timezone' | 'label' | 'labelPosition'
  > &
    Pick<ArdaDateFieldDisplayProps, 'value' | 'timezone' | 'label' | 'labelPosition'> = {};
  if (localValue !== undefined) optionalProps.value = localValue;
  if (timezone !== undefined) optionalProps.timezone = timezone;
  if (label !== undefined) optionalProps.label = label;
  if (labelPosition !== undefined) optionalProps.labelPosition = labelPosition;

  if (isEditing) {
    return (
      <div ref={wrapperRef} className={className}>
        <ArdaDateFieldEditor
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
      <ArdaDateFieldDisplay {...optionalProps} />
    </div>
  );
}
