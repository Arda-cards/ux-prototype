import type { AtomMode, AtomProps } from '@/lib/data-types/atom-types';
import { ArdaImageFieldDisplay, type ArdaImageFieldDisplayProps } from './image-field-display';
import { ArdaImageFieldEditor, type ArdaImageFieldEditorProps } from './image-field-editor';

/** Static configuration props specific to the image field. */
export interface ImageFieldStaticConfig {
  /** Placeholder text for the input. */
  placeholder?: string;
  /** Maximum height for the preview in editor mode. */
  maxPreviewHeight?: number;
  /** Maximum width in pixels (display mode). */
  maxWidth?: number;
  /** Maximum height in pixels (display mode). */
  maxHeight?: number;
  /** Alt text for the image. */
  alt?: string;
}

/** Props for the interactive image form field. */
export interface ArdaImageFieldInteractiveProps extends AtomProps<string>, ImageFieldStaticConfig {}

/**
 * Interactive image form field that renders in display, edit, or error mode
 * based on the `mode` prop. When `editable` is `false`, always renders
 * in display mode regardless of `mode`.
 */
export function ArdaImageFieldInteractive({
  value,
  onChange,
  onComplete,
  onCancel,
  mode,
  errors,
  editable,
  label,
  labelPosition,
  placeholder,
  maxPreviewHeight,
  maxWidth,
  maxHeight,
  alt,
}: ArdaImageFieldInteractiveProps) {
  const effectiveMode: AtomMode = editable === false ? 'display' : mode;

  const displayProps: ArdaImageFieldDisplayProps = { value };
  if (label !== undefined) displayProps.label = label;
  if (labelPosition !== undefined) displayProps.labelPosition = labelPosition;
  if (maxWidth !== undefined) displayProps.maxWidth = maxWidth;
  if (maxHeight !== undefined) displayProps.maxHeight = maxHeight;
  if (alt !== undefined) displayProps.alt = alt;

  if (effectiveMode === 'display') {
    return <ArdaImageFieldDisplay {...displayProps} />;
  }

  const editorProps: ArdaImageFieldEditorProps = {
    value,
    onChange,
    showErrors: effectiveMode === 'error',
  };
  if (onComplete !== undefined) editorProps.onComplete = onComplete;
  if (onCancel !== undefined) editorProps.onCancel = onCancel;
  if (label !== undefined) editorProps.label = label;
  if (labelPosition !== undefined) editorProps.labelPosition = labelPosition;
  if (placeholder !== undefined) editorProps.placeholder = placeholder;
  if (maxPreviewHeight !== undefined) editorProps.maxPreviewHeight = maxPreviewHeight;
  if (errors !== undefined) editorProps.errors = errors;

  return <ArdaImageFieldEditor {...editorProps} />;
}
