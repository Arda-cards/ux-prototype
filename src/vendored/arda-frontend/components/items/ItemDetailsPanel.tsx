'use client';

import { Button } from '@frontend/components/ui/button';
import { ManageCardsPanel } from './ManageCardsPanel';
import { ItemCardView } from './ItemCardView';
import { CardsPreviewModal } from './CardsPreviewModal';
import { CardPreviewModal } from '@frontend/components/scan/CardPreviewModal';
import {
  XIcon,
  MoreHorizontal,
  Dock,
  Printer,
  SquarePen,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlignLeft,
  Tag,
  Hash,
} from 'lucide-react';
import { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@frontend/lib/utils';
import { ItemDetailsPanelProps } from '@frontend/constants/interfaces';
import type { ItemCard } from '@frontend/constants/types';
import { useOrderQueue } from '@frontend/contexts/OrderQueueContext';
import { TruncatedLink } from '@frontend/components/common/TruncatedLink';
import OrderQueueToast from '@frontend/components/ui/order-queue-toast';
import { useOrderQueueToast } from '@frontend/hooks/useOrderQueueToast';
import { canAddToOrderQueue } from '@frontend/lib/cardStateUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@frontend/components/ui/dropdown-menu';
import { flyToTarget } from '@frontend/lib/fly-to-target';
import { toast } from 'sonner';
import { DeleteConfirmationModal } from '@frontend/components/common/DeleteConfirmationModal';
import { useAuthErrorHandler } from '@frontend/hooks/useAuthErrorHandler';
import { extractKanbanRecords } from '@frontend/lib/kanbanResponseParser';

// Types for API response
interface KanbanCardResult {
  payload: {
    eId: string;
    serialNumber: string;
    item: {
      eId: string;
      name: string;
    };
    itemDetails?: {
      internalSKU?: string;
      [key: string]: unknown;
    };
    cardQuantity: {
      amount: number;
      unit: string;
    };
    status: string;
  };
  rId: string;
}

export function ItemDetailsPanel({
  item,
  isOpen,
  onClose,
  onOpenChange,
  onEditItem,
  onDuplicateItem,
}: ItemDetailsPanelProps) {
  const { handleAuthError } = useAuthErrorHandler();
  const { refreshOrderQueueData } = useOrderQueue();
  const [activeTab, setActiveTab] = useState<'details' | 'cards'>('details');
  const [currentCardIndex, setCurrentCardIndex] = useState(1);
  const [selectedCardEid, setSelectedCardEid] = useState<string>(
    item.eid || ''
  );
  const [isCardsPreviewModalOpen, setIsCardsPreviewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cardsToDelete, setCardsToDelete] = useState<KanbanCardResult[]>([]);
  const [isLoadingCardsToDelete, setIsLoadingCardsToDelete] = useState(false);
  const [isCardPreviewModalOpen, setIsCardPreviewModalOpen] = useState(false);
  const [cardList, setCardList] = useState<KanbanCardResult[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [isPrintingAll, setIsPrintingAll] = useState(false);
  const [isPrintingLabel, setIsPrintingLabel] = useState(false);
  const [isPrintingBreadcrumb, setIsPrintingBreadcrumb] = useState(false);
  const cardOriginRef = useRef<HTMLDivElement | null>(null);
  const prevIsOpenRef = useRef<boolean>(false);
  // Order queue toast hook
  const { isToastVisible, showToast, hideToast, handleUndo } =
    useOrderQueueToast();

  // Fetch cards from API
  const fetchCards = useCallback(async () => {
    try {
      setIsLoadingCards(true);
      const jwtToken = localStorage.getItem('idToken');

      const requestBody = {
        filter: {
          eq: item.eid,
          locator: 'ITEM_REFERENCE_entity_id',
        },
        paginate: {
          index: 0,
          size: 100,
        },
      };

      const response = await fetch(
        `/api/arda/kanban/kanban-card/query-details-by-item`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.data.results) {
          setCardList(data.data.results);
        }
      } else {
        console.error('Failed to fetch cards:', response.status);
        toast.error('Failed to fetch cards');
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
      if (handleAuthError(error)) {
        return;
      }
      toast.error('Error fetching cards');
    } finally {
      setIsLoadingCards(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.eid]);

  // Reset to 'details' tab and fetch cards when panel opens
  useEffect(() => {
    // Only fetch when panel transitions from closed to open
    if (isOpen && !prevIsOpenRef.current) {
      // Always reset to 'details' tab when panel opens
      setActiveTab('details');
      // Always fetch cards when panel opens to ensure fresh data
      fetchCards();
    }
    // Update the ref to track the previous state
    prevIsOpenRef.current = isOpen;
  }, [isOpen, fetchCards]);

  // Update selectedCardEid when currentCardIndex or cardList changes
  useEffect(() => {
    if (cardList.length === 0) {
      setSelectedCardEid(item.eid || '');
    } else {
      setSelectedCardEid(cardList[currentCardIndex - 1]?.payload?.eId || '');
    }
  }, [currentCardIndex, cardList, item.eid]);

  // Convert API data to ItemCard format for ItemCardView
  const getCurrentCard = (): ItemCard => {
    if (cardList.length === 0) {
      return {
        eid: item.eid || '',
        title: item.title || '',
        minQty: item.minQty || '',
        minUnit: item.minUnit || '',
        location: item.location || '',
        orderQty: item.orderQty || '',
        orderUnit: item.orderUnit || '',
        supplier: item.supplier || '',
        sku: item.sku || '',
        image: item.image || '',
        link: item.link || '',
        unitPrice: item.unitPrice || 0.0,
      };
    }

    const currentCard = cardList[currentCardIndex - 1];
    return {
      eid: currentCard?.payload?.eId || '',
      title: item.title || '',
      minQty: item.minQty || '',
      minUnit: item.minUnit || '',
      location: item.location || '',
      orderQty: item.orderQty || '',
      orderUnit: item.orderUnit || '',
      supplier: item.supplier || '',
      sku:
        currentCard?.payload?.itemDetails?.internalSKU ??
        currentCard?.payload?.serialNumber ??
        item.sku ??
        '',
      image: item.image || '',
      link: item.link || '',
      unitPrice: item.unitPrice || 0,
    };
  };

  // Convert API data to ItemCard format for CardsPreviewModal
  const getCardsForModal = (): ItemCard[] => {
    if (cardList.length === 0) {
      return [
        {
          eid: item.eid || '',
          title: item.title || '',
          minQty: item.minQty || '',
          minUnit: item.minUnit || '',
          location: item.location || '',
          orderQty: item.orderQty || '',
          orderUnit: item.orderUnit || '',
          supplier: item.supplier || '',
          sku: item.sku || '',
          image: item.image || '',
          link: item.link || '',
          unitPrice: item.unitPrice || 0,
        },
      ];
    }

    return cardList.map((card) => ({
      eid: card.payload.eId,
      title: card.payload.item.name || '',
      minQty: item.minQty || '',
      minUnit: item.minUnit || '',
      location: item.location || '',
      orderQty: item.orderQty || '',
      orderUnit: item.orderUnit || '',
      supplier: item.supplier || '',
      sku:
        card.payload.itemDetails?.internalSKU ??
        card.payload.serialNumber ??
        '',
      image: item.image || '',
      link: item.link || '',
      unitPrice: item.unitPrice || 0,
    }));
  };

  const totalCards = cardList.length || 0;
  const currentCard = getCurrentCard();
  const cardsForModal = getCardsForModal();
  const hasCards = cardList.length > 0;

  // Check if the selected card is available to add to cart using new state mapping
  const selectedCard = cardList.find(
    (card) => card.payload.eId === selectedCardEid
  );
  const canAddToCart = selectedCard
    ? canAddToOrderQueue(selectedCard.payload.status)
    : false;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as Element).id === 'item-panel-overlay') {
      onClose();
    }
  };

  const handleClose = async () => {
    await onClose();
    onOpenChange();
  };

  const handleAddToOrderQueue = async () => {
    const fromEl = cardOriginRef.current;
    const toEl = document.getElementById('order-queue-target');

    // Call the API to add the selected card to order queue
    try {
      const jwtToken = localStorage.getItem('idToken');

      const response = await fetch(
        `/api/arda/kanban/kanban-card/${selectedCardEid}/event/request`,
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
          showToast(); // Show the order queue toast on success

          // Update the global order queue context
          await refreshOrderQueueData();

          // Update the local card status optimistically
          setCardList((prevCardList) =>
            prevCardList.map((card) =>
              card.payload.eId === selectedCardEid
                ? {
                    ...card,
                    payload: { ...card.payload, status: 'REQUESTING' },
                  }
                : card
            )
          );

          // Refresh cards from API to get the actual updated status
          // Multiple refreshes ensure we catch the status update even if the API is slow
          setTimeout(() => {
            fetchCards();
          }, 300);
          setTimeout(() => {
            fetchCards();
          }, 1000);
        } else {
          console.error('Failed to add card to order queue:', data);
        }
      } else {
        console.error('Failed to add card to order queue:', response.status);
        toast.error('Failed to add card to order queue');
      }
    } catch (error) {
      console.error('Error adding card to order queue:', error);
      if (handleAuthError(error)) {
        return;
      }
      toast.error('Error adding card to order queue');
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

      showToast();
    } catch (e) {
      console.error('Error in flyToTarget:', e);
      toast.error('Something went wrong', {
        description: 'Please try again.',
      });
    }
  };

  const handleCardsChange = useCallback(() => {
    fetchCards();
  }, [fetchCards]);

  // Listen for refreshItemCards event to update card list when cards are added
  useEffect(() => {
    const handleRefreshItemCards = (event: Event) => {
      const customEvent = event as CustomEvent<{ itemEntityId: string }>;
      const { itemEntityId } = customEvent.detail;
      // Only refresh if this event is for the current item and panel is open
      if (itemEntityId === item.eid && isOpen) {
        // Refresh immediately to show the new card
        fetchCards();
        // Also refresh after short delays to ensure status is fully updated
        // The API may need a moment to update the card status after creation/fulfillment
        setTimeout(() => {
          fetchCards();
        }, 500);
        // Additional refresh to catch any delayed status updates
        setTimeout(() => {
          fetchCards();
        }, 1500);
      }
    };

    window.addEventListener('refreshItemCards', handleRefreshItemCards);
    return () => {
      window.removeEventListener('refreshItemCards', handleRefreshItemCards);
    };
  }, [item.eid, isOpen, fetchCards]);

  // Force fetch cards when switching to cards tab
  useEffect(() => {
    if (isOpen && activeTab === 'cards') {
      fetchCards();
    }
  }, [isOpen, activeTab, fetchCards]);

  // TODO: Implement export item functionality
  // const handleExportItem = () => {
  //   // TODO: Implement export item functionality
  // };

  const handleDuplicateItem = () => {
    if (onDuplicateItem) {
      onDuplicateItem();
    }
  };

  // TODO: Implement view item history functionality
  // const handleViewItemHistory = () => {
  //   // TODO: Implement view item history functionality
  // };

  // TODO: Implement view related tasks functionality
  // const handleViewRelatedTasks = () => {
  //   // TODO: Implement view related tasks functionality
  // };

  const handleViewCardPreview = () => {
    setIsCardsPreviewModalOpen(true);
  };

  const handleScanPreview = () => {
    setIsCardPreviewModalOpen(true);
  };

  const handleDeleteItem = async () => {
    if (!item.eid) {
      toast.error('Item ID not found');
      return;
    }

    try {
      setIsLoadingCardsToDelete(true);
      setIsDeleteModalOpen(true);

      // First, fetch all cards for this item
      const jwtToken = localStorage.getItem('idToken');
      if (!jwtToken) {
        toast.error('Authentication token not found');
        setIsDeleteModalOpen(false);
        return;
      }

      const response = await fetch(
        `/api/arda/kanban/kanban-card/query-by-item?eId=${item.eid}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawRecords = extractKanbanRecords(data);
        if (data.ok && rawRecords.length > 0) {
          setCardsToDelete(rawRecords);
        } else {
          setCardsToDelete([]);
        }
      } else {
        console.error('Failed to fetch cards:', response.status);
        setCardsToDelete([]);
      }
    } catch (error) {
      console.error('Error fetching cards for deletion:', error);
      if (handleAuthError(error)) {
        setIsDeleteModalOpen(false);
        return;
      }
      toast.error('Error fetching cards');
      setCardsToDelete([]);
    } finally {
      setIsLoadingCardsToDelete(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!item.eid) {
      toast.error('Item ID not found');
      return;
    }

    try {
      setIsDeleting(true);

      const jwtToken = localStorage.getItem('idToken');
      if (!jwtToken) {
        toast.error('Authentication token not found');
        return;
      }

      // First, delete all cards associated with this item
      if (cardsToDelete.length > 0) {

        const cardDeletePromises = cardsToDelete.map(async (card) => {
          try {
            const response = await fetch(
              `/api/arda/kanban/kanban-card/${card.payload.eId}`,
              {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${jwtToken}`,
                },
              }
            );

            if (response.ok) {
              const data = await response.json();
              return { success: data.ok, cardId: card.payload.eId };
            }
            const errorText = await response.text();
            console.error(
              `Failed to delete card ${card.payload.eId}:`,
              response.status,
              errorText
            );
            return { success: false, cardId: card.payload.eId };
          } catch (error) {
            console.error(`Error deleting card ${card.payload.eId}:`, error);
            if (handleAuthError(error)) {
              throw error;
            }
            return { success: false, cardId: card.payload.eId };
          }
        });

        const cardResults = await Promise.all(cardDeletePromises);
        const failedCards = cardResults.filter((r) => !r.success);

        if (failedCards.length > 0) {
          console.warn(
            `Failed to delete ${failedCards.length} of ${cardsToDelete.length} cards`
          );
          toast.error(
            `Failed to delete ${failedCards.length} card${
              failedCards.length > 1 ? 's' : ''
            }. Item was not deleted.`
          );
          return;
        }

      }

      // Then delete the item
      const response = await fetch(`/api/arda/items/${item.eid}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.ok) {
          const cardsMessage =
            cardsToDelete.length > 0
              ? ` and ${cardsToDelete.length} card${
                  cardsToDelete.length > 1 ? 's' : ''
                }`
              : '';
          toast.success(`Successfully deleted item${cardsMessage}`);
        } else {
          toast.error('Failed to delete item');
          return;
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to delete item:', response.status, errorText);
        toast.error('Failed to delete item');
        return;
      }

      // Close modal and panel after deletion
      setIsDeleteModalOpen(false);
      setCardsToDelete([]);
      onClose();

      // Trigger refresh of the items list in the parent component
      window.dispatchEvent(
        new CustomEvent('itemDeleted', { detail: { itemId: item.eid } })
      );
    } catch (error) {
      console.error('Error deleting item:', error);
      if (handleAuthError(error)) {
        return;
      }
      toast.error('Error deleting item');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
  };

  const handlePrintSelectedCard = async () => {
    if (cardList.length === 0) {
      toast.error('No cards available to print');
      return;
    }

    if (isPrintingAll) {
      return;
    }

    try {
      setIsPrintingAll(true);
      const jwtToken = localStorage.getItem('idToken');

      const selectedCardId = selectedCardEid;

      const response = await fetch('/api/arda/kanban/kanban-card/print-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          ids: [selectedCardId],
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.ok && data.data && data.data.url) {
          // Open PDF in new window - use only one method to avoid duplicates
          window.open(data.data.url, '_blank', 'noopener,noreferrer');

          // Refresh cards list to show updated print status
          await fetchCards();
          toast.success('Successfully printed selected card!');
        } else {
          console.error(
            'Failed to print card - invalid response structure:',
            data
          );
          toast.error('Failed to print card - invalid response');
        }
      } else {
        console.error('Failed to print card:', response.status);
        toast.error('Failed to print card');
      }
    } catch (error) {
      console.error('Error printing card:', error);
      if (handleAuthError(error)) {
        return;
      }
      toast.error('Error printing card');
    } finally {
      setIsPrintingAll(false);
    }
  };

  const handlePrintLabel = async () => {
    if (!item?.eid) {
      toast.error('Item ID not available');
      return;
    }

    const jwtToken = localStorage.getItem('idToken');
    if (!jwtToken) {
      toast.error('Authentication token not found');
      return;
    }

    try {
      setIsPrintingLabel(true);

      const response = await fetch(`/api/arda/items/${item.eid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!response.ok) {
        toast.error('Failed to fetch item record ID');
        return;
      }

      const data = await response.json();
      if (!data.ok || !data.data?.rId) {
        toast.error('Item record ID not found');
        return;
      }

      const printResponse = await fetch('/api/arda/item/item/print-label', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          ids: [data.data.rId],
        }),
      });

      if (printResponse.ok) {
        const printData = await printResponse.json();

        if (printData.ok && printData.data && printData.data.url) {
          window.open(printData.data.url, '_blank', 'noopener,noreferrer');
          toast.success('Successfully printed label!');
        } else {
          console.error(
            'Failed to print label - invalid response structure:',
            printData
          );
          toast.error('Failed to print label - invalid response');
        }
      } else {
        console.error('Failed to print label:', printResponse.status);
        toast.error('Failed to print label');
      }
    } catch (error) {
      console.error('Error printing label:', error);
      if (handleAuthError(error)) {
        return;
      }
      toast.error('Error printing label');
    } finally {
      setIsPrintingLabel(false);
    }
  };

  const handlePrintBreadcrumb = async () => {
    if (!item?.eid) {
      toast.error('Item ID not available');
      return;
    }

    const jwtToken = localStorage.getItem('idToken');
    if (!jwtToken) {
      toast.error('Authentication token not found');
      return;
    }

    try {
      setIsPrintingBreadcrumb(true);

      const response = await fetch(`/api/arda/items/${item.eid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!response.ok) {
        toast.error('Failed to fetch item record ID');
        return;
      }

      const data = await response.json();
      if (!data.ok || !data.data?.rId) {
        toast.error('Item record ID not found');
        return;
      }

      const printResponse = await fetch(
        '/api/arda/item/item/print-breadcrumb',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({
            ids: [data.data.rId],
          }),
        }
      );

      if (printResponse.ok) {
        const printData = await printResponse.json();

        if (printData.ok && printData.data && printData.data.url) {
          window.open(printData.data.url, '_blank', 'noopener,noreferrer');
          toast.success('Successfully printed breadcrumb!');
        } else {
          console.error(
            'Failed to print breadcrumb - invalid response structure:',
            printData
          );
          toast.error('Failed to print breadcrumb - invalid response');
        }
      } else {
        console.error('Failed to print breadcrumb:', printResponse.status);
        toast.error('Failed to print breadcrumb');
      }
    } catch (error) {
      console.error('Error printing breadcrumb:', error);
      if (handleAuthError(error)) {
        return;
      }
      toast.error('Error printing breadcrumb');
    } finally {
      setIsPrintingBreadcrumb(false);
    }
  };

  return (
    <>
      <div
        id='item-panel-overlay'
        onClick={handleOverlayClick}
        className={cn(
          'fixed inset-0 z-50 flex justify-end transition-all duration-300',
          isOpen ? 'visible opacity-100' : 'invisible opacity-0'
        )}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(0px)',
        }}
      >
        <div
          className={cn(
            'relative w-full sm:w-[420px] lg:w-[460px] h-full bg-white border-l border-border flex flex-col shadow-xl transition-transform duration-300 overflow-hidden',
            isOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          {/* Close icon */}
          <button
            onClick={handleClose}
            className='absolute top-4 right-4 z-50 text-muted-foreground hover:text-foreground'
          >
            <XIcon className='w-5 h-5' />
          </button>

          {/* Header */}
          <div className='sticky top-0 z-40 bg-white px-4 sm:px-6 pt-4 pb-2 sm:pt-5 sm:pb-3 border-b'>
            <div className='flex flex-col gap-y-1.5'>
              {/* Title */}
              <h2 className='text-md sm:text-xl font-semibold font-inter leading-tight text-black break-words'>
                {item.title || 'Item Details'}
              </h2>

              {/* Tabs */}
              <div className='flex justify-center'>
                <div className='flex items-center gap-1.5 rounded-[10px] bg-[#f5f5f5] p-1.5'>
                  <button
                    type='button'
                    onClick={() => setActiveTab('details')}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors border border-transparent',
                      activeTab === 'details'
                        ? 'bg-white text-[#0a0a0a] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] border border-[#C3CCDC]'
                        : 'text-[#737373]'
                    )}
                  >
                    <AlignLeft className='h-4 w-4' />
                    <span>Item details</span>
                  </button>
                  <button
                    type='button'
                    onClick={() => setActiveTab('cards')}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors border border-transparent',
                      activeTab === 'cards'
                        ? 'bg-white text-[#0a0a0a] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] border border-[#C3CCDC]'
                        : 'text-[#737373]'
                    )}
                  >
                    <Dock className='h-4 w-4' />
                    <span>Cards</span>
                  </button>
                </div>
              </div>

              <div
                className='h-px bg-[#e5e5e5]'
                style={{ marginInline: '-24px' }}
              />

              {activeTab === 'details' && (
                <div className='-mx-6 flex items-center justify-center gap-1 sm:gap-2 flex-wrap px-6 pt-1'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={onEditItem}
                    className='h-8 rounded-lg px-2 sm:px-3 py-2 text-xs font-medium font-geist gap-1 sm:gap-2'
                  >
                    <SquarePen className='w-3 h-3 sm:w-4 sm:h-4' />
                    <span className='hidden sm:inline'>Edit item</span>
                    <span className='sm:hidden'>Edit</span>
                  </Button>

                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleAddToOrderQueue}
                    disabled={!canAddToCart}
                    className='h-8 rounded-lg px-2 sm:px-3 py-2 text-xs font-medium font-geist gap-1 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    <Dock className='w-3 h-3 sm:w-4 sm:h-4' />
                    <span className='hidden sm:inline'>Add to cart</span>
                    <span className='sm:hidden'>Queue</span>
                  </Button>

                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePrintSelectedCard();
                    }}
                    disabled={isPrintingAll || cardList.length === 0}
                    className='h-8 rounded-lg px-2 sm:px-3 py-2 text-xs font-medium font-geist gap-1 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isPrintingAll ? (
                      <Loader2 className='w-3 h-3 sm:w-4 sm:h-4 animate-spin' />
                    ) : (
                      <Printer className='w-3 h-3 sm:w-4 sm:h-4' />
                    )}
                    <span className='hidden sm:inline'>
                      {isPrintingAll ? 'Printing...' : 'Print card'}
                    </span>
                    <span className='sm:hidden'>
                      {isPrintingAll ? 'Printing...' : 'Print'}
                    </span>
                  </Button>

                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePrintLabel();
                    }}
                    disabled={isPrintingLabel}
                    className='h-8 rounded-lg px-2 sm:px-3 py-2 text-xs font-medium font-geist gap-1 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isPrintingLabel ? (
                      <Loader2 className='w-3 h-3 sm:w-4 sm:h-4 animate-spin' />
                    ) : (
                      <Tag className='w-3 h-3 sm:w-4 sm:h-4' />
                    )}
                    <span className='hidden sm:inline'>
                      {isPrintingLabel ? 'Printing...' : 'Print label'}
                    </span>
                    <span className='sm:hidden'>
                      {isPrintingLabel ? 'Printing...' : 'Label'}
                    </span>
                  </Button>

                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePrintBreadcrumb();
                    }}
                    disabled={isPrintingBreadcrumb}
                    className='h-8 rounded-lg px-2 sm:px-3 py-2 text-xs font-medium font-geist gap-1 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isPrintingBreadcrumb ? (
                      <Loader2 className='w-3 h-3 sm:w-4 sm:h-4 animate-spin' />
                    ) : (
                      <Hash className='w-3 h-3 sm:w-4 sm:h-4' />
                    )}
                    <span className='hidden sm:inline'>
                      {isPrintingBreadcrumb
                        ? 'Printing...'
                        : 'Print breadcrumb'}
                    </span>
                    <span className='sm:hidden'>
                      {isPrintingBreadcrumb ? 'Printing...' : 'Breadcrumb'}
                    </span>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 rounded-lg'
                      >
                        <MoreHorizontal className='w-4 h-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='w-48 bg-white border border-[#E5E5E5] shadow-lg rounded-lg'>
                      <DropdownMenuItem
                        onClick={handleScanPreview}
                        className='px-3 py-2 text-sm text-[#0a0a0a] hover:bg-[#f5f5f5] cursor-pointer'
                      >
                        Scan Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleViewCardPreview}
                        className='px-3 py-2 text-sm text-[#0a0a0a] hover:bg-[#f5f5f5] cursor-pointer'
                      >
                        View card preview
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleDuplicateItem}
                        className='px-3 py-2 text-sm text-[#0a0a0a] hover:bg-[#f5f5f5] cursor-pointer'
                      >
                        Duplicate item...
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className='bg-[#E5E5E5]' />
                      <DropdownMenuItem
                        onClick={handleDeleteItem}
                        className='px-3 py-2 text-sm text-[#0a0a0a] hover:bg-[#f5f5f5] cursor-pointer'
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>

          {/* Scrollable Content */}
          <div className='flex-1 overflow-y-auto'>
            {activeTab === 'details' ? (
              <>
                {/* Item Card View */}
                <div className='relative w-full bg-[#fef7f5] px-4 sm:px-6 pt-4 pb-12 flex flex-col items-center gap-1'>
                  {/* Card Preview Section */}
                  <div className='w-full max-w-[396px] flex flex-col items-center gap-2'>
                    {/* Loading State */}
                    {isLoadingCards && (
                      <div className='w-full flex justify-center items-center py-8'>
                        <div className='text-sm text-[#737373]'>
                          Loading cards...
                        </div>
                      </div>
                    )}

                    {/* No Cards State */}
                    {!isLoadingCards && !hasCards && (
                      <div className='w-full flex flex-col items-center py-8 gap-3'>
                        <div className='text-center'>
                          <div className='text-lg font-medium text-[#0a0a0a] mb-2'>
                            No cards available
                          </div>
                          <div className='text-sm text-[#737373]'>
                            This item doesn&apos;t have any kanban cards yet.
                          </div>
                        </div>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setActiveTab('cards')}
                          className='h-8 px-3 py-2 text-xs font-medium shadow-sm border-[#e5e5e5] bg-white'
                        >
                          Create first card
                        </Button>
                      </div>
                    )}

                    {/* Card with Badge - Show when cards exist regardless of status */}
                    {!isLoadingCards && hasCards && (
                      <div className='relative mb-2' ref={cardOriginRef}>
                        <ItemCardView
                          item={{
                            ...item,
                            title: currentCard.title,
                            minQty: currentCard.minQty,
                            minUnit: currentCard.minUnit,
                            location: currentCard.location,
                            orderQty: currentCard.orderQty,
                            orderUnit: currentCard.orderUnit,
                            supplier: currentCard.supplier,
                            sku: currentCard.sku,
                            image: currentCard.image,
                          }}
                          cardIndex={currentCardIndex}
                          totalCards={totalCards}
                          cardStatus={cardList[currentCardIndex - 1]?.payload?.status}
                        />
                        {/* Card Count Badge */}
                        <div className='absolute -top-3 -left-4 bg-white border border-[#e5e5e5] rounded-full px-2.5 py-2 shadow-sm text-[#737373] font-semibold text-base'>
                          x{totalCards}
                        </div>
                      </div>
                    )}

                    {/* Card Navigation and Preview Button - Show when cards exist regardless of status */}
                    {!isLoadingCards && hasCards && (
                      <div className='absolute   bottom-2 left-2 right-18 flex items-center'>
                        {/* Card Preview Button */}
                        <Button
                          variant='outline'
                          size='sm'
                          className='h-8 px-3 py-2 text-xs font-medium shadow-sm border-[#e5e5e5] bg-white'
                          onClick={() => setIsCardsPreviewModalOpen(true)}
                        >
                          Card preview
                        </Button>
                        {/* Card Navigation - Centered */}
                        <div className='flex-1 flex items-center justify-center -ml-12'>
                          <div className='flex items-center gap-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() =>
                                setCurrentCardIndex(
                                  Math.max(1, currentCardIndex - 1)
                                )
                              }
                              disabled={currentCardIndex === 1}
                              className='h-9 w-10 p-0 shadow-sm border-[#e5e5e5] bg-white'
                              style={{
                                opacity: currentCardIndex === 1 ? 0.5 : 1,
                              }}
                            >
                              <ChevronLeft className='w-4 h-4' />
                            </Button>
                            <span className='text-sm font-medium text-[#0a0a0a]'>
                              <strong>{currentCardIndex}</strong> of{' '}
                              <strong>{totalCards}</strong>
                            </span>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() =>
                                setCurrentCardIndex(
                                  Math.min(totalCards, currentCardIndex + 1)
                                )
                              }
                              disabled={currentCardIndex === totalCards}
                              className='h-9 w-10 p-0 shadow-sm border-[#e5e5e5] bg-white'
                            >
                              <ChevronRight className='w-4 h-4' />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Item Details */}
                <div className='w-full px-4 sm:px-6 space-y-3 py-4 mb-6'>
                  <div className='flex flex-col gap-1'>
                    <span className='text-sm text-[#737373] font-medium'>
                      Link
                    </span>
                    {item.link ? (
                      <TruncatedLink href={item.link} className='w-full' />
                    ) : (
                      <span className='text-base text-[#737373] font-normal'>
                        No link available
                      </span>
                    )}
                  </div>
                  <div className='flex flex-col gap-1'>
                    <span className='text-sm text-[#737373] font-medium'>
                      SKU
                    </span>
                    <span className='text-base text-[#0a0a0a] font-semibold break-all'>
                      {item.sku || 'No SKU available'}
                    </span>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <span className='text-sm text-[#737373] font-medium'>
                      General Ledger Code
                    </span>
                    <span className='text-base text-[#0a0a0a] font-semibold break-all'>
                      {item.generalLedgerCode || 'No GL Code available'}
                    </span>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <span className='text-sm text-[#737373] font-medium'>
                      Unit price
                    </span>
                    <span className='text-base text-[#0a0a0a] font-semibold'>
                      ${item.unitPrice?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <span className='text-sm text-[#737373] font-medium'>
                      Number of cards
                    </span>
                    <span className='text-sm text-[#0a0a0a] font-semibold'>
                      {totalCards}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <ManageCardsPanel
                mode='inline'
                item={item}
                open={activeTab === 'cards'}
                onCardsChange={handleCardsChange}
              />
            )}
          </div>

          {/* Cancel Button */}
          <div className='sticky bottom-0 left-0 w-full px-4 sm:px-6 py-2.5 z-40 flex justify-end bg-white border-t border-[#E5E5E5]'>
            <Button
              variant='outline'
              className='text-sm font-medium text-[#0A0A0A] px-3 py-1 h-8 rounded-md border border-[#E5E5E5]'
              onClick={handleClose}
            >
              Done
            </Button>
          </div>
        </div>
      </div>

      {/* Cards Preview Modal - Outside the panel, centered on screen */}
      <CardsPreviewModal
        isOpen={isCardsPreviewModalOpen}
        onClose={() => setIsCardsPreviewModalOpen(false)}
        item={item}
        cards={cardsForModal}
        cardList={cardList}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting || isLoadingCardsToDelete}
        message={
          isLoadingCardsToDelete
            ? 'Loading cards...'
            : cardsToDelete.length > 0
            ? `Delete it like you mean it! Deleting this item will also remove all ${
                cardsToDelete.length
              } associated card${
                cardsToDelete.length > 1 ? 's' : ''
              }, so make sure you're ready to say goodbye forever.`
            : "Delete it like you mean it! Deleting an item also removes all of its cards, so make sure you're ready to say goodbye forever."
        }
      />

      {/* Order Queue Toast Notification */}
      <OrderQueueToast
        isVisible={isToastVisible}
        onUndo={handleUndo}
        onClose={hideToast}
      />

      {/* Card Preview Modal */}
      <CardPreviewModal
        isOpen={isCardPreviewModalOpen}
        onClose={() => setIsCardPreviewModalOpen(false)}
        cardId={selectedCardEid}
        onReceiveCard={fetchCards}
      />
    </>
  );
}
