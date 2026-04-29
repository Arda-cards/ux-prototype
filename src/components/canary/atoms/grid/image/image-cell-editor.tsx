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

/** Ref handle exposing getValue and isPopup for AG Grid. */
export interface ImageCellEditorHandle {
  getValue: () => string | null;
  /** Tells AG Grid this is a popup editor — prevents focus-loss stop editing. */
  isPopup: () => boolean;
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
 * Declares `isPopup() => true` so AG Grid treats this as a popup editor.
 * This prevents the grid from stopping editing when the Radix Dialog
 * portal moves focus to `document.body`.
 *
 * **Upload wiring (5.0.0+).** The dialog consumes its uploader from the
 * surrounding `ImageUploadProvider` Context — the cell editor no longer
 * takes per-callback `onUpload` / `onCheckReachability` props. Mount
 * `<ImageUploadProvider value={uploader}>` at or above the grid.
 *
 * Usage in column definitions:
 * ```ts
 * {
 *   field: 'imageUrl',
 *   cellEditor: createImageCellEditor(ITEM_IMAGE_CONFIG),
 *   cellEditorPopup: true,
 * }
 * ```
 */
export const ImageCellEditor = forwardRef<ImageCellEditorHandle, ImageCellEditorProps>(
  ({ value: initialValue, stopEditing, config }, ref) => {
    const [currentValue, setCurrentValue] = useState<string | null>(initialValue);
    const [dialogOpen, setDialogOpen] = useState(true);

    useImperativeHandle(ref, () => ({
      getValue: () => currentValue,
      isPopup: () => true,
    }));

    const handleConfirm = (result: ImageUploadResult) => {
      setCurrentValue(result.imageUrl);
      setDialogOpen(false);
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
 * Factory helper for creating an image cell editor with curried config.
 *
 * As of 5.0.0, this factory takes only `ImageFieldConfig`. The uploader
 * (file-blob upload, URL upload, reachability) is consumed from the
 * surrounding `ImageUploadProvider` Context at render time, so callers
 * no longer thread hook references through this factory.
 *
 * **Important — single forwardRef contract (FD-19).**
 * The returned component is a single `forwardRef`, not a wrapper around the
 * exported `ImageCellEditor` `forwardRef`. AG Grid 34.3.1's
 * `TooltipService.setupCellEditorTooltip` checks `editor.isPopup?.()`
 * synchronously to decide whether to construct the (broken)
 * `AgTooltipFeature` bean. With a double `forwardRef` wrapper, the inner
 * `useImperativeHandle` populates the ref one tick later than AG Grid
 * looks, so `isPopup` reads as `undefined` and AG Grid proceeds into a
 * codepath that crashes with "Cannot read properties of undefined
 * (reading 'get')". Calling `useImperativeHandle` on the outer ref
 * eliminates the indirection and AG Grid sees `isPopup() => true` in
 * time, taking the early-return branch.
 */
export function createImageCellEditor(config: ImageFieldConfig) {
  const ImageCellEditorAdapter = forwardRef<ImageCellEditorHandle, ImageCellEditorRuntimeProps>(
    ({ value: initialValue, stopEditing }, ref) => {
      const [currentValue, setCurrentValue] = useState<string | null>(initialValue);
      const [dialogOpen, setDialogOpen] = useState(true);

      // Imperative handle on the outer ref (no second forwardRef
      // indirection). See JSDoc above for why this matters.
      useImperativeHandle(ref, () => ({
        getValue: () => currentValue,
        isPopup: () => true,
      }));

      const handleConfirm = (result: ImageUploadResult) => {
        setCurrentValue(result.imageUrl);
        setDialogOpen(false);
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
          {/* Modal dialog overlay — renders via portal, not in the cell.
              Uploader consumed from the surrounding ImageUploadProvider. */}
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
  ImageCellEditorAdapter.displayName = `ImageCellEditor(${config.entityTypeDisplayName})`;
  return ImageCellEditorAdapter;
}
