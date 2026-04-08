import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDraft } from './use-draft';
import type { FieldError, Validator } from './edit-lifecycle';

// ── Test fixtures ───────────────────────────────────────────────────────────

interface TestAddress {
  street: string;
  city: string;
  postalCode: string;
}

const VALID_ADDRESS: TestAddress = { street: '123 Main', city: 'Springfield', postalCode: '62701' };
const EMPTY_ADDRESS: TestAddress = { street: '', city: '', postalCode: '' };

const validateAddress: Validator<TestAddress> = (addr) => {
  const errors: FieldError[] = [];
  if (!addr.street) errors.push({ field: 'street', message: 'Required' });
  if (!addr.city) errors.push({ field: 'city', message: 'Required' });
  if (addr.postalCode && !/^\d{5}$/.test(addr.postalCode))
    errors.push({ field: 'postalCode', message: 'Invalid format' });
  return { valid: errors.length === 0, errors };
};

const alwaysValid: Validator<TestAddress> = () => ({ valid: true, errors: [] });

function renderDraft(overrides: Partial<Parameters<typeof useDraft<TestAddress>>[0]> = {}) {
  return renderHook(
    (props) =>
      useDraft<TestAddress>({
        initialValue: VALID_ADDRESS,
        validate: validateAddress,
        ...props,
      }),
    { initialProps: overrides },
  );
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('useDraft', () => {
  describe('initial state', () => {
    it('value matches initialValue', () => {
      const { result } = renderDraft();
      expect(result.current.value).toBe(VALID_ADDRESS);
    });

    it('phase is idle', () => {
      const { result } = renderDraft();
      expect(result.current.phase).toBe('idle');
    });

    it('dirty is false', () => {
      const { result } = renderDraft();
      expect(result.current.dirty).toBe(false);
    });

    it('intrinsicValidation reflects validation of initial value', () => {
      const { result } = renderDraft();
      expect(result.current.intrinsicValidation.valid).toBe(true);
      expect(result.current.intrinsicValidation.errors).toEqual([]);
    });

    it('isValid reflects validation of initial value', () => {
      const { result } = renderDraft();
      expect(result.current.isValid).toBe(true);
    });

    it('allErrors matches intrinsic errors when no contextErrors', () => {
      const { result } = renderDraft({ initialValue: EMPTY_ADDRESS });
      expect(result.current.allErrors).toEqual(result.current.intrinsicValidation.errors);
    });
  });

  describe('update()', () => {
    it('updates value and sets phase to editing', () => {
      const { result } = renderDraft();
      const newValue = { ...VALID_ADDRESS, city: 'Shelbyville' };
      act(() => result.current.update(newValue));
      expect(result.current.value).toEqual(newValue);
      expect(result.current.phase).toBe('editing');
      expect(result.current.dirty).toBe(true);
    });

    it('runs validation: invalid value produces errors', () => {
      const { result } = renderDraft();
      act(() => result.current.update(EMPTY_ADDRESS));
      expect(result.current.intrinsicValidation.valid).toBe(false);
      expect(result.current.intrinsicValidation.errors.length).toBeGreaterThan(0);
    });

    it('calls onChange with new value and validation result', () => {
      const onChange = vi.fn();
      const { result } = renderDraft({ onChange });
      const newValue = { ...VALID_ADDRESS, city: 'Shelbyville' };
      act(() => result.current.update(newValue));
      expect(onChange).toHaveBeenCalledWith(newValue, expect.objectContaining({ valid: true }));
    });
  });

  describe('update() with function updater', () => {
    it('applies the updater function to previous value', () => {
      const { result } = renderDraft();
      act(() => result.current.update((prev) => ({ ...prev, city: 'New York' })));
      expect(result.current.value.city).toBe('New York');
      expect(result.current.value.street).toBe(VALID_ADDRESS.street);
    });
  });

  describe('updateField()', () => {
    it('updates a single field by dot-path', () => {
      const { result } = renderDraft();
      act(() => result.current.updateField('city', 'Springfield'));
      expect(result.current.value.city).toBe('Springfield');
    });

    it('runs validation after field update', () => {
      const { result } = renderDraft();
      act(() => result.current.updateField('street', ''));
      expect(result.current.intrinsicValidation.valid).toBe(false);
    });

    it('preserves sibling fields', () => {
      const { result } = renderDraft();
      act(() => result.current.updateField('city', 'Shelbyville'));
      expect(result.current.value.street).toBe(VALID_ADDRESS.street);
      expect(result.current.value.postalCode).toBe(VALID_ADDRESS.postalCode);
    });
  });

  describe('confirm() — valid', () => {
    it('calls onConfirm with current value when valid', () => {
      const onConfirm = vi.fn();
      const { result } = renderDraft({ onConfirm });
      act(() => result.current.update({ ...VALID_ADDRESS, city: 'Shelbyville' }));
      act(() => result.current.confirm());
      expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ city: 'Shelbyville' }));
    });

    it('sets phase to confirming', () => {
      const { result } = renderDraft();
      act(() => result.current.update({ ...VALID_ADDRESS, city: 'Shelbyville' }));
      act(() => result.current.confirm());
      expect(result.current.phase).toBe('confirming');
    });
  });

  describe('confirm() — invalid', () => {
    it('does not call onConfirm when draft is invalid', () => {
      const onConfirm = vi.fn();
      const { result } = renderDraft({ onConfirm });
      act(() => result.current.update(EMPTY_ADDRESS));
      act(() => result.current.confirm());
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('sets phase to error', () => {
      const { result } = renderDraft();
      act(() => result.current.update(EMPTY_ADDRESS));
      act(() => result.current.confirm());
      expect(result.current.phase).toBe('error');
    });
  });

  describe('cancel()', () => {
    it('resets value to initialValue', () => {
      const { result } = renderDraft();
      act(() => result.current.update(EMPTY_ADDRESS));
      act(() => result.current.cancel());
      expect(result.current.value).toBe(VALID_ADDRESS);
    });

    it('sets phase to idle and dirty to false', () => {
      const { result } = renderDraft();
      act(() => result.current.update(EMPTY_ADDRESS));
      act(() => result.current.cancel());
      expect(result.current.phase).toBe('idle');
      expect(result.current.dirty).toBe(false);
    });

    it('calls onCancel callback', () => {
      const onCancel = vi.fn();
      const { result } = renderDraft({ onCancel });
      act(() => result.current.update(EMPTY_ADDRESS));
      act(() => result.current.cancel());
      expect(onCancel).toHaveBeenCalledOnce();
    });
  });

  describe('reset()', () => {
    it('resets value to initialValue', () => {
      const { result } = renderDraft();
      act(() => result.current.update(EMPTY_ADDRESS));
      act(() => result.current.reset());
      expect(result.current.value).toBe(VALID_ADDRESS);
    });

    it('sets phase to idle', () => {
      const { result } = renderDraft();
      act(() => result.current.update(EMPTY_ADDRESS));
      act(() => result.current.reset());
      expect(result.current.phase).toBe('idle');
    });

    it('does NOT call onCancel', () => {
      const onCancel = vi.fn();
      const { result } = renderDraft({ onCancel });
      act(() => result.current.update(EMPTY_ADDRESS));
      act(() => result.current.reset());
      expect(onCancel).not.toHaveBeenCalled();
    });
  });

  describe('initialValue change', () => {
    it('resets draft when initialValue reference changes', () => {
      const { result, rerender } = renderDraft();
      act(() => result.current.update(EMPTY_ADDRESS));
      expect(result.current.phase).toBe('editing');

      const newInitial = { ...VALID_ADDRESS, city: 'Capital City' };
      rerender({ initialValue: newInitial, validate: validateAddress });

      expect(result.current.value).toEqual(newInitial);
      expect(result.current.phase).toBe('idle');
      expect(result.current.dirty).toBe(false);
    });
  });

  describe('isEqual option', () => {
    it('prevents reset when structurally equal value has new reference', () => {
      const isEqual = (a: TestAddress, b: TestAddress) =>
        a.street === b.street && a.city === b.city && a.postalCode === b.postalCode;

      const { result, rerender } = renderDraft({ isEqual });
      act(() => result.current.update({ ...VALID_ADDRESS, city: 'Shelbyville' }));
      expect(result.current.phase).toBe('editing');

      // Re-render with structurally identical but new reference
      const newRef = { ...VALID_ADDRESS };
      rerender({ initialValue: newRef, validate: validateAddress, isEqual });

      // Draft should NOT reset — isEqual returns true
      expect(result.current.value.city).toBe('Shelbyville');
      expect(result.current.phase).toBe('editing');
    });

    it('without isEqual, new reference triggers reset even if structurally equal', () => {
      const { result, rerender } = renderDraft();
      act(() => result.current.update({ ...VALID_ADDRESS, city: 'Shelbyville' }));

      // New reference, identical content — but no isEqual provided
      const newRef = { ...VALID_ADDRESS };
      rerender({ initialValue: newRef, validate: validateAddress });

      // Draft resets because Object.is(original, newRef) is false
      expect(result.current.value).toEqual(VALID_ADDRESS);
      expect(result.current.phase).toBe('idle');
    });
  });

  describe('contextErrors merge', () => {
    const parentError: FieldError = { field: 'city', message: 'Duplicate city' };

    it('adds contextErrors to allErrors', () => {
      const { result } = renderDraft({ contextErrors: [parentError] });
      expect(result.current.allErrors).toContainEqual(parentError);
    });

    it('isValid is false when contextErrors contain error-severity errors', () => {
      const { result } = renderDraft({
        validate: alwaysValid,
        contextErrors: [{ field: 'city', message: 'Bad', severity: 'error' }],
      });
      expect(result.current.isValid).toBe(false);
    });

    it('isValid is true when contextErrors contain only warnings', () => {
      const { result } = renderDraft({
        validate: alwaysValid,
        contextErrors: [{ field: 'city', message: 'Consider changing', severity: 'warning' }],
      });
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('errorsFor() filtering', () => {
    const errors: FieldError[] = [
      { field: 'address', message: 'Address incomplete' },
      { field: 'address.city', message: 'City required' },
      { field: 'address.postalCode', message: 'Invalid zip' },
      { field: 'addressLine2', message: 'Too long' },
    ];

    it('matches exact field and dot-path children', () => {
      const { result } = renderDraft({
        validate: () => ({ valid: false, errors }),
      });
      const addressErrors = result.current.errorsFor('address');
      expect(addressErrors).toHaveLength(3);
      expect(addressErrors.map((e) => e.field)).toEqual([
        'address',
        'address.city',
        'address.postalCode',
      ]);
    });

    it('does not match similar-prefix fields', () => {
      const { result } = renderDraft({
        validate: () => ({ valid: false, errors }),
      });
      const addressErrors = result.current.errorsFor('address');
      expect(addressErrors.map((e) => e.field)).not.toContain('addressLine2');
    });

    it('returns empty array when no errors match', () => {
      const { result } = renderDraft();
      expect(result.current.errorsFor('nonexistent')).toEqual([]);
    });
  });

  describe('warning severity', () => {
    const warningValidator: Validator<TestAddress> = () => ({
      valid: true,
      errors: [{ field: 'postalCode', message: 'Unusual format', severity: 'warning' }],
    });

    it('warning appears in allErrors', () => {
      const { result } = renderDraft({ validate: warningValidator });
      expect(result.current.allErrors).toHaveLength(1);
      expect(result.current.allErrors[0]?.severity).toBe('warning');
    });

    it('warning does not block confirm (isValid remains true)', () => {
      const onConfirm = vi.fn();
      const { result } = renderDraft({ validate: warningValidator, onConfirm });
      act(() => result.current.update({ ...VALID_ADDRESS, city: 'New' }));
      act(() => result.current.confirm());
      expect(result.current.isValid).toBe(true);
      expect(onConfirm).toHaveBeenCalled();
      expect(result.current.phase).toBe('confirming');
    });

    it('error severity (default) blocks confirm', () => {
      const onConfirm = vi.fn();
      const { result } = renderDraft({ onConfirm, initialValue: EMPTY_ADDRESS });
      act(() => result.current.confirm());
      expect(onConfirm).not.toHaveBeenCalled();
      expect(result.current.phase).toBe('error');
    });
  });
});
