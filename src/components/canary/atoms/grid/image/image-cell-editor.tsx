import { forwardRef, useImperativeHandle, useState } from 'react';

import type {
  ImageFieldConfig,
  ImageUploadResult,
} from '@/types/canary/utilities/image-field-config';
import { ImageUploadDialog } from '@/components/canary/organisms/shared/image-upload-dialog/image-upload-dialog';

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
  ImageCellEditorRuntimeProps & {
    /** Curried by createImageCellEditor — not passed by AG Grid directly. */
    config: ImageFieldConfig;
  };

/** Ref handle exposing getValue for AG Grid. */
export interface ImageCellEditorHandle {
  getValue: () => string | null;
}

/**
 * ImageCellEditor &#8212; AG Grid cell editor for image columns.
 *
 * Opens `ImageUploadDialog` in modal mode on mount. The editor renders an
 * invisible placeholder in the grid cell; all visual UI is in the dialog
 * overlay. On confirm, `getValue()` returns the new image URL and
 * `stopEditing(false)` commits the change. On cancel, `stopEditing(true)`
 * discards.
 *
 * Usage in column definitions:
 * ```ts
 * {
 *   field: 'imageUrl',
 *   cellEditor: createImageCellEditor(ITEM_IMAGE_CONFIG),
 *   // AG Grid double-clicks to edit by default; no suppressClickEdit needed
 * }
 * ```
 */
export const ImageCellEditor = forwardRef<ImageCellEditorHandle, ImageCellEditorProps>(
  ({ value: initialValue, stopEditing, config }, ref) => {
    const [currentValue, setCurrentValue] = useState<string | null>(initialValue);
    const [dialogOpen, setDialogOpen] = useState(true);

    useImperativeHandle(ref, () => ({
      getValue: () => currentValue,
    }));

    const handleConfirm = (result: ImageUploadResult) => {
      setCurrentValue(result.imageUrl);
      setDialogOpen(false);
      // Use setTimeout to let React flush the state update before AG Grid
      // reads getValue() via the ref.
      setTimeout(() => stopEditing?.(false), 0);
    };

    const handleCancel = () => {
      setDialogOpen(false);
      setTimeout(() => stopEditing?.(true), 0);
    };

    return (
      <>
        {/* Invisible placeholder in the grid cell */}
        <div
          data-slot="image-cell-editor"
          aria-hidden="true"
          style={{ width: 0, height: 0, overflow: 'hidden' }}
        />
        {/* Modal dialog overlay — renders via portal, not in the cell */}
        <ImageUploadDialog
          config={config}
          existingImageUrl={initialValue}
          open={dialogOpen}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </>
    );
  },
);

ImageCellEditor.displayName = 'ImageCellEditor';

/**
 * Factory helper for creating an image cell editor with a curried config.
 *
 * The factory captures the `ImageFieldConfig` at column-definition time and
 * injects it as a prop so the AG Grid runtime doesn't need to know about it.
 *
 * @example
 * ```ts
 * const colDef = {
 *   field: 'imageUrl',
 *   cellEditor: createImageCellEditor(ITEM_IMAGE_CONFIG),
 *   // AG Grid double-clicks to edit by default; no suppressClickEdit needed
 * };
 * ```
 */
export function createImageCellEditor(config: ImageFieldConfig) {
  const WrappedEditor = forwardRef<ImageCellEditorHandle, ImageCellEditorRuntimeProps>(
    (props, ref) => <ImageCellEditor {...props} config={config} ref={ref} />,
  );
  WrappedEditor.displayName = `ImageCellEditor(${config.entityTypeDisplayName})`;
  return WrappedEditor;
}
