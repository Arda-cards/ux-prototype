import { cn } from '@/types/canary/utilities/utils';
import type { ImageFieldConfig } from '@/types/canary/utilities/image-field-config';
import { ImageDisplay } from '@/components/canary/molecules/image-display/image-display';
import { ImagePreviewPopover } from '@/components/canary/molecules/image-preview-popover/image-preview-popover';

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
  /**
   * Called when the thumbnail fails to load. Forwarded to the underlying
   * `<img>`. Consumers use this to drive recovery — e.g. refreshing CDN
   * signed cookies and retrying after a 403.
   */
  onError?: (() => void) | undefined;
  /** Called when the thumbnail loads successfully. */
  onLoad?: (() => void) | undefined;
  /** Human-readable failure reason, shown on hover in the error state. */
  errorReason?: string | undefined;
  /**
   * The URL is not resolvable yet (e.g. CDN credentials still in flight), as
   * opposed to absent. Renders a skeleton and issues no request.
   */
  imagePending?: boolean | undefined;
}

/** Combined props for ImageCellDisplay. */
export type ImageCellDisplayProps = ImageCellDisplayStaticProps &
  ImageCellDisplayInitProps &
  ImageCellDisplayRuntimeProps;

/**
 * ImageCellDisplay &#8212; AG Grid cell renderer for image columns.
 *
 * Renders a thumbnail using ImageDisplay that fills the row height (minus a
 * 2px margin). When an image is set, the thumbnail is a button that opens an
 * ImagePreviewPopover on click; single clicks stop propagating so they don't
 * select the row, while double-click still bubbles to open the cell editor
 * (ImageUploadDialog).
 *
 * Pass in a column definition:
 * ```ts
 * { field: 'imageUrl', cellRenderer: ImageCellDisplay, cellRendererParams: { config: ITEM_IMAGE_CONFIG } }
 * ```
 */
export function ImageCellDisplay({
  config,
  value,
  onError,
  onLoad,
  errorReason,
  imagePending,
}: ImageCellDisplayProps) {
  // Normalize the AG Grid value to the `string | null` contract expected
  // by the child components. At runtime the field may be undefined (no
  // imageUrl on the row) or an empty string (legacy backend data); both
  // must render as "no image" so the cell shows the initials placeholder
  // with no preview trigger — not a broken <img src="">.
  const normalizedImageUrl = typeof value === 'string' && value.length > 0 ? value : null;

  const thumbnail = (
    <ImageDisplay
      imageUrl={normalizedImageUrl}
      entityTypeDisplayName={config.entityTypeDisplayName}
      propertyDisplayName={config.propertyDisplayName}
      onError={onError}
      onLoad={onLoad}
      errorReason={errorReason}
      imagePending={imagePending}
    />
  );

  return (
    <div
      data-slot="image-cell-display"
      className={cn('flex items-center justify-center h-full py-[2px]')}
      style={{ minHeight: 28 }}
    >
      {normalizedImageUrl !== null ? (
        <ImagePreviewPopover
          imageUrl={normalizedImageUrl}
          entityTypeDisplayName={config.entityTypeDisplayName}
          propertyDisplayName={config.propertyDisplayName}
        >
          <button
            type="button"
            aria-label={`Preview ${config.propertyDisplayName}`}
            className="rounded overflow-hidden cursor-pointer"
            style={{ width: 28, height: 28 }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {thumbnail}
          </button>
        </ImagePreviewPopover>
      ) : (
        <div className="rounded" style={{ width: 28, height: 28 }}>
          {thumbnail}
        </div>
      )}
    </div>
  );
}
