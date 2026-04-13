import * as React from 'react';

import { cn } from '@/types/canary/utilities/utils';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/canary/primitives/popover';
import { ImageDisplay } from '@/components/canary/molecules/image-display/image-display';

// --- Interfaces ---

/** Static configuration for ImageHoverPreview. */
export interface ImageHoverPreviewStaticProps {}

/** Init configuration for ImageHoverPreview (entity/property labels). */
export interface ImageHoverPreviewInitProps {
  /** Display name of the entity type (e.g. "Item"). Passed to ImageDisplay for initials. */
  entityTypeDisplayName: string;
  /** Display name of the image property (e.g. "Product Image"). */
  propertyDisplayName: string;
}

/** Runtime configuration for ImageHoverPreview (live data). */
export interface ImageHoverPreviewRuntimeProps {
  /** URL of the image to preview. When null the popover is suppressed entirely. */
  imageUrl: string | null;
  /** Trigger element wrapped by this component. */
  children: React.ReactNode;
}

/** Combined props for ImageHoverPreview. */
export type ImageHoverPreviewProps = ImageHoverPreviewStaticProps &
  ImageHoverPreviewInitProps &
  ImageHoverPreviewRuntimeProps;

const HOVER_DELAY_MS = 500;
const EMPTY_STATE_CAPTION = 'No Image Available';

/**
 * ImageHoverPreview &#8212; lightweight hover popover showing a larger image preview.
 *
 * Wraps any trigger element. After ~500 ms of hover, opens a Popover containing
 * either an ImageDisplay at ~256&#215;256 (when `imageUrl` is non-null) or a
 * centered "No Image Available" caption (when `imageUrl` is null). On
 * mouse-leave the timer is cancelled and the popover closes immediately.
 *
 * If the image enters an error state after open, the Popover remains visible
 * showing the ImageDisplay error placeholder (initials + badge).
 *
 * Not a modal: no focus trap, no backdrop overlay.
 */
export function ImageHoverPreview({
  imageUrl,
  entityTypeDisplayName,
  propertyDisplayName,
  children,
}: ImageHoverPreviewProps) {
  const [open, setOpen] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => {
      setOpen(true);
    }, HOVER_DELAY_MS);
  };

  const handleMouseLeave = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setOpen(false);
  };

  // Treat null, undefined, and empty-string alike as "no image". Callers
  // feed this component row data from AG Grid, where an absent field shows
  // up as undefined (TypeScript types lie at runtime). Normalizing here
  // keeps consumers simple and prevents the "broken <img src=''>" state.
  const hasImage = typeof imageUrl === 'string' && imageUrl.length > 0;

  return (
    <div
      data-slot="image-hover-preview"
      className={cn('inline-block')}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>{children}</PopoverAnchor>
        <PopoverContent
          className={cn('w-64 h-64 p-2 bg-popover border-border shadow-md')}
          onOpenAutoFocus={(e) => e.preventDefault()}
          sideOffset={-4}
        >
          {hasImage ? (
            <ImageDisplay
              imageUrl={imageUrl}
              entityTypeDisplayName={entityTypeDisplayName}
              propertyDisplayName={propertyDisplayName}
            />
          ) : (
            <div
              data-slot="image-hover-preview-empty"
              className={cn(
                'flex h-full w-full items-center justify-center',
                'text-muted-foreground text-sm select-none',
              )}
            >
              {EMPTY_STATE_CAPTION}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
