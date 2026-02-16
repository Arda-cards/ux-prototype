import { createInteractive } from '@/lib/data-types/create-interactive';
import type { FieldLabelProps } from '../field-label';
import { ArdaBooleanFieldDisplay } from './boolean-field-display';
import { ArdaBooleanFieldEditor } from './boolean-field-editor';

/**
 * Interactive boolean form field: displays boolean in read-only mode by default,
 * switches to an editable input on double-click, and commits on blur/Enter.
 */
export const ArdaBooleanFieldInteractive = createInteractive<boolean, FieldLabelProps>({
  DisplayComponent: ArdaBooleanFieldDisplay,
  EditorComponent: ArdaBooleanFieldEditor,
  displayName: 'ArdaBooleanFieldInteractive',
});
