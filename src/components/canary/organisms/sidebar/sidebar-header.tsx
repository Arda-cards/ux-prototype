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

export interface ArdaSidebarHeaderProps {
  /** Team or workspace name displayed next to the logo. */
  teamName?: string;
  /** When provided, renders a team switcher dropdown. */
  teams?: TeamOption[];
  /** Additional CSS classes. */
  className?: string;
  /** Optional children to render instead of the default logo + team name. */
  children?: React.ReactNode;
}

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

  // Non-interactive header (default)
  if (!teams || teams.length === 0) {
    return (
      <SidebarHeader className={cn('p-2', className)}>
        <div className="flex h-8 items-center gap-2 px-2">
          <ArdaBrandIcon variant="mono-light" className="size-4 min-w-4 shrink-0" />
          <span className="truncate font-semibold text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden">
            {name}
          </span>
        </div>
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
                <ArdaBrandIcon variant="mono-light" className="size-4 min-w-4 shrink-0" />
                <span className="truncate font-semibold text-sidebar-accent-foreground">
                  {name}
                </span>
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
