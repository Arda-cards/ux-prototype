import { cn } from '@/types/canary/utilities/utils';
import { Badge as BadgeBase, badgeVariants } from './badge-base';
import type { VariantProps } from 'class-variance-authority';

// --- Interfaces ---

/** Static configuration for Badge. */
export interface ArdaBadgeStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Visual variant — maps directly to shadcn Badge variants. */
  variant?: VariantProps<typeof badgeVariants>['variant'];
  /** Maximum count before showing "+". Defaults to 99. */
  max?: number;
}

/** Runtime configuration for Badge. */
export interface ArdaBadgeRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** Numeric count — capped at 99+. When provided, renders as a live status region. */
  count?: number;
  /** Content to render. Ignored when `count` is provided. */
  children?: React.ReactNode;
}

/** Combined props for Badge. */
export interface BadgeProps
  extends
    ArdaBadgeStaticConfig,
    ArdaBadgeRuntimeConfig,
    Omit<React.ComponentProps<'span'>, 'children'> {}

/** @deprecated Use BadgeProps */
export type ArdaBadgeProps = BadgeProps;

// --- Component ---

/**
 * Badge — thin Arda wrapper around shadcn Badge.
 *
 * Supports a `count` prop that auto-caps at 99+ (or a custom `max`).
 * When `count` is provided the badge gets `role="status"` for live updates.
 * Falls back to rendering `children` for string/label badges.
 */
export function Badge({
  variant = 'default',
  count,
  max = 99,
  children,
  className,
  ...props
}: BadgeProps) {
  const isCount = count !== undefined;
  const display = isCount ? (count > max ? `${max}+` : String(count)) : children;

  return (
    <BadgeBase
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
    </BadgeBase>
  );
}

/** @deprecated Use Badge */
export const ArdaBadge = Badge;
