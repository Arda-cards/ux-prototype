'use client';

import { useState, useCallback } from 'react';
import {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
} from '../../atoms/drawer/drawer';
import { ItemDetailsHeader } from '../../molecules/item-details/item-details-header';
import { ArdaFieldList, type FieldDef } from '../../molecules/field-list/field-list';
import { ItemDetailsCardPreview } from '../../molecules/item-details/item-details-card-preview';
import type { ToolbarAction, OverflowAction } from '../../molecules/action-toolbar/action-toolbar';
import { Button } from '../../atoms/button/button';
import { XIcon, type LucideIcon } from 'lucide-react';

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

/** Design-time configuration for ItemDetails. */
export interface ArdaItemDetailsStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Drawer width preset. Defaults to `"lg"`. */
  size?: 'md' | 'lg' | 'xl';
  /** Tab definitions. Defaults to details + cards tabs. */
  tabs?: ItemDetailsTab[];
  /** Additional CSS classes on the drawer. */
  className?: string;
}

/** Runtime configuration for ItemDetails. */
export interface ArdaItemDetailsRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** Whether the panel is open. */
  open: boolean;
  /** Called when open state changes. */
  onOpenChange: (open: boolean) => void;
  /** Item title. */
  title: string;
  /** Detail fields to display on the details tab. */
  fields?: FieldDef[] | undefined;

  /** Primary toolbar actions. */
  actions?: ToolbarAction[] | undefined;
  /** Overflow menu actions. */
  overflowActions?: OverflowAction[] | undefined;

  /** Total number of kanban cards for this item. */
  cardCount?: number | undefined;
  /** Whether cards are loading. */
  cardsLoading?: boolean | undefined;
  /** Render prop for the card visual. Receives 1-based index. */
  renderCard?: ((index: number) => React.ReactNode) | undefined;
  /** Custom empty state for the card preview area. */
  cardEmptyState?: React.ReactNode | undefined;

  /** Render prop for the cards tab content. */
  renderCardsTab?: (() => React.ReactNode) | undefined;
}

/** Combined props for ItemDetails. */
export interface ItemDetailsProps
  extends ArdaItemDetailsStaticConfig, ArdaItemDetailsRuntimeConfig {}

/** @deprecated Use ItemDetailsProps */
export type ArdaItemDetailsProps = ItemDetailsProps;

// --- Default tabs ---

const DEFAULT_TABS: ItemDetailsTab[] = [
  { key: 'details', label: 'Item details' },
  { key: 'cards', label: 'Cards' },
];

// --- Component ---

/**
 * ItemDetails — item detail/edit slide-over panel.
 *
 * Compound component built from Drawer, ItemDetailsHeader,
 * ItemDetailsCardPreview, and ArdaFieldList molecules.
 *
 * Manages internal tab and card navigation state. All data and actions
 * are passed via props — no API calls or context consumption.
 */
export function ItemDetails({
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
}: ItemDetailsProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [currentCardIndex, setCurrentCardIndex] = useState(1);

  const displayTitle = title || 'Item Details';

  // Reset state when drawer opens
  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        setActiveTab('details');
        setCurrentCardIndex(1);
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange],
  );

  const hasActions = (actions?.length ?? 0) > 0 || (overflowActions?.length ?? 0) > 0;

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} size={size} className={className}>
      <DrawerHeader>
        {/* Visually hidden title for screen readers (Radix requirement) */}
        <DrawerTitle className="sr-only">{displayTitle}</DrawerTitle>
        <DrawerDescription className="sr-only">View and manage item details.</DrawerDescription>

        {/* Title row with close button */}
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex-1 min-w-0 text-lg font-semibold leading-snug break-words text-foreground">
            {displayTitle}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="-mr-2 text-muted-foreground"
            aria-label="Close"
          >
            <XIcon className="size-4" />
          </Button>
        </div>

        {/* Tabs — full width */}
        <ItemDetailsHeader activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />
      </DrawerHeader>

      <DrawerBody>
        {activeTab === 'details' ? (
          <>
            <ItemDetailsCardPreview
              currentIndex={currentCardIndex}
              totalCards={cardCount}
              onIndexChange={setCurrentCardIndex}
              loading={cardsLoading}
              renderCard={renderCard}
              emptyState={cardEmptyState}
            >
              {hasActions && (
                <div className="px-5 pt-2 pb-1">
                  <ItemDetailsHeader
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    tabs={[]}
                    actions={actions}
                    overflowActions={overflowActions}
                  />
                </div>
              )}
            </ItemDetailsCardPreview>
            {fields && <ArdaFieldList fields={fields} />}
          </>
        ) : (
          renderCardsTab?.()
        )}
      </DrawerBody>
    </Drawer>
  );
}

/** @deprecated Use ItemDetails */
export const ArdaItemDetails = ItemDetails;
