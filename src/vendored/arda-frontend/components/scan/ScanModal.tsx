'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { XIcon, Loader, Package } from 'lucide-react';
import { Button } from '@frontend/components/ui/button';
import QrScanner from 'qr-scanner';
import { getKanbanCard } from '@frontend/lib/ardaClient';
import { toast } from 'sonner';
import { isAuthenticationError } from '@frontend/lib/utils';
import { flyToTarget } from '@frontend/lib/fly-to-target';
import { useOrderQueueToast } from '@frontend/hooks/useOrderQueueToast';
import { useOrderQueue } from '@frontend/contexts/OrderQueueContext';
import OrderQueueToast from '@frontend/components/ui/order-queue-toast';
import { ItemDetailsPanel } from '@frontend/components/items/ItemDetailsPanel';
import { ItemFormPanel } from '@frontend/components/items/ItemFormPanel';
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
import { CardActions } from './CardActions';

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

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan?: (scannedData: string) => void;
  cardData?: KanbanCardData | null;
  cardId?: string; // Add cardId for refreshing data after edits
  loading?: boolean;
  error?: string | null;
  onReceiveCard?: () => void;
}

export function ScanModal({
  isOpen,
  onClose,
  onScan,
  cardData,
  cardId,
  loading = false,
  error,
  onReceiveCard,
}: ScanModalProps) {
  const router = useRouter();
  const { refreshOrderQueueData } = useOrderQueue();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const qrScanner = useRef<QrScanner | null>(null);
  const [internalCardData, setInternalCardData] =
    useState<KanbanCardData | null>(cardData || null);
  const [internalLoading, setInternalLoading] = useState(loading);
  const [internalError, setInternalError] = useState<string | null>(
    error || null
  );
  const [isItemDetailsOpen, setIsItemDetailsOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<items.Item | null>(null);
  const scannerInitialized = useRef(false);

  // Order queue toast hook
  const { isToastVisible, showToast, hideToast, handleUndo } =
    useOrderQueueToast();

  // Function to handle viewing item details
  const handleViewItemDetails = () => {
    setIsItemDetailsOpen(true);
  };

  // Function to close item details panel
  const handleCloseItemDetails = () => {
    setIsItemDetailsOpen(false);
  };

  // Function to handle edit item
  const handleEditItem = () => {
    if (currentCardData?.payload?.itemDetails) {
      // Debug: Check entity IDs for troubleshooting
      // console.log('ScanModal Edit Debug:', {
      //   cardEId: currentCardData.payload.eId,
      //   itemEId: currentCardData.payload.item.eId,
      //   itemDetailsEId: currentCardData.payload.itemDetails.eId,
      // });

      // Convert KanbanCardData to Item format for editing with all required fields
      const itemData: items.Item = {
        // Required JournalledEntity fields - using placeholder values since we're only editing
        entityId: currentCardData.payload.item.eId,
        recordId: currentCardData.rId,
        author: currentCardData.author || 'system',
        timeCoordinates: {
          recordedAsOf: currentCardData.asOf.recorded,
          effectiveAsOf: currentCardData.asOf.effective,
        },
        createdCoordinates: {
          recordedAsOf: currentCardData.asOf.recorded,
          effectiveAsOf: currentCardData.asOf.effective,
        },

        // Item-specific fields
        name: currentCardData.payload.itemDetails.name,
        imageUrl: currentCardData.payload.itemDetails.imageUrl,
        classification: {
          type: '',
          subType: '',
        },
        useCase: '',
        locator: currentCardData.payload.itemDetails.locator
          ? {
              facility:
                currentCardData.payload.itemDetails.locator.facility || '',
              department: '', // Not available in card data
              location:
                currentCardData.payload.itemDetails.locator.location || '',
            }
          : {
              facility: '',
              department: '',
              location: '',
            },
        internalSKU:
          currentCardData.payload.itemDetails?.internalSKU ??
          currentCardData.payload.serialNumber ??
          '',
        minQuantity:
          currentCardData.payload.itemDetails?.minQuantity || defaultQuantity,
        notes: currentCardData.payload.itemDetails.notes || '',
        cardNotesDefault:
          currentCardData.payload.itemDetails.cardNotesDefault || '',
        taxable: true, // Default to true as per form
        primarySupply: {
          supplyEId:
            currentCardData.payload.itemDetails.primarySupply?.supplyEId,
          name: currentCardData.payload.itemDetails.primarySupply?.name,
          supplier:
            currentCardData.payload.itemDetails.primarySupply?.supplier || '',
          sku:
            currentCardData.payload.itemDetails.primarySupply?.sku ?? '',
          orderMechanism:
            (currentCardData.payload.itemDetails.primarySupply
              ?.orderMethod as items.OrderMechanism) ?? defaultOrderMechanism,
          url:
            currentCardData.payload.itemDetails.primarySupply?.url ?? '',
          minimumQuantity:
            currentCardData.payload.itemDetails?.minQuantity || defaultQuantity,
          orderQuantity:
            currentCardData.payload.itemDetails.primarySupply?.orderQuantity ||
            defaultQuantity,
          unitCost: currentCardData.payload.itemDetails.primarySupply?.unitCost
            ? {
                value:
                  currentCardData.payload.itemDetails.primarySupply.unitCost
                    .value,
                currency:
                  (currentCardData.payload.itemDetails.primarySupply.unitCost
                    .currency as Currency) || 'USD',
              }
            : defaultMoney,
          averageLeadTime: defaultDuration,
          orderCost: defaultMoney,
        },
        secondarySupply: currentCardData.payload.itemDetails.secondarySupply
          ?.supplyEId
          ? {
              supplyEId:
                currentCardData.payload.itemDetails.secondarySupply.supplyEId,
              name: currentCardData.payload.itemDetails.secondarySupply.name,
              supplier:
                currentCardData.payload.itemDetails.secondarySupply.supplier ||
                '',
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
        defaultSupply: currentCardData.payload.itemDetails.defaultSupply || '',
        cardSize:
          (currentCardData.payload.itemDetails.cardSize as items.CardSize) ||
          defaultCardSize,
        labelSize:
          (currentCardData.payload.itemDetails.labelSize as items.LabelSize) ||
          defaultLabelSize,
        breadcrumbSize:
          (currentCardData.payload.itemDetails
            .breadcrumbSize as items.BreadcrumbSize) || defaultBreadcrumbSize,
        color:
          (currentCardData.payload.itemDetails.itemColor as items.ItemColor) ||
          'GRAY',
      };

      // Debug: Verify itemToEdit structure
      // console.log('ScanModal itemToEdit:', { entityId: itemData.entityId, name: itemData.name });

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

  // Function to refresh card data after edit or receive
  const refreshCardData = useCallback(async () => {
    // Use cardId prop if available, otherwise use current card's eId from state
    const currentCard = internalCardData || cardData;
    const idToUse = cardId || currentCard?.payload?.eId;
    if (idToUse) {
      try {
        const refreshedData = await getKanbanCard(idToUse);
        setInternalCardData(refreshedData);
      } catch (error) {
        console.error('Error refreshing card data:', error);
        // Don't show error toast as the operation was successful, just data refresh failed
      }
    }
  }, [cardId, internalCardData, cardData]);

  const handleEditSuccess = () => {
    setIsEditFormOpen(false);
    setItemToEdit(null);
    // Refresh the card data to show updated information
    refreshCardData();
  };

  // Helper function to check if Add to order queue button should be disabled
  const isAddToOrderQueueDisabled = (
    cardData: KanbanCardData | null
  ): boolean => {
    if (!cardData?.payload?.status) {
      return false; // Default to enabled if status is missing
    }

    const disabledStatuses = ['REQUESTED', 'IN_PROCESS', 'REQUESTING'];
    return disabledStatuses.includes(cardData.payload.status);
  };

  // Helper function to check if Receive card button should be disabled
  // Disable when status is FULFILLED (restocked/fulfilled)
  const isReceiveCardDisabled = (
    cardData: KanbanCardData | null
  ): boolean => {
    if (!cardData?.payload?.status) {
      return false; // Default to enabled if status is missing
    }

    const status = cardData.payload.status.toUpperCase();
    return status === 'FULFILLED';
  };

  // Function to map scanned card data to ItemCard format
  const mapToItemCard = (cardData: KanbanCardData): ItemCard => {
    return {
      eid: cardData.payload.item.eId,
      title: cardData.payload.itemDetails.name,
      supplier: cardData.payload.itemDetails?.primarySupply?.supplier || '',
      image: cardData.payload.itemDetails?.imageUrl || '',
      link: '',
      sku: cardData.payload.serialNumber || '',
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

  const extractCardIdFromQR = useCallback((qrText: string): string | null => {
    try {
      const urlMatch = qrText.match(/\/kanban\/cards\/([a-f0-9-]+)/i);
      if (urlMatch) return urlMatch[1];

      const uuidMatch = qrText.match(
        /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i
      );
      if (uuidMatch) return qrText;

      return null;
    } catch (err) {
      console.error('Error extracting card ID:', err);
      return null;
    }
  }, []);

  const stopScanning = useCallback(() => {
    // Stop the QR scanner
    if (qrScanner.current) {
      try {
        qrScanner.current.stop();
        qrScanner.current.destroy();
        qrScanner.current = null;
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }

    setScanning(false);
  }, []);

  const handleQRCodeScanned = useCallback(
    async (scannedText: string) => {
      try {
        // Stop scanning first
        stopScanning();

        // Extract card ID from URL
        const cardId = extractCardIdFromQR(scannedText);
        if (!cardId) {
          setInternalError(
            'Not a valid Arda QR code. Please scan a valid Arda card QR.'
          );
          setScanning(false);
          return;
        }

        // Show loading state
        setInternalLoading(true);
        setInternalError(null);

        // Fetch card data
        const fetchedCardData = await getKanbanCard(cardId);
        setInternalCardData(fetchedCardData);
        setInternalLoading(false);

        // Call onScan callback if provided
        if (onScan) {
          onScan(scannedText);
        }
      } catch (err) {
        console.error('Error processing QR code:', err);

        // Check if this is an authentication error
        if (isAuthenticationError(err)) {
          // Redirect to login with the current path as next parameter
          const currentPath = window.location.pathname + window.location.search;
          router.push(`/signin?next=${encodeURIComponent(currentPath)}`);
          return;
        }

        setInternalError(
          'Card not found. The QR code may be for a card that no longer exists.'
        );
        setInternalLoading(false);
        setScanning(false);
      }
    },
    [onScan, extractCardIdFromQR, stopScanning, router]
  );

  // moved above

  // replaced by memoized version above
  /*
  const stopScanning = () => {
    if (!qrScanner.current && !scanning) {
      return; // Avoid noisy logs when nothing is running
    }

    if (qrScanner.current) {
      try {
        qrScanner.current.stop();
        qrScanner.current.destroy();
        qrScanner.current = null;
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }

    // Ensure video element releases the stream fully to avoid play() interruption on next open
    if (videoRef.current) {
      try {
        const vid = videoRef.current as unknown as HTMLVideoElement & { srcObject?: MediaStream | null };
        // @ts-expect-error - srcObject exists at runtime
        const stream: MediaStream | null = vid.srcObject || null;
        if (stream) {
          stream.getTracks().forEach((t) => t.stop());
        }
        // @ts-expect-error - srcObject exists at runtime
        vid.srcObject = null;
        vid.pause?.();
        vid.removeAttribute('src');
        vid.load?.();
      } catch {}
    }

    setScanning(false);
  };
  */

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Initialize camera when modal opens (if no card data provided)
  useEffect(() => {
    const startScanningLocal = async () => {
      try {
        setCameraError(null);
        setScanning(true);

        if (videoRef.current) {
          // Initialize QR scanner with the video element
          qrScanner.current = new QrScanner(
            videoRef.current,
            (result) => {
              handleQRCodeScanned(result.data);
            },
            {
              highlightScanRegion: true,
              highlightCodeOutline: true,
              preferredCamera: 'environment',
              maxScansPerSecond: 5,
            }
          );

          // Start the scanner
          try {
            await qrScanner.current.start();
          } catch (startErr) {
            console.error('Failed to start scanner:', startErr);
            throw startErr;
          }
        } else {
          console.error('Video element not ready');
          setCameraError('Video element not ready. Please try again.');
        }
      } catch (err) {
        console.error('QR scanner error:', err);

        // Don't show error for AbortError - it's expected during restart/cleanup
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        let errorMessage = 'Could not access camera. ';

        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            errorMessage += 'Please allow camera permission and try again.';
          } else if (err.name === 'NotFoundError') {
            errorMessage += 'No camera found on this device.';
          } else if (err.name === 'NotSupportedError') {
            errorMessage += 'Camera not supported in this browser.';
          } else {
            errorMessage +=
              err.message || 'Please check permissions and try again.';
          }
        } else {
          errorMessage += 'Please check permissions and try again.';
        }

        setCameraError(errorMessage);
        setScanning(false);
      }
    };

    const initScanning = async () => {
      if (
        isOpen &&
        !cardData &&
        !internalCardData &&
        !scannerInitialized.current
      ) {
        scannerInitialized.current = true;

        // Wait for video element to be rendered and retry if needed
        const tryStart = async (attempts = 0) => {
          if (attempts >= 10) {
            setCameraError(
              'Could not initialize video element. Please try again.'
            );
            return;
          }

          if (videoRef.current) {
            await startScanningLocal();
          } else {
            console.log(
              `Video element not ready, retrying... (attempt ${attempts + 1})`
            );
            setTimeout(() => tryStart(attempts + 1), 200);
          }
        };

        tryStart();
      }
    };

    initScanning();

    return () => {
      scannerInitialized.current = false;
      stopScanning();
    };
  }, [isOpen, cardData, internalCardData, handleQRCodeScanned, stopScanning]);

  // Reset modal state to start fresh
  const resetModalState = () => {
    setInternalCardData(null);
    setInternalLoading(false);
    setInternalError(null);
    setCameraError(null);
    scannerInitialized.current = false;
    stopScanning();
  };

  // Restart scanning after error
  const restartScanning = async () => {
    try {
      // First, completely reset everything
      resetModalState();

      // Wait a moment for cleanup
      setTimeout(async () => {
        try {
          setCameraError(null);
          setInternalError(null);
          setScanning(true);

          if (videoRef.current) {
            // Initialize QR scanner with the video element
            qrScanner.current = new QrScanner(
              videoRef.current,
              (result) => {
                handleQRCodeScanned(result.data);
              },
              {
                highlightScanRegion: true,
                highlightCodeOutline: true,
                preferredCamera: 'environment',
                maxScansPerSecond: 5,
              }
            );

            await qrScanner.current.start();
          }
        } catch (restartErr) {
          console.error('Error restarting scanner:', restartErr);
          // Don't show error for AbortError - it's expected during restart
          if (restartErr instanceof Error && restartErr.name !== 'AbortError') {
            setCameraError(
              'Could not restart camera. Please close and try again.'
            );
            setScanning(false);
          }
        }
      }, 100);
    } catch (err) {
      console.error('Error in restart process:', err);
      setCameraError('Could not restart camera. Please close and try again.');
      setScanning(false);
    }
  };

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
          // Don't show toast here, wait until after animation
        } else {
          console.error('Failed to add card to order queue:', data);
        }
      } else {
        console.error('Failed to add card to order queue:', response.status);
        toast.error('Failed to add card to order queue');
      }
    } catch (error) {
      console.error('Error adding card to order queue:', error);
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

      // Update order queue count after animation completes
      await refreshOrderQueueData();

      console.log('About to call showToast()');
      showToast();
      console.log('showToast() called');
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
    const currentCard = internalCardData || cardData;
    if (!currentCard?.payload?.eId) return;

    try {
      const jwtToken = localStorage.getItem('idToken');
      if (!jwtToken) {
        toast.error('Authentication token not found');
        return;
      }

      const response = await fetch(
        `/api/arda/kanban/kanban-card/${currentCard.payload.eId}/event/fulfill`,
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

          toast.success(
            <div className='flex flex-col gap-0.5'>
              <div className='font-semibold text-[#0a0a0a]'>Receive card</div>
              <div className='text-sm text-[#737373]'>
                Card has been received and restocked.
              </div>
            </div>,
            {
              icon: <Package className='w-4 h-4' />,
            }
          );

          // Call onReceiveCard callback if provided
          if (onReceiveCard) {
            onReceiveCard();
          }
        } else {
          console.error('Failed to receive card:', data);
          toast.error('Failed to receive card');
        }
      } else {
        console.error('Failed to receive card:', response.status);
        toast.error('Failed to receive card');
      }
    } catch (error) {
      console.error('Error receiving card:', error);
      toast.error('Error receiving card');
    }
  };

  // Use internal state or props
  const currentCardData = internalCardData || cardData;
  const currentLoading = internalLoading || loading;
  const currentError = internalError || error;

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
          // Reset state when clicking outside
          resetModalState();
          onClose();
        }
      }}
    >
      <div
        className='relative w-full max-w-[416px] mx-4 sm:mx-0 min-h-[500px] sm:min-h-[700px] max-h-[95vh] rounded-2xl bg-white border border-[#E5E5E5] shadow-lg px-4 sm:px-6 py-6 flex flex-col font-[Geist] sm:overflow-y-auto'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => {
            resetModalState();
            onClose();
          }}
          className='absolute top-4 right-4 text-muted-foreground hover:text-foreground'
        >
          <XIcon className='w-4 h-4' />
        </button>

        {/* Header */}
        <div className='flex flex-col gap-2 text-left'>
          <h2
            style={{
              color: 'var(--base-foreground, #0A0A0A)',
              fontSize: 18,
              fontWeight: 600,
              lineHeight: '18px',
            }}
          >
            Quick Scan
          </h2>
          <p
            style={{
              color: 'var(--base-muted-foreground, #737373)',
              fontSize: 14,
              fontWeight: 400,
              lineHeight: '20px',
            }}
          >
            Whoa there, cowboy! You’re quicker on that scanner than a
            rattlesnake at high noon.
          </p>
        </div>

        {/* Content area - different states */}
        {currentError || cameraError ? (
          // Error state
          <div className='w-full h-[550px] flex flex-col items-center justify-center my-3'>
            <div className='text-center max-w-md mx-auto p-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                {currentError ? 'Scan Error' : 'Camera Error'}
              </h2>
              <p className='text-gray-600 mb-6'>
                {currentError || cameraError}
              </p>
              <div className='flex gap-3 justify-center'>
                <Button
                  onClick={() => {
                    resetModalState();
                    onClose();
                  }}
                  className='px-4 py-2'
                  style={{
                    backgroundColor: 'var(--base-primary, #FC5A29)',
                    color: 'white',
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={restartScanning}
                  variant='outline'
                  className='px-4 py-2'
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        ) : currentLoading ? (
          // Loading state
          <div
            className='w-full h-[550px] flex flex-col items-center justify-center my-3'
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
              Looking up card...
            </p>
          </div>
        ) : currentCardData ? (
          // Success state - show card preview using ItemCardView component
          <>
            <CardActions
              cardData={currentCardData}
              onAddToOrderQueue={handleAddToOrderQueue}
              onReceiveCard={handleReceiveCard}
              onViewItemDetails={handleViewItemDetails}
              onClose={onClose}
              isAddToOrderQueueDisabled={isAddToOrderQueueDisabled}
              isReceiveCardDisabled={isReceiveCardDisabled}
            />
          </>
        ) : (
          // Camera scanning state
          <div className='w-full h-[550px] my-3 bg-gray-900 rounded-lg overflow-hidden relative'>
            {/* Always render video element - let qr-scanner handle all styling */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

            {/* Only show loading overlay when not scanning */}
            {!scanning && (
              <div className='absolute inset-0 flex flex-col items-center justify-center text-white bg-black bg-opacity-70'>
                <Loader
                  className='w-16 h-16 text-white animate-spin mb-4'
                  strokeWidth={1.5}
                />
                <p className='text-center text-sm'>
                  {cameraError || 'Starting camera...'}
                </p>
              </div>
            )}

            {/* Show instruction when scanning */}
            {scanning && (
              <div className='absolute bottom-4 left-0 right-0 text-center'>
                <p className='text-white text-sm font-medium bg-black bg-opacity-50 px-3 py-1 rounded-full mx-auto inline-block'>
                  Point camera at QR code
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer for scanning state */}
        {!currentCardData &&
          !currentLoading &&
          !currentError &&
          !cameraError && (
            <div className='flex justify-end pt-4'>
              <Button
                variant='outline'
                onClick={() => {
                  resetModalState();
                  onClose();
                }}
                className='rounded-md h-9 px-5'
                style={{
                  color: 'var(--base-foreground, #0A0A0A)',
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: 'Geist',
                  lineHeight: '20px',
                }}
              >
                Cancel
              </Button>
            </div>
          )}
      </div>

      {/* Item Details Panel */}
      {isItemDetailsOpen && currentCardData && (
        <ItemDetailsPanel
          item={mapToItemCard(currentCardData)}
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
    </div>
  );
}
