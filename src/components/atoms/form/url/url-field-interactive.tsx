import { createInteractive } from '@/lib/data-types/create-interactive';
import type { FieldLabelProps } from '../field-label';
import { ArdaUrlFieldDisplay } from './url-field-display';
import { ArdaUrlFieldEditor } from './url-field-editor';

/**
 * Interactive URL form field: displays URL in read-only mode by default,
 * switches to an editable input on double-click, and commits on blur/Enter.
 */
export const ArdaUrlFieldInteractive = createInteractive<string, FieldLabelProps>({
  DisplayComponent: ArdaUrlFieldDisplay,
  EditorComponent: ArdaUrlFieldEditor,
  displayName: 'ArdaUrlFieldInteractive',
});
