import { cn } from '@/lib/utils';
import { Badge, badgeVariants } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';

// --- Interfaces ---

/** Props for ArdaBadge. */
export interface ArdaBadgeProps extends React.ComponentProps<'span'> {
  /** Visual variant — maps directly to shadcn Badge variants. */
  variant?: VariantProps<typeof badgeVariants>['variant'];
}

// --- Component ---

/**
 * ArdaBadge — thin Arda wrapper around shadcn Badge.
 *
 * Passes through all shadcn variants unchanged.
 * Use className for context-specific sizing or color overrides.
 */
export function ArdaBadge({ variant = 'default', className, ...props }: ArdaBadgeProps) {
  return <Badge variant={variant} className={cn('text-2xs font-semibold', className)} {...props} />;
}
