'use client';

import { cn } from '@/lib/utils';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronsUpDown } from 'lucide-react';

import { ArdaBrandIcon } from '../../atoms/brand-logo/brand-logo';

// --- Interfaces ---

export interface TeamOption {
  /** Unique key for React list rendering. */
  key: string;
  /** Display name. */
  name: string;
  /** Called when this team is selected. */
  onSelect: () => void;
}

/** Design-time configuration for ArdaSidebarHeader. */
export interface ArdaSidebarHeaderStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Team or workspace name displayed next to the logo. */
  teamName?: string;
  /** Additional CSS classes. */
  className?: string;
  /** Optional children to render instead of the default logo + team name. */
  children?: React.ReactNode;
}

/** Runtime configuration for ArdaSidebarHeader. */
export interface ArdaSidebarHeaderRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** When provided, renders a team switcher dropdown. */
  teams?: TeamOption[];
}

/** Combined props for ArdaSidebarHeader. */
export interface ArdaSidebarHeaderProps
  extends ArdaSidebarHeaderStaticConfig, ArdaSidebarHeaderRuntimeConfig {}

// --- Component ---

export function ArdaSidebarHeader({
  teamName,
  teams,
  children,
  className,
}: ArdaSidebarHeaderProps) {
  if (children) {
    return <SidebarHeader className={className}>{children}</SidebarHeader>;
  }

  const name = teamName ?? 'Arda';

  const brandMark = (
    <>
      <ArdaBrandIcon variant="light" className="size-4 min-w-4 shrink-0" />
      <span className="truncate font-semibold text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden">
        {name}
      </span>
    </>
  );

  // Non-interactive header (default) — uses SidebarMenuButton for consistent collapsed centering
  if (!teams || teams.length === 0) {
    return (
      <SidebarHeader className={cn('p-2', className)}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={name}>{brandMark}</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
    );
  }

  // Interactive header with team switcher
  return (
    <SidebarHeader className={cn('p-2', className)}>
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
    </SidebarHeader>
  );
}
