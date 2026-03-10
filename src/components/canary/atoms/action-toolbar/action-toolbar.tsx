'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// --- Interfaces ---

/** A single action rendered as a button in the toolbar. */
export interface ToolbarAction {
  /** Unique key for React list rendering. */
  key: string;
  /** Button label text. */
  label: string;
  /** Icon displayed before the label. */
  icon: LucideIcon;
  /** Called when the action is triggered. */
  onAction: () => void;
  /** Whether this action is currently loading. */
  loading?: boolean;
  /** Whether this action is disabled. */
  disabled?: boolean;
  /** Whether this is a destructive action (renders in red). */
  destructive?: boolean;
}

/** An item in the overflow dropdown menu. */
export interface OverflowAction {
  /** Unique key for React list rendering. */
  key: string;
  /** Menu item label. */
  label: string;
  /** Called when selected. */
  onAction: () => void;
  /** Whether this is a destructive action. */
  destructive?: boolean;
  /** When `true`, renders a separator before this item. */
  separatorBefore?: boolean;
}

/** Props for ArdaActionToolbar. */
export interface ArdaActionToolbarProps {
  /* --- Model / Data Binding --- */
  /** Primary actions rendered as buttons. */
  actions?: ToolbarAction[];
  /** Actions that overflow into a dropdown menu. */
  overflowActions?: OverflowAction[];
  /* --- View / Layout / Controller --- */
  /** Additional CSS classes. */
  className?: string;
}

// --- Component ---

/**
 * ArdaActionToolbar — a row of icon+label action buttons with an overflow dropdown.
 *
 * Data-driven: pass `actions[]` for visible buttons and `overflowActions[]`
 * for the dropdown menu. Designed for entity detail panel headers.
 */
export function ArdaActionToolbar({ actions, overflowActions, className }: ArdaActionToolbarProps) {
  const hasActions = actions && actions.length > 0;
  const hasOverflow = overflowActions && overflowActions.length > 0;

  if (!hasActions && !hasOverflow) return null;

  return (
    <div className={cn('flex items-center gap-1 flex-wrap', className)}>
      {actions?.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.key}
            variant="ghost"
            size="sm"
            onClick={action.onAction}
            disabled={action.disabled || action.loading}
            className="h-8 gap-1.5 rounded-lg px-3 py-2 text-xs font-medium"
          >
            {action.loading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Icon className="size-4" aria-hidden="true" />
            )}
            <span>{action.loading ? 'Loading\u2026' : action.label}</span>
          </Button>
        );
      })}

      {hasOverflow && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg"
              aria-label="More actions"
            >
              <MoreHorizontal className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-48">
            {overflowActions?.map((item) => (
              <React.Fragment key={item.key}>
                {item.separatorBefore && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  onClick={item.onAction}
                  className={cn(item.destructive && 'text-destructive focus:text-destructive')}
                >
                  {item.label}
                </DropdownMenuItem>
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
