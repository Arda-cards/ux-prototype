import { cn } from '@/utils';
import { Badge, badgeVariants } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';

// --- Interfaces ---

/** Static configuration for ArdaBadge. */
export interface ArdaBadgeStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Visual variant — maps directly to shadcn Badge variants. */
  variant?: VariantProps<typeof badgeVariants>['variant'];
  /** Maximum count before showing "+". Defaults to 99. */
  max?: number;
}

/** Runtime configuration for ArdaBadge. */
export interface ArdaBadgeRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** Numeric count — capped at 99+. When provided, renders as a live status region. */
  count?: number;
  /** Content to render. Ignored when `count` is provided. */
  children?: React.ReactNode;
}

/** Combined props for ArdaBadge. */
export interface ArdaBadgeProps
  extends
    ArdaBadgeStaticConfig,
    ArdaBadgeRuntimeConfig,
    Omit<React.ComponentProps<'span'>, 'children'> {}

// --- Component ---

/**
 * ArdaBadge — thin Arda wrapper around shadcn Badge.
 *
 * Supports a `count` prop that auto-caps at 99+ (or a custom `max`).
 * When `count` is provided the badge gets `role="status"` for live updates.
 * Falls back to rendering `children` for string/label badges.
 */
export function ArdaBadge({
  variant = 'default',
  count,
  max = 99,
  children,
  className,
  ...props
}: ArdaBadgeProps) {
  const isCount = count !== undefined;
  const display = isCount ? (count > max ? `${max}+` : String(count)) : children;

  return (
    <Badge
      variant={variant}
      className={cn(
        'rounded-md px-[5px] py-px text-[10px] leading-none font-semibold font-mono tabular-nums',
        variant === 'default' && 'bg-sidebar-primary text-sidebar-primary-foreground',
        className,
      )}
      {...(isCount && { role: 'status' })}
      {...props}
    >
      {display}
    </Badge>
  );
}
