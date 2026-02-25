/**
 * Reusable validators for the item edit form.
 * Validators take the current form content and return true/false.
 * Can be reimplemented for tenant preferences or extended for additional rules.
 */

import type { ItemFormState } from '@frontend/constants/types';

/**
 * Returns true if the form is valid for Publish/Update (e.g. required fields pass).
 * Currently: Item Name must not be blank.
 * Used to enable/disable the Publish and Update buttons.
 */
export function isItemFormValidForPublish(form: ItemFormState): boolean {
  return typeof form.name === 'string' && form.name.trim() !== '';
}
