import * as React from 'react';
import { Eye, Trash2 } from 'lucide-react';

import { cn } from '@/types/canary/utilities/utils';
import { ImageDisplay } from '@/components/canary/molecules/image-display/image-display';
import { ImageInspectorOverlay } from '@/components/canary/molecules/image-inspector-overlay/image-inspector-overlay';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/canary/primitives/alert-dialog';
import type {
  ImageFieldConfig,
  ImageUploadResult,
} from '@/types/canary/utilities/image-field-config';

// --- Interfaces ---

/** Static configuration for ImageFormField. */
export interface ImageFormFieldStaticProps {}

/** Init configuration for ImageFormField (entity/property labels, field rules). */
export interface ImageFormFieldInitProps {
  /** Field configuration &#8212; contains display names and upload constraints. */
  config: ImageFieldConfig;
}

/** Runtime configuration for ImageFormField (live data and callbacks). */
export interface ImageFormFieldRuntimeProps {
  /** Current image URL. Null means no image is set. */
  imageUrl: string | null;
  /** Called when the image is changed. Pass `null` to remove the image. */
  onChange: (imageUrl: string | null) => void;
  /** When true the field is read-only and no actions are available. */
  disabled?: boolean;
}

/** Combined props for ImageFormField. */
export type ImageFormFieldProps = ImageFormFieldStaticProps &
  ImageFormFieldInitProps &
  ImageFormFieldRuntimeProps;

// --- Component ---

/**
 * ImageFormField &#8212; form field renderer for entity image fields.
 *
 * Renders an interactive `ImageDisplay` thumbnail (double-click or Enter opens
 * the upload dialog). On hover, two action icons appear over the thumbnail without
 * blocking the double-click edit flow:
 *
 * - **Eye** &#8212; opens the ImageInspectorOverlay (suppressed when `imageUrl` is null).
 * - **Trash** &#8212; opens a remove confirmation `AlertDialog` (hidden when `imageUrl` is null).
 *
 * The hover overlay uses `pointer-events-none` on its container and `pointer-events-auto`
 * only on the icon buttons, so double-clicks on the image area pass through to the
 * underlying `ImageDisplay` button.
 *
 * On confirmed remove, `onChange(null)` is called.
 *
 * Disabled state: `opacity-50 pointer-events-none`.
 */
export function ImageFormField({
  config,
  imageUrl,
  onChange,
  disabled = false,
}: ImageFormFieldProps) {
  const { entityTypeDisplayName, propertyDisplayName } = config;

  const [inspectorOpen, setInspectorOpen] = React.useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = React.useState(false);

  const handleImageChange = React.useCallback(
    (result: ImageUploadResult) => {
      onChange(result.imageUrl);
    },
    [onChange],
  );

  const handleRemoveConfirm = React.useCallback(() => {
    onChange(null);
    setRemoveDialogOpen(false);
  }, [onChange]);

  return (
    <div
      data-slot="image-form-field"
      className={cn(
        'flex flex-col items-center gap-2',
        disabled && 'opacity-50 pointer-events-none',
      )}
    >
      {/* Image area: interactive thumbnail + hover action overlay */}
      <div className="relative group w-24 h-24">
        {/* Interactive ImageDisplay — double-click/Enter opens upload dialog */}
        <div className="w-full h-full rounded-lg overflow-hidden">
          <ImageDisplay
            imageUrl={imageUrl}
            entityTypeDisplayName={entityTypeDisplayName}
            propertyDisplayName={propertyDisplayName}
            config={config}
            onImageChange={handleImageChange}
          />
        </div>

        {/* Hover action overlay — pointer-events-none on container so double-click passes through */}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center gap-1',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'bg-black/30 rounded-lg',
            'pointer-events-none',
          )}
        >
          {/* Eye icon — opens inspector (suppressed when no image) */}
          {imageUrl !== null && (
            <button
              type="button"
              aria-label="Inspect image"
              className={cn(
                'pointer-events-auto',
                'text-white hover:text-white/80 bg-black/40 rounded-full p-1',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
              )}
              onClick={() => setInspectorOpen(true)}
            >
              <Eye className="w-4 h-4" aria-hidden="true" />
            </button>
          )}

          {/* Trash icon — opens remove confirmation (hidden when no image) */}
          {imageUrl !== null && (
            <button
              type="button"
              aria-label="Remove image"
              className={cn(
                'pointer-events-auto',
                'text-white hover:text-white/80 bg-black/40 rounded-full p-1',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
              )}
              onClick={() => setRemoveDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Label */}
      <span className="text-sm text-muted-foreground">{propertyDisplayName}</span>

      {/* ImageInspectorOverlay — controlled by eye icon button */}
      {imageUrl !== null && (
        <ImageInspectorOverlay
          imageUrl={imageUrl}
          open={inspectorOpen}
          onClose={() => setInspectorOpen(false)}
          onEdit={() => {
            setInspectorOpen(false);
            // Edit is handled by the ImageDisplay double-click — nothing more needed here
          }}
        />
      )}

      {/* Remove AlertDialog — controlled by trash icon button */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {propertyDisplayName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the current {propertyDisplayName.toLowerCase()} from this{' '}
              {entityTypeDisplayName.toLowerCase()}. You can add a new image at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRemoveDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleRemoveConfirm}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
