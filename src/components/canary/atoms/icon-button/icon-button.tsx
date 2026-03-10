import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// --- Interfaces ---

/** Design-time configuration for ArdaIconButton. */
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

/** Runtime configuration for ArdaIconButton. */
export interface ArdaIconButtonRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** Badge count displayed as an overlay. When undefined, no badge is shown. */
  badgeCount?: number;
  /** Called when the button is clicked. */
  onClick?: () => void;
}

/** Combined props for ArdaIconButton. */
export interface ArdaIconButtonProps
  extends
    ArdaIconButtonStaticConfig,
    ArdaIconButtonRuntimeConfig,
    Omit<React.HTMLAttributes<HTMLButtonElement>, 'onClick'> {}

// --- Component ---

/**
 * ArdaIconButton — an icon-only button with optional notification badge and tooltip.
 *
 * Wraps shadcn/ui Button (ghost variant, icon size) and Tooltip.
 */
export function ArdaIconButton({
  icon: Icon,
  label,
  iconSize = 20,
  showTooltip = true,
  badgeCount,
  onClick,
  className,
  ...props
}: ArdaIconButtonProps) {
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
          className="absolute -top-1 -right-1 flex min-w-4 h-4 items-center justify-center rounded-full bg-foreground text-background text-[10px] font-semibold leading-none px-1"
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
