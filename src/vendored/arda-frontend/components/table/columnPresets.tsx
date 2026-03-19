'use client';

import React from 'react';
import Image from 'next/image';
import { ColDef, IRowNode, ValueFormatterParams } from 'ag-grid-community';
import { ShoppingCart, Printer, Eye, Tag } from 'lucide-react';
import { HiOutlineChatBubbleBottomCenterText } from 'react-icons/hi2';
import { createPortal } from 'react-dom';
import * as items from '@frontend/types/items';
import * as domain from '@frontend/types/domain';
import { useItemCards } from '@frontend/app/items/ItemTableAGGrid';
import { flyToTarget } from '@frontend/lib/fly-to-target';
import { useOrderQueueToast } from '@frontend/hooks/useOrderQueueToast';
import { useOrderQueue } from '@frontend/store/hooks/useOrderQueue';
import { toast } from 'sonner';
import { ALLOWED_ORDER_QUEUE_STATUSES } from '@frontend/lib/cardStateUtils';
import { NoteModal } from '@frontend/components/common/NoteModal';
import {
  cardSizeOptions,
  labelSizeOptions,
  breadcrumbSizeOptions,
} from '@frontend/constants/constants';


// Custom Image component with fallback - matches ItemCard behavior
const GridImage = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) => {
  const [imageError, setImageError] = React.useState(false);

  // Helper function to check if it's an uploaded file (data URL)
  const isUploadedFile = (url: string) => {
    return url.startsWith('data:');
  };

  // Reset error state when src changes
  React.useEffect(() => {
    setImageError(false);
  }, [src]);

  if (imageError || !src) {
    return (
      <div
        className={`rounded flex items-center justify-center ${className}`}
      ></div>
    );
  }

  // Use Next.js Image for uploaded files, regular img for external URLs
  if (isUploadedFile(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        width={32}
        height={32}
        className={className}
        onError={() => setImageError(true)}
      />
    );
  }

  // Use regular img tag for external URLs (like ItemCard does)
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ width: 32, height: 32 }}
      onError={() => setImageError(true)}
      onLoad={() => setImageError(false)}
    />
  );
};

export const formatCurrency = (value: domain.Money | undefined) => {
  if (!value || value.value == null) return '-';
  return `$${value.value.toFixed(2)} ${value.currency}`;
};

export const formatDate = (date: string | undefined) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString();
};

export const formatDateTime = (date: string | undefined) => {
  if (!date) return '-';
  return new Date(date).toLocaleString();
};

export const formatQuantity = (quantity: items.Quantity | undefined) => {
  if (!quantity) return '-';
  return `${quantity.amount} ${quantity.unit}`;
};

/** Default column width: wide enough to display the header label at 14px Geist,
 *  including the ⋮ sort menu button (~24px) that appears on hover.
 *  Formula: ~9px per character + 72px (32px cell padding + 16px sort indicator + 24px ⋮ button). */
const colWidth = (text: string): number => Math.max(80, Math.ceil(text.length * 9) + 72);

