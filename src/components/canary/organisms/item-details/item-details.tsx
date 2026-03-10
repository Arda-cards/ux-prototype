'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  ArdaDrawer,
  ArdaDrawerHeader,
  ArdaDrawerTitle,
  ArdaDrawerDescription,
  ArdaDrawerBody,
} from '../../atoms/drawer/drawer';
import { ArdaItemDetailsHeader } from '../../molecules/item-details/item-details-header';
import {
  ArdaItemDetailsContent,
  type DetailFieldDef,
} from '../../molecules/item-details/item-details-content';
import { ArdaItemDetailsCardPreview } from '../../molecules/item-details/item-details-card-preview';
import type { ToolbarAction, OverflowAction } from '../../atoms/action-toolbar/action-toolbar';
import type { LucideIcon } from 'lucide-react';
import { XIcon } from 'lucide-react';

// --- Interfaces ---

/** Tab definition for the item details panel. */
export interface ItemDetailsTab {
  /** Unique tab key. */
  key: string;
  /** Tab label text. */
  label: string;
  /** Optional icon for the tab trigger. */
  icon?: LucideIcon;
}

/** Design-time configuration for ArdaItemDetails. */
export interface ArdaItemDetailsStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Drawer width preset. Defaults to `"lg"`. */
  size?: 'md' | 'lg' | 'xl';
  /** Tab definitions. Defaults to details + cards tabs. */
  tabs?: ItemDetailsTab[];
  /** Additional CSS classes on the drawer. */
  className?: string;
}

/** Runtime configuration for ArdaItemDetails. */
export interface ArdaItemDetailsRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** Whether the panel is open. */
  open: boolean;
  /** Called when open state changes. */
  onOpenChange: (open: boolean) => void;
  /** Item title. */
  title: string;
  /** Detail fields to display on the details tab. */
  fields?: DetailFieldDef[];

  /** Primary toolbar actions. */
  actions?: ToolbarAction[];
  /** Overflow menu actions. */
  overflowActions?: OverflowAction[];

  /** Total number of kanban cards for this item. */
  cardCount?: number;
  /** Whether cards are loading. */
  cardsLoading?: boolean;
  /** Render prop for the card visual. Receives 1-based index. */
  renderCard?: (index: number) => React.ReactNode;
  /** Custom empty state for the card preview area. */
  cardEmptyState?: React.ReactNode;

  /** Render prop for the cards tab content. */
  renderCardsTab?: () => React.ReactNode;
}

/** Combined props for ArdaItemDetails. */
export interface ArdaItemDetailsProps
  extends ArdaItemDetailsStaticConfig, ArdaItemDetailsRuntimeConfig {}

// --- Default tabs ---

const DEFAULT_TABS: ItemDetailsTab[] = [
  { key: 'details', label: 'Item details' },
  { key: 'cards', label: 'Cards' },
];

// --- Component ---

/**
 * ArdaItemDetails — item detail/edit slide-over panel.
 *
 * Compound component built from ArdaDrawer, ArdaItemDetailsHeader,
 * ArdaItemDetailsCardPreview, and ArdaItemDetailsContent molecules.
 *
 * Manages internal tab and card navigation state. All data and actions
 * are passed via props — no API calls or context consumption.
 */
export function ArdaItemDetails({
  // Static
  size = 'lg',
  tabs = DEFAULT_TABS,
  className,
  // Runtime
  open,
  onOpenChange,
  title,
  fields,
  actions,
  overflowActions,
  cardCount = 0,
  cardsLoading,
  renderCard,
  cardEmptyState,
  renderCardsTab,
}: ArdaItemDetailsProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [currentCardIndex, setCurrentCardIndex] = useState(1);

  // Reset state when drawer opens
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setActiveTab('details');
      setCurrentCardIndex(1);
    }
    onOpenChange(nextOpen);
  };

  const hasActions = (actions?.length ?? 0) > 0 || (overflowActions?.length ?? 0) > 0;

  return (
    <ArdaDrawer open={open} onOpenChange={handleOpenChange} size={size} className={className}>
      <ArdaDrawerHeader>
        {/* Visually hidden title for screen readers (Radix requirement) */}
        <ArdaDrawerTitle className="sr-only">{title || 'Item Details'}</ArdaDrawerTitle>
        <ArdaDrawerDescription className="sr-only">
          View and manage item details.
        </ArdaDrawerDescription>

        {/* Title row with close button */}
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex-1 min-w-0 text-lg font-semibold leading-snug break-words text-foreground">
            {title || 'Item Details'}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none -mr-2"
            aria-label="Close"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        {/* Tabs — full width */}
        <ArdaItemDetailsHeader activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />
      </ArdaDrawerHeader>

      <ArdaDrawerBody>
        {activeTab === 'details' ? (
          <>
            <ArdaItemDetailsCardPreview
              currentIndex={currentCardIndex}
              totalCards={cardCount}
              onIndexChange={setCurrentCardIndex}
              loading={cardsLoading}
              renderCard={renderCard}
              emptyState={cardEmptyState}
            >
              {hasActions && (
                <div className="px-5 pt-2 pb-1">
                  <ArdaItemDetailsHeader
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    tabs={[]}
                    actions={actions}
                    overflowActions={overflowActions}
                  />
                </div>
              )}
            </ArdaItemDetailsCardPreview>
            {fields && <ArdaItemDetailsContent fields={fields} />}
          </>
        ) : (
          renderCardsTab?.()
        )}
      </ArdaDrawerBody>
    </ArdaDrawer>
  );
}
