import { useState, useEffect, useRef, useCallback, type ComponentType } from 'react';

/**
 * Props that a Display component must accept to be used with createInteractive.
 */
export interface InteractiveDisplayProps<V> {
  value?: V;
}

/**
 * Props that an Editor component must accept to be used with createInteractive.
 */
export interface InteractiveEditorProps<V> {
  value?: V;
  onChange?: (value: V) => void;
  onComplete?: (value: V) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}

/**
 * Configuration for createInteractive.
 */
export interface CreateInteractiveConfig<V> {
  /** The read-only display component. */
  DisplayComponent: ComponentType<InteractiveDisplayProps<V>>;
  /** The editing component. */
  EditorComponent: ComponentType<InteractiveEditorProps<V>>;
  /** Display name for the resulting component. */
  displayName?: string;
}

/**
 * Props for the resulting Interactive component.
 */
export interface InteractiveProps<V> {
  /** Current value. */
  value?: V;
  /** Called when value changes via editing. */
  onValueChange?: (value: V) => void;
  /** Whether editing is disabled. */
  disabled?: boolean;
  /** Additional CSS class for the wrapper. */
  className?: string;
}

/**
 * Generic HOC that composes a Display component and an Editor component
 * into an Interactive component.
 *
 * Behavior:
 * - Renders in display mode by default
 * - Switches to edit mode on double-click
 * - Switches back to display mode with the latest value on blur or Enter
 * - Cancels editing (restores original value) on Escape
 */
export function createInteractive<V>({
  DisplayComponent,
  EditorComponent,
  displayName,
}: CreateInteractiveConfig<V>) {
  function Interactive({ value, onValueChange, disabled = false, className }: InteractiveProps<V>) {
    const [isEditing, setIsEditing] = useState(false);
    const [localValue, setLocalValue] = useState<V | undefined>(value);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    const handleDoubleClick = useCallback(() => {
      if (!disabled) {
        setIsEditing(true);
      }
    }, [disabled]);

    const handleComplete = useCallback(
      (newValue: V) => {
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

    const handleChange = useCallback((newValue: V) => {
      setLocalValue(newValue);
    }, []);

    if (isEditing) {
      return (
        <div ref={wrapperRef} className={className}>
          <EditorComponent
            value={localValue}
            onChange={handleChange}
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
        <DisplayComponent value={localValue} />
      </div>
    );
  }

  Interactive.displayName = displayName ?? 'Interactive';

  return Interactive;
}
