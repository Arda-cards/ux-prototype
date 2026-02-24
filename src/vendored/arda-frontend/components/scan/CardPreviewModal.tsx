'use client';

import { useEffect, useState, useCallback } from 'react';
import { XIcon, Loader } from 'lucide-react';
import { Button } from '@frontend/components/ui/button';
import { getKanbanCard } from '@frontend/lib/ardaClient';
import { toast } from 'sonner';
import { Toaster } from '@frontend/components/ui/sonner';
import { flyToTarget } from '@frontend/lib/fly-to-target';
import { useOrderQueueToast } from '@frontend/hooks/useOrderQueueToast';
import { useOrderQueue } from '@frontend/contexts/OrderQueueContext';
import OrderQueueToast from '@frontend/components/ui/order-queue-toast';
import { ItemDetailsPanel } from '@frontend/components/items/ItemDetailsPanel';
import { ItemFormPanel } from '@frontend/components/items/ItemFormPanel';
import { CardActions } from './CardActions';
import type { ItemCard } from '@frontend/constants/types';
import * as items from '@frontend/types/items';
import {
  defaultOrderMechanism,
  defaultQuantity,
  defaultCardSize,
  defaultLabelSize,
  defaultBreadcrumbSize,
} from '@frontend/types/items';
import { defaultMoney, type Currency } from '@frontend/types/domain';
import { defaultDuration } from '@frontend/types/general';

interface KanbanCardData {
  rId: string;
  asOf: {
    effective: number;
    recorded: number;
  };
  payload: {
    eId: string;
    rId: string;
    lookupUrlId: string;
    serialNumber: string;
    item: {
      type: string;
      eId: string;
      name: string;
    };
    itemDetails: {
      eId: string;
      name: string;
      imageUrl?: string;
      internalSKU?: string;
      locator?: {
        facility: string;
        location: string;
      };
      notes: string;
      cardNotesDefault: string;
      generalLedgerCode?: string;
      minQuantity?: {
        amount: number;
        unit: string;
      };
      primarySupply: {
        supplyEId?: string;
        supplier: string;
        name?: string;
        sku?: string;
        orderMethod?: string;
        url?: string;
        orderQuantity?: {
          amount: number;
          unit: string;
        };
        unitCost?: {
          value: number;
          currency: string;
        };
      };
      secondarySupply?: {
        supplyEId?: string;
        supplier: string;
        name?: string;
      };
      defaultSupply: string;
      cardSize: string;
      labelSize: string;
      breadcrumbSize: string;
      itemColor: string;
    };
    cardQuantity: {
      amount: number;
      unit: string;
    };
    status: string;
    printStatus: string;
  };
  metadata: {
    tenantId: string;
  };
  author: string;
  retired: boolean;
}

interface CardPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardId: string;
  onReceiveCard?: () => void;
}

