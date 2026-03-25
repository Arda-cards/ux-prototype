'use client';

import { cn } from '@/types/canary/utilities/utils';
import {
  SidebarHeader as SidebarHeaderPrimitive,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/canary/primitives/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/canary/primitives/dropdown-menu';
import { ChevronsUpDown } from 'lucide-react';

import { BrandIcon } from '../../atoms/brand-logo/brand-logo';

// --- Interfaces ---

export interface TeamOption {
  /** Unique key for React list rendering. */
  key: string;
  /** Display name. */
  name: string;
  /** Called when this team is selected. */
  onSelect: () => void;
}

/** Static configuration for SidebarHeader. */
export interface ArdaSidebarHeaderStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Team or workspace name displayed next to the logo. */
  teamName?: string;
  /** Optional children to render instead of the default logo + team name. */
  children?: React.ReactNode;
}

/** Runtime configuration for SidebarHeader. */
export interface ArdaSidebarHeaderRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** When provided, renders a team switcher dropdown. */
  teams?: TeamOption[];
}

/** Combined props for SidebarHeader. */
export interface SidebarHeaderProps
  extends ArdaSidebarHeaderStaticConfig, ArdaSidebarHeaderRuntimeConfig {
  /** Additional CSS classes. */
  className?: string;
}

/** @deprecated Use SidebarHeaderProps */
export type ArdaSidebarHeaderProps = SidebarHeaderProps;

// --- Component ---

export function SidebarHeader({ teamName, teams, children, className }: SidebarHeaderProps) {
  if (children) {
    return <SidebarHeaderPrimitive className={className}>{children}</SidebarHeaderPrimitive>;
  }

  const name = teamName ?? 'Arda';

  const brandMark = (
    <>
      <BrandIcon className="size-4 min-w-4 shrink-0" />
      <span className="truncate font-semibold text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden">
        {name}
      </span>
    </>
  );

  // Non-interactive header (default) — uses SidebarMenuButton for consistent collapsed centering
  if (!teams || teams.length === 0) {
    return (
      <SidebarHeaderPrimitive className={cn('p-2', className)}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={name}>{brandMark}</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeaderPrimitive>
    );
  }

  // Interactive header with team switcher
  return (
    <SidebarHeaderPrimitive className={cn('p-2', className)}>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton>
                {brandMark}
                <ChevronsUpDown className="ml-auto size-4 shrink-0 text-sidebar-foreground/70" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-48"
              align="start"
            >
              {teams.map((team) => (
                <DropdownMenuItem key={team.key} onClick={team.onSelect}>
                  {team.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeaderPrimitive>
  );
}

/** @deprecated Use SidebarHeader */
export const ArdaSidebarHeader = SidebarHeader;
