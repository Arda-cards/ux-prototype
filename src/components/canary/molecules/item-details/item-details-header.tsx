'use client';

import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArdaActionToolbar,
  type ToolbarAction,
  type OverflowAction,
} from '../../atoms/action-toolbar/action-toolbar';
import type { LucideIcon } from 'lucide-react';

// --- Interfaces ---

export interface ArdaItemDetailsHeaderProps {
  /* --- Model / Data Binding --- */
  /** Item title displayed in the header. */
  title: string;
  /** Currently active tab. */
  activeTab: string;
  /** Called when the user switches tabs. */
  onTabChange: (tab: string) => void;

  /* --- View / Layout / Controller --- */
  /** Tab definitions. Each tab has a key, label, and optional icon. */
  tabs: Array<{ key: string; label: string; icon?: LucideIcon }>;
  /** Primary action buttons shown below the tabs. */
  actions?: ToolbarAction[];
  /** Overflow dropdown actions. */
  overflowActions?: OverflowAction[];
  /** Additional CSS classes. */
  className?: string;
}

// --- Component ---

/**
 * ArdaItemDetailsHeader — title, tab bar, and action toolbar for the item detail drawer.
 *
 * Pure presentational molecule. Receives all data and callbacks via props.
 */
export function ArdaItemDetailsHeader({
  title,
  activeTab,
  onTabChange,
  tabs,
  actions,
  overflowActions,
  className,
}: ArdaItemDetailsHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-y-1.5', className)}>
      <h2 className="text-xl font-semibold leading-tight break-words text-foreground">
        {title || 'Item Details'}
      </h2>

      <Tabs value={activeTab} onValueChange={onTabChange}>
        <div className="flex justify-center">
          <TabsList className="h-auto gap-1.5 rounded-[10px] bg-secondary p-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="gap-2 rounded-lg px-3 py-1.5 text-sm font-medium"
                >
                  {Icon && <Icon className="size-4" aria-hidden="true" />}
                  <span>{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
      </Tabs>

      {actions && actions.length > 0 && (
        <>
          <div className="-mx-6 h-px bg-border" />
          <ArdaActionToolbar
            actions={actions}
            overflowActions={overflowActions}
            className="justify-center pt-1"
          />
        </>
      )}
    </div>
  );
}
