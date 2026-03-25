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

/**
 * ImageHoverPreview &#8212; lightweight hover popover showing a larger image preview.
 *
 * Wraps any trigger element. After ~500 ms of hover, opens a Popover containing
 * an ImageDisplay at ~256&#215;256. On mouse-leave the timer is cancelled and the
 * popover closes immediately.
 *
 * When `imageUrl` is null the popover is fully suppressed &#8212; no preview appears.
 * If the image enters an error state after open, the Popover remains visible showing
 * the ImageDisplay error placeholder (initials + badge).
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

  // Close popover and clear timer when imageUrl changes to null
  React.useEffect(() => {
    if (imageUrl === null) {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setOpen(false);
    }
  }, [imageUrl]);

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (imageUrl === null) return;
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
          sideOffset={8}
        >
          {imageUrl !== null && (
            <ImageDisplay
              imageUrl={imageUrl}
              entityTypeDisplayName={entityTypeDisplayName}
              propertyDisplayName={propertyDisplayName}
            />
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