// Quick Actions Cell Component
const QuickActionsCell = ({ item }: { item: items.Item }) => {
  const { itemCardsMap, refreshCardsForItem, ensureCardsForItem, onOpenItemDetails } =
    useItemCards();
  React.useEffect(() => {
    if (item?.entityId) {
      ensureCardsForItem(item.entityId);
    }
  }, [item?.entityId, ensureCardsForItem]);

  const cards = item?.entityId ? itemCardsMap[item.entityId] : undefined;
  const hasLoadedCards = Array.isArray(cards);
  const safeCards = hasLoadedCards ? cards : [];
  const isLoadingCards = item?.entityId ? !hasLoadedCards : false;
  const { showToast } = useOrderQueueToast();
  const { refreshOrderQueueData } = useOrderQueue();

  // State for the candidate card to add to order queue (oldest FULFILLED card)
  const [candidateCard, setCandidateCard] = React.useState<any>(null);
  const [isLoadingCandidate, setIsLoadingCandidate] = React.useState(false);
  const mountedRef = React.useRef(true);
  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Track how many buttons fit in the current column width
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = React.useState(4);
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // 8px left pad + N×36px buttons + (N-1)×4px gaps + 8px right pad
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w >= 172) setVisibleCount(4);
      else if (w >= 132) setVisibleCount(3);
      else if (w >= 92) setVisibleCount(2);
      else setVisibleCount(1);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Count cards with status "REQUESTING" (In Order Queue)
  const inOrderQueueCount = safeCards.filter(
    (card: any) => card.payload?.status === 'REQUESTING'
  ).length;

  // Count cards with printStatus "PRINTED"
  const printedCount = safeCards.filter(
    (card: any) => card.payload?.printStatus === 'PRINTED'
  ).length;

  // Note: restockedCards is no longer used - we now use candidateCard which is queried separately
  // This ensures we only add the oldest FULFILLED card, not all of them

  const [isPrintingLabels, setIsPrintingLabels] = React.useState(false);

  // Function to query for the oldest candidate card (FULFILLED status, sorted by effective_as_of ascending)
  const queryCandidateCard = React.useCallback(
    async (signal?: AbortSignal) => {
      if (!item?.entityId) {
        if (mountedRef.current) setCandidateCard(null);
        return;
      }

      if (mountedRef.current) setIsLoadingCandidate(true);
      try {
        const jwtToken = localStorage.getItem('idToken');
        if (!jwtToken) {
          if (mountedRef.current) {
            setCandidateCard(null);
            setIsLoadingCandidate(false);
          }
          return;
        }

        // Fetch all cards for this item using the dedicated endpoint,
        // then filter client-side by allowed statuses.
        const response = await fetch(
          `/api/arda/kanban/kanban-card/query-by-item?eId=${encodeURIComponent(item.entityId)}`,
          {
            method: 'GET',
            headers: { Authorization: `Bearer ${jwtToken}` },
            signal,
          }
        );

        if (signal?.aborted || !mountedRef.current) return;

        if (!response.ok) {
          if (mountedRef.current) setCandidateCard(null);
          return;
        }

        const data = await response.json();
        if (signal?.aborted || !mountedRef.current) return;

        // Support all known response shapes
        const rawCards: any[] =
          data?.data?.records ??
          data?.data?.data?.records ??
          (Array.isArray(data?.data) ? data.data : null) ??
          data?.data?.results ??
          [];

        // Filter to only cards in allowed statuses
        const allCandidates = rawCards.filter((card: any) =>
          ALLOWED_ORDER_QUEUE_STATUSES.includes(card.payload?.status?.toUpperCase?.() ?? '')
        );

        if (allCandidates.length > 0) {
          allCandidates.sort((a: any, b: any) => {
            const aEffective = a.asOf?.effective || 0;
            const bEffective = b.asOf?.effective || 0;
            return aEffective - bEffective;
          });
          if (mountedRef.current) setCandidateCard(allCandidates[0]);
        } else {
          if (mountedRef.current) setCandidateCard(null);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          // Network error or aborted – avoid noisy logs
          if (mountedRef.current) {
            setCandidateCard(null);
            setIsLoadingCandidate(false);
          }
          return;
        }
        if (mountedRef.current) {
          console.error('Error querying candidate card:', error);
          setCandidateCard(null);
          setIsLoadingCandidate(false);
        }
      } finally {
        if (mountedRef.current && !signal?.aborted) {
          setIsLoadingCandidate(false);
        }
      }
    },
    [item?.entityId]
  );

  // Query for candidate card when item changes; abort on unmount or item change
  React.useEffect(() => {
    const controller = new AbortController();
    queryCandidateCard(controller.signal);
    return () => controller.abort();
  }, [queryCandidateCard]);

  // Listen for refreshItemCards event to re-query candidate card when cards are added
  React.useEffect(() => {
    const handleRefreshItemCards = (event: Event) => {
      const customEvent = event as CustomEvent<{ itemEntityId: string }>;
      const { itemEntityId } = customEvent.detail;
      // Only refresh if this event is for the current item
      if (itemEntityId === item?.entityId) {
        queryCandidateCard();
      }
    };

    window.addEventListener('refreshItemCards', handleRefreshItemCards);
    return () => {
      window.removeEventListener('refreshItemCards', handleRefreshItemCards);
    };
  }, [item?.entityId, queryCandidateCard]);

  const handleMouseEvent = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleAddToCart = async () => {
    if (!candidateCard) {
      toast.error('No candidate card available to add to cart');
      return;
    }

    // Find the button element as origin for animation
    const buttonElement = document.querySelector(
      `[data-item-id="${item.entityId}"] .shopping-cart-button`
    ) as HTMLElement;
    const fromEl =
      buttonElement ||
      (document.querySelector(
        `[data-item-id="${item.entityId}"]`
      ) as HTMLElement);
    const toEl = document.getElementById('order-queue-target');

    const jwtToken = localStorage.getItem('idToken');
    if (!jwtToken) {
      toast.error('Authentication token not found');
      return;
    }

    try {
      // Add only the candidate card (oldest FULFILLED card) to order queue
      const response = await fetch(
        `/api/arda/kanban/kanban-card/${candidateCard.payload.eId}/event/request`,
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
          // Execute animation
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

            // Give the backend a moment to persist, then update order queue count so the sidebar badge updates
            await new Promise((r) => setTimeout(r, 400));
            await refreshOrderQueueData();

            // Show toast after animation
            showToast();
            toast.success('Added card to cart');

            // Refresh cards for this item to update the counts
            if (item?.entityId) {
              await refreshCardsForItem(item.entityId);
              // Re-query for the next candidate card
              await queryCandidateCard();
            }
          } catch (animationError) {
            console.error('Error in flyToTarget:', animationError);
            // Update order queue count even if animation fails
            await new Promise((r) => setTimeout(r, 400));
            await refreshOrderQueueData();
            // Still show toast even if animation fails
            showToast();
            toast.success('Added card to cart');
            // Refresh cards even if animation fails
            if (item?.entityId) {
              await refreshCardsForItem(item.entityId);
              // Re-query for the next candidate card
              await queryCandidateCard();
            }
          }
        } else {
          toast.error('Failed to add card to cart');
        }
      } else {
        toast.error('Failed to add card to cart');
      }
    } catch (error) {
      console.error('Error adding card to cart:', error);
      toast.error('Error adding card to cart');
    }
  };

  const handlePrintCard = async () => {
    if (!hasLoadedCards) {
      toast.error('Card data is still loading—please try again in a moment.');
      return;
    }

    if (safeCards.length === 0) {
      toast.error('No cards available to print');
      return;
    }

    // Process all cards (can reprint)
    const jwtToken = localStorage.getItem('idToken');
    if (!jwtToken) {
      toast.error('Authentication token not found');
      return;
    }

    try {
      setIsPrintingLabels(true);
      const cardIds = safeCards.map((card) => card.payload.eId);

      const response = await fetch('/api/arda/kanban/kanban-card/print-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          ids: cardIds,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.ok && data.data && data.data.url) {
          // Open PDF in new window
          window.open(data.data.url, '_blank', 'noopener,noreferrer');

          // Refresh cards for this item to update the print status
          if (item?.entityId) {
            await refreshCardsForItem(item.entityId);
          }

          toast.success(
            `Successfully printed ${safeCards.length} card${
              safeCards.length > 1 ? 's' : ''
            }!`
          );
        } else {
          console.error(
            'Failed to print cards - invalid response structure:',
            data
          );
          toast.error('Failed to print cards - invalid response');
        }
      } else {
        console.error('Failed to print cards:', response.status);
        toast.error('Failed to print cards');
      }
    } catch (error) {
      console.error('Error printing cards:', error);
      toast.error('Error printing cards');
    } finally {
      setIsPrintingLabels(false);
    }
  };

  const handlePrintLabel = async () => {
    if (!item?.recordId) {
      toast.error('Item data is not available');
      return;
    }

    const jwtToken = localStorage.getItem('idToken');
    if (!jwtToken) {
      toast.error('Authentication token not found');
      return;
    }

    try {
      setIsPrintingLabels(true);

      const response = await fetch('/api/arda/item/item/print-label', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          ids: [item.recordId],
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.ok && data.data && data.data.url) {
          // Open PDF in new window
          window.open(data.data.url, '_blank', 'noopener,noreferrer');

          // Refresh cards for this item to update the print status
          if (item?.entityId) {
            await refreshCardsForItem(item.entityId);
          }

          toast.success('Successfully printed label!');
        } else {
          console.error(
            'Failed to print labels - invalid response structure:',
            data
          );
          toast.error('Failed to print labels - invalid response');
        }
      } else {
        console.error('Failed to print labels:', response.status);
        toast.error('Failed to print labels');
      }
    } catch (error) {
      console.error('Error printing labels:', error);
      toast.error('Error printing labels');
    } finally {
      setIsPrintingLabels(false);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
        height: '100%',
        overflow: 'visible',
      }}
      onClick={handleMouseEvent}
      onMouseDown={handleMouseEvent}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          gap: '4px',
          flexShrink: 0,
          paddingLeft: '8px',
          paddingRight: '8px',
        }}
      >
        {/* View Item Details Button */}
        <button
          style={{
            height: '36px',
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
            borderRadius: '8px',
            backgroundColor: '#fff',
            border: '1px solid #e5e5e5',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 10px',
            zIndex: 0,
            cursor: onOpenItemDetails ? 'pointer' : 'default',
            position: 'relative',
            overflow: 'visible',
          }}
          title='View item details'
          onClick={(e) => {
            e.stopPropagation();
            onOpenItemDetails?.(item);
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        >
          <Eye size={16} style={{ color: '#000' }} />
        </button>
        {/* Shopping Cart Button */}
        <div
          data-item-id={item.entityId}
          style={{ position: 'relative', overflow: 'visible', display: visibleCount >= 2 ? undefined : 'none' }}
        >
          <button
            className='shopping-cart-button'
            style={{
              height: '36px',
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
              borderRadius: '8px',
              backgroundColor: '#fff',
              border: '1px solid #e5e5e5',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 10px',
              zIndex: 0,
              cursor:
                candidateCard && !isLoadingCards && !isLoadingCandidate
                  ? 'pointer'
                  : 'not-allowed',
              position: 'relative',
              overflow: 'visible',
              opacity:
                candidateCard && !isLoadingCards && !isLoadingCandidate ? 1 : 0.5,
            }}
            title={
              isLoadingCandidate
                ? 'Checking for available cards…'
                : !hasLoadedCards
                ? 'Loading card data…'
                : candidateCard
                ? 'Add card to Cart'
                : 'No restocked cards available for this item'
            }
            onClick={(e) => {
              e.stopPropagation();
              if (candidateCard && !isLoadingCards && !isLoadingCandidate) {
                handleAddToCart();
              }
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            disabled={
              !candidateCard || isLoadingCards || isLoadingCandidate
            }
          >
            <ShoppingCart size={16} style={{ color: '#000' }} />
          </button>
          <div
            style={{
              margin: 0,
              position: 'absolute',
              bottom: '-4px',
              right: '-4px',
              borderRadius: '9999px',
              backgroundColor: '#fff',
              border: '1px solid #e5e5e5',
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2px 4px',
              minWidth: '16px',
              zIndex: 10,
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
                fontWeight: 600,
                fontSize: '10px',
                color: '#0a0a0a',
                textAlign: 'center',
              }}
            >
              {hasLoadedCards ? inOrderQueueCount : '—'}
            </div>
          </div>
        </div>

        {/* Printer Button */}
        <div style={{ position: 'relative', overflow: 'visible', display: visibleCount >= 3 ? undefined : 'none' }}>
          <button
            style={{
              height: '36px',
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
              borderRadius: '8px',
              backgroundColor: '#fff',
              border: '1px solid #e5e5e5',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 10px',
              zIndex: 2,
              cursor:
                safeCards.length > 0 && !isLoadingCards
                  ? 'pointer'
                  : 'not-allowed',
              position: 'relative',
              overflow: 'visible',
              opacity: safeCards.length > 0 && !isLoadingCards ? 1 : 0.5,
            }}
            title={
              !hasLoadedCards
                ? 'Loading card data…'
                : safeCards.length > 0
                ? `Print ${safeCards.length} card${
                    safeCards.length > 1 ? 's' : ''
                  }`
                : 'No cards available'
            }
            onClick={(e) => {
              e.stopPropagation();
              if (safeCards.length > 0 && !isLoadingCards) {
                handlePrintCard();
              }
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            disabled={
              safeCards.length === 0 || isPrintingLabels || isLoadingCards
            }
          >
            <Printer size={16} style={{ color: '#000' }} />
          </button>
          <div
            style={{
              margin: 0,
              position: 'absolute',
              bottom: '-4px',
              right: '-4px',
              borderRadius: '9999px',
              backgroundColor: '#fff',
              border: '1px solid #e5e5e5',
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2px 4px',
              minWidth: '16px',
              zIndex: 10,
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
                fontWeight: 600,
                fontSize: '10px',
                color: '#0a0a0a',
                textAlign: 'center',
              }}
            >
              {hasLoadedCards ? printedCount : '—'}
            </div>
          </div>
        </div>

        {/* Print Label Button */}
        <div style={{ position: 'relative', overflow: 'visible', display: visibleCount >= 4 ? undefined : 'none' }}>
            <button
              style={{
                height: '36px',
                boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                borderRadius: '8px',
                backgroundColor: '#fff',
                border: '1px solid #e5e5e5',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 10px',
                zIndex: 4,
                cursor: !isPrintingLabels ? 'pointer' : 'not-allowed',
                position: 'relative',
                overflow: 'visible',
                opacity: !isPrintingLabels ? 1 : 0.5,
              }}
              title={isPrintingLabels ? 'Printing label…' : 'Print label'}
              onClick={(e) => {
                e.stopPropagation();
                if (!isPrintingLabels) {
                  handlePrintLabel();
                }
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              disabled={isPrintingLabels}
            >
              <Tag size={16} style={{ color: '#000' }} />
            </button>
        </div>
      </div>
    </div>
  );
};

// Card Count Cell Component
const CardCountCell = ({ item }: { item: items.Item }) => {
  const { itemCardsMap, ensureCardsForItem } = useItemCards();
  const [hasError, setHasError] = React.useState(false);
  
  React.useEffect(() => {
    if (item?.entityId && !hasError) {
      // Silently try to load cards, but don't show errors if it fails
      ensureCardsForItem(item.entityId).catch(() => {
        // Silently handle errors - don't show error to user
        setHasError(true);
      });
    }
  }, [item?.entityId, ensureCardsForItem, hasError]);

  const cards = item?.entityId ? itemCardsMap[item.entityId] : undefined;
  const hasLoadedCards = Array.isArray(cards);
  const cardCount = hasLoadedCards ? cards.length : undefined;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Prevent grid row click when clicking on card count
  };

  return (
    <div 
      className='flex items-center gap-1'
      onClick={handleClick}
      onMouseDown={handleClick}
    >
      <span className='text-blue-600 font-medium'>
        {typeof cardCount === 'number' ? cardCount : '—'}
      </span>
    </div>
  );
};

// Notes Cell Component
const NotesCell = ({
  item,
  onNotesSave,
}: {
  item: items.Item;
  onNotesSave?: (item: items.Item, notes: string) => void;
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleMouseEvent = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleSave = (notes: string) => {
    onNotesSave?.(item, notes);
  };

  if (!item.notes && !onNotesSave) {
    return <span>-</span>;
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
        }}
        onClick={handleMouseEvent}
        onMouseDown={handleMouseEvent}
      >
        {item.notes ? (
          <button
            onClick={handleClick}
            onMouseDown={handleMouseEvent}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={onNotesSave ? 'Edit note' : 'View note'}
          >
            <HiOutlineChatBubbleBottomCenterText size={20} style={{ color: '#000' }} />
          </button>
        ) : (
          <button
            onClick={handleClick}
            onMouseDown={handleMouseEvent}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'inherit',
              fontSize: 'inherit',
            }}
            title='Add note'
          >
            -
          </button>
        )}
      </div>
      {typeof document !== 'undefined' &&
        createPortal(
          <NoteModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title='Note'
            message={item.notes ?? ''}
            confirmText='Done'
            editable={Boolean(onNotesSave)}
            initialValue={item.notes ?? ''}
            onSave={onNotesSave ? handleSave : undefined}
          />,
          document.body
        )}
    </>
  );
};

// Card Notes Cell Component
const CardNotesCell = ({
  item,
  onCardNotesSave,
}: {
  item: items.Item;
  onCardNotesSave?: (item: items.Item, notes: string) => void;
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleMouseEvent = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleSave = (notes: string) => {
    onCardNotesSave?.(item, notes);
  };

  if (!item.cardNotesDefault && !onCardNotesSave) {
    return <span>-</span>;
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
        }}
        onClick={handleMouseEvent}
        onMouseDown={handleMouseEvent}
      >
        {item.cardNotesDefault ? (
          <button
            onClick={handleClick}
            onMouseDown={handleMouseEvent}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={onCardNotesSave ? 'Edit card note' : 'View card note'}
          >
            <HiOutlineChatBubbleBottomCenterText size={20} style={{ color: '#000' }} />
          </button>
        ) : (
          <button
            onClick={handleClick}
            onMouseDown={handleMouseEvent}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'inherit',
              fontSize: 'inherit',
            }}
            title='Add card note'
          >
            -
          </button>
        )}
      </div>
      {typeof document !== 'undefined' &&
        createPortal(
          <NoteModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title='Card Note'
            message={item.cardNotesDefault ?? ''}
            confirmText='Done'
            editable={Boolean(onCardNotesSave)}
            initialValue={item.cardNotesDefault ?? ''}
            onSave={onCardNotesSave ? handleSave : undefined}
          />,
          document.body
        )}
    </>
  );
};

