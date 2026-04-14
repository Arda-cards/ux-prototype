import { cn } from '@/types/canary/utilities/utils';
import type { ImageFieldConfig } from '@/types/canary/utilities/image-field-config';
import { ImageDisplay } from '@/components/canary/molecules/image-display/image-display';
import { ImageHoverPreview } from '@/components/canary/molecules/image-hover-preview/image-hover-preview';

// --- Interfaces ---

/** Design-time configuration for ImageCellDisplay (no static props). */
export interface ImageCellDisplayStaticProps {}

/** Init configuration for ImageCellDisplay — field-level config. */
export interface ImageCellDisplayInitProps {
  /** Full image field configuration (entity labels, aspect ratio, size limits). */
  config: ImageFieldConfig;
}

/** Runtime configuration for ImageCellDisplay — live AG Grid data. */
export interface ImageCellDisplayRuntimeProps {
  /** Image URL from the row data. Null when no image is set. */
  value: string | null;
  /** Full row data record from AG Grid. */
  data: Record<string, unknown>;
}

/** Combined props for ImageCellDisplay. */
export type ImageCellDisplayProps = ImageCellDisplayStaticProps &
  ImageCellDisplayInitProps &
  ImageCellDisplayRuntimeProps;

/**
 * ImageCellDisplay &#8212; AG Grid cell renderer for image columns.
 *
 * Renders a thumbnail using ImageDisplay that fills the row height (minus a
 * 2px margin). Wrapped in ImageHoverPreview for a popover on hover.
 * Double-click opens the cell editor (ImageUploadDialog).
 *
 * Pass in a column definition:
 * ```ts
 * { field: 'imageUrl', cellRenderer: ImageCellDisplay, cellRendererParams: { config: ITEM_IMAGE_CONFIG } }
 * ```
 */
export function ImageCellDisplay({ config, value }: ImageCellDisplayProps) {
  // Normalize the AG Grid value to the `string | null` contract expected
  // by the child components. At runtime the field may be undefined (no
  // imageUrl on the row) or an empty string (legacy backend data); both
  // must render as "no image" so the cell shows the initials placeholder
  // and the hover popover shows the empty-state caption — not a broken
  // <img src="">.
  const normalizedImageUrl = typeof value === 'string' && value.length > 0 ? value : null;

  return (
    <div
      data-slot="image-cell-display"
      className={cn('flex items-center justify-center h-full py-[2px]')}
      style={{ minHeight: 28 }}
    >
      <ImageHoverPreview
        imageUrl={normalizedImageUrl}
        entityTypeDisplayName={config.entityTypeDisplayName}
        propertyDisplayName={config.propertyDisplayName}
      >
        <div className="rounded" style={{ width: 28, height: 28 }}>
          <ImageDisplay
            imageUrl={normalizedImageUrl}
            entityTypeDisplayName={config.entityTypeDisplayName}
            propertyDisplayName={config.propertyDisplayName}
          />
        </div>
      </ImageHoverPreview>
    </div>
  );
}
