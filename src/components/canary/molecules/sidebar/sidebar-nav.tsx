'use client';

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
} from '@/components/ui/sidebar';

// --- Interfaces ---

/** Design-time configuration for ArdaSidebarNav. */
export interface ArdaSidebarNavStaticConfig {
  /* --- View / Layout / Controller --- */
  /** ArdaSidebarNavItem and ArdaSidebarNavGroup children. */
  children: React.ReactNode;
  /** Optional group label (e.g. "Navigation", "Platform"). */
  label?: string;
  /** Additional CSS classes. */
  className?: string;
}

/** Combined props for ArdaSidebarNav. No runtime config — pure presentational. */
export interface ArdaSidebarNavProps extends ArdaSidebarNavStaticConfig {}

// --- Component ---

/**
 * ArdaSidebarNav — wraps shadcn SidebarContent > SidebarGroup > SidebarMenu.
 * Provides the scrollable nav section of the sidebar.
 */
export function ArdaSidebarNav({ children, label, className }: ArdaSidebarNavProps) {
  return (
    <SidebarContent className={className}>
      <SidebarGroup>
        {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
        <SidebarGroupContent>
          <SidebarMenu>{children}</SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}
