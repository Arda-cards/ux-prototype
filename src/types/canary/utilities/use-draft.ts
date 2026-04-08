import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { FieldError, ValidationResult, Validator, EditPhase } from './edit-lifecycle';
import { setNestedField } from './set-nested-field';

export interface UseDraftOptions<T> {
  /** Initial value — resets the draft when this value changes. */
  initialValue: T;
  /** Intrinsic validator — called on every draft change. */
  validate: Validator<T>;
  /** Contextual errors from parent — merged into the validation display. */
  contextErrors?: FieldError[];
  /** Lifecycle callbacks — forwarded from EditableComponentProps. */
  onChange?: (value: T, validation: ValidationResult) => void;
  onConfirm?: (value: T) => void;
  onCancel?: () => void;
  /**
   * Custom equality check for initialValue. When provided, draft resets
   * only when isEqual returns false. When omitted, uses reference equality
   * (Object.is) — callers must memoize initialValue to prevent unwanted resets.
   */
  isEqual?: (a: T, b: T) => boolean;
}

export interface DraftState<T> {
  /** Current draft value. */
  value: T;
  /** Intrinsic validation result of the current draft. */
  intrinsicValidation: ValidationResult;
  /** All errors: intrinsic + contextual, for display. */
  allErrors: FieldError[];
  /** Whether the draft differs from initialValue. */
  dirty: boolean;
  /** Whether the draft is valid (intrinsic + no contextual error-severity errors). */
  isValid: boolean;
  /** Current lifecycle phase. */
  phase: EditPhase;

  /** Update the draft. Runs validation and notifies parent via onChange. */
  update: (updater: T | ((prev: T) => T)) => void;
  /** Update a single field by dot-path. */
  updateField: (path: string, value: unknown) => void;
  /** Confirm the draft. Calls onConfirm if valid. */
  confirm: () => void;
  /** Cancel the edit. Resets draft to initialValue and calls onCancel. */
  cancel: () => void;
  /** Reset draft to initialValue without calling onCancel. */
  reset: () => void;
  /** Get errors for a specific field (for rendering inline errors). */
  errorsFor: (field: string) => FieldError[];
}

function hasBlockingErrors(errors: FieldError[]): boolean {
  return errors.some((e) => e.severity !== 'warning');
}

/**
 * Manages draft state, validation, and lifecycle for an editable component.
 *
 * Key behaviors:
 * - Resets draft when `initialValue` changes (uses `isEqual` or `Object.is`)
 * - Runs `validate()` on every `update()`/`updateField()` call
 * - Merges `contextErrors` into `allErrors`
 * - `confirm()` only succeeds if `isValid` is true
 * - `errorsFor(field)` filters by exact match or dot-path prefix
 */
export function useDraft<T>(options: UseDraftOptions<T>): DraftState<T> {
  const { initialValue, validate, contextErrors, onChange, onConfirm, onCancel, isEqual } = options;

  const [value, setValue] = useState<T>(initialValue);
  const [phase, setPhase] = useState<EditPhase>('idle');

  // Track initial value for reset detection
  const prevInitialRef = useRef(initialValue);

  // Reset when initialValue changes
  useEffect(() => {
    const prev = prevInitialRef.current;
    const equal = isEqual ? isEqual(prev, initialValue) : Object.is(prev, initialValue);
    if (!equal) {
      prevInitialRef.current = initialValue;
      setValue(initialValue);
      setPhase('idle');
    }
  }, [initialValue, isEqual]);

  const intrinsicValidation = useMemo(() => validate(value), [validate, value]);

  const contextErrorsList = contextErrors ?? [];

  const allErrors = useMemo(
    () => [...intrinsicValidation.errors, ...contextErrorsList],
    [intrinsicValidation.errors, contextErrorsList],
  );

  const isValid = intrinsicValidation.valid && !hasBlockingErrors(contextErrorsList);

  const dirty = !Object.is(value, initialValue);

  const update = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next = typeof updater === 'function' ? (updater as (prev: T) => T)(prev) : updater;
        const validation = validate(next);
        onChange?.(next, validation);
        return next;
      });
      setPhase('editing');
    },
    [validate, onChange],
  );

  const updateField = useCallback(
    (path: string, fieldValue: unknown) => {
      setValue((prev) => {
        const next = setNestedField(prev, path, fieldValue);
        const validation = validate(next);
        onChange?.(next, validation);
        return next;
      });
      setPhase('editing');
    },
    [validate, onChange],
  );

  const confirm = useCallback(() => {
    if (isValid) {
      onConfirm?.(value);
      setPhase('confirming');
    } else {
      setPhase('error');
    }
  }, [isValid, value, onConfirm]);

  const cancel = useCallback(() => {
    setValue(initialValue);
    setPhase('idle');
    onCancel?.();
  }, [initialValue, onCancel]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setPhase('idle');
  }, [initialValue]);

  const errorsFor = useCallback(
    (field: string): FieldError[] =>
      allErrors.filter((e) => e.field === field || e.field.startsWith(field + '.')),
    [allErrors],
  );

  return {
    value,
    intrinsicValidation,
    allErrors,
    dirty,
    isValid,
    phase,
    update,
    updateField,
    confirm,
    cancel,
    reset,
    errorsFor,
  };
}
