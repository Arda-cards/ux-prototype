'use client';

import { cn } from '@/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ToolbarAction, OverflowAction } from '../action-toolbar/action-toolbar';
import { ArdaGridAction } from '../grid-action/grid-action';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, type LucideIcon } from 'lucide-react';
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
  actions?: ToolbarAction[] | undefined;
  /** Additional actions — shown in grid if space allows, otherwise in "More" dropdown. */
  overflowActions?: OverflowAction[] | undefined;
  /** Maximum number of visible action cells (including "More"). Defaults to 6. */
  maxActions?: number | undefined;
  /** Additional CSS classes. */
  className?: string | undefined;
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

  // Partition overflow actions in a single pass: icon vs no-icon
  const remainingSlots = visibleSlots - visiblePrimary.length;
  const withIcon: (OverflowAction & { icon: LucideIcon })[] = [];
  const withoutIcon: OverflowAction[] = [];
  for (const a of allOverflow) {
    if (a.icon) withIcon.push(a as OverflowAction & { icon: LucideIcon });
    else withoutIcon.push(a);
  }
  const visibleOverflow = withIcon.slice(0, remainingSlots);
  const hiddenOverflow = [...withIcon.slice(remainingSlots), ...withoutIcon];

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
          {visiblePrimary.map((action) => (
            <ArdaGridAction
              key={action.key}
              icon={action.icon}
              label={action.label}
              onAction={action.onAction}
              loading={action.loading}
              disabled={action.disabled}
            />
          ))}

          {/* Overflow actions promoted to the grid (ones with icons) */}
          {visibleOverflow.map((action) => (
            <ArdaGridAction
              key={action.key}
              icon={action.icon}
              label={action.label}
              onAction={action.onAction}
              destructive={action.destructive}
            />
          ))}

          {/* "More" cell — always last, opens dropdown with remaining actions */}
          {showMore && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <ArdaGridAction
                  icon={MoreHorizontal}
                  label="More actions"
                  shortLabel="More"
                  onAction={() => {}}
                />
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
