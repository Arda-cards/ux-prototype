import { renderHook, act } from '@testing-library/react';
import { useFormValidation } from './useFormValidation';

describe('useFormValidation', () => {
  const initialValues = { name: '', email: '' };

  it('initializes with provided initial values', () => {
    const { result } = renderHook(() => useFormValidation(initialValues));
    expect(result.current.values).toEqual({ name: '', email: '' });
  });

  it('initializes with empty errors', () => {
    const { result } = renderHook(() => useFormValidation(initialValues));
    expect(result.current.errors).toEqual({});
  });

  it('handleChange updates field value', () => {
    const { result } = renderHook(() => useFormValidation(initialValues));

    act(() => {
      result.current.handleChange('name')({
        target: { value: 'John' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.values.name).toBe('John');
  });

  it('handleChange clears field error', () => {
    const { result } = renderHook(() => useFormValidation(initialValues));

    // First set an error via validate
    act(() => {
      result.current.validate({
        name: (v) => (v ? null : 'Required'),
      });
    });
    expect(result.current.errors.name).toBe('Required');

    // handleChange should clear the error
    act(() => {
      result.current.handleChange('name')({
        target: { value: 'John' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.errors.name).toBe('');
  });

  it('validate returns true when all rules pass', () => {
    const { result } = renderHook(() =>
      useFormValidation({ name: 'John', email: 'john@test.com' })
    );

    let isValid: boolean = false;
    act(() => {
      isValid = result.current.validate({
        name: (v) => (v ? null : 'Required'),
        email: (v) => (v ? null : 'Required'),
      });
    });

    expect(isValid).toBe(true);
  });

  it('validate returns false when a rule fails', () => {
    const { result } = renderHook(() => useFormValidation(initialValues));

    let isValid: boolean = true;
    act(() => {
      isValid = result.current.validate({
        name: (v) => (v ? null : 'Required'),
      });
    });

    expect(isValid).toBe(false);
  });

  it('validate sets error messages for failing fields', () => {
    const { result } = renderHook(() => useFormValidation(initialValues));

    act(() => {
      result.current.validate({
        name: (v) => (v ? null : 'Name is required'),
        email: (v) => (v ? null : 'Email is required'),
      });
    });

    expect(result.current.errors.name).toBe('Name is required');
    expect(result.current.errors.email).toBe('Email is required');
  });

  it('validate clears errors for passing fields', () => {
    const { result } = renderHook(() => useFormValidation(initialValues));

    // Set errors first
    act(() => {
      result.current.validate({
        name: () => 'Error',
        email: () => 'Error',
      });
    });

    // Now update name and validate again with name passing
    act(() => {
      result.current.setValues({ name: 'John', email: '' });
    });

    act(() => {
      result.current.validate({
        name: (v) => (v ? null : 'Required'),
        email: (v) => (v ? null : 'Required'),
      });
    });

    expect(result.current.errors.name).toBeUndefined();
    expect(result.current.errors.email).toBe('Required');
  });

  it('setValues updates all values', () => {
    const { result } = renderHook(() => useFormValidation(initialValues));

    act(() => {
      result.current.setValues({ name: 'Jane', email: 'jane@test.com' });
    });

    expect(result.current.values).toEqual({ name: 'Jane', email: 'jane@test.com' });
  });

  it('validate with valuesOverride uses override instead of state', () => {
    const { result } = renderHook(() => useFormValidation(initialValues));

    let isValid: boolean = false;
    act(() => {
      isValid = result.current.validate(
        {
          name: (v) => (v ? null : 'Required'),
        },
        { name: 'Override', email: '' }
      );
    });

    // Should pass because the override has name filled in
    expect(isValid).toBe(true);
  });
});
