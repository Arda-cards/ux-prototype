import { describe, it, expectTypeOf } from 'vitest';
import type {
  FieldError,
  ValidationResult,
  Validator,
  EditPhase,
  EditLifecycleCallbacks,
  EditableComponentProps,
} from './edit-lifecycle';

describe('edit-lifecycle types', () => {
  it('FieldError has required field and message string fields', () => {
    expectTypeOf<FieldError['field']>().toEqualTypeOf<string>();
    expectTypeOf<FieldError['message']>().toEqualTypeOf<string>();
  });

  it('FieldError.severity accepts only error and warning', () => {
    expectTypeOf<FieldError['severity']>().toEqualTypeOf<'error' | 'warning' | undefined>();
  });

  it('FieldError.code is optional string', () => {
    expectTypeOf<FieldError['code']>().toEqualTypeOf<string | undefined>();
  });

  it('ValidationResult has boolean valid and FieldError[] errors', () => {
    expectTypeOf<ValidationResult['valid']>().toEqualTypeOf<boolean>();
    expectTypeOf<ValidationResult['errors']>().toEqualTypeOf<FieldError[]>();
  });

  it('Validator<T> is callable with T and returns ValidationResult', () => {
    expectTypeOf<Validator<string>>().toEqualTypeOf<(value: string) => ValidationResult>();
  });

  it('EditPhase is a union of exactly 4 string literals', () => {
    expectTypeOf<EditPhase>().toEqualTypeOf<'idle' | 'editing' | 'confirming' | 'error'>();
  });

  it('EditLifecycleCallbacks<T> has optional onChange, onConfirm, onCancel', () => {
    type Cbs = EditLifecycleCallbacks<number>;
    expectTypeOf<Cbs['onChange']>().toEqualTypeOf<
      ((value: number, validation: ValidationResult) => void) | undefined
    >();
    expectTypeOf<Cbs['onConfirm']>().toEqualTypeOf<((value: number) => void) | undefined>();
    expectTypeOf<Cbs['onCancel']>().toEqualTypeOf<(() => void) | undefined>();
  });

  it('EditableComponentProps<T> extends EditLifecycleCallbacks<T>', () => {
    expectTypeOf<EditableComponentProps<string>>().toMatchTypeOf<EditLifecycleCallbacks<string>>();
  });

  it('EditableComponentProps<T>.contextErrors accepts FieldError[]', () => {
    expectTypeOf<EditableComponentProps<string>['contextErrors']>().toEqualTypeOf<
      FieldError[] | undefined
    >();
  });
});
