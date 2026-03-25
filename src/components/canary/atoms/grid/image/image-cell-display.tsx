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
 * Renders a 32&#215;32 thumbnail using ImageDisplay, wrapped in ImageHoverPreview
 * for a 256&#215;256 popover on hover. Action icons (Eye, Pencil) appear on hover:
 * - **Eye** (inspect): suppressed when value is null.
 * - **Pencil** (edit): always visible on hover.
 *
 * Pass in a column definition:
 * ```ts
 * { field: 'imageUrl', cellRenderer: ImageCellDisplay, cellRendererParams: { config: ITEM_IMAGE_CONFIG } }
 * ```
 */
export function ImageCellDisplay({ config, value }: ImageCellDisplayProps) {
  return (
    <div data-slot="image-cell-display" className={cn('flex items-center justify-center w-8 h-8')}>
      <ImageHoverPreview
        imageUrl={value}
        entityTypeDisplayName={config.entityTypeDisplayName}
        propertyDisplayName={config.propertyDisplayName}
      >
        <div className="w-8 h-8 rounded overflow-hidden">
          <ImageDisplay
            imageUrl={value}
            entityTypeDisplayName={config.entityTypeDisplayName}
            propertyDisplayName={config.propertyDisplayName}
          />
        </div>
      </ImageHoverPreview>
    </div>
  );
}
