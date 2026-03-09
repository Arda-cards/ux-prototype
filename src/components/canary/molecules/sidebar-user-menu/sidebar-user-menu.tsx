'use client';

import { type LucideIcon, LogOut } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

/** Props for ArdaSidebarUserMenu. */
export interface ArdaSidebarUserMenuProps {
  /* --- Model / Data Binding --- */
  /** User information. */
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  /** Menu actions rendered in the flyout dropdown. Logout should be last and marked destructive. */
  actions: UserMenuAction[];

  /* --- View / Layout / Controller --- */
  /** When true, renders in compact mode (avatar only). */
  collapsed?: boolean;
  /** Additional CSS classes. */
  className?: string;
}

// --- Component ---

export function ArdaSidebarUserMenu({
  user,
  actions,
  collapsed = false,
  className,
}: ArdaSidebarUserMenuProps) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Split actions: non-destructive first, then destructive (separated)
  const standardActions = actions.filter((a) => !a.destructive);
  const destructiveActions = actions.filter((a) => a.destructive);

  return (
    <div className={cn('relative z-10 border-t border-sidebar-border p-3 h-16', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Account menu for ${user.name}`}
            className={cn(
              'flex w-full items-center gap-3 rounded-md p-1 text-left outline-none transition-colors duration-150 motion-reduce:transition-none',
              'hover:bg-sidebar-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-bg',
              collapsed && 'justify-center',
            )}
          >
            <Avatar size="sm" className="bg-white/20">
              {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
              <AvatarFallback className="bg-white/20 text-white text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Name and email — sr-only when collapsed */}
            <div className={cn('flex-1 min-w-0', collapsed && 'sr-only')}>
              <p className="text-sm font-semibold text-sidebar-text-active truncate leading-tight">
                {user.name}
              </p>
              <p className="text-xs text-sidebar-text-muted truncate leading-tight">{user.email}</p>
            </div>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="top" align="start" sideOffset={8}>
          {/* Show user info in dropdown when collapsed (since it's sr-only in the trigger) */}
          {collapsed && (
            <>
              <div className="px-2 py-1.5">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
            </>
          )}

          {standardActions.map((action) => (
            <DropdownMenuItem key={action.key} onClick={action.onClick}>
              <action.icon size={14} />
              {action.label}
            </DropdownMenuItem>
          ))}

          {destructiveActions.length > 0 && standardActions.length > 0 && <DropdownMenuSeparator />}

          {destructiveActions.map((action) => (
            <DropdownMenuItem key={action.key} onClick={action.onClick} variant="destructive">
              <action.icon size={14} />
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
