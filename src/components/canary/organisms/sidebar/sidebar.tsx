'use client';

import { cn } from '@/lib/utils';
import { SidebarProvider, Sidebar, SidebarRail } from '@/components/ui/sidebar';

// --- Interfaces ---

export interface ArdaSidebarProps {
  /** Default open state (uncontrolled). */
  defaultOpen?: boolean;
  /** Controlled open state. */
  open?: boolean;
  /** Called when sidebar open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Sidebar content — compose with ArdaSidebarHeader, nav items, ArdaSidebarUserMenu, etc. */
  children: React.ReactNode;
  /** Content to render outside the sidebar but inside the provider (e.g. SidebarInset). */
  page?: React.ReactNode;
  /** Additional CSS classes applied to the sidebar. */
  className?: string;
}

// --- Component ---

/**
 * ArdaSidebar — Arda-branded wrapper around shadcn Sidebar.
 *
 * Provides: mobile Sheet, Cmd+B keyboard shortcut, cookie persistence,
 * icon-only collapsed mode with tooltips — all from shadcn primitives.
 *
 * Uses `collapsible="icon"` to collapse to icon-only mode (not offcanvas).
 */
export function ArdaSidebar({
  defaultOpen = true,
  open,
  onOpenChange,
  children,
  page,
  className,
}: ArdaSidebarProps) {
  // Only spread defined props — shadcn's exactOptionalPropertyTypes
  // rejects `undefined` for optional props.
  const providerProps = {
    defaultOpen,
    ...(open !== undefined && { open }),
    ...(onOpenChange !== undefined && { onOpenChange }),
  };

  return (
    <SidebarProvider {...providerProps}>
      <Sidebar collapsible="icon" className={cn('border-sidebar-border', className)}>
        {children}
        <SidebarRail />
      </Sidebar>
      {page}
    </SidebarProvider>
  );
}
