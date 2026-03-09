'use client';

import { ChevronsLeft, ChevronsRight } from 'lucide-react';

import { cn } from '@/lib/utils';

// --- Interfaces ---

/** Props for ArdaCollapseToggle. */
export interface ArdaCollapseToggleProps {
  /* --- Model / Data Binding --- */
  /** Whether the target is in collapsed state. */
  collapsed: boolean;
  /** Called when the toggle is activated. */
  onToggle?: () => void;

  /* --- View / Layout / Controller --- */
  /** Label announced when expanded. */
  expandedLabel?: string;
  /** Label announced when collapsed. */
  collapsedLabel?: string;
  /** Additional CSS classes. */
  className?: string;
}

// --- Component ---

export function ArdaCollapseToggle({
  collapsed,
  onToggle,
  expandedLabel = 'Collapse',
  collapsedLabel = 'Expand',
  className,
}: ArdaCollapseToggleProps) {
  const Icon = collapsed ? ChevronsRight : ChevronsLeft;
  const label = collapsed ? collapsedLabel : expandedLabel;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={!collapsed}
      aria-label={label}
      className={cn(
        'flex items-center justify-center rounded-md p-1.5 text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text-active transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar-bg',
        className,
      )}
    >
      <Icon size={16} aria-hidden="true" />
    </button>
  );
}
