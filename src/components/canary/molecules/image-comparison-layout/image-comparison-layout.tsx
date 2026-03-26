import * as React from 'react';

import { cn } from '@/types/canary/utilities/utils';
import { ImageDisplay } from '@/components/canary/molecules/image-display/image-display';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/canary/primitives/tabs';
import { Button } from '@/components/canary/primitives/button';

// --- Interfaces ---

/** Static configuration for ImageComparisonLayout. */
export interface ImageComparisonLayoutStaticProps {}

/** Init configuration for ImageComparisonLayout. */
export interface ImageComparisonLayoutInitProps {
  /** Display name of the entity type (e.g. "Item"). Passed through to ImageDisplay. */
  entityTypeDisplayName: string;
  /** Display name of the image property (e.g. "Product Image"). Passed through to ImageDisplay. */
  propertyDisplayName: string;
}

/** Runtime configuration for ImageComparisonLayout. */
export interface ImageComparisonLayoutRuntimeProps {
  /** URL of the existing image. When null, only children are rendered (pass-through mode). */
  existingImageUrl: string | null;
  /** New image content, typically an ImagePreviewEditor. */
  children: React.ReactNode;
  /** Accept the edited image. When provided, renders an "Accept" button. */
  onAccept?: () => void;
  /** Dismiss without changes. When provided, renders a "Dismiss" button. */
  onDismiss?: () => void;
  /** Switch to upload surface. When provided, renders an "Upload New Image" button. */
  onUploadNew?: () => void;
}

/** Combined props for ImageComparisonLayout. */
export type ImageComparisonLayoutProps = ImageComparisonLayoutStaticProps &
  ImageComparisonLayoutInitProps &
  ImageComparisonLayoutRuntimeProps;

// --- Component ---

/**
 * ImageComparisonLayout &#8212; side-by-side (desktop) or tabbed (mobile) comparison of existing
 * vs new image.
 *
 * - When `existingImageUrl` is `null`: renders only `children` (pass-through mode).
 * - **Desktop** (md: and above): flex-row layout with a left "Current" panel and a right
 *   "New" panel separated by a border.
 * - **Mobile** (below md:): Tabs component with "Current" and "New" tabs.
 *
 * The root element carries `data-slot="image-comparison-layout"`.
 */
export function ImageComparisonLayout({
  existingImageUrl,
  entityTypeDisplayName,
  propertyDisplayName,
  children,
  onAccept,
  onDismiss,
  onUploadNew,
}: ImageComparisonLayoutProps) {
  const hasActions = onAccept !== undefined || onDismiss !== undefined || onUploadNew !== undefined;
  // Pass-through mode: no existing image to compare against
  if (existingImageUrl === null) {
    return (
      <div data-slot="image-comparison-layout" className={cn('w-full')}>
        {children}
      </div>
    );
  }

  return (
    <div data-slot="image-comparison-layout" className={cn('w-full')}>
      {/* Desktop layout: side-by-side flex row */}
      <div className={cn('hidden md:flex md:flex-row md:gap-4')}>
        {/* Left panel: existing image */}
        <div className={cn('flex flex-col gap-1 border-r border-border pr-4 flex-shrink-0')}>
          <span className={cn('text-sm text-muted-foreground')}>Current</span>
          <div className={cn('w-32 h-32')}>
            <ImageDisplay
              imageUrl={existingImageUrl}
              entityTypeDisplayName={entityTypeDisplayName}
              propertyDisplayName={propertyDisplayName}
            />
          </div>
        </div>

        {/* Right panel: new image content */}
        <div className={cn('flex flex-col gap-1 flex-1 min-w-0')}>
          <span className={cn('text-sm text-muted-foreground')}>New</span>
          {children}
        </div>
      </div>

      {/* Mobile layout: tabs */}
      <div className={cn('flex flex-col md:hidden')}>
        <Tabs defaultValue="new">
          <TabsList>
            <TabsTrigger value="current">Current</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
          </TabsList>

          <TabsContent value="current">
            <div className={cn('w-full aspect-square max-w-64 mt-2')}>
              <ImageDisplay
                imageUrl={existingImageUrl}
                entityTypeDisplayName={entityTypeDisplayName}
                propertyDisplayName={propertyDisplayName}
              />
            </div>
          </TabsContent>

          <TabsContent value="new">
            <div className={cn('mt-2')}>{children}</div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Action footer — rendered when any action callback is provided */}
      {hasActions && (
        <div className={cn('flex items-center justify-end gap-2 pt-4 border-t border-border mt-4')}>
          {onUploadNew !== undefined && (
            <Button type="button" variant="secondary" onClick={onUploadNew}>
              Upload New Image
            </Button>
          )}
          {onDismiss !== undefined && (
            <Button type="button" variant="secondary" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
          {onAccept !== undefined && (
            <Button type="button" onClick={onAccept}>
              Accept
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
