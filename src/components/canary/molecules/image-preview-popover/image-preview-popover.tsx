import * as React from 'react';

import { cn } from '@/types/canary/utilities/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/canary/primitives/popover';
import { ImageDisplay } from '@/components/canary/molecules/image-display/image-display';

// --- Interfaces ---

/** Static configuration for ImagePreviewPopover. */
export interface ImagePreviewPopoverStaticProps {}

/** Init configuration for ImagePreviewPopover (entity/property labels). */
export interface ImagePreviewPopoverInitProps {
  /** Display name of the entity type (e.g. "Item"). Passed to ImageDisplay for initials. */
  entityTypeDisplayName: string;
  /** Display name of the image property (e.g. "Product Image"). */
  propertyDisplayName: string;
}

/** Runtime configuration for ImagePreviewPopover (live data). */
export interface ImagePreviewPopoverRuntimeProps {
  /**
   * URL of the image to preview. When null (or empty) there is nothing to
   * preview: the children render unwrapped and no popover exists.
   */
  imageUrl: string | null;
  /**
   * Trigger element. Rendered via `PopoverTrigger asChild`, so it must be a
   * single element that accepts a ref and a click handler — ideally a
   * `<button>` so the preview is keyboard-reachable.
   */
  children: React.ReactElement;
}

/** Combined props for ImagePreviewPopover. */
export type ImagePreviewPopoverProps = ImagePreviewPopoverStaticProps &
  ImagePreviewPopoverInitProps &
  ImagePreviewPopoverRuntimeProps;

/**
 * ImagePreviewPopover &#8212; click-to-open popover showing a larger image preview.
 *
 * Wraps a trigger element (typically a thumbnail). Clicking the trigger opens
 * a Popover containing an ImageDisplay at ~256&#215;256; clicking the trigger
 * again, clicking outside, or pressing Escape closes it. When `imageUrl` is
 * null, undefined, or empty there is nothing to preview, so the trigger
 * renders unwrapped and no popover opens.
 *
 * Click replaced the earlier hover-to-open interaction (ImageHoverPreview):
 * it works on touch devices, never opens accidentally while the pointer
 * crosses a grid, and only does work the user asked for.
 *
 * If the image enters an error state after open, the Popover remains visible
 * showing the ImageDisplay error placeholder (initials + badge).
 *
 * Not a modal: no focus trap, no backdrop overlay.
 */
export function ImagePreviewPopover({
  imageUrl,
  entityTypeDisplayName,
  propertyDisplayName,
  children,
}: ImagePreviewPopoverProps) {
  // Treat null, undefined, and empty-string alike as "no image". Callers
  // feed this component row data from AG Grid, where an absent field shows
  // up as undefined (TypeScript types lie at runtime).
  const hasImage = typeof imageUrl === 'string' && imageUrl.length > 0;

  if (!hasImage) {
    return children;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className={cn('w-64 h-64 p-2 bg-popover border-border shadow-md')}
        onOpenAutoFocus={(e) => e.preventDefault()}
        sideOffset={-4}
      >
        <ImageDisplay
          imageUrl={imageUrl}
          entityTypeDisplayName={entityTypeDisplayName}
          propertyDisplayName={propertyDisplayName}
        />
      </PopoverContent>
    </Popover>
  );
}
