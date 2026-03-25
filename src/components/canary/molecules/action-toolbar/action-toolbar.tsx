'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@/types/canary/utilities/utils';
import { Button } from '@/components/canary/atoms/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/canary/primitives/dropdown-menu';
import { MoreHorizontal, Loader2, type LucideIcon } from 'lucide-react';

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
  /** Icon displayed in the grid cell. */
  icon?: LucideIcon;
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
  /** Primary actions — shown as buttons when space allows, otherwise in overflow. */
  actions?: ToolbarAction[];
  /** Always-in-overflow actions (e.g. destructive, low-priority). */
  overflowActions?: OverflowAction[];
  /* --- View / Layout / Controller --- */
  /** Additional CSS classes. */
  className?: string;
}

// --- Constants ---

/** Approximate width per action button (icon + label + padding + gap). */
const ACTION_WIDTH_ESTIMATE = 100;
/** Width of the overflow trigger button. */
const OVERFLOW_BUTTON_WIDTH = 36;

// --- Component ---

/**
 * ArdaActionToolbar — responsive action bar that promotes items from overflow as space allows.
 *
 * Measures available width with ResizeObserver and shows as many `actions[]` as fit.
 * Remaining actions are demoted into the overflow dropdown alongside `overflowActions[]`.
 */
export function ArdaActionToolbar({ actions, overflowActions, className }: ArdaActionToolbarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(actions?.length ?? 0);

  const allActions = actions ?? [];
  const allOverflow = overflowActions ?? [];
  const hasAnything = allActions.length > 0 || allOverflow.length > 0;

  const computeVisible = useCallback(() => {
    const el = containerRef.current;
    if (!el || allActions.length === 0) return;

    const containerWidth = el.clientWidth;
    // In test/SSR environments clientWidth is 0 — show all actions
    if (containerWidth === 0) {
      setVisibleCount(allActions.length);
      return;
    }

    const needsOverflow = allOverflow.length > 0;
    const reservedForOverflow = needsOverflow || allActions.length > 1 ? OVERFLOW_BUTTON_WIDTH : 0;
    const available = containerWidth - reservedForOverflow;
    const fits = Math.max(0, Math.floor(available / ACTION_WIDTH_ESTIMATE));

    // If all actions fit and no permanent overflow items, show them all (no overflow button needed)
    if (fits >= allActions.length && !needsOverflow) {
      setVisibleCount(allActions.length);
    } else {
      // Always reserve space for overflow button when some actions are hidden
      const availableWithOverflow = containerWidth - OVERFLOW_BUTTON_WIDTH;
      setVisibleCount(Math.max(0, Math.floor(availableWithOverflow / ACTION_WIDTH_ESTIMATE)));
    }
  }, [allActions.length, allOverflow.length]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    computeVisible();

    const observer = new ResizeObserver(computeVisible);
    observer.observe(el);
    return () => observer.disconnect();
  }, [computeVisible]);

  if (!hasAnything) return null;

  const visibleActions = allActions.slice(0, visibleCount);
  const hiddenActions = allActions.slice(visibleCount);
  const showOverflow = hiddenActions.length > 0 || allOverflow.length > 0;

  return (
    <div ref={containerRef} className={cn('flex items-center gap-1', className)}>
      {visibleActions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.key}
            variant="ghost"
            size="sm"
            onClick={action.onAction}
            disabled={action.disabled || action.loading}
            className="h-9 gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium"
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

      {showOverflow && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 rounded-md"
              aria-label="More actions"
            >
              <MoreHorizontal className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-48">
            {/* Hidden primary actions promoted into the menu */}
            {hiddenActions.map((action) => (
              <DropdownMenuItem
                key={action.key}
                onClick={action.onAction}
                disabled={action.disabled === true || action.loading === true}
              >
                {action.label}
              </DropdownMenuItem>
            ))}
            {/* Separator between promoted actions and permanent overflow */}
            {hiddenActions.length > 0 && allOverflow.length > 0 && <DropdownMenuSeparator />}
            {/* Permanent overflow actions */}
            {allOverflow.map((item) => (
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