// Select All Header Component
export const SelectAllHeaderComponent = React.memo((params: any) => {
  const [isChecked, setIsChecked] = React.useState(false);
  const [isIndeterminate, setIsIndeterminate] = React.useState(false);

  React.useEffect(() => {
    const updateSelectionState = () => {
      const api = params.api;
      if (!api) return;

      const displayedRowCount = api.getDisplayedRowCount();
      const selectedRowCount = api.getSelectedRows().length;

      if (selectedRowCount === 0) {
        setIsChecked(false);
        setIsIndeterminate(false);
      } else if (
        selectedRowCount === displayedRowCount &&
        displayedRowCount > 0
      ) {
        setIsChecked(true);
        setIsIndeterminate(false);
      } else {
        setIsChecked(false);
        setIsIndeterminate(true);
      }
    };

    updateSelectionState();

    const onSelectionChanged = () => {
      updateSelectionState();
    };

    params.api.addEventListener('selectionChanged', onSelectionChanged);

    return () => {
      params.api?.removeEventListener('selectionChanged', onSelectionChanged);
    };
  }, [params.api]);

  const handleSelectAll = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    e.preventDefault();

    const api = params.api;
    if (!api) return;

    try {
      if (isChecked || isIndeterminate) {
        // Deselect all rows (this automatically triggers selection changed event)
        api.deselectAll();
      } else {
        // Collect all displayed/filtered nodes then select in a single batch,
        // so AG Grid fires only one selectionChanged event instead of N.
        const nodesToSelect: IRowNode[] = [];
        api.forEachNodeAfterFilterAndSort((node: IRowNode) => {
          if (node.data) nodesToSelect.push(node);
        });
        api.setNodesSelected({ nodes: nodesToSelect, newValue: true });
      }
    } catch (error) {
      console.error('Error selecting/deselecting all:', error);
    }
  };

  if (!params || !params.api) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          padding: '0',
          minHeight: '48px',
        }}
      >
        <div
          style={{
            width: '16px',
            height: '16px',
            border: '1px solid #ccc',
            backgroundColor: '#fff',
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
        height: '100%',
        padding: '0',
        paddingLeft: '0',
        minHeight: '48px',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        pointerEvents: 'auto',
      }}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <input
        type='checkbox'
        className='rounded'
        checked={isChecked}
        ref={(input) => {
          if (input) {
            input.indeterminate = isIndeterminate;
          }
        }}
        onChange={(e) => {
          e.stopPropagation();
        }}
        onClick={handleSelectAll}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        style={{
          cursor: 'pointer',
          margin: '0',
          width: '16px',
          height: '16px',
          minWidth: '16px',
          minHeight: '16px',
          flexShrink: 0,
          display: 'block',
          visibility: 'visible',
          opacity: 1,
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          border: '1.5px solid #e5e5e5',
          borderRadius: '4px',
          backgroundColor: '#fff',
          boxShadow:
            '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)',
          position: 'relative',
        }}
      />
    </div>
  );
});

