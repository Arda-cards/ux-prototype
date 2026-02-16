import { ExternalLink } from 'lucide-react';
import { formatUrl } from '@/lib/data-types/formatters';
import { cn } from '@/lib/utils';
import { FieldLabel, type FieldLabelProps } from '../field-label';

/** Design-time configuration for URL field display. */
export interface UrlFieldDisplayStaticConfig extends FieldLabelProps {
  /* --- View / Layout / Controller --- */
  /** Display format: link or button. */
  displayFormat?: 'link' | 'button';
  /** Button label (for button format). */
  buttonLabel?: string;
  /** Open in new tab (default: true). */
  openInNewTab?: boolean;
}

/** Runtime configuration for URL field display. */
export interface UrlFieldDisplayRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** The URL value to display. */
  value?: string;
}

export interface ArdaUrlFieldDisplayProps
  extends UrlFieldDisplayStaticConfig, UrlFieldDisplayRuntimeConfig {}

/** Read-only URL display for form fields. */
export function ArdaUrlFieldDisplay({
  value,
  displayFormat = 'link',
  buttonLabel = 'Open',
  openInNewTab = true,
  label,
  labelPosition,
}: ArdaUrlFieldDisplayProps) {
  const formatted = formatUrl(value);

  if (formatted === '—') {
    return (
      <FieldLabel label={label} labelPosition={labelPosition}>
        <div className="px-3 py-2 text-sm text-foreground bg-muted/30 rounded-lg border border-transparent min-h-[36px] flex items-center">
          {formatted}
        </div>
      </FieldLabel>
    );
  }

  if (displayFormat === 'button') {
    return (
      <FieldLabel label={label} labelPosition={labelPosition}>
        <div className="px-3 py-2 bg-muted/30 rounded-lg border border-transparent min-h-[36px] flex items-center">
          <a
            href={value}
            target={openInNewTab ? '_blank' : '_self'}
            rel={openInNewTab ? 'noopener noreferrer' : undefined}
            className={cn(
              'inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded',
              'bg-primary text-primary-foreground hover:bg-primary/90',
              'transition-colors',
            )}
          >
            <span>{buttonLabel}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </FieldLabel>
    );
  }

  // Link format
  return (
    <FieldLabel label={label} labelPosition={labelPosition}>
      <div className="px-3 py-2 text-sm bg-muted/30 rounded-lg border border-transparent min-h-[36px] flex items-center">
        <a
          href={value}
          target={openInNewTab ? '_blank' : '_self'}
          rel={openInNewTab ? 'noopener noreferrer' : undefined}
          className="text-blue-600 hover:underline truncate"
        >
          {formatted}
        </a>
      </div>
    </FieldLabel>
  );
}
