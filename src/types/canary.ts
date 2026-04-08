// Canary type exports — in-development domain types not yet promoted to stable.
// Consumers: import type { ... } from '@arda-cards/design-system/types/canary';

export { cn } from './canary/utilities/utils';
export type { PaginationData } from './canary/utilities/pagination';
export type {
  FieldError,
  ValidationResult,
  Validator,
  EditPhase,
  EditLifecycleCallbacks,
  EditableComponentProps,
} from './canary/utilities/edit-lifecycle';
export { setNestedField } from './canary/utilities/set-nested-field';
