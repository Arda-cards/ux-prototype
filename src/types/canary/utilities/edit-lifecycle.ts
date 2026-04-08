/** A single validation error on a specific field. */
export interface FieldError {
  /** Dot-path to the field (e.g., "street1", "supplier.address.postalCode"). */
  field: string;
  /** Human-readable error message. */
  message: string;
  /** Machine-readable code for testing and i18n. */
  code?: string;
  /** Severity — 'error' blocks confirm; 'warning' allows but shows message. */
  severity?: 'error' | 'warning';
}

/** Result of validating a value. */
export interface ValidationResult {
  /** True if no errors (warnings are allowed). */
  valid: boolean;
  /** List of field-level errors and warnings. */
  errors: FieldError[];
}

/** A function that validates a value and returns a result. */
export type Validator<T> = (value: T) => ValidationResult;

/** The phase of an edit session. */
export type EditPhase = 'idle' | 'editing' | 'confirming' | 'error';

/** Callbacks for the edit lifecycle. */
export interface EditLifecycleCallbacks<T> {
  /** Called on every draft change with current validation result. */
  onChange?: (value: T, validation: ValidationResult) => void;
  /** Called when the user confirms and intrinsic validation passes. */
  onConfirm?: (value: T) => void;
  /** Called when the user cancels the edit. */
  onCancel?: () => void;
}

/** Standard props for any editable component. */
export interface EditableComponentProps<T> extends EditLifecycleCallbacks<T> {
  /** Initial value — from parent's draft or from a data provider. */
  initialValue: T;
  /** Contextual errors injected by the parent after its own validation. */
  contextErrors?: FieldError[];
  /** Component is disabled (parent is saving, or a sibling edit is active). */
  disabled?: boolean;
}
