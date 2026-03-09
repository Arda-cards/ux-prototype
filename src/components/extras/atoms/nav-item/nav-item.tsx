'use client';

import { type LucideIcon } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// --- CVA variant definition ---

const navItemVariants = cva(
  'relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150 outline-none',
  {
    variants: {
      variant: {
        dark: 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-bg',
        light:
          'text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      },
      active: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        variant: 'dark',
        active: true,
        className: 'bg-sidebar-active-bg text-sidebar-text-active font-medium',
      },
      {
        variant: 'light',
        active: true,
        className: 'bg-accent text-accent-foreground font-medium',
      },
    ],
    defaultVariants: { variant: 'dark', active: false },
  },
);

// --- Interfaces ---

/** Props for ArdaNavItem. */
export interface ArdaNavItemProps extends Omit<VariantProps<typeof navItemVariants>, 'active'> {
  /* --- Model / Data Binding --- */
  /** Navigation target URL. */
  href: string;
  /** Whether this item is the currently active route. */
  active?: boolean;
  /** Notification count or status text displayed as a badge. */
  badge?: number | string;

  /* --- View / Layout / Controller --- */
  /** Lucide icon component rendered before the label. */
  icon: LucideIcon;
  /** Text label for the navigation item. */
  label: string;
  /** When true, renders in compact icon-only mode with tooltip. */
  collapsed?: boolean;
  /** Additional CSS classes. */
  className?: string;
  /** Called when the nav item is clicked. Receives the href. */
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

// --- Component ---

export function ArdaNavItem({
  href,
  active = false,
  badge,
  icon: Icon,
  label,
  collapsed = false,
  variant = 'dark',
  className,
  onClick,
}: ArdaNavItemProps) {
  const link = (
    <a
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(navItemVariants({ variant, active }), className)}
    >
      {/* Active indicator — orange bar on the left */}
      {active && variant === 'dark' && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-sidebar-active-indicator rounded-r-full" />
      )}

      <Icon size={18} className="shrink-0" aria-hidden="true" />

      {/* Label — sr-only when collapsed, visible when expanded */}
      <span className={cn('truncate', collapsed && 'sr-only')}>{label}</span>

      {/* Badge */}
      {badge !== undefined && !collapsed && (
        <span className="ml-auto inline-flex items-center justify-center rounded-full bg-sidebar-active-indicator px-1.5 py-0.5 text-xs font-bold text-white min-w-[20px]">
          {badge}
        </span>
      )}
    </a>
  );

  // Wrap in tooltip when collapsed
  if (collapsed) {
    return (
      <li>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              <span className="flex items-center gap-2">
                {label}
                {badge !== undefined && (
                  <span className="inline-flex items-center justify-center rounded-full bg-sidebar-active-indicator px-1.5 py-0.5 text-xs font-bold text-white min-w-[20px]">
                    {badge}
                  </span>
                )}
              </span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </li>
    );
  }

  return <li>{link}</li>;
}

export { navItemVariants };
