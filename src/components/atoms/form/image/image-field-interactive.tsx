import { createInteractive } from '@/lib/data-types/create-interactive';
import type { FieldLabelProps } from '../field-label';
import { ArdaImageFieldDisplay } from './image-field-display';
import { ArdaImageFieldEditor } from './image-field-editor';

/**
 * Interactive image form field: displays image in read-only mode by default,
 * switches to an editable input on double-click, and commits on blur/Enter.
 */
export const ArdaImageFieldInteractive = createInteractive<string, FieldLabelProps>({
  DisplayComponent: ArdaImageFieldDisplay,
  EditorComponent: ArdaImageFieldEditor,
  displayName: 'ArdaImageFieldInteractive',
});
