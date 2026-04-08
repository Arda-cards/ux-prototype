import { forwardRef, useImperativeHandle, useState } from 'react';

import type {
  ImageFieldConfig,
  ImageUploadResult,
} from '@/types/canary/utilities/image-field-config';
import { ImageUploadDialog } from '@/components/canary/organisms/shared/image-upload-dialog/image-upload-dialog';

/** Configuration for the image cell editor factory (FD-01 / FD-15). */
export interface ImageCellEditorConfig {
  config: ImageFieldConfig;
  /** Hook returning the upload mutation — required (FD-15). */
  useImageUpload: () => { mutateAsync: (file: Blob) => Promise<string>; isPending: boolean };
  /** Hook returning the reachability check — required (FD-15). */
  useCheckReachability: () => { mutateAsync: (url: string) => Promise<boolean> };
}

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
    /** Upload hook — returns mutateAsync for the upload flow. */
    useImageUpload?: () => { mutateAsync: (file: Blob) => Promise<string>; isPending: boolean };
    /** Reachability hook — returns mutateAsync for URL checking. */
    useCheckReachability?: () => { mutateAsync: (url: string) => Promise<boolean> };
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
 * Usage in column definitions:
 * ```ts
 * {
 *   field: 'imageUrl',
 *   cellEditor: createImageCellEditor(ITEM_IMAGE_CONFIG),
 * }
 * ```
 */
export const ImageCellEditor = forwardRef<ImageCellEditorHandle, ImageCellEditorProps>(
  ({ value: initialValue, stopEditing, config, useImageUpload, useCheckReachability }, ref) => {
    const [currentValue, setCurrentValue] = useState<string | null>(initialValue);
    const [dialogOpen, setDialogOpen] = useState(true);

    // Invoke hooks at the top level (Rules of Hooks) — only when provided
    const uploadHook = useImageUpload?.();
    const reachabilityHook = useCheckReachability?.();

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
          {...(uploadHook ? { onUpload: (file: Blob) => uploadHook.mutateAsync(file) } : {})}
          {...(reachabilityHook
            ? { onCheckReachability: (url: string) => reachabilityHook.mutateAsync(url) }
            : {})}
        />
      </>
    );
  },
);

ImageCellEditor.displayName = 'ImageCellEditor';

/**
 * Factory helper for creating an image cell editor with curried config and hooks.
 *
 * Accepts either the legacy `ImageFieldConfig` (Storybook/default handlers) or
 * the full `ImageCellEditorConfig` with required typed provider hooks (FD-15).
 */
export function createImageCellEditor(configOrFull: ImageFieldConfig | ImageCellEditorConfig) {
  const isFullConfig = 'useImageUpload' in configOrFull;
  const config = isFullConfig ? configOrFull.config : configOrFull;
  const useImageUpload = isFullConfig ? configOrFull.useImageUpload : undefined;
  const useCheckReachability = isFullConfig ? configOrFull.useCheckReachability : undefined;

  const WrappedEditor = forwardRef<ImageCellEditorHandle, ImageCellEditorRuntimeProps>(
    (props, editorRef) => (
      <ImageCellEditor
        {...props}
        config={config}
        {...(useImageUpload ? { useImageUpload } : {})}
        {...(useCheckReachability ? { useCheckReachability } : {})}
        ref={editorRef}
      />
    ),
  );
  WrappedEditor.displayName = `ImageCellEditor(${config.entityTypeDisplayName})`;
  return WrappedEditor;
}
