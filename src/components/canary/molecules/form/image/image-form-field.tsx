import * as React from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';

import { cn } from '@/types/canary/utilities/utils';
import { ImageDisplay } from '@/components/canary/molecules/image-display/image-display';
import { ImageHoverPreview } from '@/components/canary/molecules/image-hover-preview/image-hover-preview';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/canary/primitives/alert-dialog';
import type { ImageFieldConfig } from '@/types/canary/utilities/image-field-config';

// --- Interfaces ---

/** Static configuration for ImageFormField. */
export interface ImageFormFieldStaticProps {}

/** Init configuration for ImageFormField (entity/property labels, field rules). */
export interface ImageFormFieldInitProps {
  /** Field configuration — contains display names and upload constraints. */
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
 * Renders an `ImageDisplay` thumbnail wrapped in an `ImageHoverPreview`. On hover a set of
 * action icons appears over the thumbnail:
 *
 * - **Eye** &#8212; opens the ImageInspectorOverlay (suppressed when `imageUrl` is null).
 * - **Pencil** &#8212; triggers the edit/upload action (always visible).
 * - **Trash** &#8212; opens a remove confirmation `AlertDialog` (hidden when `imageUrl` is null).
 *
 * On confirmed remove, `onChange(null)` is called. Double-clicking the image area also
 * triggers the edit action.
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

  const handleEdit = React.useCallback(() => {
    // Future: open upload dialog via parent callback
    // TODO: wire to ImageUploadDialog in Run 4
  }, []);

  const handleRemoveConfirm = React.useCallback(() => {
    onChange(null);
  }, [onChange]);

  return (
    <div
      data-slot="image-form-field"
      className={cn(
        'flex flex-col items-center gap-2',
        disabled && 'opacity-50 pointer-events-none',
      )}
    >
      {/* Image area: thumbnail + hover preview + action overlay */}
      <ImageHoverPreview
        imageUrl={imageUrl}
        entityTypeDisplayName={entityTypeDisplayName}
        propertyDisplayName={propertyDisplayName}
      >
        <div
          className={cn(
            'relative group rounded-lg w-24 h-24 overflow-hidden cursor-pointer',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
          )}
          onDoubleClick={handleEdit}
          tabIndex={0}
          role="button"
          aria-label={`Edit ${propertyDisplayName}`}
        >
          {/* Thumbnail */}
          <ImageDisplay
            imageUrl={imageUrl}
            entityTypeDisplayName={entityTypeDisplayName}
            propertyDisplayName={propertyDisplayName}
          />

          {/* Action icons overlay */}
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center gap-1',
              'opacity-0 group-hover:opacity-100 transition-opacity',
              'bg-black/30 rounded-lg',
            )}
          >
            {/* Eye icon — suppressed when no image */}
            {imageUrl !== null && (
              <button
                type="button"
                aria-label="Inspect image"
                className={cn(
                  'text-white hover:text-white/80 bg-black/40 rounded-full p-1',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  // Future: open ImageInspectorOverlay
                  // TODO: wire to ImageInspectorOverlay in Run 4
                }}
              >
                <Eye className="w-4 h-4" aria-hidden="true" />
              </button>
            )}

            {/* Pencil icon — always visible */}
            <button
              type="button"
              aria-label="Edit image"
              className={cn(
                'text-white hover:text-white/80 bg-black/40 rounded-full p-1',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
            >
              <Pencil className="w-4 h-4" aria-hidden="true" />
            </button>

            {/* Trash icon — hidden when no image */}
            {imageUrl !== null && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    aria-label="Remove image"
                    className={cn(
                      'text-white hover:text-white/80 bg-black/40 rounded-full p-1',
                      'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove {propertyDisplayName}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove the current {propertyDisplayName.toLowerCase()} from this{' '}
                      {entityTypeDisplayName.toLowerCase()}. You can add a new image at any time.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={handleRemoveConfirm}
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </ImageHoverPreview>

      {/* Label */}
      <span className="text-sm text-muted-foreground">{propertyDisplayName}</span>
    </div>
  );
}
