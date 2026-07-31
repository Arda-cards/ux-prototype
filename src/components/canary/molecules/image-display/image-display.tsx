import * as React from 'react';

import { cn } from '@/types/canary/utilities/utils';
import { Skeleton } from '@/components/canary/primitives/skeleton';
import { TriangleAlert } from 'lucide-react';
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
  /**
   * Called when the underlying `<img>` fails to load.
   *
   * Augments — does not replace — the internal error state: the initials
   * placeholder and error badge still render. Consumers use this to drive
   * recovery, e.g. refreshing CDN signed cookies and retrying after a 403.
   */
  // `| undefined` is explicit on these three so wrappers (e.g. ImageCellDisplay)
  // can forward their own optionals straight through under
  // `exactOptionalPropertyTypes: true`, rather than conditionally spreading.
  onError?: (() => void) | undefined;
  /** Called when the underlying `<img>` loads successfully. */
  onLoad?: (() => void) | undefined;
  /**
   * Human-readable explanation of *why* the image failed, surfaced on hover
   * and to assistive tech. Only shown in the error state; a null `imageUrl`
   * is "no image", not a failure, and never displays it.
   *
   * Classification lives with the consumer — this component only renders the
   * string it is given.
   */
  errorReason?: string | undefined;
  /**
   * The image URL is not resolvable *yet* — as opposed to absent.
   *
   * While true the component shows its skeleton and renders no `<img>`, so no
   * request is issued. Consumers whose URLs need credentials that arrive
   * asynchronously (e.g. CloudFront signed cookies) use this to avoid firing a
   * request that would 403 and never be retried.
   *
   * Distinct from `imageUrl === null`, which means "this entity has no image".
   * Conflating the two makes a not-yet-ready image look deleted.
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
 * Renders an image with three visual states:
 * - **Loaded**: `<img>` fills the container with `object-cover`.
 * - **Loading**: skeleton shimmer overlaid while the image network request is in flight.
 * - **Error**: a muted alert icon centred in the frame (URL provided but failed to load).
 *
 * When `imageUrl` is `null` the component shows an initials placeholder and no
 * alert icon &#8212; this is the "no image" state, not a broken image.
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
  onError,
  onLoad,
  errorReason,
  imagePending,
}: ImageDisplayProps) {
  const [loadState, setLoadState] = React.useState<LoadState>(
    imageUrl === null ? 'loaded' : 'loading',
  );
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Reset load state whenever imageUrl changes — and whenever the pending flag
  // flips. No <img> is mounted while pending, so clearing pending always starts
  // a fresh load; without resetting here a previous 'error' would survive the
  // pending window and render a stale error badge during what is actually a
  // retry (same imageUrl, refreshed credentials).
  React.useEffect(() => {
    setLoadState(imageUrl === null ? 'loaded' : 'loading');
  }, [imageUrl, imagePending]);

  const initials = getInitials(entityTypeDisplayName);

  const isInteractive = onImageChange !== undefined && config !== undefined;

  // The error badge is `pointer-events-none` so it never blocks AG Grid's
  // double-click-to-edit — which also means it cannot host a hover tooltip.
  // Put the reason on the container instead, so hovering anywhere on the cell
  // explains the failure. `loadState === 'error'` implies a non-null imageUrl,
  // since a null URL resolves straight to 'loaded'.
  const hoverTitle = loadState === 'error' ? errorReason : undefined;

  // While pending we know nothing yet: not that the image is missing, not that
  // it failed. Show only the skeleton and issue no request.
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

      {/* Initials placeholder — the "no image" state. A failed load shows the
          alert icon below instead: initials imply the entity simply has no
          picture, which is not what happened. */}
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

      {/* Failed load — a muted alert icon centred in the frame, not a corner
          badge. A red badge reads as "something needs your attention" for what
          is usually a transient, self-recovering failure. Only for broken URLs,
          never for a null imageUrl. */}
      {!isPending && imageUrl !== null && loadState === 'error' && (
        <TriangleAlert
          role="img"
          aria-label={errorReason ?? 'Image failed to load'}
          className={cn(
            'relative pointer-events-none text-muted-foreground',
            'w-1/3 h-1/3 max-w-8 max-h-8 min-w-4 min-h-4',
            // Solid triangle with the mark knocked out, per the design note.
            // lucide ships this icon as an outline, so the fill and the
            // knock-out are applied to its paths here.
            '[&>path:first-child]:fill-current',
            '[&>path:not(:first-child)]:stroke-background',
          )}
        />
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
