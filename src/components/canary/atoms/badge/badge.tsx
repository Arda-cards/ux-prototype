import { cn } from '@/types/canary/utilities/utils';
import { Badge as BadgeBase, badgeVariants } from './badge-base';
import type { VariantProps } from 'class-variance-authority';

// --- Interfaces ---

/** Static configuration for Badge. */
export interface ArdaBadgeStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Visual variant — maps directly to shadcn Badge variants. */
  variant?: VariantProps<typeof badgeVariants>['variant'];
  /** Size — sm (16px) or default (20px). */
  size?: VariantProps<typeof badgeVariants>['size'];
  /** Maximum count before showing "+". Defaults to 99. */
  max?: number;
  /** Icon component rendered before children. */
  icon?: React.ComponentType<{ className?: string }>;
  /** Additional CSS classes applied to the icon (e.g. color). */
  iconColor?: string;
  /** When true, renders icon-only at rest and expands to show children on hover. */
  collapsible?: boolean;
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
 *
 * When `icon` is provided, renders the icon before the content.
 * When `collapsible` is true, shows icon-only at rest and expands on hover.
 */
export function Badge({
  variant = 'default',
  size = 'default',
  count,
  max = 99,
  icon,
  iconColor,
  collapsible,
  children,
  className,
  ...props
}: BadgeProps) {
  const isCount = count !== undefined;
  const display = isCount ? (count > max ? `${max}+` : String(count)) : children;

  return (
    <BadgeBase
      variant={variant}
      size={size}
      {...(icon ? { icon } : {})}
      {...(iconColor ? { iconColor } : {})}
      {...(collapsible ? { collapsible } : {})}
      className={cn(
        isCount && 'font-mono tabular-nums',
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
