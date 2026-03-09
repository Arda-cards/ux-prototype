'use client';

import { useMemo } from 'react';

import { cn } from '@/lib/utils';
import { SidebarProvider, type SidebarContextValue } from './sidebar-context';

// --- Interfaces ---

export interface ArdaSidebarProps {
  /** Whether the sidebar is in collapsed (icon-only) mode. */
  collapsed?: boolean;
  /** Sidebar content — compose with ArdaSidebarHeader, ArdaSidebarNav, ArdaSidebarUserMenu, etc. */
  children: React.ReactNode;
  /** Additional CSS classes applied to the aside element. */
  className?: string;
}

// --- Component ---

export function ArdaSidebar({ collapsed = false, children, className }: ArdaSidebarProps) {
  const ctx = useMemo<SidebarContextValue>(() => ({ collapsed }), [collapsed]);

  return (
    <SidebarProvider value={ctx}>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 bg-sidebar-bg text-white flex flex-col transition-all duration-200 z-50 overflow-hidden',
          collapsed ? 'w-[var(--sidebar-width-collapsed)]' : 'w-[var(--sidebar-width-expanded)]',
          className,
        )}
      >
        {/* Background gradient — the subtle warm glow */}
        <div
          className="absolute top-0 right-[-300px] w-[400px] h-full pointer-events-none skew-x-[-20deg] origin-top-right transition-colors"
          style={{
            background:
              'linear-gradient(180deg, var(--sidebar-gradient-end) 0%, var(--sidebar-gradient-start) 100%)',
          }}
        />

        {children}
      </aside>
    </SidebarProvider>
  );
}
