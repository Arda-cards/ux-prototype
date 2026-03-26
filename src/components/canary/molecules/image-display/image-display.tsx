import * as React from 'react';

import { cn } from '@/types/canary/utilities/utils';
import { Skeleton } from '@/components/canary/primitives/skeleton';
import { Badge } from '@/components/canary/atoms/badge/badge-base';
import { getInitials } from '@/types/canary/utilities/get-initials';
import { ImageUploadDialog } from '@/components/canary/organisms/shared/image-upload-dialog/image-upload-dialog';
import type {
  ImageFieldConfig,
  ImageUploadResult,
} from '@/types/canary/utilities/image-field-config';

// --- Interfaces ---

/** Static configuration for ImageDisplay. */
export interface ImageDisplayStaticProps {}

/** Init configuration for ImageDisplay (shape, labels). */
export interface ImageDisplayInitProps {
  /** Display name of the entity type (e.g. "Item"). Used to derive initials. */
  entityTypeDisplayName: string;
  /** Display name of this image property (e.g. "Product Image"). */
  propertyDisplayName: string;
  /**
   * Required when `onImageChange` is provided. Configures the upload dialog
   * (aspect ratio, accepted formats, size limits).
   */
  config?: ImageFieldConfig;
}

/** Runtime configuration for ImageDisplay (live data). */
export interface ImageDisplayRuntimeProps {
  /** URL of the image to display. Null means "no image" (shows initials, no error badge). */
  imageUrl: string | null;
  /**
   * When provided together with `config`, enables the full edit flow.
   * Double-click or Enter opens the ImageUploadDialog internally.
   * On confirm, calls this callback with the upload result.
   */
  onImageChange?: (result: ImageUploadResult) => void;
}

/** Combined props for ImageDisplay. */
export type ImageDisplayProps = ImageDisplayStaticProps &
  ImageDisplayInitProps &
  ImageDisplayRuntimeProps;

// --- Types ---

type LoadState = 'loading' | 'loaded' | 'error';

// --- Component ---

/**
 * ImageDisplay &#8212; foundational image rendering molecule.
 *
 * Renders an image with three visual states:
 * - **Loaded**: `<img>` fills the container with `object-cover`.
 * - **Loading**: skeleton shimmer overlaid while the image network request is in flight.
 * - **Error**: initials placeholder with a destructive error badge (URL provided but failed to load).
 *
 * When `imageUrl` is `null` the component shows an initials placeholder without
 * an error badge &#8212; this is the "no image" state, not a broken image.
 *
 * When both `onImageChange` and `config` are provided, the component becomes
 * interactive: double-click or Enter opens an `ImageUploadDialog` internally.
 * The dialog enters EditExisting mode when there is an existing image, or
 * EmptyImage mode when `imageUrl` is null. On confirm, `onImageChange` is
 * called with the result and the dialog closes.
 *
 * The container fills its parent (`w-full h-full`) so the caller controls sizing.
 * No border is applied deliberately; `bg-muted` provides sufficient contrast even
 * for white images.
 */
export function ImageDisplay({
  imageUrl,
  entityTypeDisplayName,
  propertyDisplayName: _propertyDisplayName,
  config,
  onImageChange,
}: ImageDisplayProps) {
  const [loadState, setLoadState] = React.useState<LoadState>(
    imageUrl === null ? 'loaded' : 'loading',
  );
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Reset load state whenever imageUrl changes
  React.useEffect(() => {
    setLoadState(imageUrl === null ? 'loaded' : 'loading');
  }, [imageUrl]);

  const initials = getInitials(entityTypeDisplayName);

  const isInteractive = onImageChange !== undefined && config !== undefined;

  const handleDoubleClick = isInteractive
    ? () => {
        setDialogOpen(true);
      }
    : undefined;

  const handleKeyDown = isInteractive
    ? (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          setDialogOpen(true);
        }
      }
    : undefined;

  const handleConfirm = React.useCallback(
    (result: ImageUploadResult) => {
      onImageChange?.(result);
      setDialogOpen(false);
    },
    [onImageChange],
  );

  const handleCancel = React.useCallback(() => {
    setDialogOpen(false);
  }, []);

  const content = (
    <>
      {/* Skeleton shimmer — visible only while loading */}
      {imageUrl !== null && loadState === 'loading' && (
        <Skeleton className="absolute inset-0 rounded-none" />
      )}

      {/* img element — rendered when we have a URL */}
      {imageUrl !== null && (
        <img
          src={imageUrl}
          alt={entityTypeDisplayName}
          className={cn(
            'absolute inset-0 w-full h-full object-cover',
            loadState !== 'loaded' && 'invisible',
          )}
          onLoad={() => setLoadState('loaded')}
          onError={() => setLoadState('error')}
        />
      )}

      {/* Initials placeholder — shown for null imageUrl or error state */}
      {(imageUrl === null || loadState === 'error') && (
        <span
          className={cn(
            'relative select-none text-muted-foreground font-semibold leading-none',
            'text-[clamp(0.75rem,40%,4rem)]',
          )}
        >
          {initials}
        </span>
      )}

      {/* Error badge — only for broken URLs, not for null imageUrl */}
      {imageUrl !== null && loadState === 'error' && (
        <Badge
          variant="error-overlay"
          className="pointer-events-none"
          aria-label="Image failed to load"
        >
          !
        </Badge>
      )}

      {/* ImageUploadDialog — rendered inside the component when edit flow is enabled */}
      {isInteractive && (
        <ImageUploadDialog
          config={config}
          existingImageUrl={imageUrl}
          open={dialogOpen}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        data-slot="image-display"
        className={cn(
          'relative w-full h-full rounded bg-muted',
          'flex items-center justify-center',
          'cursor-pointer border-2 border-transparent',
          'hover:border-primary/50 transition-colors',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        )}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        aria-label={`Edit ${entityTypeDisplayName} image — double-click or press Enter`}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      data-slot="image-display"
      className={cn('relative w-full h-full rounded bg-muted', 'flex items-center justify-center')}
    >
      {content}
    </div>
  );
}
