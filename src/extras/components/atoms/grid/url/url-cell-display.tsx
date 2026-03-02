import { ExternalLink } from 'lucide-react';
import { formatUrl } from '@/lib/data-types/formatters';
import { cn } from '@/lib/utils';

/** Design-time configuration for URL cell display. */
export interface UrlCellDisplayStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Display format: link or button. */
  displayFormat?: 'link' | 'button';
  /** Button label (for button format). */
  buttonLabel?: string;
  /** Open in new tab (default: true). */
  openInNewTab?: boolean;
  /** Maximum characters before truncation (for link format). */
  maxLength?: number;
}

/** Runtime configuration for URL cell display. */
export interface UrlCellDisplayRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** The URL value to display. */
  value?: string;
}

export interface ArdaUrlCellDisplayProps
  extends UrlCellDisplayStaticConfig, UrlCellDisplayRuntimeConfig {}

/** Compact read-only URL renderer for AG Grid cells. */
export function ArdaUrlCellDisplay({
  value,
  displayFormat = 'link',
  buttonLabel = 'Open',
  openInNewTab = true,
  maxLength,
}: ArdaUrlCellDisplayProps) {
  const formatted = formatUrl(value);

  if (formatted === '—') {
    return (
      <span className="truncate text-sm leading-normal text-muted-foreground">{formatted}</span>
    );
  }

  if (displayFormat === 'button') {
    return (
      <a
        href={value}
        target={openInNewTab ? '_blank' : '_self'}
        rel={openInNewTab ? 'noopener noreferrer' : undefined}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'inline-flex items-center gap-1 px-2 py-1 text-xs rounded',
          'bg-primary text-primary-foreground hover:bg-primary/90',
          'transition-colors',
        )}
      >
        <span>{buttonLabel}</span>
        <ExternalLink className="w-3 h-3" />
      </a>
    );
  }

  // Link format
  let displayText = formatted;
  if (maxLength && displayText.length > maxLength) {
    displayText = displayText.slice(0, maxLength) + '…';
  }

  return (
    <a
      href={value}
      target={openInNewTab ? '_blank' : '_self'}
      rel={openInNewTab ? 'noopener noreferrer' : undefined}
      onClick={(e) => e.stopPropagation()}
      className="truncate text-sm leading-normal text-blue-600 hover:underline"
    >
      {displayText}
    </a>
  );
}
