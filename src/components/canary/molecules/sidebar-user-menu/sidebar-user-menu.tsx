'use client';

import { LogOut, Settings } from 'lucide-react';

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

/** Props for ArdaSidebarUserMenu. */
export interface ArdaSidebarUserMenuProps {
  /* --- Model / Data Binding --- */
  /** User information. */
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  /** Called when logout is selected. */
  onLogout?: () => void;
  /** Called when settings is selected. */
  onSettings?: () => void;

  /* --- View / Layout / Controller --- */
  /** When true, renders in compact mode (avatar only). */
  collapsed?: boolean;
  /** Additional CSS classes. */
  className?: string;
}

// --- Component ---

export function ArdaSidebarUserMenu({
  user,
  onLogout,
  onSettings,
  collapsed = false,
  className,
}: ArdaSidebarUserMenuProps) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn('relative z-10 border-t border-sidebar-border p-3', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              'flex w-full items-center gap-3 rounded-md p-1 text-left outline-none transition-colors duration-150',
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

        <DropdownMenuContent side="right" align="end" sideOffset={8}>
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
          {onSettings && (
            <DropdownMenuItem onClick={onSettings}>
              <Settings size={14} />
              Settings
            </DropdownMenuItem>
          )}
          {onLogout && (
            <DropdownMenuItem onClick={onLogout} variant="destructive">
              <LogOut size={14} />
              Log out
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
