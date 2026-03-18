'use client';

import { cn } from '@/utils';
import { SidebarProvider, Sidebar, SidebarRail } from '@/components/ui/sidebar';

// --- Interfaces ---

/** Static configuration for ArdaSidebar. */
export interface ArdaSidebarStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Default open state (uncontrolled). */
  defaultOpen?: boolean;
  /** When true, applies the `dark` class so sidebar uses dark tokens. Defaults to true. */
  dark?: boolean;
  /** Sidebar content — compose with SidebarHeader, nav items, SidebarUserMenu, etc. */
  children: React.ReactNode;
  /** Content to render outside the sidebar but inside the provider (e.g. SidebarInset). */
  content?: React.ReactNode;
}

/** Runtime configuration for ArdaSidebar. */
export interface ArdaSidebarRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** Controlled open state. */
  open?: boolean;
  /** Called when sidebar open state changes. */
  onOpenChange?: (open: boolean) => void;
}

/** Combined props for ArdaSidebar. */
export interface ArdaSidebarProps extends ArdaSidebarStaticConfig, ArdaSidebarRuntimeConfig {
  /** Additional CSS classes applied to the sidebar. */
  className?: string;
}

// --- Component ---

/**
 * ArdaSidebar — Arda-branded wrapper around shadcn Sidebar.
 *
 * Dark by default. Set `dark={false}` to follow app theme instead.
 *
 * Provides: mobile Sheet, Cmd+B keyboard shortcut, cookie persistence,
 * icon-only collapsed mode with tooltips — all from shadcn primitives.
 */
export function ArdaSidebar({
  defaultOpen = true,
  dark = true,
  open,
  onOpenChange,
  children,
  content,
  className,
}: ArdaSidebarProps) {
  const providerProps = {
    defaultOpen,
    ...(open !== undefined && { open }),
    ...(onOpenChange !== undefined && { onOpenChange }),
  };

  return (
    <SidebarProvider {...providerProps} className={cn(dark && 'dark')}>
      <Sidebar collapsible="icon" className={cn('border-sidebar-border', className)}>
        {children}
        <SidebarRail />
      </Sidebar>
      {content}
    </SidebarProvider>
  );
}
