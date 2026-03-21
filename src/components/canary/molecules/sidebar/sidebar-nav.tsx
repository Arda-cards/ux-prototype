'use client';

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
} from '@/components/canary/primitives/sidebar';

export interface SidebarNavProps {
  /** SidebarNavItem and SidebarNavGroup children. */
  children: React.ReactNode;
  /** Optional group label (e.g. "Navigation", "Platform"). */
  label?: string;
  /** Accessible label for the nav landmark. Defaults to "Main navigation". */
  ariaLabel?: string;
  className?: string;
}

export function SidebarNav({
  children,
  label,
  ariaLabel = 'Main navigation',
  className,
}: SidebarNavProps) {
  return (
    <SidebarContent className={className}>
      <SidebarGroup>
        {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
        <SidebarGroupContent>
          <nav aria-label={ariaLabel}>
            <SidebarMenu>{children}</SidebarMenu>
          </nav>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}
