import { Badge } from '@/components/canary/atoms/badge/badge';
import { cn } from '@/types/canary/utilities/utils';

// --- Types ---

export interface TokenListProps {
  /** The token values to render, one Badge each. */
  values: string[];
  /** Badge variant — `secondary` (filled) for multi-token, `outline` for single, by convention. */
  variant?: 'secondary' | 'outline';
  /** Placeholder shown when there are no values. Defaults to an em dash. */
  emptyText?: string;
  /** Additional CSS classes applied to the container. */
  className?: string;
}

// --- Component ---

/**
 * TokenList — read-mode display for token cells (roles, order methods, tags…).
 *
 * Renders one {@link Badge} per value on a single line, clipping overflow rather
 * than wrapping (so it never balloons a grid row's height). Shared by the grid
 * cell renderer and any form display so the two can't drift. Pairs with the
 * typeahead / multiselect editors via {@link createTokenDataType}.
 */
export function TokenList({
  values,
  variant = 'secondary',
  emptyText = '—',
  className,
}: TokenListProps) {
  if (values.length === 0) {
    return <span className="text-muted-foreground text-xs">{emptyText}</span>;
  }

  return (
    <div className={cn('flex h-full items-center gap-1 overflow-hidden', className)}>
      {values.map((value) => (
        <Badge key={value} variant={variant} className="shrink-0 whitespace-nowrap">
          {value}
        </Badge>
      ))}
    </div>
  );
}
