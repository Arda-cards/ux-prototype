'use client';

import { type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { ArdaBadge } from '../../atoms/badge/badge';

// --- Interfaces ---

/** Design-time configuration for SidebarNavItem. */
export interface SidebarNavItemStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Lucide icon component rendered before the label. */
  icon: LucideIcon;
  /** Text label for the navigation item. */
  label: string;
  /** Additional CSS classes. */
  className?: string;
}

/** Runtime configuration for SidebarNavItem. */
export interface SidebarNavItemRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** Whether this item is the currently active route. */
  active?: boolean;
  /** Count badge (number or short label), or `true` for a dot indicator. */
  badge?: number | string | true;
  /** Called when the nav item is clicked. Use with router.push() for navigation. */
  onClick?: (e: React.MouseEvent) => void;
}

/** Combined props for SidebarNavItem. */
export interface SidebarNavItemProps
  extends SidebarNavItemStaticConfig, SidebarNavItemRuntimeConfig {}

// --- Component ---

/**
 * SidebarNavItem — wraps shadcn SidebarMenuItem + SidebarMenuButton.
 *
 * Renders a button by default. Consumers handle navigation via onClick
 * (e.g. router.push). Tooltips in collapsed mode, badges, and active
 * state are all handled by the shadcn primitives.
 */
export function SidebarNavItem({
  active = false,
  badge,
  icon: Icon,
  label,
  className,
  onClick,
}: SidebarNavItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={active}
        tooltip={label}
        className={cn('data-[active=true]:font-medium', className)}
        onClick={onClick}
        aria-current={active ? 'page' : undefined}
      >
        <Icon />
        <span>{label}</span>
      </SidebarMenuButton>
      {badge !== undefined && (
        <>
          {/* Dot — always rendered, visible only when collapsed (for count badges) or always (for dot-only) */}
          <span
            className={cn(
              'pointer-events-none absolute size-1.5 rounded-full bg-sidebar-primary',
              'transition-opacity duration-150 motion-reduce:transition-none',
              'right-2 top-1/2 -translate-y-1/2',
              'group-data-[collapsible=icon]:right-0.5 group-data-[collapsible=icon]:top-0.5 group-data-[collapsible=icon]:translate-y-0',
              badge !== true ? 'opacity-0 group-data-[collapsible=icon]:opacity-100' : '',
            )}
            role={badge === true ? 'status' : undefined}
            aria-label={badge === true ? 'New activity' : undefined}
            aria-hidden={badge !== true ? true : undefined}
          />
          {/* Count — fades out when collapsing, fades in when expanding */}
          {badge !== true && (
            <ArdaBadge
              variant="default"
              {...(typeof badge === 'number' && { count: badge })}
              className="absolute right-2 top-1/2 -translate-y-1/2 tabular-nums transition-opacity duration-150 motion-reduce:transition-none group-data-[collapsible=icon]:opacity-0"
            >
              {typeof badge === 'string' ? badge : undefined}
            </ArdaBadge>
          )}
        </>
      )}
    </SidebarMenuItem>
  );
}
