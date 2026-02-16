import { createInteractive } from '@/lib/data-types/create-interactive';
import type { FieldLabelProps } from '../field-label';
import { ArdaTextFieldDisplay } from './text-field-display';
import { ArdaTextFieldEditor } from './text-field-editor';

/**
 * Interactive text form field: displays text in read-only mode by default,
 * switches to an editable input on double-click, and commits on blur/Enter.
 */
export const ArdaTextFieldInteractive = createInteractive<string, FieldLabelProps>({
  DisplayComponent: ArdaTextFieldDisplay,
  EditorComponent: ArdaTextFieldEditor,
  displayName: 'ArdaTextFieldInteractive',
});
