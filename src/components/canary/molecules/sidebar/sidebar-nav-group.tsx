'use client';

import { useRef, Children, isValidElement } from 'react';
import { type LucideIcon, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarMenuItem, SidebarMenuButton, SidebarMenuSub } from '@/components/ui/sidebar';

// --- Interfaces ---

/** Design-time configuration for ArdaSidebarNavGroup. */
export interface ArdaSidebarNavGroupStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Group label text. */
  label: string;
  /** Optional icon displayed before the label. */
  icon?: LucideIcon;
  /** Whether the group starts expanded. */
  defaultExpanded?: boolean;
  /** ArdaSidebarNavItem children rendered inside the disclosure. */
  children: React.ReactNode;
  /** Additional CSS classes. */
  className?: string;
}

/** Combined props for ArdaSidebarNavGroup. No runtime config — pure presentational. */
export interface ArdaSidebarNavGroupProps extends ArdaSidebarNavGroupStaticConfig {}

// --- Helpers ---

/** Check if any child ArdaSidebarNavItem has active=true (auto-expand support). */
function hasActiveChild(node: React.ReactNode): boolean {
  return Children.toArray(node).some(
    (child) => isValidElement<{ active?: boolean }>(child) && child.props.active === true,
  );
}

// --- Component ---

/**
 * ArdaSidebarNavGroup — collapsible nav section using shadcn Collapsible + SidebarMenuSub.
 * Renders as a SidebarMenuItem with a disclosure trigger and nested sub-items.
 * Auto-expands when a child nav item has active=true.
 */
export function ArdaSidebarNavGroup({
  label,
  icon: Icon,
  defaultExpanded = false,
  children,
  className,
}: ArdaSidebarNavGroupProps) {
  // Compute once at mount — hasActiveChild walks the React tree and the result
  // is only meaningful as the initial value for the uncontrolled Collapsible.
  const shouldExpand = useRef(defaultExpanded || hasActiveChild(children)).current;

  return (
    <Collapsible defaultOpen={shouldExpand} className={cn('group/collapsible', className)}>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            className="text-sidebar-foreground/70 group-data-[state=open]/collapsible:text-sidebar-foreground"
            tooltip={label}
          >
            {Icon && <Icon />}
            <span className="truncate">{label}</span>
            <ChevronRight className="ml-auto shrink-0 transition-transform duration-150 motion-reduce:transition-none group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>{children}</SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
