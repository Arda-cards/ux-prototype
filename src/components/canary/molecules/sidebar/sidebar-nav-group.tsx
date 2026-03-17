'use client';

import { useRef, Children, isValidElement } from 'react';
import { type LucideIcon, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarMenuItem, SidebarMenuButton, SidebarMenuSub } from '@/components/ui/sidebar';

export interface SidebarNavGroupProps {
  /** Group label text. */
  label: string;
  /** Optional icon displayed before the label. */
  icon?: LucideIcon;
  /** Whether the group starts expanded. */
  defaultExpanded?: boolean;
  /** SidebarNavItem children rendered inside the disclosure. */
  children: React.ReactNode;
  className?: string;
}

function hasActiveChild(node: React.ReactNode): boolean {
  return Children.toArray(node).some(
    (child) => isValidElement<{ active?: boolean }>(child) && child.props.active === true,
  );
}

export function SidebarNavGroup({
  label,
  icon: Icon,
  defaultExpanded = false,
  children,
  className,
}: SidebarNavGroupProps) {
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