SelectAllHeaderComponent.displayName = 'SelectAllHeaderComponent';

// Items column definitions
export const itemsColumnDefs: ColDef<items.Item>[] = [
  {
    colId: 'select', // Explicitly set colId to ensure it's not confused with ag-Grid-SelectionColumn
    headerName: '',
    field: 'select' as any,
    width: 50,
    sortable: false,
    filter: false,
    resizable: false,
    suppressHeaderMenuButton: true,
    wrapHeaderText: false,
    autoHeaderHeight: false,
    checkboxSelection: false, // Don't use default checkbox selection - use custom component
    headerCheckboxSelection: false, // Don't use default header checkbox - use custom component
    suppressMovable: true, // Prevent column from being moved
    headerComponent: SelectAllHeaderComponent,
    cellStyle: {
      overflow: 'visible',
      textOverflow: 'clip',
      whiteSpace: 'normal',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0',
    },
    headerClass: 'arda-header-select',
    cellRenderer: (params: any) => {
      // Per-grid shift-click state passed via gridOptions.context — isolates each
      // grid instance so multiple grids on the same page don't share state.
      const selRef = (
        params.context?.lastSelectedRowIndexRef as
          | React.RefObject<number | null>
          | undefined
      ) ?? null;

      const handleMouseEvent = (e: React.MouseEvent) => {
        e.stopPropagation();
      };

      const handleCheckboxClick = (e: React.MouseEvent<HTMLInputElement>) => {
        e.stopPropagation();
        e.preventDefault();

        const currentRowIndex = params.node.rowIndex ?? -1;
        const api = params.api;
        const currentSelection = params.node.isSelected();
        const newNodeState = !currentSelection;

        // Check for modifier keys
        const isShiftKey = e.shiftKey;
        const isMetaKey = e.metaKey;
        const isCtrlKey = e.ctrlKey;
        const isModifierKey = isMetaKey || isCtrlKey;

        if (
          isShiftKey &&
          selRef !== null &&
          selRef.current !== null &&
          selRef.current >= 0 &&
          currentRowIndex >= 0
        ) {
          // Range selection with Shift key
          const startIndex = Math.min(selRef.current, currentRowIndex);
          const endIndex = Math.max(selRef.current, currentRowIndex);

          // Collect all displayed nodes in the range
          const nodesInRange: any[] = [];
          for (let i = startIndex; i <= endIndex; i++) {
            const node = api.getDisplayedRowAtIndex(i);
            if (node && node.setSelected) {
              nodesInRange.push(node);
            }
          }

          // Apply the same state to all nodes in range (select all or deselect all)
          // The state is based on what we want for the clicked node
          nodesInRange.forEach((node) => {
            node.setSelected(newNodeState, false);
          });

          // Update last selected to the clicked row
          if (selRef) selRef.current = currentRowIndex;
        } else if (isModifierKey) {
          // Command/Ctrl click - toggle individual row, keep other selections
          params.node.setSelected(newNodeState, false);
          if (selRef) selRef.current = currentRowIndex;
        } else {
          // Regular click - toggle single row, keep other selections
          params.node.setSelected(newNodeState, false);
          // Always update lastSelectedRowIndex on regular click for future shift-click
          if (selRef) selRef.current = currentRowIndex;
        }
      };

      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '100%',
            height: '100%',
            padding: 0,
            paddingLeft: 0,
          }}
          onClick={handleMouseEvent}
          onMouseDown={handleMouseEvent}
        >
          <input
            type='checkbox'
            className='rounded'
            checked={params.node.isSelected()}
            onChange={(e) => {
              e.stopPropagation();
            }}
            onClick={handleCheckboxClick}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          />
        </div>
      );
    },
  },
  {
    headerName: 'SKU',
    field: 'internalSKU',
    width: colWidth('SKU'),
    valueFormatter: (params: ValueFormatterParams) => params.value ?? '',
  },
  {
    headerName: 'GL Code',
    field: 'generalLedgerCode',
    width: colWidth('GL Code'),
    valueFormatter: (params: ValueFormatterParams) => params.value ?? '',
  },
  {
    headerName: 'Item',
    field: 'name',
    width: 300,
    sortable: true,
    filter: false,
    resizable: true,
    cellRenderer: (params: any) => {
      const item = params.data as items.Item;
      return (
        <div
          style={{
            width: '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'left',
            fontSize: '14px',
            fontFamily: 'Roboto, sans-serif',
          }}
        >
          <div
            style={{
              height: '41px',
              flex: 1,
              position: 'relative',
              lineHeight: '41px',
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: '#0a68f3',
              cursor: 'pointer',
            }}
          >
            {item.name}
          </div>
        </div>
      );
    },
  },

  {
    headerName: 'Image',
    field: 'imageUrl',
    width: colWidth('Image'),
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    cellRenderer: (params: any) => {
      const item = params.data as items.Item;
      return (
        <div style={{ width: 32, height: 32, flexShrink: 0, overflow: 'hidden' }}>
          <GridImage
            src={item.imageUrl || ''}
            alt={item.name}
            className='w-8 h-8 object-contain rounded'
          />
        </div>
      );
    },
  },
  {
    headerName: 'Quick Actions',
    field: 'quickActions' as any,
    // 8px pad + 4×36px buttons + 3×4px gaps + 8px pad = 172px; min = 1 button + padding = 52px
    width: 172,
    minWidth: 52,
    sortable: false,
    cellStyle: {
      overflow: 'visible',
      textOverflow: 'clip',
      whiteSpace: 'normal',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0',
    },
    headerClass: 'arda-header-quick-actions',
    cellRenderer: (params: any) => {
      const item = params.data as items.Item;
      return <QuickActionsCell item={item} />;
    },
  },
  {
    headerName: 'Supplier',
    field: 'primarySupply.supplier',
    width: colWidth('Supplier'),
    cellRenderer: (params: any) => {
      const item = params.data as items.Item;
      const supplier = item.primarySupply?.supplier;
      if (!supplier) return '-';

      return <span className='text-black'>{supplier}</span>;
    },
  },
  {
    headerName: 'Unit Price',
    field: 'primarySupply.unitCost',
    width: colWidth('Unit Price'),
    valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.value),
  },
  {
    headerName: 'Created',
    field: 'createdCoordinates',
    width: colWidth('Created'),
    valueFormatter: (params: ValueFormatterParams) =>
      formatDateTime(new Date(params.value?.recordedAsOf || 0).toISOString()),
  },
  {
    headerName: 'Min Qty',
    field: 'minQuantity.amount' as any,
    colId: 'minQuantityAmount',
    width: colWidth('Min Qty'),
    minWidth: colWidth('Min Qty'),
    suppressSizeToFit: true,
    valueFormatter: (params: ValueFormatterParams) => String(params.value ?? '-'),
  },
  {
    headerName: 'Min Unit',
    field: 'minQuantity.unit' as any,
    colId: 'minQuantityUnit',
    width: colWidth('Min Unit'),
    minWidth: colWidth('Min Unit'),
    suppressSizeToFit: true,
    cellRenderer: (params: any) => {
      const item = params.data as items.Item;
      return item.minQuantity?.unit ?? '-';
    },
  },
  {
    headerName: 'Order Qty',
    field: 'primarySupply.orderQuantity.amount' as any,
    colId: 'orderQuantityAmount',
    width: colWidth('Order Qty'),
    minWidth: colWidth('Order Qty'),
    suppressSizeToFit: true,
    valueFormatter: (params: ValueFormatterParams) => String(params.value ?? '-'),
  },
  {
    headerName: 'Order Unit',
    field: 'primarySupply.orderQuantity.unit' as any,
    colId: 'orderQuantityUnit',
    width: colWidth('Order Unit'),
    minWidth: colWidth('Order Unit'),
    suppressSizeToFit: true,
    cellRenderer: (params: any) => {
      const item = params.data as items.Item;
      return item.primarySupply?.orderQuantity?.unit ?? '-';
    },
  },
  {
    headerName: 'Order Method',
    field: 'primarySupply.orderMechanism',
    width: colWidth('Order Method'),
    cellRenderer: (params: any) => {
      const item = params.data as items.Item;
      const orderMechanism = item.primarySupply?.orderMechanism;
      if (!orderMechanism) return '-';

      const orderMethodMap: Record<items.OrderMechanism, string> = {
        EMAIL: 'Email',
        PURCHASE_ORDER: 'Purchase order',
        PHONE: 'Phone',
        IN_STORE: 'In store',
        ONLINE: 'Online',
        RFQ: 'Request for quotation (RFQ)',
        PRODUCTION: 'Production',
        THIRD_PARTY: '3rd party',
        OTHER: 'Other',
      };

      return (
        <span className='text-black'>
          {orderMethodMap[orderMechanism] || orderMechanism}
        </span>
      );
    },
  },
  {
    headerName: 'Type',
    field: 'classification.type',
    width: colWidth('Type'),
    cellRenderer: (params: any) => {
      const item = params.data as items.Item;
      const classification = item.classification;
      if (!classification?.type) return '-';
      return <span className='text-black'>{classification.type}</span>;
    },
  },
  {
    headerName: 'Location',
    field: 'locator.location',
    width: colWidth('Location'),
    cellRenderer: (params: any) => {
      const item = params.data as items.Item;
      const locator = item.locator;
      if (!locator) return '-';
      const parts = [
        locator.facility,
        locator.department,
        locator.location,
      ].filter(Boolean);
      const display = parts.join(' / ') || '-';
      return (
        <span className='text-black' title={display}>
          {display}
        </span>
      );
    },
  },
  {
    headerName: 'Sub-location',
    field: 'locator.subLocation',
    width: colWidth('Sub-location'),
    cellRenderer: (params: any) => {
      const item = params.data as items.Item;
      return <span className='text-black'>{item.locator?.subLocation || '-'}</span>;
    },
  },
  {
    headerName: '# of Cards',
    field: 'cardCount' as any,
    colId: 'cardCount',
    width: colWidth('# of Cards'),
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cellRenderer: (params: any) => {
      const item = params.data as items.Item;
      return <CardCountCell item={item} />;
    },
  },
  {
    headerName: 'Notes',
    field: 'notes',
    width: colWidth('Notes'),
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cellRenderer: (params: any) => {
      const item = params.data as items.Item;
      const onNotesSave = params.context?.onNotesSave as
        | ((item: items.Item, notes: string) => void)
        | undefined;
      return <NotesCell item={item} onNotesSave={onNotesSave} />;
    },
  },
  {
    headerName: 'Sub-Type',
    field: 'classification.subType',
    width: colWidth('Sub-Type'),
    cellRenderer: (params: any) => {
      const item = params.data as items.Item;
      return <span className='text-black'>{item.classification?.subType || '-'}</span>;
    },
  },
  {
    headerName: 'Use Case',
    field: 'useCase',
    width: colWidth('Use Case'),
    cellRenderer: (params: any) => {
      const item = params.data as items.Item;
      return <span className='text-black'>{item.useCase || '-'}</span>;
    },
  },
  {
    headerName: 'Department',
    field: 'locator.department',
    width: colWidth('Department'),
    cellRenderer: (params: any) => {
      const item = params.data as items.Item;
      return <span className='text-black'>{item.locator?.department || '-'}</span>;
    },
  },
  {
    headerName: 'Facility',
    field: 'locator.facility',
    width: colWidth('Facility'),
    cellRenderer: (params: any) => {
      const item = params.data as items.Item;
      return <span className='text-black'>{item.locator?.facility || '-'}</span>;
    },
  },
  {
    headerName: 'Card Notes',
    field: 'cardNotesDefault',
    width: colWidth('Card Notes'),
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cellRenderer: (params: any) => {
      const item = params.data as items.Item;
      const onCardNotesSave = params.context?.onCardNotesSave as
        | ((item: items.Item, notes: string) => void)
        | undefined;
      return <CardNotesCell item={item} onCardNotesSave={onCardNotesSave} />;
    },
  },
  {
    headerName: 'Taxable',
    field: 'taxable',
    width: colWidth('Taxable'),
    cellRenderer: (params: any) => {
      const item = params.data as items.Item;
      return <span className='text-black'>{item.taxable ? 'Yes' : 'No'}</span>;
    },
  },
  {
    headerName: 'Supplier URL',
    field: 'primarySupply.url',
    width: 200,
    cellRenderer: (params: any) => {
      const item = params.data as items.Item;
      const url = item.primarySupply?.url;
      if (!url) return '-';
      return (
        <a
          href={url.startsWith('http') ? url : `https://${url}`}
          target='_blank'
          rel='noopener noreferrer'
          className='text-blue-600 hover:underline'
          onClick={(e) => e.stopPropagation()}
        >
          {url.length > 30 ? `${url.substring(0, 30)}...` : url}
        </a>
      );
    },
  },
  {
    headerName: 'Supplier SKU',
    field: 'primarySupply.sku',
    width: colWidth('Supplier SKU'),
    cellRenderer: (params: any) => {
      const item = params.data as items.Item;
      return <span className='text-black'>{item.primarySupply?.sku || '-'}</span>;
    },
  },
  {
    headerName: 'Lead Time',
    field: 'primarySupply.averageLeadTime',
    width: colWidth('Lead Time'),
    cellRenderer: (params: any) => {
      const item = params.data as items.Item;
      const leadTime = item.primarySupply?.averageLeadTime;
      if (!leadTime || leadTime.length === 0) return '-';
      return <span className='text-black'>{leadTime.length} {leadTime.unit || 'hours'}</span>;
    },
  },
  {
    headerName: 'Order Cost',
    field: 'primarySupply.orderCost',
    width: colWidth('Order Cost'),
    valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.value),
  },
  {
    headerName: 'Card Size',
    field: 'cardSize',
    width: colWidth('Card Size'),
    cellRenderer: (params: any) => {
      const item = params.data as items.Item;
      const value = item.cardSize;
      if (!value) return '-';
      const label = cardSizeOptions.find((o) => o.value === value)?.label;
      return <span className='text-black'>{label ?? value}</span>;
    },
  },
  {
    headerName: 'Label Size',
    field: 'labelSize',
    width: colWidth('Label Size'),
    cellRenderer: (params: any) => {
      const item = params.data as items.Item;
      const value = item.labelSize;
      if (!value) return '-';
      const label = labelSizeOptions.find((o) => o.value === value)?.label;
      return <span className='text-black'>{label ?? value}</span>;
    },
  },
  {
    headerName: 'Breadcrumb Size',
    field: 'breadcrumbSize',
    width: colWidth('Breadcrumb Size'),
    cellRenderer: (params: any) => {
      const item = params.data as items.Item;
      const value = item.breadcrumbSize;
      if (!value) return '-';
      const label = breadcrumbSizeOptions.find((o) => o.value === value)?.label;
      return <span className='text-black'>{label ?? value}</span>;
    },
  },
  {
    headerName: 'Color',
    field: 'color',
    width: colWidth('Color'),
    cellRenderer: (params: any) => {
      const item = params.data as items.Item;
      const color = item.color;
      if (!color) return '-';
      const colorMap: Record<items.ItemColor, { hex: string; name: string }> = {
        RED: { hex: '#EF4444', name: 'Red' },
        GREEN: { hex: '#22C55E', name: 'Green' },
        BLUE: { hex: '#3B82F6', name: 'Blue' },
        YELLOW: { hex: '#FDE047', name: 'Yellow' },
        ORANGE: { hex: '#F97316', name: 'Orange' },
        PURPLE: { hex: '#A855F7', name: 'Purple' },
        PINK: { hex: '#EC4899', name: 'Pink' },
        GRAY: { hex: '#6B7280', name: 'Gray' },
        BLACK: { hex: '#000000', name: 'Black' },
        WHITE: { hex: '#FFFFFF', name: 'White' },
      };
      const colorInfo = colorMap[color] || { hex: '#6B7280', name: color };
      return (
        <div className='flex items-center gap-2'>
          <div
            className='w-4 h-4 rounded border border-gray-300'
            style={{ backgroundColor: colorInfo.hex }}
          />
          <span className='text-black'>{colorInfo.name}</span>
        </div>
      );
    },
  },
];

