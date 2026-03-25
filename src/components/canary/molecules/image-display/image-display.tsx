import * as React from 'react';

import { cn } from '@/types/canary/utilities/utils';
import { Skeleton } from '@/components/canary/primitives/skeleton';
import { Badge } from '@/components/canary/atoms/badge/badge-base';
import { getInitials } from '@/types/canary/utilities/get-initials';

// --- Interfaces ---

/** Static configuration for ImageDisplay. */
export interface ImageDisplayStaticProps {}

/** Init configuration for ImageDisplay (shape, labels). */
export interface ImageDisplayInitProps {
  /** Display name of the entity type (e.g. "Item"). Used to derive initials. */
  entityTypeDisplayName: string;
  /** Display name of this image property (e.g. "Product Image"). */
  propertyDisplayName: string;
}

/** Runtime configuration for ImageDisplay (live data). */
export interface ImageDisplayRuntimeProps {
  /** URL of the image to display. Null means "no image" (shows initials, no error badge). */
  imageUrl: string | null;
}

/** Combined props for ImageDisplay. */
export type ImageDisplayProps = ImageDisplayStaticProps &
  ImageDisplayInitProps &
  ImageDisplayRuntimeProps;

// --- Types ---

type LoadState = 'loading' | 'loaded' | 'error';

// --- Component ---

/**
 * ImageDisplay — foundational image rendering molecule.
 *
 * Renders an image with three visual states:
 * - **Loaded**: `<img>` fills the container with `object-cover`.
 * - **Loading**: skeleton shimmer overlaid while the image network request is in flight.
 * - **Error**: initials placeholder with a destructive error badge (URL provided but failed to load).
 *
 * When `imageUrl` is `null` the component shows an initials placeholder without
 * an error badge &#8212; this is the "no image" state, not a broken image.
 *
 * The container fills its parent (`w-full h-full`) so the caller controls sizing.
 * No border is applied deliberately; `bg-muted` provides sufficient contrast even
 * for white images.
 */
export function ImageDisplay({ imageUrl, entityTypeDisplayName }: ImageDisplayProps) {
  const [loadState, setLoadState] = React.useState<LoadState>(
    imageUrl === null ? 'loaded' : 'loading',
  );

  // Reset load state whenever imageUrl changes
  React.useEffect(() => {
    setLoadState(imageUrl === null ? 'loaded' : 'loading');
  }, [imageUrl]);

  const initials = getInitials(entityTypeDisplayName);

  return (
    <div
      data-slot="image-display"
      className={cn('relative w-full h-full rounded bg-muted', 'flex items-center justify-center')}
    >
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
            // Font size scales with container; 40cqw uses container query units
            // for proportional sizing. Fallback to 30% for older browsers.
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
    </div>
  );
}