export function CardPreviewModal({
  isOpen,
  onClose,
  cardId,
  onReceiveCard,
}: CardPreviewModalProps) {
  const { refreshOrderQueueData } = useOrderQueue();
  const [cardData, setCardData] = useState<KanbanCardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isItemDetailsOpen, setIsItemDetailsOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<items.Item | null>(null);

  // Order queue toast hook
  const { isToastVisible, showToast, hideToast, handleUndo } =
    useOrderQueueToast();

  // Function to handle viewing item details
  // Ensure we refresh card data before opening to show latest state
  const handleViewItemDetails = async () => {
    // Refresh card data to ensure we have the latest state
    if (cardId && cardData) {
      try {
        await refreshCardData();
      } catch (error) {
        console.error(
          'Error refreshing card data before showing details:',
          error
        );
        // Continue to open panel even if refresh fails
      }
    }
    setIsItemDetailsOpen(true);
  };

  // Function to close item details panel
  const handleCloseItemDetails = () => {
    setIsItemDetailsOpen(false);
  };

  // Function to handle edit item
  const handleEditItem = () => {
    if (cardData?.payload?.itemDetails) {
      // Convert KanbanCardData to Item format for editing with all required fields
      const itemData: items.Item = {
        // Required JournalledEntity fields - using placeholder values since we're only editing
        entityId: cardData.payload.item.eId,
        recordId: cardData.rId,
        author: cardData.author || 'system',
        timeCoordinates: {
          recordedAsOf: cardData.asOf.recorded,
          effectiveAsOf: cardData.asOf.effective,
        },
        createdCoordinates: {
          recordedAsOf: cardData.asOf.recorded,
          effectiveAsOf: cardData.asOf.effective,
        },

        // Item-specific fields
        name: cardData.payload.itemDetails.name,
        imageUrl: cardData.payload.itemDetails.imageUrl,
        classification: {
          type: '',
          subType: '',
        },
        useCase: '',
        locator: cardData.payload.itemDetails.locator
          ? {
              facility: cardData.payload.itemDetails.locator.facility || '',
              department: '', // Not available in card data
              location: cardData.payload.itemDetails.locator.location || '',
            }
          : {
              facility: '',
              department: '',
              location: '',
            },
        internalSKU:
          cardData.payload.itemDetails?.internalSKU ??
          cardData.payload.serialNumber ??
          '',
        minQuantity:
          cardData.payload.itemDetails?.minQuantity || defaultQuantity,
        notes: cardData.payload.itemDetails.notes || '',
        cardNotesDefault: cardData.payload.itemDetails.cardNotesDefault || '',
        taxable: true, // Default to true as per form
        primarySupply: {
          supplyEId:
            cardData.payload.itemDetails.primarySupply?.supplyEId,
          name: cardData.payload.itemDetails.primarySupply?.name,
          supplier: cardData.payload.itemDetails.primarySupply?.supplier || '',
          sku:
            cardData.payload.itemDetails.primarySupply?.sku ?? '',
          orderMechanism:
            (cardData.payload.itemDetails.primarySupply?.orderMethod as items.OrderMechanism) ??
            defaultOrderMechanism,
          url: cardData.payload.itemDetails.primarySupply?.url ?? '',
          orderQuantity:
            cardData.payload.itemDetails.primarySupply?.orderQuantity ||
            defaultQuantity,
          unitCost: cardData.payload.itemDetails.primarySupply?.unitCost
            ? {
                value:
                  cardData.payload.itemDetails.primarySupply.unitCost.value,
                currency:
                  (cardData.payload.itemDetails.primarySupply.unitCost
                    .currency as Currency) || 'USD',
              }
            : defaultMoney,
          averageLeadTime: defaultDuration,
          orderCost: defaultMoney,
        },
        secondarySupply: cardData.payload.itemDetails.secondarySupply
          ?.supplyEId
          ? {
              supplyEId:
                cardData.payload.itemDetails.secondarySupply.supplyEId,
              name: cardData.payload.itemDetails.secondarySupply.name,
              supplier:
                cardData.payload.itemDetails.secondarySupply.supplier || '',
              sku: '',
              orderMechanism: defaultOrderMechanism,
              url: '',
              minimumQuantity: defaultQuantity,
              orderQuantity: defaultQuantity,
              unitCost: defaultMoney,
              averageLeadTime: defaultDuration,
              orderCost: defaultMoney,
            }
          : undefined,
        defaultSupply: cardData.payload.itemDetails.defaultSupply || '',
        cardSize:
          (cardData.payload.itemDetails.cardSize as items.CardSize) ||
          defaultCardSize,
        labelSize:
          (cardData.payload.itemDetails.labelSize as items.LabelSize) ||
          defaultLabelSize,
        breadcrumbSize:
          (cardData.payload.itemDetails
            .breadcrumbSize as items.BreadcrumbSize) || defaultBreadcrumbSize,
        color:
          (cardData.payload.itemDetails.itemColor as items.ItemColor) || 'GRAY',
      };

      setItemToEdit(itemData);
      setIsItemDetailsOpen(false);
      setIsEditFormOpen(true);
    }
  };

  // Function to close edit form
  const handleCloseEditForm = () => {
    setIsEditFormOpen(false);
    setItemToEdit(null);
  };

  // Function to refresh card data after edit
  const refreshCardData = useCallback(async () => {
    if (cardId) {
      try {
        const refreshedData = await getKanbanCard(cardId);
        setCardData(refreshedData);
      } catch (error) {
        console.error('Error refreshing card data after edit:', error);
        // Don't show error toast as the edit was successful, just data refresh failed
      }
    }
  }, [cardId]);

  const handleEditSuccess = () => {
    setIsEditFormOpen(false);
    setItemToEdit(null);
    // Refresh the card data to show updated information
    refreshCardData();
  };

  // Helper function to check if Add to order queue button should be disabled
  // Only disable when status is REQUESTING (in order queue)
  const isAddToOrderQueueDisabled = (
    cardData: KanbanCardData | null
  ): boolean => {
    if (!cardData?.payload?.status) {
      return false; // Default to enabled if status is missing
    }

    const status = cardData.payload.status.toUpperCase();
    return status === 'REQUESTING';
  };

  // Helper function to check if Receive card button should be disabled
  // Disable when status is FULFILLED (restocked/fulfilled)
  const isReceiveCardDisabled = (cardData: KanbanCardData | null): boolean => {
    if (!cardData?.payload?.status) {
      return false; // Default to enabled if status is missing
    }

    const status = cardData.payload.status.toUpperCase();
    return status === 'FULFILLED';
  };

  // Function to map card data to ItemCard format
  const mapToItemCard = (cardData: KanbanCardData): ItemCard => {
    return {
      eid: cardData.payload.item.eId,
      title: cardData.payload.itemDetails.name,
      supplier: cardData.payload.itemDetails?.primarySupply?.supplier || '',
      image: cardData.payload.itemDetails?.imageUrl || '',
      link: '',
      sku:
        cardData.payload.itemDetails?.internalSKU ??
        cardData.payload.serialNumber ??
        '',
      serialNumber: cardData.payload.serialNumber,
      unitPrice: 0,
      minQty:
        cardData.payload.itemDetails?.minQuantity?.amount?.toString() || '',
      minUnit: cardData.payload.itemDetails?.minQuantity?.unit || '',
      location: cardData.payload.itemDetails?.locator
        ? `${cardData.payload.itemDetails.locator.facility} ${cardData.payload.itemDetails.locator.location}`.trim()
        : '',
      orderQty:
        cardData.payload.itemDetails?.primarySupply?.orderQuantity?.amount?.toString() ||
        '',
      orderUnit:
        cardData.payload.itemDetails?.primarySupply?.orderQuantity?.unit || '',
      generalLedgerCode: cardData.payload.itemDetails?.generalLedgerCode,
    };
  };

  // Load card data when modal opens
  useEffect(() => {
    const loadCardData = async () => {
      if (isOpen && cardId) {
        try {
          setLoading(true);
          setError(null);

          const fetchedCardData = await getKanbanCard(cardId);
          setCardData(fetchedCardData);
          setLoading(false);
        } catch (err) {
          console.error('Error loading card data:', err);
          setError('Card not found or could not be loaded.');
          setLoading(false);
        }
      }
    };

    loadCardData();
  }, [isOpen, cardId]);

  // Handle body overflow
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleAddToOrderQueue = async (cardEid: string) => {
    const fromEl = document.querySelector('.fixed.inset-0.z-50') as HTMLElement;
    const toEl = document.getElementById('order-queue-target');

    // Call the API to add the selected card to order queue
    try {
      const jwtToken = localStorage.getItem('idToken');

      const response = await fetch(
        `/api/arda/kanban/kanban-card/${cardEid}/event/request`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.ok) {
          // Refresh card data to reflect new status (REQUESTING)
          await refreshCardData();
          // Don't show toast here, wait until after animation
        } else {
          console.error('Failed to add card to order queue:', data);
          toast.error('Failed to add card to order queue');
          return;
        }
      } else {
        console.error('Failed to add card to order queue:', response.status);
        toast.error('Failed to add card to order queue');
        return;
      }
    } catch (error) {
      console.error('Error adding card to order queue:', error);
      toast.error('Error adding card to order queue');
      return;
    }

    try {
      if (fromEl && toEl) {
        await flyToTarget({
          fromEl,
          toEl,
          imageSrc: '/images/Addtoorderqueueanimation.svg',
          duration: 1500,
          size: 1208,
          endOffsetX: -180,
          endOffsetY: 0,
        });

        toEl.classList.add(
          'ring-2',
          'ring-[var(--base-primary)]',
          'ring-offset-2',
          'rounded-md'
        );
        setTimeout(() => {
          toEl.classList.remove(
            'ring-2',
            'ring-[var(--base-primary)]',
            'ring-offset-2',
            'rounded-md'
          );
        }, 600);
      }

      // Update order queue count after animation completes
      await refreshOrderQueueData();

      showToast();
    } catch (e) {
      console.error('Error in flyToTarget:', e);
      // Update order queue count even if animation fails
      await refreshOrderQueueData();
      toast.error('Something went wrong', {
        description: 'Please try again.',
      });
    }
  };

  const handleReceiveCard = async () => {
    if (!cardData?.payload?.eId) return;

    try {
      const jwtToken = localStorage.getItem('idToken');
      if (!jwtToken) {
        toast.error('Authentication token not found');
        return;
      }

      const response = await fetch(
        `/api/arda/kanban/kanban-card/${cardData.payload.eId}/event/fulfill`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.ok) {
          // Refresh card data to reflect new status (FULFILLED)
          await refreshCardData();

          // Show success toast
          toast.success('Card received successfully!', {
            duration: 4000,
          });

          // Call onReceiveCard callback if provided
          if (onReceiveCard) {
            onReceiveCard();
          }
        } else {
          console.error('Failed to receive card:', data);
          toast.error('Failed to receive card', {
            description: 'Please try again.',
          });
        }
      } else {
        console.error('Failed to receive card:', response.status);
        toast.error('Failed to receive card', {
          description: 'Please try again.',
        });
      }
    } catch (error) {
      console.error('Error receiving card:', error);
      toast.error('Error receiving card');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center transition-all duration-300'
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(0px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className='relative w-full max-w-[416px] mx-2 sm:mx-4 lg:mx-0 min-h-[500px] sm:min-h-[600px] lg:min-h-[700px] max-h-[95vh] rounded-lg sm:rounded-2xl bg-white border border-[#E5E5E5] shadow-lg px-3 sm:px-4 lg:px-6 py-4 sm:py-6 flex flex-col font-[Geist] overflow-hidden'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-muted-foreground hover:text-foreground'
        >
          <XIcon className='w-4 h-4' />
        </button>

        {/* Header */}
        <div className='flex flex-col gap-1 sm:gap-2 text-left'>
          <h2
            className='text-base sm:text-lg font-semibold'
            style={{
              color: 'var(--base-foreground, #0A0A0A)',
              lineHeight: '1.2',
            }}
          >
            Card Preview
          </h2>
          <p
            className='text-xs sm:text-sm'
            style={{
              color: 'var(--base-muted-foreground, #737373)',
              lineHeight: '1.4',
            }}
          >
            Preview the selected card and perform actions.
          </p>
        </div>

        {/* Content area - different states */}
        {error ? (
          // Error state
          <div className='w-full h-[400px] sm:h-[500px] lg:h-[550px] flex flex-col items-center justify-center my-2 sm:my-3'>
            <div className='text-center max-w-md mx-auto p-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                Error Loading Card
              </h2>
              <p className='text-gray-600 mb-6'>{error}</p>
              <div className='flex gap-3 justify-center'>
                <Button
                  onClick={onClose}
                  className='px-4 py-2'
                  style={{
                    backgroundColor: 'var(--base-primary, #FC5A29)',
                    color: 'white',
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        ) : loading ? (
          // Loading state
          <div
            className='w-full h-[400px] sm:h-[500px] lg:h-[550px] flex flex-col items-center justify-center my-2 sm:my-3'
            style={{
              backgroundColor: 'var(--slate-100, #F1F5F9)',
            }}
          >
            <Loader
              className='w-30 h-30 text-[#D4D4D8] animate-spin'
              strokeWidth={1.5}
            />
            <p
              className='mt-6 font-geist text-center'
              style={{
                color: 'var(--base-muted-foreground, #737373)',
                fontSize: 14,
                fontWeight: 400,
                lineHeight: '20px',
              }}
            >
              Loading card...
            </p>
          </div>
        ) : cardData ? (
          // Success state - show card preview using ItemCardView component
          <>
            <CardActions
              cardData={cardData}
              onAddToOrderQueue={handleAddToOrderQueue}
              onReceiveCard={handleReceiveCard}
              onViewItemDetails={handleViewItemDetails}
              onClose={onClose}
              isAddToOrderQueueDisabled={isAddToOrderQueueDisabled}
              isReceiveCardDisabled={isReceiveCardDisabled}
            />
          </>
        ) : null}
      </div>

      {/* Item Details Panel */}
      {isItemDetailsOpen && cardData && (
        <ItemDetailsPanel
          key={cardData.payload?.eId || cardId} // Force re-render when cardData changes
          item={mapToItemCard(cardData)}
          isOpen={isItemDetailsOpen}
          onClose={handleCloseItemDetails}
          onOpenChange={() => setIsItemDetailsOpen(!isItemDetailsOpen)}
          onEditItem={handleEditItem}
        />
      )}

      {/* Item Edit Form Panel */}
      <ItemFormPanel
        isOpen={isEditFormOpen}
        onClose={handleCloseEditForm}
        itemToEdit={itemToEdit}
        onSuccess={handleEditSuccess}
      />

      {/* Order Queue Toast Notification */}
      <OrderQueueToast
        isVisible={isToastVisible}
        onUndo={handleUndo}
        onClose={hideToast}
      />

      {/* Toast notification */}
      <Toaster position='top-center' />
    </div>
  );
}
