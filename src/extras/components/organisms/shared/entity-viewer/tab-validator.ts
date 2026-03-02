/**
 * Tab-level validation for the stepped layout of AbstractEntityViewer.
 *
 * Runs per-field validation for all fields assigned to a given tab.
 * This is a pure utility module with no React dependencies.
 *
 * **Design note — Sub-viewer validation:**
 * Sub-viewer validation is handled separately by the shell component via the
 * triggerValidation / onValidationResult callback protocol defined in
 * SubViewerProps. This module only validates atom-level fields; it does not
 * invoke or coordinate sub-viewer validation.
 */

import type { FieldDescriptor, TabConfig, ViewerError } from './types';

/**
 * Validates all editable, visible fields on the current tab.
 *
 * Iterates over the tab's `fieldKeys`, looks up each field's descriptor,
 * and runs its `validate` function (if present) against the current entity
 * value. Fields that are hidden, non-editable, or have no descriptor are
 * skipped.
 *
 * @param tabConfig - The tab whose fields should be validated.
 * @param entity - The current working copy of the entity.
 * @param fieldDescriptors - Map of field key to its descriptor.
 * @returns An array of {@link ViewerError} for any validation failures.
 */
export function validateTab<T>(
  tabConfig: TabConfig,
  entity: T,
  fieldDescriptors: Partial<Record<string, FieldDescriptor<unknown>>>,
): ViewerError[] {
  const errors: ViewerError[] = [];

  for (const fieldKey of tabConfig.fieldKeys) {
    const descriptor = fieldDescriptors[fieldKey];

    // Skip fields with no descriptor, hidden fields, or non-editable fields.
    if (!descriptor || !descriptor.visible || !descriptor.editable) {
      continue;
    }

    // Skip fields that have no validation function.
    if (!descriptor.validate) {
      continue;
    }

    const value = (entity as Record<string, unknown>)[fieldKey];
    const errorMessage = descriptor.validate(value);

    if (errorMessage) {
      errors.push({ message: errorMessage, fieldPath: fieldKey });
    }
  }

  return errors;
}
