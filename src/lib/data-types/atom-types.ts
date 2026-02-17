/**
 * Shared type definitions for the atom component system.
 *
 * All atoms (form and grid) implement the AtomProps<V> interface to enable
 * uniform composition by the entity viewer and other parent components.
 */

/** The three rendering modes for an atom. */
export type AtomMode = 'display' | 'edit' | 'error';

/** Label position relative to the field (form atoms only). */
export type LabelPosition = 'left' | 'top';

/**
 * Base props interface that all atoms must accept.
 *
 * - `display` mode: read-only presentation, no inputs, no error styling.
 * - `edit` mode: editable inputs, ignores `errors` array.
 * - `error` mode: editable inputs with error styling and error messages.
 *
 * When `editable` is `false`, the atom renders in display mode regardless
 * of the `mode` prop.
 */
export interface AtomProps<V> {
  /** Current field value. */
  value: V;
  /**
   * Called when the value changes.
   * Receives both the original (unmodified) value and the current (modified) value
   * to enable change tracking, dirty detection, and rollback.
   */
  onChange: (original: V, current: V) => void;
  /** Rendering mode. */
  mode: AtomMode;
  /** Validation error messages (shown only in `error` mode). */
  errors?: string[];
  /** Field label text. */
  label?: string;
  /** Label position (form atoms only, default: 'left'). */
  labelPosition?: LabelPosition;
  /**
   * Per-field editability override.
   * When `false`, the atom renders in display mode regardless of `mode`.
   * When `true` or omitted, the atom respects the `mode` prop.
   */
  editable?: boolean;
  /** Called when editing completes (blur or Enter). */
  onComplete?: (value: V) => void;
  /** Called when editing is cancelled (Escape). */
  onCancel?: () => void;
}
