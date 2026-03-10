'use client';

import { type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { ArdaBadge } from '../../atoms/badge/badge';

// --- Interfaces ---

/** Props for ArdaSidebarNavItem. */
export interface ArdaSidebarNavItemProps {
  /* --- Model / Data Binding --- */
  /** Whether this item is the currently active route. */
  active?: boolean;
  /** Count badge (number or short label), or `true` for a dot indicator. */
  badge?: number | string | true;

  /* --- View / Layout / Controller --- */
  /** Lucide icon component rendered before the label. */
  icon: LucideIcon;
  /** Text label for the navigation item. */
  label: string;
  /** Additional CSS classes. */
  className?: string;
  /** Called when the nav item is clicked. Use with router.push() for navigation. */
  onClick?: (e: React.MouseEvent) => void;
}

// --- Component ---

/**
 * ArdaSidebarNavItem — wraps shadcn SidebarMenuItem + SidebarMenuButton.
 *
 * Renders a button by default. Consumers handle navigation via onClick
 * (e.g. router.push). Tooltips in collapsed mode, badges, and active
 * state are all handled by the shadcn primitives.
 */
export function ArdaSidebarNavItem({
  active = false,
  badge,
  icon: Icon,
  label,
  className,
  onClick,
}: ArdaSidebarNavItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={active}
        tooltip={label}
        className={cn('data-[active=true]:font-medium', className)}
        onClick={onClick}
      >
        <Icon />
        <span>{label}</span>
      </SidebarMenuButton>
      {badge !== undefined && (
        <>
          {/* Dot — vertically centered when expanded, top-right when collapsed */}
          <span
            className={cn(
              'pointer-events-none absolute size-1.5 rounded-full bg-sidebar-primary transition-none',
              'right-2 top-1/2 -translate-y-1/2',
              'group-data-[collapsible=icon]:right-0.5 group-data-[collapsible=icon]:top-0.5 group-data-[collapsible=icon]:translate-y-0',
              badge !== true && 'hidden group-data-[collapsible=icon]:block',
            )}
            aria-label="New activity"
          />
          {/* Count — visible when expanded */}
          {badge !== true && (
            <ArdaBadge
              variant="default"
              className="absolute right-2 top-1/2 -translate-y-1/2 tabular-nums group-data-[collapsible=icon]:hidden"
            >
              {badge}
            </ArdaBadge>
          )}
        </>
      )}
    </SidebarMenuItem>
  );
}
