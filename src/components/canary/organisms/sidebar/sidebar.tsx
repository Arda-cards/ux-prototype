'use client';

import { cn } from '@/types/canary/utilities/utils';
import {
  SidebarProvider,
  Sidebar as SidebarPrimitive,
  SidebarRail,
} from '@/components/canary/primitives/sidebar';

// --- Interfaces ---

/** Static configuration for Sidebar. */
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

/** Runtime configuration for Sidebar. */
export interface ArdaSidebarRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** Controlled open state. */
  open?: boolean;
  /** Called when sidebar open state changes. */
  onOpenChange?: (open: boolean) => void;
}

/** Combined props for Sidebar. */
export interface SidebarProps extends ArdaSidebarStaticConfig, ArdaSidebarRuntimeConfig {
  /** Additional CSS classes applied to the sidebar. */
  className?: string;
}

/** @deprecated Use SidebarProps */
export type ArdaSidebarProps = SidebarProps;

// --- Component ---

/**
 * Sidebar — Arda-branded wrapper around shadcn Sidebar.
 *
 * Dark by default. Set `dark={false}` to follow app theme instead.
 *
 * Provides: mobile Sheet, Cmd+B keyboard shortcut, cookie persistence,
 * icon-only collapsed mode with tooltips — all from shadcn primitives.
 */
export function Sidebar({
  defaultOpen = true,
  dark = true,
  open,
  onOpenChange,
  children,
  content,
  className,
}: SidebarProps) {
  const providerProps = {
    defaultOpen,
    ...(open !== undefined && { open }),
    ...(onOpenChange !== undefined && { onOpenChange }),
  };

  return (
    <SidebarProvider {...providerProps} className={cn(dark && 'dark')}>
      <SidebarPrimitive collapsible="icon" className={cn('border-sidebar-border', className)}>
        {children}
        <SidebarRail />
      </SidebarPrimitive>
      {content}
    </SidebarProvider>
  );
}

/** @deprecated Use Sidebar */
export const ArdaSidebar = Sidebar;
