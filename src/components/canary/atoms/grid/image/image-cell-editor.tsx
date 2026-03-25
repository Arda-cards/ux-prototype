import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

import type { ImageFieldConfig } from '@/types/canary/utilities/image-field-config';

// --- Interfaces ---

/** Design-time configuration for ImageCellEditor (no static props). */
export interface ImageCellEditorStaticProps {}

/** Init configuration for ImageCellEditor. */
export interface ImageCellEditorInitProps {}

/** Runtime props for ImageCellEditor — supplied by AG Grid. */
export interface ImageCellEditorRuntimeProps {
  /** Current image URL value from the row. */
  value: string | null;
  /** Full row data record from AG Grid. */
  data: Record<string, unknown>;
  /** AG Grid callback to stop editing. Pass true to cancel (discard changes). */
  stopEditing?: (cancel?: boolean) => void;
}

/** Combined props for ImageCellEditor. */
export type ImageCellEditorProps = ImageCellEditorStaticProps &
  ImageCellEditorInitProps &
  ImageCellEditorRuntimeProps;

/** Ref handle exposing getValue for AG Grid. */
export interface ImageCellEditorHandle {
  getValue: () => string | null;
}

/**
 * ImageCellEditor &#8212; AG Grid cell editor for image columns.
 *
 * This is a thin placeholder. The actual editing UI (ImageUploadDialog) will be
 * wired in a later phase. For now the editor cancels immediately on mount,
 * returning control to the grid without changing the value.
 *
 * Usage in column definitions:
 * ```ts
 * { field: 'imageUrl', cellEditor: createImageCellEditor(config) }
 * ```
 */
export const ImageCellEditor = forwardRef<ImageCellEditorHandle, ImageCellEditorProps>(
  ({ value: initialValue, stopEditing }, ref) => {
    const [currentValue] = useState<string | null>(initialValue);

    useImperativeHandle(ref, () => ({
      getValue: () => currentValue,
    }));

    // Placeholder behavior: cancel immediately since ImageUploadDialog is not yet wired.
    useEffect(() => {
      stopEditing?.(true);
    }, []); // Intentionally empty — fire once on mount only

    // Invisible placeholder — editing happens in a dialog (future phase).
    return (
      <div
        data-slot="image-cell-editor"
        aria-hidden="true"
        style={{ width: 0, height: 0, overflow: 'hidden' }}
      />
    );
  },
);

ImageCellEditor.displayName = 'ImageCellEditor';

/**
 * Factory helper for creating an image cell editor with a curried config.
 *
 * @example
 * ```ts
 * const colDef = { field: 'imageUrl', cellEditor: createImageCellEditor(ITEM_IMAGE_CONFIG) };
 * ```
 */
export function createImageCellEditor(_config: ImageFieldConfig) {
  return (props: ImageCellEditorRuntimeProps) => <ImageCellEditor {...props} />;
}
