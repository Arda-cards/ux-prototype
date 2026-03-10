'use client';

import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ToolbarAction, OverflowAction } from '../../atoms/action-toolbar/action-toolbar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loader2, CircleDot, MoreHorizontal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import React from 'react';

// --- Interfaces ---

export interface ArdaItemDetailsHeaderProps {
  /* --- Model / Data Binding --- */
  /** Currently active tab. */
  activeTab: string;
  /** Called when the user switches tabs. */
  onTabChange: (tab: string) => void;

  /* --- View / Layout / Controller --- */
  /** Tab definitions. Each tab has a key, label, and optional icon. */
  tabs: Array<{ key: string; label: string; icon?: LucideIcon }>;
  /** Primary action buttons shown in the action grid. */
  actions?: ToolbarAction[];
  /** Additional actions — shown in grid if space allows, otherwise in "More" dropdown. */
  overflowActions?: OverflowAction[];
  /** Maximum number of visible action cells (including "More"). Defaults to 6. */
  maxActions?: number;
  /** Additional CSS classes. */
  className?: string;
}

// --- Constants ---

const DEFAULT_MAX_ACTIONS = 6;

// --- Component ---

/**
 * ArdaItemDetailsHeader — tab bar and action grid for the item detail drawer.
 *
 * Pure presentational molecule. Receives all data and callbacks via props.
 * Shows up to `maxActions` cells in a stable grid. Excess actions and
 * overflow actions collapse into a "More" dropdown as the last cell.
 */
export function ArdaItemDetailsHeader({
  activeTab,
  onTabChange,
  tabs,
  actions,
  overflowActions,
  maxActions = DEFAULT_MAX_ACTIONS,
  className,
}: ArdaItemDetailsHeaderProps) {
  const allPrimary = actions ?? [];
  const allOverflow = overflowActions ?? [];

  // Reserve one slot for "More" if we need it
  const totalActions = allPrimary.length + allOverflow.length;
  const needsMore = totalActions > maxActions || allOverflow.length > 0;
  const visibleSlots = needsMore ? maxActions - 1 : maxActions;

  // Split primary actions into visible grid vs demoted to dropdown
  const visiblePrimary = allPrimary.slice(0, visibleSlots);
  const hiddenPrimary = allPrimary.slice(visibleSlots);

  // Overflow actions with icons that fit in remaining grid slots
  const remainingSlots = visibleSlots - visiblePrimary.length;
  const visibleOverflow = allOverflow.filter((a) => a.icon).slice(0, remainingSlots);
  const hiddenOverflow = [
    ...allOverflow.filter((a) => a.icon).slice(remainingSlots),
    ...allOverflow.filter((a) => !a.icon),
  ];

  // Everything that goes in the "More" dropdown
  const moreItems = [...hiddenPrimary, ...hiddenOverflow];
  const showMore = needsMore && moreItems.length > 0;

  const hasActions = visiblePrimary.length > 0 || visibleOverflow.length > 0 || showMore;

  return (
    <div className={cn('flex flex-col gap-y-3', className)}>
      {tabs.length > 0 && (
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.key} value={tab.key} className="flex-1 gap-1.5 text-sm">
                  {Icon && <Icon className="size-3.5" aria-hidden="true" />}
                  <span>{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      )}

      {/* Action grid */}
      {hasActions && (
        <div className="flex flex-wrap items-start justify-center gap-x-4 gap-y-2">
          {/* Primary actions */}
          {visiblePrimary.map((action) => {
            const Icon = action.icon;
            const shortLabel = action.label.split(' ')[0];
            return (
              <button
                key={action.key}
                type="button"
                onClick={action.onAction}
                disabled={action.disabled || action.loading}
                className="flex flex-col items-center gap-1.5 rounded-md py-1 text-foreground/70 transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                aria-label={action.label}
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-muted">
                  {action.loading ? (
                    <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                  ) : (
                    <Icon className="size-5" aria-hidden="true" />
                  )}
                </div>
                <span className="text-xs leading-tight">
                  {action.loading ? 'Wait…' : shortLabel}
                </span>
              </button>
            );
          })}

          {/* Overflow actions promoted to the grid (ones with icons) */}
          {visibleOverflow.map((action) => {
            const Icon = action.icon!;
            const shortLabel = action.label.split(' ')[0];
            return (
              <button
                key={action.key}
                type="button"
                onClick={action.onAction}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-md py-1 text-foreground/70 transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                  action.destructive && 'text-destructive/70 hover:text-destructive',
                )}
                aria-label={action.label}
              >
                <div
                  className={cn(
                    'flex size-11 items-center justify-center rounded-xl bg-muted',
                    action.destructive && 'bg-destructive/10',
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <span className="text-xs leading-tight">{shortLabel}</span>
              </button>
            );
          })}

          {/* "More" cell — always last, opens dropdown with remaining actions */}
          {showMore && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex flex-col items-center gap-1.5 rounded-md py-1 text-foreground/70 transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  aria-label="More actions"
                >
                  <div className="flex size-11 items-center justify-center rounded-xl bg-muted">
                    <MoreHorizontal className="size-5" aria-hidden="true" />
                  </div>
                  <span className="text-xs leading-tight">More</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-48">
                {moreItems.map((item) => (
                  <React.Fragment key={item.key}>
                    {'separatorBefore' in item && item.separatorBefore && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      onClick={item.onAction}
                      className={cn(
                        'destructive' in item &&
                          item.destructive &&
                          'text-destructive focus:text-destructive',
                      )}
                    >
                      {item.label}
                    </DropdownMenuItem>
                  </React.Fragment>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
    </div>
  );
}
