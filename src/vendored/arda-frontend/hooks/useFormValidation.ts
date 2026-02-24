import { useState } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
type ValidationErrors<T> = Partial<Record<keyof T, string>>;

export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors<T>>({});

  const validate = (
    rules: Partial<Record<keyof T, (value: any) => string | null>>,
    valuesOverride?: T
  ) => {
    const newErrors: ValidationErrors<T> = {};
    const validationTarget = valuesOverride || values;

    for (const key in rules) {
      const rule = rules[key];
      if (rule) {
        const error = rule(validationTarget[key]);
        if (error) {
          newErrors[key] = error;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange =
    (field: keyof T) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: '' }));
    };

  return {
    values,
    errors,
    setValues,
    setErrors,
    handleChange,
    validate,
  };
};
