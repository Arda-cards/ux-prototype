import type { LucideIcon } from 'lucide-react';

import { cn } from '@/types/canary/utilities/utils';
import { Button } from '@/components/canary/primitives/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/canary/primitives/tooltip';

// --- Interfaces ---

/** Design-time configuration for IconButton. */
export interface ArdaIconButtonStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Lucide icon component to render. */
  icon: LucideIcon;
  /** Accessible label — required since there's no visible text. */
  label: string;
  /** Icon size in pixels. Defaults to 20. */
  iconSize?: number;
  /** Whether to show a tooltip on hover. Defaults to true. */
  showTooltip?: boolean;
}

/** Runtime configuration for IconButton. */
export interface ArdaIconButtonRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** Badge count displayed as an overlay. When undefined, no badge is shown. */
  badgeCount?: number;
  /** Called when the button is clicked. */
  onClick?: () => void;
}

/** Combined props for IconButton. */
export interface IconButtonProps
  extends
    ArdaIconButtonStaticConfig,
    ArdaIconButtonRuntimeConfig,
    Omit<React.HTMLAttributes<HTMLButtonElement>, 'onClick'> {}

/** @deprecated Use IconButtonProps */
export type ArdaIconButtonProps = IconButtonProps;

// --- Component ---

/**
 * IconButton — an icon-only button with optional notification badge and tooltip.
 *
 * Wraps shadcn/ui Button (ghost variant, icon size) and Tooltip.
 *
 * @deprecated Use `Button` with `size="icon"` and the `tooltip` prop instead.
 * Badge overlays should be composed at point of use. See the Button atom docs
 * for migration examples.
 */
export function IconButton({
  icon: Icon,
  label,
  iconSize = 20,
  showTooltip = true,
  badgeCount,
  onClick,
  className,
  ...props
}: IconButtonProps) {
  const button = (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-label={label}
      className={cn('relative', className)}
      {...props}
    >
      <Icon size={iconSize} className="text-foreground" />
      {badgeCount !== undefined && badgeCount > 0 && (
        <span
          className="absolute -top-1 -right-1 flex min-w-4 h-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-semibold leading-none px-1"
          role="status"
          aria-label={`${badgeCount} notification${badgeCount === 1 ? '' : 's'}`}
        >
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}
    </Button>
  );

  if (!showTooltip) return button;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}

/** @deprecated Use IconButton */
export const ArdaIconButton = IconButton;