// Orders column definitions (placeholder - would need actual Order type)
export const ordersColumnDefs: ColDef<any>[] = [
  {
    headerName: 'Item',
    field: 'itemName',
    width: 250,
    pinned: 'left',
  },
  {
    headerName: 'Supplier',
    field: 'supplier',
    width: 150,
  },
  {
    headerName: 'Status',
    field: 'status',
    width: 120,
    cellRenderer: (params: any) => {
      const status = params.value as string;
      const statusColors = {
        Pending: 'bg-yellow-100 text-yellow-800',
        Processing: 'bg-blue-100 text-blue-800',
        Shipped: 'bg-green-100 text-green-800',
        Delivered: 'bg-gray-100 text-gray-800',
        Cancelled: 'bg-red-100 text-red-800',
      };
      const colorClass =
        statusColors[status as keyof typeof statusColors] ||
        'bg-gray-100 text-gray-800';
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
        >
          {status}
        </span>
      );
    },
  },
  {
    headerName: 'Date',
    field: 'orderDate',
    width: 120,
    cellRenderer: (params: any) => formatDate(params.value),
  },
  {
    headerName: 'Amount',
    field: 'totalAmount',
    width: 120,
    cellRenderer: (params: any) => formatCurrency(params.value),
  },
  {
    headerName: 'Quantity',
    field: 'quantity',
    width: 100,
    cellRenderer: (params: any) => formatQuantity(params.value),
  },
];

// Default column definition for Items
export const itemsDefaultColDef: ColDef<items.Item> = {
  sortable: true,
  filter: false,
  resizable: true,
  suppressMovable: false,
  sortingOrder: ['asc', 'desc', null],
  cellStyle: { display: 'flex', alignItems: 'center' },
};

// Default column definition for Orders
export const ordersDefaultColDef: ColDef<any> = {
  sortable: true,
  filter: false,
  resizable: true,
};
