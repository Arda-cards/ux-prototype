import { useState } from 'react';
import { ImageIcon, ImageOff } from 'lucide-react';
import { formatImageUrl } from '@/lib/data-types/formatters';
import { FieldLabel, type FieldLabelProps } from '../field-label';

/** Design-time configuration for image field display. */
export interface ImageFieldDisplayStaticConfig extends FieldLabelProps {
  /* --- View / Layout / Controller --- */
  /** Maximum width in pixels. */
  maxWidth?: number;
  /** Maximum height in pixels (default: 120). */
  maxHeight?: number;
  /** Alt text for the image. */
  alt?: string;
}

/** Runtime configuration for image field display. */
export interface ImageFieldDisplayRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** The image URL to display. */
  value?: string;
}

export interface ArdaImageFieldDisplayProps
  extends ImageFieldDisplayStaticConfig, ImageFieldDisplayRuntimeConfig {}

/** Read-only image display for form fields. */
export function ArdaImageFieldDisplay({
  value,
  maxWidth,
  maxHeight = 120,
  alt = 'Image',
  label,
  labelPosition,
}: ArdaImageFieldDisplayProps) {
  const [hasError, setHasError] = useState(false);
  const formatted = formatImageUrl(value);

  if (formatted === '—') {
    return (
      <FieldLabel label={label} labelPosition={labelPosition}>
        <div className="px-3 py-2 text-sm text-foreground bg-muted/30 rounded-lg border border-transparent min-h-[120px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageIcon className="w-8 h-8" />
            <span className="text-xs">No image</span>
          </div>
        </div>
      </FieldLabel>
    );
  }

  if (hasError) {
    return (
      <FieldLabel label={label} labelPosition={labelPosition}>
        <div className="px-3 py-2 text-sm text-foreground bg-muted/30 rounded-lg border border-transparent min-h-[120px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-destructive/60">
            <ImageOff className="w-8 h-8" />
            <span className="text-xs">Invalid image</span>
          </div>
        </div>
      </FieldLabel>
    );
  }

  return (
    <FieldLabel label={label} labelPosition={labelPosition}>
      <div className="px-3 py-2 bg-muted/30 rounded-lg border border-transparent flex flex-col gap-2">
        <img
          src={value}
          alt={alt}
          onError={() => setHasError(true)}
          style={{
            maxWidth: maxWidth ? `${maxWidth}px` : '100%',
            maxHeight: `${maxHeight}px`,
            objectFit: 'cover',
          }}
          className="rounded border border-border"
        />
        <div className="text-xs text-muted-foreground truncate">{value}</div>
      </div>
    </FieldLabel>
  );
}
