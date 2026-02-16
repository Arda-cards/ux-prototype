import { createInteractive } from '@/lib/data-types/create-interactive';
import { ArdaNumberFieldDisplay } from './number-field-display';
import { ArdaNumberFieldEditor } from './number-field-editor';

/**
 * Interactive number form field: displays number in read-only mode by default,
 * switches to an editable input on double-click, and commits on blur/Enter.
 */
export const ArdaNumberFieldInteractive = createInteractive<number>({
  DisplayComponent: ArdaNumberFieldDisplay,
  EditorComponent: ArdaNumberFieldEditor,
  displayName: 'ArdaNumberFieldInteractive',
});
