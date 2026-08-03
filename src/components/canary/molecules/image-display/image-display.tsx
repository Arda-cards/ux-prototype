import * as React from 'react';

import { cn } from '@/types/canary/utilities/utils';
import { Skeleton } from '@/components/canary/primitives/skeleton';
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
  /** Image URL. `null` is "no image" — initials, no alert icon. */
  imageUrl: string | null;
  /**
   * When provided together with `config`, enables the full edit flow.
   * Double-click or Enter opens the ImageUploadDialog internally.
   * On confirm, calls this callback with the upload result.
   */
  onImageChange?: (result: ImageUploadResult) => void;
  /**
   * The `<img>` failed to load. Augments the internal error state rather than
   * replacing it; consumers use it to refresh CDN credentials and retry.
   */
  // `| undefined` is explicit on these three so wrappers can forward their own
  // optionals under `exactOptionalPropertyTypes`.
  onError?: (() => void) | undefined;
  /** Called when the underlying `<img>` loads successfully. */
  onLoad?: (() => void) | undefined;
  /**
   * Why the image failed, shown on hover and to assistive tech. Error state
   * only — a null `imageUrl` is "no image", not a failure. The consumer
   * classifies; this renders.
   */
  errorReason?: string | undefined;
  /**
   * The URL is not resolvable *yet*, as opposed to absent: renders the skeleton
   * and no `<img>`, so nothing is requested before its credentials exist.
   * Distinct from `imageUrl === null` — conflating them makes a not-yet-ready
   * image look deleted.
   */
  imagePending?: boolean | undefined;
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
 * States: **loaded** (`<img>`), **loading** and **pending** (skeleton),
 * **error** (muted alert icon), **no image** (initials). Error and no-image are
 * deliberately distinct — initials would read as "no picture" for a broken one.
 *
 * With both `onImageChange` and `config`, double-click or Enter opens an
 * `ImageUploadDialog` internally (EditExisting, or EmptyImage when `imageUrl`
 * is null).
 *
 * Fills its parent, so the caller controls sizing. No border: `bg-muted` gives
 * enough contrast even for white images.
 */
export function ImageDisplay({
  imageUrl,
  entityTypeDisplayName,
  propertyDisplayName: _propertyDisplayName,
  config,
  onImageChange,
  onError,
  onLoad,
  errorReason,
  imagePending,
}: ImageDisplayProps) {
  const [loadState, setLoadState] = React.useState<LoadState>(
    imageUrl === null ? 'loaded' : 'loading',
  );
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Also resets when `imagePending` flips: no <img> is mounted while pending, so
  // clearing it always starts a fresh load. Without this a prior 'error' would
  // survive the pending window and show during what is actually a retry.
  React.useEffect(() => {
    setLoadState(imageUrl === null ? 'loaded' : 'loading');
  }, [imageUrl, imagePending]);

  const initials = getInitials(entityTypeDisplayName);

  const isInteractive = onImageChange !== undefined && config !== undefined;

  // On the container, not the icon: the icon is `pointer-events-none` so it never
  // blocks AG Grid's double-click-to-edit, which also stops it hosting a tooltip.
  const hoverTitle = loadState === 'error' ? errorReason : undefined;

  // Pending means nothing is known yet — neither missing nor failed.
  const isPending = imagePending === true;

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
      {(isPending || (imageUrl !== null && loadState === 'loading')) && (
        <Skeleton className="absolute inset-0 rounded-none" />
      )}

      {/* img element — rendered when we have a URL */}
      {imageUrl !== null && !isPending && (
        <img
          src={imageUrl}
          alt={entityTypeDisplayName}
          className={cn(
            'absolute inset-0 w-full h-full object-contain',
            loadState !== 'loaded' && 'invisible',
          )}
          onLoad={() => {
            setLoadState('loaded');
            onLoad?.();
          }}
          onError={() => {
            setLoadState('error');
            onError?.();
          }}
        />
      )}

      {/* "No image". A failed load shows the alert icon instead — initials would
          read as "this entity has no picture", which is not what happened. */}
      {!isPending && imageUrl === null && (
        <span
          className={cn(
            'relative select-none text-muted-foreground font-semibold leading-none',
            'text-[clamp(0.75rem,40%,4rem)]',
          )}
        >
          {initials}
        </span>
      )}

      {/* Failed load. Muted and centred, not a red corner badge — most image
          failures are transient and self-recovering, so an alarm mis-states it.
          Inline rather than lucide's <TriangleAlert> because lucide ships it as
          an outline, and filling it meant selecting its paths by position —
          which silently breaks if the icon's internals change. */}
      {!isPending && imageUrl !== null && loadState === 'error' && (
        <svg
          role="img"
          aria-label={errorReason ?? 'Image failed to load'}
          viewBox="0 0 24 24"
          className={cn(
            'relative pointer-events-none fill-current text-muted-foreground',
            'w-1/3 h-1/3 max-w-8 max-h-8 min-w-4 min-h-4',
          )}
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <rect className="fill-background" x="11" y="9" width="2" height="5" rx="1" />
          <circle className="fill-background" cx="12" cy="17.5" r="1.15" />
        </svg>
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
        title={hoverTitle}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      data-slot="image-display"
      className={cn('relative w-full h-full rounded bg-muted', 'flex items-center justify-center')}
      title={hoverTitle}
    >
      {content}
    </div>
  );
}
