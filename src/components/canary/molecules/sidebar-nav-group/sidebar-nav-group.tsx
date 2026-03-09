'use client';

import { type LucideIcon, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// --- Interfaces ---

/** Props for ArdaSidebarNavGroup. */
export interface ArdaSidebarNavGroupProps {
  /* --- View / Layout / Controller --- */
  /** Group label text. */
  label: string;
  /** Optional icon displayed before the label. */
  icon?: LucideIcon;
  /** Whether the group starts expanded. */
  defaultExpanded?: boolean;
  /** When true, hides label text (icon-only mode). */
  collapsed?: boolean;
  /** ArdaNavItem children rendered inside the disclosure. */
  children: React.ReactNode;
  /** Additional CSS classes. */
  className?: string;
}

// --- Component ---

export function ArdaSidebarNavGroup({
  label,
  icon: Icon,
  defaultExpanded = false,
  collapsed = false,
  children,
  className,
}: ArdaSidebarNavGroupProps) {
  // In collapsed sidebar mode, just render children directly (no group header)
  if (collapsed) {
    return <>{children}</>;
  }

  return (
    <li className={cn('list-none', className)}>
      <Collapsible defaultOpen={defaultExpanded}>
        <CollapsibleTrigger className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text-active transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-bg group">
          {Icon && <Icon size={18} className="shrink-0" aria-hidden="true" />}
          <span className="truncate font-medium">{label}</span>
          <ChevronRight
            size={14}
            className="ml-auto shrink-0 transition-transform duration-150 group-data-[state=open]:rotate-90"
            aria-hidden="true"
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul
            role="list"
            className="mt-1 ml-4 space-y-1 list-none border-l border-sidebar-border pl-2"
          >
            {children}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}
