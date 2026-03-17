'use client';

import React from 'react';
import Image from 'next/image';
import { ColDef, IRowNode, ValueFormatterParams } from 'ag-grid-community';
import { ShoppingCart, Printer, Eye } from 'lucide-react';
import { LuCaptions } from 'react-icons/lu';
import { createPortal } from 'react-dom';
import * as items from '@frontend/types/items';
import * as domain from '@frontend/types/domain';
import { useItemCards } from '@frontend/app/items/ItemTableAGGrid';
import { flyToTarget } from '@frontend/lib/fly-to-target';
import { useOrderQueueToast } from '@frontend/hooks/useOrderQueueToast';
import { useOrderQueue } from '@frontend/contexts/OrderQueueContext';
import { toast } from 'sonner';
import { NoteModal } from '@frontend/components/common/NoteModal';
import {
  cardSizeOptions,
  labelSizeOptions,
  breadcrumbSizeOptions,
} from '@frontend/constants/constants';

// Canary atom imports
import { TextCellDisplay } from '@/components/canary/atoms/grid/text';
import { NumberCellDisplay } from '@/components/canary/atoms/grid/number';
import { BooleanCellDisplay } from '@/components/canary/atoms/grid/boolean';
import { EnumCellDisplay } from '@/components/canary/atoms/grid/enum';
import { MemoButtonCell, createMemoButtonCellEditor } from '@/components/canary/atoms/grid/memo';
import { ColorCellDisplay } from '@/components/canary/atoms/grid/color';


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

  const [candidateCard, setCandidateCard] = React.useState<any>(null);
  const [isLoadingCandidate, setIsLoadingCandidate] = React.useState(false);
  const mountedRef = React.useRef(true);
  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const inOrderQueueCount = safeCards.filter(
    (card: any) => card.payload?.status === 'REQUESTING'
  ).length;

  const printedCount = safeCards.filter(
    (card: any) => card.payload?.printStatus === 'PRINTED'
  ).length;

  const notPrintedCards = safeCards.filter(
    (card: any) => card.payload?.printStatus === 'NOT_PRINTED'
  );

  const [isPrintingLabels, setIsPrintingLabels] = React.useState(false);

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

        const requestBody: any = {
          filter: {
            eq: 'FULFILLED',
            locator: 'status',
          },
          paginate: {
            index: 0,
            size: 50,
          },
        };

        const response = await fetch(
          `/api/arda/kanban/kanban-card/query`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}`,
            },
            body: JSON.stringify(requestBody),
            signal,
          }
        );

        if (signal?.aborted) return;

        if (response.ok) {
          const data = await response.json();
          if (signal?.aborted || !mountedRef.current) return;
          if (data.ok && data.data?.results) {
            const itemCards = data.data.results.filter(
              (card: any) => card.payload?.item?.eId === item.entityId
            );
            itemCards.sort((a: any, b: any) => {
              const aDate = new Date(a.effectiveAsOf || 0).getTime();
              const bDate = new Date(b.effectiveAsOf || 0).getTime();
              return aDate - bDate;
            });
            if (mountedRef.current) {
              setCandidateCard(itemCards[0] || null);
              setIsLoadingCandidate(false);
            }
          }
        }
      } catch (error: any) {
        if (error?.name !== 'AbortError' && mountedRef.current) {
          setIsLoadingCandidate(false);
        }
      }
    },
    [item?.entityId]
  );

  React.useEffect(() => {
    const controller = new AbortController();
    queryCandidateCard(controller.signal);
    return () => controller.abort();
  }, [queryCandidateCard]);

  const handleMouseEvent = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleAddToCart = async () => {
    if (!candidateCard) {
      toast.error('No cards available to add to cart');
      return;
    }

    const jwtToken = localStorage.getItem('idToken');
    if (!jwtToken) {
      toast.error('Authentication token not found');
      return;
    }

    try {
      const cardId = candidateCard.payload.eId;
      const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
      const cartElement = document.querySelector('[data-cart-target]');

      const response = await fetch('/api/arda/kanban/kanban-card/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ ids: [cardId] }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.ok) {
          try {
            if (cardElement && cartElement) {
              await flyToTarget(cardElement as HTMLElement, cartElement as HTMLElement);
            } else {
              await new Promise((r) => setTimeout(r, 400));
            }
            await refreshOrderQueueData();
            showToast();
            toast.success('Added card to cart');
            if (item?.entityId) {
              await refreshCardsForItem(item.entityId);
              await queryCandidateCard();
            }
          } catch (animationError) {
            console.error('Error in flyToTarget:', animationError);
            await new Promise((r) => setTimeout(r, 400));
            await refreshOrderQueueData();
            showToast();
            toast.success('Added card to cart');
            if (item?.entityId) {
              await refreshCardsForItem(item.entityId);
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
          window.open(data.data.url, '_blank', 'noopener,noreferrer');

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
    if (!hasLoadedCards) {
      toast.error('Card data is still loading—please try again in a moment.');
      return;
    }

    if (notPrintedCards.length === 0) {
      toast.error('No unprinted cards available to print');
      return;
    }

    const jwtToken = localStorage.getItem('idToken');
    if (!jwtToken) {
      toast.error('Authentication token not found');
      return;
    }

    try {
      setIsPrintingLabels(true);
      const cardIds = notPrintedCards.map((card) => card.payload.eId);

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
          window.open(data.data.url, '_blank', 'noopener,noreferrer');

          if (item?.entityId) {
            await refreshCardsForItem(item.entityId);
          }
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
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
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
            cursor: 'pointer',
          }}
          title='View item details'
          onClick={(e) => {
            e.stopPropagation();
            onOpenItemDetails?.(item);
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Eye size={16} style={{ color: '#000' }} />
        </button>

        {/* Add to Cart Button */}
        <div style={{ position: 'relative', overflow: 'visible' }}>
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
              cursor: candidateCard && !isLoadingCards ? 'pointer' : 'not-allowed',
              opacity: candidateCard && !isLoadingCards ? 1 : 0.5,
            }}
            title={
              isLoadingCandidate
                ? 'Loading card data…'
                : candidateCard
                ? 'Add oldest restocked card to cart'
                : 'No restocked cards available'
            }
            onClick={(e) => {
              e.stopPropagation();
              if (candidateCard && !isLoadingCards) handleAddToCart();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            disabled={!candidateCard || isLoadingCards}
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

        {/* Print Card Button */}
        <div style={{ position: 'relative', overflow: 'visible' }}>
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
              cursor: safeCards.length > 0 && !isLoadingCards ? 'pointer' : 'not-allowed',
              opacity: safeCards.length > 0 && !isLoadingCards ? 1 : 0.5,
            }}
            title={
              !hasLoadedCards
                ? 'Loading card data…'
                : safeCards.length > 0
                ? `Print ${safeCards.length} card${safeCards.length > 1 ? 's' : ''}`
                : 'No cards available to print'
            }
            onClick={(e) => {
              e.stopPropagation();
              if (safeCards.length > 0 && !isLoadingCards) handlePrintCard();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            disabled={safeCards.length === 0 || isPrintingLabels || isLoadingCards}
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
        <div style={{ position: 'relative', overflow: 'visible' }}>
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
                cursor:
                  notPrintedCards.length > 0 && !isLoadingCards
                    ? 'pointer'
                    : 'not-allowed',
                position: 'relative',
                overflow: 'visible',
                opacity:
                  notPrintedCards.length > 0 && !isLoadingCards ? 1 : 0.5,
              }}
              title={
                !hasLoadedCards
                  ? 'Loading card data…'
                  : notPrintedCards.length > 0
                  ? `Print ${notPrintedCards.length} label${
                      notPrintedCards.length > 1 ? 's' : ''
                    }`
                  : 'No unprinted cards available'
              }
              onClick={(e) => {
                e.stopPropagation();
                if (notPrintedCards.length > 0 && !isLoadingCards) {
                  handlePrintLabel();
                }
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              disabled={
                notPrintedCards.length === 0 ||
                isPrintingLabels ||
                isLoadingCards
              }
            >
              <LuCaptions size={16} style={{ color: '#000' }} />
            </button>
            <div
              style={{
                margin: 0,
                position: 'absolute',
                bottom: '-4px',
                right: '-4px',
                borderRadius: '9999px',
                backgroundColor: '#fff',
                border: '1px solid #babfc7',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.15)',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px 4px',
                minWidth: '16px',
                zIndex: 10,
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
                {hasLoadedCards ? notPrintedCards.length : '—'}
              </div>
            </div>
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
      ensureCardsForItem(item.entityId).catch(() => {
        setHasError(true);
      });
    }
  }, [item?.entityId, ensureCardsForItem, hasError]);

  const cards = item?.entityId ? itemCardsMap[item.entityId] : undefined;
  const hasLoadedCards = Array.isArray(cards);
  const cardCount = hasLoadedCards ? cards.length : undefined;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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

// Canary memo cell editor for Notes (with modal save flow)
const NotesMemoEditor = createMemoButtonCellEditor({ title: 'Note' });
const CardNotesMemoEditor = createMemoButtonCellEditor({ title: 'Card Note' });

// Order method options map for EnumCellDisplay
const ORDER_METHOD_OPTIONS: Record<string, string> = {
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

// Card/Label/Breadcrumb size option maps for EnumCellDisplay
const CARD_SIZE_OPTIONS: Record<string, string> = Object.fromEntries(
  cardSizeOptions.map((o: { value: string; label: string }) => [o.value, o.label])
);
const LABEL_SIZE_OPTIONS: Record<string, string> = Object.fromEntries(
  labelSizeOptions.map((o: { value: string; label: string }) => [o.value, o.label])
);
const BREADCRUMB_SIZE_OPTIONS: Record<string, string> = Object.fromEntries(
  breadcrumbSizeOptions.map((o: { value: string; label: string }) => [o.value, o.label])
);

// Items column definitions — canary integration fork
export const itemsColumnDefs: ColDef<items.Item>[] = [
  // NOTE: select column removed — DataGrid uses native AG Grid rowSelection
  {
    headerName: 'SKU',
    field: 'internalSKU',
    width: 140,
    cellRenderer: (params: any) => (
      <TextCellDisplay value={params.data?.internalSKU} />
    ),
  },
  {
    headerName: 'GL Code',
    field: 'generalLedgerCode',
    width: 140,
    cellRenderer: (params: any) => (
      <TextCellDisplay value={params.data?.generalLedgerCode} />
    ),
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
    width: 80,
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cellRenderer: (params: any) => {
      const item = params.data as items.Item;
      return (
        <GridImage
          src={item.imageUrl || ''}
          alt={item.name}
          className='w-8 h-8 object-contain rounded'
        />
      );
    },
  },
  {
    headerName: 'Quick Actions',
    field: 'quickActions' as any,
    width: 164,
    minWidth: 38,
    sortable: false,
    cellStyle: {
      overflow: 'hidden',
      textOverflow: 'clip',
      whiteSpace: 'normal',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0',
    },
    headerStyle: {
      overflow: 'visible',
      textOverflow: 'clip',
      whiteSpace: 'normal',
    },
    cellRenderer: (params: any) => {
      const item = params.data as items.Item;
      return <QuickActionsCell item={item} />;
    },
  },
  {
    headerName: 'Supplier',
    field: 'primarySupply.supplier',
    width: 150,
    // Display: canary TextCellDisplay; editor: keep vendored SupplierCellEditor
    cellRenderer: (params: any) => (
      <TextCellDisplay value={params.data?.primarySupply?.supplier} />
    ),
  },
  {
    headerName: 'Unit Price',
    field: 'primarySupply.unitCost',
    width: 120,
    valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.value),
  },
  {
    headerName: 'Created',
    field: 'createdCoordinates',
    width: 150,
    valueFormatter: (params: ValueFormatterParams) =>
      formatDateTime(new Date(params.value?.recordedAsOf || 0).toISOString()),
  },
  {
    headerName: 'Min Qty',
    field: 'minQuantity.amount' as any,
    colId: 'minQuantityAmount',
    width: 150,
    minWidth: 100,
    suppressSizeToFit: true,
    cellRenderer: (params: any) => (
      <NumberCellDisplay value={params.data?.minQuantity?.amount} />
    ),
  },
  {
    headerName: 'Min Unit',
    field: 'minQuantity.unit' as any,
    colId: 'minQuantityUnit',
    width: 130,
    minWidth: 90,
    suppressSizeToFit: true,
    cellRenderer: (params: any) => {
      const item = params.data as items.Item;
      return item.minQuantity?.unit ?? '-';
    },
  },
  {
    headerName: 'Order Amount',
    field: 'primarySupply.orderQuantity.amount' as any,
    colId: 'orderQuantityAmount',
    width: 150,
    minWidth: 100,
    suppressSizeToFit: true,
    cellRenderer: (params: any) => (
      <NumberCellDisplay value={params.data?.primarySupply?.orderQuantity?.amount} />
    ),
  },
  {
    headerName: 'Order Unit',
    field: 'primarySupply.orderQuantity.unit' as any,
    colId: 'orderQuantityUnit',
    width: 130,
    minWidth: 90,
    suppressSizeToFit: true,
    cellRenderer: (params: any) => {
      const item = params.data as items.Item;
      return item.primarySupply?.orderQuantity?.unit ?? '-';
    },
  },
  {
    headerName: 'Order Method',
    field: 'primarySupply.orderMechanism',
    width: 140,
    cellRenderer: (params: any) => (
      <EnumCellDisplay
        value={params.data?.primarySupply?.orderMechanism}
        options={ORDER_METHOD_OPTIONS}
      />
    ),
  },
  {
    headerName: 'Classification',
    field: 'classification.type',
    width: 150,
    cellRenderer: (params: any) => {
      const item = params.data as items.Item;
      const classification = item.classification;
      if (!classification?.type) return '-';
      const display = classification.subType
        ? `${classification.type} - ${classification.subType}`
        : classification.type;
      return <span className='text-black'>{display}</span>;
    },
  },
  {
    headerName: 'Location',
    field: 'locator.location',
    width: 150,
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
    width: 150,
    cellRenderer: (params: any) => (
      <TextCellDisplay value={params.data?.locator?.subLocation} />
    ),
  },
  {
    headerName: '# of Cards',
    field: 'cardCount' as any,
    colId: 'cardCount',
    width: 100,
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
    width: 100,
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
      return (
        <MemoButtonCell
          value={item.notes}
          editable={Boolean(onNotesSave)}
          onSave={onNotesSave ? (v: string) => onNotesSave(item, v) : undefined}
          title='Note'
        />
      );
    },
    cellEditor: NotesMemoEditor,
  },
  {
    headerName: 'Sub-Type',
    field: 'classification.subType',
    width: 150,
    cellRenderer: (params: any) => (
      <TextCellDisplay value={params.data?.classification?.subType} />
    ),
  },
  {
    headerName: 'Use Case',
    field: 'useCase',
    width: 150,
    cellRenderer: (params: any) => (
      <TextCellDisplay value={params.data?.useCase} />
    ),
  },
  {
    headerName: 'Department',
    field: 'locator.department',
    width: 150,
    cellRenderer: (params: any) => (
      <TextCellDisplay value={params.data?.locator?.department} />
    ),
  },
  {
    headerName: 'Facility',
    field: 'locator.facility',
    width: 150,
    cellRenderer: (params: any) => (
      <TextCellDisplay value={params.data?.locator?.facility} />
    ),
  },
  {
    headerName: 'Card Notes',
    field: 'cardNotesDefault',
    width: 100,
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
      return (
        <MemoButtonCell
          value={item.cardNotesDefault}
          editable={Boolean(onCardNotesSave)}
          onSave={onCardNotesSave ? (v: string) => onCardNotesSave(item, v) : undefined}
          title='Card Note'
        />
      );
    },
    cellEditor: CardNotesMemoEditor,
  },
  {
    headerName: 'Taxable',
    field: 'taxable',
    width: 100,
    cellRenderer: (params: any) => (
      <BooleanCellDisplay value={params.data?.taxable} />
    ),
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
    width: 150,
    cellRenderer: (params: any) => (
      <TextCellDisplay value={params.data?.primarySupply?.sku} />
    ),
  },
  {
    headerName: 'Lead Time',
    field: 'primarySupply.averageLeadTime',
    width: 120,
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
    width: 120,
    valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.value),
  },
  {
    headerName: 'Card Size',
    field: 'cardSize',
    width: 150,
    cellRenderer: (params: any) => (
      <EnumCellDisplay
        value={params.data?.cardSize}
        options={CARD_SIZE_OPTIONS}
      />
    ),
  },
  {
    headerName: 'Label Size',
    field: 'labelSize',
    width: 120,
    cellRenderer: (params: any) => (
      <EnumCellDisplay
        value={params.data?.labelSize}
        options={LABEL_SIZE_OPTIONS}
      />
    ),
  },
  {
    headerName: 'Breadcrumb Size',
    field: 'breadcrumbSize',
    width: 150,
    cellRenderer: (params: any) => (
      <EnumCellDisplay
        value={params.data?.breadcrumbSize}
        options={BREADCRUMB_SIZE_OPTIONS}
      />
    ),
  },
  {
    headerName: 'Color',
    field: 'color',
    width: 120,
    cellRenderer: (params: any) => (
      <ColorCellDisplay value={params.data?.color} />
    ),
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
};

// Default column definition for Orders
export const ordersDefaultColDef: ColDef<any> = {
  sortable: true,
  filter: false,
  resizable: true,
};
