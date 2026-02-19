import { useState } from 'react';
import { ImageIcon, ImageOff } from 'lucide-react';
import { formatImageUrl } from '@/lib/data-types/formatters';

/** Design-time configuration for image cell display. */
export interface ImageCellDisplayStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Maximum width in pixels. */
  maxWidth?: number;
  /** Maximum height in pixels (default: 24). */
  maxHeight?: number;
  /** Alt text for the image. */
  alt?: string;
}

/** Runtime configuration for image cell display. */
export interface ImageCellDisplayRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** The image URL to display. */
  value?: string;
}

export interface ArdaImageCellDisplayProps
  extends ImageCellDisplayStaticConfig, ImageCellDisplayRuntimeConfig {}

/** Compact read-only image thumbnail renderer for AG Grid cells. */
export function ArdaImageCellDisplay({
  value,
  maxWidth,
  maxHeight = 24,
  alt = 'Image',
}: ArdaImageCellDisplayProps) {
  const [hasError, setHasError] = useState(false);
  const formatted = formatImageUrl(value);

  if (formatted === '—') {
    return (
      <span className="flex items-center justify-center text-muted-foreground" title="No image">
        <ImageIcon className="w-4 h-4" />
      </span>
    );
  }

  if (hasError) {
    return (
      <span className="flex items-center justify-center text-destructive/60" title="Invalid image">
        <ImageOff className="w-4 h-4" />
      </span>
    );
  }

  return (
    <img
      src={value}
      alt={alt}
      onError={() => setHasError(true)}
      style={{
        maxWidth: maxWidth ? `${maxWidth}px` : undefined,
        maxHeight: `${maxHeight}px`,
        objectFit: 'cover',
      }}
      className="rounded"
    />
  );
}
