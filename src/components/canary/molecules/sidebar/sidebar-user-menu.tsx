'use client';

import { type LucideIcon, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

// --- Interfaces ---

/** A single action in the user menu flyout. */
export interface UserMenuAction {
  /** Unique key for React list rendering. */
  key: string;
  /** Display label. */
  label: string;
  /** Lucide icon shown before the label. */
  icon: LucideIcon;
  /** Called when this action is selected. */
  onClick: () => void;
  /** When true, renders with destructive styling (red text). */
  destructive?: boolean;
}

/** Design-time configuration for ArdaSidebarUserMenu. */
export interface ArdaSidebarUserMenuStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Whether the sidebar is in mobile mode. Controls dropdown placement direction. */
  isMobile?: boolean;
  /** Additional CSS classes. */
  className?: string;
}

/** Runtime configuration for ArdaSidebarUserMenu. */
export interface ArdaSidebarUserMenuRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** User information. */
  user: {
    name: string;
    email: string;
    avatar?: string;
    /** Role or subtitle shown below the name in the dropdown. */
    role?: string;
  };
  /** Menu actions rendered in the flyout dropdown. Logout should be last and marked destructive. */
  actions: UserMenuAction[];
}

/** Combined props for ArdaSidebarUserMenu. */
export interface ArdaSidebarUserMenuProps
  extends ArdaSidebarUserMenuStaticConfig, ArdaSidebarUserMenuRuntimeConfig {}

// --- Component ---

export function ArdaSidebarUserMenu({
  user,
  actions,
  isMobile = false,
  className,
}: ArdaSidebarUserMenuProps) {
  const initials = user.name
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Split actions: non-destructive first, then destructive (separated)
  const standardActions = actions.filter((a) => !a.destructive);
  const destructiveActions = actions.filter((a) => a.destructive);

  return (
    <SidebarFooter className={cn('p-2', className)}>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton tooltip={user.name}>
                <Avatar className="size-4 shrink-0 rounded-sm bg-sidebar-accent">
                  {user.avatar && <AvatarImage src={user.avatar} alt="" />}
                  <AvatarFallback className="rounded-sm bg-sidebar-accent text-sidebar-accent-foreground text-[10px] font-bold leading-none">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate font-medium text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden">
                  {user.name}
                </span>
                <ChevronsUpDown className="ml-auto size-4 shrink-0 text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-48 rounded-lg"
              side={isMobile ? 'bottom' : 'right'}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-semibold">{user.name}</p>
                {user.role && <p className="text-xs text-muted-foreground">{user.role}</p>}
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {standardActions.map((action) => (
                <DropdownMenuItem key={action.key} onClick={action.onClick}>
                  <action.icon />
                  {action.label}
                </DropdownMenuItem>
              ))}

              {destructiveActions.length > 0 && standardActions.length > 0 && (
                <DropdownMenuSeparator />
              )}

              {destructiveActions.map((action) => (
                <DropdownMenuItem key={action.key} onClick={action.onClick} variant="destructive">
                  <action.icon />
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
