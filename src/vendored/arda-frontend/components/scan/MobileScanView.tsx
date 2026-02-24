'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import QrScanner from 'qr-scanner';
import {
  QrCode,
  List,
  X,
  ChevronDown,
  SlidersHorizontal,
  Check,
  ArrowDown,
  ShoppingCart,
  PackageOpen,
  FileText,
  CreditCard,
} from 'lucide-react';
import { getKanbanCard } from '@frontend/lib/ardaClient';
import {
  CARD_STATE_CONFIG,
  getAllCardStates,
  canAddToOrderQueue,
} from '@frontend/lib/cardStateUtils';
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
import { toast, Toaster } from 'sonner';
import { useAuthErrorHandler } from '@frontend/hooks/useAuthErrorHandler';
import { useOrderQueue } from '@frontend/contexts/OrderQueueContext';
import { CardActions } from './CardActions';
import Image from 'next/image';

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
      minQuantity?: {
        amount: number;
        unit: string;
      };
      primarySupply: {
        supplyEId?: string;
        supplier: string;
        name?: string;
        sku?: string;
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

interface MobileScanViewProps {
  onScan?: (scannedData: string) => void;
  onClose?: () => void;
  initialCardId?: string; // Optional cardId to pre-populate the scan view
  initialView?: 'scan' | 'list' | 'card';
  showCardToggle?: boolean;
}

interface ScannedItem {
  id: string;
  cardData: KanbanCardData;
  scannedAt: Date;
}

export function MobileScanView({
  onScan,
  onClose,
  initialCardId,
  initialView = 'scan',
  showCardToggle = false,
}: MobileScanViewProps) {
  const { refreshOrderQueueData } = useOrderQueue();
  const { handleAuthError } = useAuthErrorHandler();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentView, setCurrentView] = useState<'scan' | 'list' | 'card'>(
    initialView,
  );
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanComplete, setScanComplete] = useState(false);
  const [qrDetected, setQrDetected] = useState(false);
  const qrScanner = useRef<QrScanner | null>(null);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const scannerInitialized = useRef(false);
  const qrDetectionTimeout = useRef<NodeJS.Timeout | null>(null);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(
    new Set(Object.keys(CARD_STATE_CONFIG).filter((key) => key !== 'UNKNOWN')),
  );
  const [isItemDetailsPanelOpen, setIsItemDetailsPanelOpen] = useState(false);
  const [selectedItemForDetails, setSelectedItemForDetails] =
    useState<ItemCard | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<items.Item | null>(null);
  const [isClearItemsModalOpen, setIsClearItemsModalOpen] = useState(false);
  const [isCantAddCardsModalOpen, setIsCantAddCardsModalOpen] = useState(false);
  const [cardsCantAddCount, setCardsCantAddCount] = useState(0);
  const [isCantReceiveCardsModalOpen, setIsCantReceiveCardsModalOpen] =
    useState(false);
  const [cardsCantReceiveCount, setCardsCantReceiveCount] = useState(0);
  const [initialCardLoaded, setInitialCardLoaded] = useState(false);
  const [activeCardId, setActiveCardId] = useState<string | null>(
    initialCardId || null,
  );

  // Extract item ID from QR code text (for /item/[itemId] URLs)
  const extractItemIdFromQR = useCallback((qrText: string): string | null => {
    try {
      // Clean the text first
      const cleanText = qrText.trim();

      // Match full URLs first (e.g., https://stage.alpha002.app.arda.cards/item/...)
      const fullUrlMatch = cleanText.match(
        /https?:\/\/[^\/\s]+\/item\/([a-f0-9-]+)/i,
      );
      if (fullUrlMatch) {
        console.info(
          'MobileScanView: Full URL matched for item',
          fullUrlMatch[1],
        );
        return fullUrlMatch[1];
      }

      // Match relative URLs like /item/[itemId]
      const urlMatch = cleanText.match(/\/item\/([a-f0-9-]+)/i);
      if (urlMatch) {
        console.info(
          'MobileScanView: Relative URL matched for item',
          urlMatch[1],
        );
        return urlMatch[1];
      }

      return null;
    } catch (err) {
      console.error('Error extracting item ID:', err);
      return null;
    }
  }, []);

  const extractCardIdFromQR = useCallback((qrText: string): string | null => {
    try {
      const cleanText = qrText.trim();

      // Match URLs like /kanban/cards/[cardId]?view=card&src=qr
      const urlMatch = cleanText.match(/\/kanban\/cards\/([a-f0-9-]+)/i);
      if (urlMatch) return urlMatch[1];

      // Also match full URLs
      const fullUrlMatch = cleanText.match(
        /https?:\/\/[^\/\s]+\/kanban\/cards\/([a-f0-9-]+)/i,
      );
      if (fullUrlMatch) return fullUrlMatch[1];

      // Match UUID directly
      const uuidMatch = cleanText.match(/^[a-f0-9\-]{36}$/i);
      if (uuidMatch) return cleanText;

      return null;
    } catch {
      return null;
    }
  }, []);

  const stopScanning = useCallback(async () => {
    if (qrScanner.current) {
      try {
        await qrScanner.current.stop();
      } catch (err) {
        // Ignore stop errors - video might already be stopped
        if (err instanceof Error && err.name !== 'AbortError') {
          console.warn('Error stopping scanner:', err);
        }
      }
      try {
        qrScanner.current.destroy();
      } catch (err) {
        // Ignore destroy errors
        console.warn('Error destroying scanner:', err);
      }
      qrScanner.current = null;
    }

    // Pause video element to prevent play() conflicts
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      } catch {
        // Ignore pause errors
      }
    }

    setScanning(false);
    setQrDetected(false);
    if (qrDetectionTimeout.current) {
      clearTimeout(qrDetectionTimeout.current);
      qrDetectionTimeout.current = null;
    }
  }, []);

  const startScanningRef = useRef<() => Promise<void>>(async () => {});
  const handleQRCodeScannedRef = useRef<(text: string) => Promise<void>>(
    async () => {},
  );

  const startScanning = useCallback(async () => {
    try {
      setCameraError(null);
      setScanning(true);
      setQrDetected(false);

      // Stop any existing scanner first and wait for it to fully stop
      if (qrScanner.current) {
        try {
          await qrScanner.current.stop();
        } catch {
          // Ignore stop errors
        }
        try {
          qrScanner.current.destroy();
        } catch {
          // Ignore destroy errors
        }
        qrScanner.current = null;
      }

      // Wait a bit for video to be ready
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check if video element exists
      if (!videoRef.current) {
        throw new Error('Video element not ready');
      }

      // Reset video element state
      try {
        if (videoRef.current.srcObject) {
          const tracks = (
            videoRef.current.srcObject as MediaStream
          ).getTracks();
          tracks.forEach((track) => track.stop());
        }
        videoRef.current.srcObject = null;
      } catch {
        // Ignore errors clearing video
      }

      // Create new scanner instance
      qrScanner.current = new QrScanner(
        videoRef.current,
        (result) => {
          // Set QR detected state when QR is found - keep it active
          setQrDetected(true);
          // Clear any existing timeout
          if (qrDetectionTimeout.current) {
            clearTimeout(qrDetectionTimeout.current);
          }
          // Reset detection state only if QR is not detected for a while
          // This keeps the border orange while QR is in view
          qrDetectionTimeout.current = setTimeout(() => {
            setQrDetected(false);
          }, 2000);
          handleQRCodeScannedRef.current?.(result.data);
        },
        {
          highlightScanRegion: false,
          highlightCodeOutline: false,
          preferredCamera: 'environment',
          maxScansPerSecond: 5,
        },
      );

      // Start the scanner - QrScanner will handle camera initialization
      await qrScanner.current.start();
      setCameraError(null);
    } catch (err: unknown) {
      // Ignore AbortError and play() interruption errors
      if (
        err instanceof Error &&
        (err.name === 'AbortError' ||
          err.message?.includes('play() request was interrupted') ||
          err.message?.includes('The play() request was interrupted'))
      ) {
        return;
      }

      console.error('Scanner error:', err);

      let error = 'Could not access camera. ';
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          error += 'Please allow camera permission and try again.';
        } else if (err.name === 'NotFoundError') {
          error += 'No camera found on this device.';
        } else if (err.name === 'NotReadableError') {
          error += 'Camera is already in use.';
        } else if (err.name === 'NotSupportedError') {
          error += 'Camera not supported in this browser.';
        } else if (err.message?.includes('Video element not ready')) {
          error = 'Video element not ready. Please try again.';
        } else {
          error += err.message || 'Please check permissions and try again.';
        }
      } else {
        error += 'Please check permissions and try again.';
      }
      setCameraError(error);
      setScanning(false);
      scannerInitialized.current = false;

      // Clean up on error
      if (qrScanner.current) {
        try {
          await qrScanner.current.stop();
        } catch {
          // Ignore cleanup errors
        }
        try {
          qrScanner.current.destroy();
        } catch {
          // Ignore cleanup errors
        }
        qrScanner.current = null;
      }
    }
  }, []);

  startScanningRef.current = startScanning;

  const handleQRCodeScanned = useCallback(
    async (scannedText: string) => {
      try {
        // Clear any timeout that might reset qrDetected
        if (qrDetectionTimeout.current) {
          clearTimeout(qrDetectionTimeout.current);
          qrDetectionTimeout.current = null;
        }

        // Clean the scanned text
        const cleanText = scannedText.trim();
        console.info('MobileScanView: QR code scanned', cleanText);

        // Keep QR detected state visible during processing
        setQrDetected(true);

        // First check if it's an item URL
        const itemId = extractItemIdFromQR(cleanText);
        if (itemId) {
          console.info(
            'MobileScanView: Item ID extracted, redirecting to item page',
            itemId,
          );
          const itemPath = `/item/${itemId}`;
          // Stop scanning
          await stopScanning();
          // Close the scan view
          if (onClose) {
            onClose();
          }
          // Navigate to item page
          window.location.href = itemPath;
          return;
        }

        // Then check if it's a kanban card URL
        const cardId = extractCardIdFromQR(cleanText);
        if (!cardId) {
          // Invalid QR - keep orange for a moment then reset
          setTimeout(async () => {
            setQrDetected(false);
            await new Promise((resolve) => setTimeout(resolve, 200));
            await startScanningRef.current();
          }, 1500);
          return;
        }

        // Keep orange border while fetching card data
        const card = await getKanbanCard(cardId);

        // Add new scanned item only if not already scanned (check and add atomically)
        let itemWasAdded = false;
        setScannedItems((prev) => {
          // Check if card was already scanned
          const isDuplicate = prev.some((item) => item.id === cardId);
          if (isDuplicate) {
            // Card already scanned, don't add again
            return prev;
          }
          // Filter out any existing duplicates (safety check) and add new item
          const filtered = prev.filter((item) => item.id !== cardId);
          itemWasAdded = true;
          return [
            { id: cardId, cardData: card, scannedAt: new Date() },
            ...filtered,
          ];
        });

        // Always show toast when a new item is added (not duplicate)
        if (itemWasAdded) {
          const desiredViewAfterScan = showCardToggle ? 'card' : 'list';
          // Clear any existing toast timeout to prevent conflicts
          if (toastTimeout.current) {
            clearTimeout(toastTimeout.current);
            toastTimeout.current = null;
          }

          // Force toast to show immediately - reset state first to ensure visibility
          setScanComplete(false);
          // Use a small delay to ensure state update
          setTimeout(() => {
            setScanComplete(true);
            onScan?.(scannedText);

            // Keep orange border visible while toast is showing (2 seconds)
            // Then reset visual states (but keep scanner running)
            toastTimeout.current = setTimeout(() => {
              setQrDetected(false);
              setScanComplete(false);
              toastTimeout.current = null;
              setCurrentView(desiredViewAfterScan);
            }, 2000);
          }, 10);
        } else {
          // Card already scanned - reset visual state and continue scanning
          setTimeout(() => {
            setQrDetected(false);
          }, 1500);
        }
      } catch {
        // Error - keep orange for a moment then reset
        setTimeout(async () => {
          setQrDetected(false);
          await new Promise((resolve) => setTimeout(resolve, 200));
          await startScanningRef.current();
        }, 1500);
      }
    },
    [
      onScan,
      extractItemIdFromQR,
      extractCardIdFromQR,
      showCardToggle,
      onClose,
      stopScanning,
    ],
  );

  useEffect(() => {
    handleQRCodeScannedRef.current = handleQRCodeScanned;
  }, [handleQRCodeScanned]);

  // Load initial card if provided (when opening from QR scan URL)
  useEffect(() => {
    if (!initialCardId || initialCardLoaded) return;

    const loadInitialCard = async () => {
      try {
        const cardData = await getKanbanCard(initialCardId);
        const newItem: ScannedItem = {
          id: initialCardId,
          cardData: cardData,
          scannedAt: new Date(),
        };

        setScannedItems([newItem]);
        setActiveCardId(initialCardId);
        if (initialView === 'card') {
          setCurrentView('card');
        } else if (initialView === 'list') {
          setCurrentView('list');
        }
        setInitialCardLoaded(true);

        if (onScan) {
          onScan(initialCardId);
        }
      } catch (err) {
        console.error('Error loading initial card:', err);
        if (handleAuthError(err)) {
          return;
        }
        toast.error('Failed to load card');
      }
    };

    loadInitialCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCardId, initialCardLoaded, onScan, initialView]);

  // Reset initialCardLoaded when component unmounts or closes
  useEffect(() => {
    return () => {
      if (!onClose) {
        setInitialCardLoaded(false);
      }
    };
  }, [onClose]);

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionsMenuRef.current &&
        !actionsMenuRef.current.contains(event.target as Node)
      ) {
        setIsActionsMenuOpen(false);
      }
    };

    if (isActionsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isActionsMenuOpen]);

  // Close filter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target as Node)
      ) {
        setIsFilterMenuOpen(false);
      }
    };

    if (isFilterMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterMenuOpen]);

  useEffect(() => {
    if (currentView === 'scan' && !scannerInitialized.current) {
      scannerInitialized.current = true;

      const initScanning = async () => {
        // Wait a bit for DOM to be ready
        await new Promise((resolve) => setTimeout(resolve, 300));

        if (!videoRef.current) {
          setCameraError('Video element not ready. Please try again.');
          scannerInitialized.current = false;
          return;
        }

        try {
          await startScanningRef.current();
        } catch (error) {
          console.error('Error starting scanner:', error);
          // Error is already handled in startScanning
        }
      };

      initScanning();
    }

    return () => {
      if (currentView !== 'scan') {
        scannerInitialized.current = false;
        stopScanning();
      }
    };
  }, [currentView, stopScanning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  const handleRemoveItem = (id: string) => {
    setScannedItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Helper function to check if Add to order queue button should be disabled
  const isAddToOrderQueueDisabled = (
    cardData: KanbanCardData | null,
  ): boolean => {
    if (!cardData?.payload?.status) {
      return false; // Default to enabled if status is missing
    }

    const disabledStatuses = ['REQUESTED', 'IN_PROCESS', 'REQUESTING'];
    return disabledStatuses.includes(cardData.payload.status);
  };

  // Map ScannedItem to ItemCard format for ItemDetailsPanel
  const mapScannedItemToItemCard = (scannedItem: ScannedItem): ItemCard => {
    const itemDetails = scannedItem.cardData.payload.itemDetails;
    const primarySupply = itemDetails?.primarySupply;

    return {
      eid: itemDetails?.eId || scannedItem.id,
      title: itemDetails?.name || 'Unknown Item',
      minQty: itemDetails?.minQuantity?.amount?.toString() || '',
      minUnit: itemDetails?.minQuantity?.unit || '',
      orderQty: primarySupply?.orderQuantity?.amount?.toString() || '',
      orderUnit: primarySupply?.orderQuantity?.unit || '',
      location: itemDetails?.locator?.location || '',
      supplier: primarySupply?.supplier || '',
      sku:
        scannedItem.cardData.payload.itemDetails?.internalSKU ??
        scannedItem.cardData.payload.serialNumber ??
        '',
      image: itemDetails?.imageUrl || '',
      link: '',
      unitPrice: primarySupply?.unitCost?.value || 0.0,
    };
  };

  // Handler for opening item details panel
  // itemId optional: when called from card view, pass it directly to avoid async state timing
  const handleViewItemDetails = (itemId?: string) => {
    const selectedItemId = itemId ?? Array.from(selectedItems)[0];
    if (selectedItemId) {
      const selectedItem = scannedItems.find(
        (item) => item.id === selectedItemId,
      );
      if (selectedItem) {
        const itemCard = mapScannedItemToItemCard(selectedItem);
        setSelectedItemForDetails(itemCard);
        setIsItemDetailsPanelOpen(true);
        setIsActionsMenuOpen(false);
      }
    }
  };

  // Function to handle edit item - use selectedItemForDetails (the item being viewed) since selectedItems may be stale when opening from card view
  const handleEditItem = () => {
    if (!selectedItemForDetails) return;
    const selectedItem = scannedItems.find(
      (item) =>
        item.cardData?.payload?.item?.eId === selectedItemForDetails.eid ||
        item.cardData?.payload?.itemDetails?.eId === selectedItemForDetails.eid ||
        item.id === selectedItemForDetails.eid,
    );
    if (selectedItem) {
      if (selectedItem?.cardData?.payload?.itemDetails) {
        const currentCardData = selectedItem.cardData;

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
          primarySupply:
            currentCardData.payload.itemDetails.primarySupply &&
            currentCardData.payload.itemDetails.primarySupply.supplier
              ? {
                  supplyEId:
                    currentCardData.payload.itemDetails.primarySupply.supplyEId,
                  name:
                    currentCardData.payload.itemDetails.primarySupply.name,
                  supplier:
                    currentCardData.payload.itemDetails.primarySupply
                      .supplier || '',
                  sku:
                    currentCardData.payload.itemDetails.primarySupply.sku ?? '',
                  url:
                    currentCardData.payload.itemDetails.primarySupply.url ?? '',
                  orderQuantity:
                    currentCardData.payload.itemDetails.primarySupply
                      .orderQuantity || defaultQuantity,
                  unitCost: currentCardData.payload.itemDetails.primarySupply
                    .unitCost
                    ? {
                        value:
                          currentCardData.payload.itemDetails.primarySupply
                            .unitCost.value,
                        currency: currentCardData.payload.itemDetails
                          .primarySupply.unitCost.currency as Currency,
                      }
                    : defaultMoney,
                  minimumQuantity:
                    currentCardData.payload.itemDetails.minQuantity ||
                    defaultQuantity,
                  orderMechanism:
                    (currentCardData.payload.itemDetails.primarySupply as { orderMethod?: string })
                      ?.orderMethod as items.OrderMechanism ?? defaultOrderMechanism,
                  averageLeadTime: defaultDuration,
                  orderNotes: '',
                  orderCost: {
                    value:
                      (currentCardData.payload.itemDetails.primarySupply
                        .unitCost?.value ?? 0.0) *
                      (currentCardData.payload.itemDetails.primarySupply
                        .orderQuantity?.amount ?? 0.0),
                    currency:
                      (currentCardData.payload.itemDetails.primarySupply
                        .unitCost?.currency as Currency) ??
                      defaultMoney.currency,
                  },
                }
              : {
                  supplier: '',
                  unitCost: defaultMoney,
                  minimumQuantity: defaultQuantity,
                  orderQuantity: defaultQuantity,
                  orderMechanism:
                    (currentCardData.payload.itemDetails.primarySupply as { orderMethod?: string })
                      ?.orderMethod as items.OrderMechanism ?? defaultOrderMechanism,
                  averageLeadTime: defaultDuration,
                  orderNotes: '',
                  orderCost: defaultMoney,
                },
          defaultSupply:
            currentCardData.payload.itemDetails.defaultSupply || '',
          cardSize:
            (currentCardData.payload.itemDetails.cardSize as items.CardSize) ||
            defaultCardSize,
          labelSize:
            (currentCardData.payload.itemDetails
              .labelSize as items.LabelSize) || defaultLabelSize,
          breadcrumbSize:
            (currentCardData.payload.itemDetails
              .breadcrumbSize as items.BreadcrumbSize) || defaultBreadcrumbSize,
          color:
            (currentCardData.payload.itemDetails
              .itemColor as items.ItemColor) || 'GRAY',
        };

        setItemToEdit(itemData);
        setIsItemDetailsPanelOpen(false);
        setIsEditFormOpen(true);
      }
    }
  };

  // Function to close edit form
  const handleCloseEditForm = () => {
    setIsEditFormOpen(false);
    setItemToEdit(null);
  };

  const handleEditSuccess = async () => {
    setIsEditFormOpen(false);
    setItemToEdit(null);

    // Refresh the scanned items to show updated information
    const selectedItemId = Array.from(selectedItems)[0];
    if (selectedItemId) {
      const selectedItem = scannedItems.find(
        (item) => item.id === selectedItemId,
      );
      if (selectedItem) {
        try {
          const refreshedData = await getKanbanCard(
            selectedItem.cardData.payload.eId,
          );
          setScannedItems((prevItems) =>
            prevItems.map((item) =>
              item.id === selectedItemId
                ? { ...item, cardData: refreshedData }
                : item,
            ),
          );
        } catch (error) {
          console.error('Error refreshing card data:', error);
          // Don't show error toast as the operation was successful, just data refresh failed
        }
      }
    }
  };

  // Handler for adding to order queue
  const handleAddToOrderQueue = async () => {
    if (selectedItems.size === 0) return;

    try {
      const jwtToken = localStorage.getItem('idToken');
      if (!jwtToken) {
        console.error('Authentication token not found');
        return;
      }

      const selectedItemsArray = Array.from(selectedItems);

      // Separate items that can and cannot be added
      const itemsCanAdd: string[] = [];
      const itemsCantAdd: string[] = [];

      selectedItemsArray.forEach((itemId) => {
        const item = scannedItems.find((i) => i.id === itemId);
        if (item) {
          const itemStatus =
            item.cardData.payload.status?.toUpperCase() || 'UNKNOWN';
          if (canAddToOrderQueue(itemStatus)) {
            itemsCanAdd.push(itemId);
          } else {
            itemsCantAdd.push(itemId);
          }
        }
      });

      // If there are items that can't be added, show modal
      if (itemsCantAdd.length > 0) {
        setCardsCantAddCount(itemsCantAdd.length);
        setIsCantAddCardsModalOpen(true);
        setIsActionsMenuOpen(false);
        return;
      }

      // If all can be added, proceed directly
      await addItemsToOrderQueue(itemsCanAdd, jwtToken);
      setIsActionsMenuOpen(false);
    } catch (error) {
      console.error('Error adding to order queue:', error);
      if (handleAuthError(error)) {
        return;
      }
      toast.error('Error adding to order queue');
    }
  };

  // Helper function to add items to order queue
  const addItemsToOrderQueue = async (itemIds: string[], jwtToken: string) => {
    const successfulItemIds: string[] = [];
    const alreadyInQueueIds: string[] = [];
    const failedItemIds: string[] = [];

    for (const itemId of itemIds) {
      const item = scannedItems.find((i) => i.id === itemId);
      if (!item) continue;

      // Check if item is already in REQUESTING state
      const itemStatus =
        item.cardData.payload.status?.toUpperCase() || 'UNKNOWN';
      if (itemStatus === 'REQUESTING') {
        alreadyInQueueIds.push(itemId);
        continue;
      }

      try {
        const response = await fetch(
          `/api/arda/kanban/kanban-card/${item.cardData.payload.eId}/event/request`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          if (data.ok) {
            successfulItemIds.push(itemId);
          } else {
            failedItemIds.push(itemId);
          }
        } else {
          failedItemIds.push(itemId);
        }
      } catch (error) {
        console.error('Error adding item to order queue:', error);
        failedItemIds.push(itemId);
      }
    }

    // Remove successful items and items already in queue from scannedItems
    const itemsToRemove = [...successfulItemIds, ...alreadyInQueueIds];
    if (itemsToRemove.length > 0) {
      setScannedItems((prev) =>
        prev.filter((item) => !itemsToRemove.includes(item.id)),
      );

      // Remove successful items and items already in queue from selectedItems
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        itemsToRemove.forEach((id) => newSet.delete(id));
        return newSet;
      });
    }

    // Show appropriate toast messages
    if (successfulItemIds.length > 0) {
      // Update order queue count after adding cards
      await refreshOrderQueueData();

      // Show toast with ShoppingCart icon
      toast.success(
        <div className='flex flex-col gap-0.5'>
          <div className='font-semibold text-[#0a0a0a]'>
            Cards sent to order queue
          </div>
          <div className='text-sm text-[#737373]'>
            They will be waiting for you in the order queue.
          </div>
        </div>,
        {
          icon: <ShoppingCart className='w-4 h-4' />,
        },
      );
    } else if (alreadyInQueueIds.length > 0 && failedItemIds.length === 0) {
      // All items were already in queue
      toast.info('Items are already in order queue');
    } else if (failedItemIds.length > 0) {
      toast.error('Failed to add to order queue');
    }
  };

  // Helper function to receive cards (set to FULFILLED/Restocked)
  const receiveItems = async (itemIds: string[], jwtToken: string) => {
    const successfulItemIds: string[] = [];

    for (const itemId of itemIds) {
      const item = scannedItems.find((i) => i.id === itemId);
      if (!item) continue;

      try {
        const response = await fetch(
          `/api/arda/kanban/kanban-card/${item.cardData.payload.eId}/event/fulfill`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          if (data.ok) {
            successfulItemIds.push(itemId);
          }
        }
      } catch (error) {
        console.error('Error receiving item:', error);
      }
    }

    if (successfulItemIds.length > 0) {
      // Remove successful items from scannedItems
      setScannedItems((prev) =>
        prev.filter((item) => !successfulItemIds.includes(item.id)),
      );

      // Remove successful items from selectedItems
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        successfulItemIds.forEach((id) => newSet.delete(id));
        return newSet;
      });

      // Show toast with PackageOpen icon
      toast.success(
        <div className='flex flex-col gap-0.5'>
          <div className='font-semibold text-[#0a0a0a]'>Receive card</div>
          <div className='text-sm text-[#737373]'>
            Cards have been received and restocked.
          </div>
        </div>,
        {
          icon: <PackageOpen className='w-4 h-4' />,
        },
      );
    } else {
      toast.error('Failed to receive card');
    }
  };

  // Handler for receiving card (set to FULFILLED/Restocked)
  const handleReceiveCard = async () => {
    if (selectedItems.size === 0) return;

    try {
      const jwtToken = localStorage.getItem('idToken');
      if (!jwtToken) {
        console.error('Authentication token not found');
        return;
      }

      const selectedItemsArray = Array.from(selectedItems);

      // Separate items that can and cannot be received
      const itemsCanReceive: string[] = [];
      const itemsCantReceive: string[] = [];

      selectedItemsArray.forEach((itemId) => {
        const item = scannedItems.find((i) => i.id === itemId);
        if (item) {
          const itemStatus =
            item.cardData.payload.status?.toUpperCase() || 'UNKNOWN';
          // Items that are already FULFILLED cannot be received again
          if (itemStatus !== 'FULFILLED') {
            itemsCanReceive.push(itemId);
          } else {
            itemsCantReceive.push(itemId);
          }
        }
      });

      // If there are items that can't be received, show modal
      if (itemsCantReceive.length > 0) {
        setCardsCantReceiveCount(itemsCantReceive.length);
        setIsCantReceiveCardsModalOpen(true);
        setIsActionsMenuOpen(false);
        return;
      }

      // If all can be received, proceed directly
      await receiveItems(itemsCanReceive, jwtToken);
      setIsActionsMenuOpen(false);
    } catch (error) {
      console.error('Error receiving card:', error);
      if (handleAuthError(error)) {
        return;
      }
      toast.error('Error receiving card');
    }
  };

  // Handler for changing card state
  const handleSetCardState = async (newState: string) => {
    if (selectedItems.size === 0) return;

    try {
      const jwtToken = localStorage.getItem('idToken');
      if (!jwtToken) {
        console.error('Authentication token not found');
        return;
      }

      // Validate state
      if (
        !['REQUESTING', 'REQUESTED', 'IN_PROCESS', 'FULFILLED'].includes(
          newState,
        )
      ) {
        console.error('Unknown state change');
        return;
      }

      // Get success message based on state
      const successMessages: Record<string, string> = {
        REQUESTING: 'Card status changed to In Order Queue',
        REQUESTED: 'Card status changed to In Progress',
        IN_PROCESS: 'Card status changed to Receiving',
        FULFILLED: 'Card status changed to Restocked',
      };

      // Update state for all selected items
      const selectedItemsArray = Array.from(selectedItems);
      let successCount = 0;

      for (const itemId of selectedItemsArray) {
        const item = scannedItems.find((i) => i.id === itemId);
        if (!item) {
          continue;
        }

        let stateEndpoint = '';
        switch (newState) {
          case 'REQUESTING':
            stateEndpoint = `/api/arda/kanban/kanban-card/${item.cardData.payload.eId}/event/request`;
            break;
          case 'REQUESTED':
            stateEndpoint = `/api/arda/kanban/kanban-card/${item.cardData.payload.eId}/event/accept`;
            break;
          case 'IN_PROCESS':
            stateEndpoint = `/api/arda/kanban/kanban-card/${item.cardData.payload.eId}/event/start-processing`;
            break;
          case 'FULFILLED':
            stateEndpoint = `/api/arda/kanban/kanban-card/${item.cardData.payload.eId}/event/fulfill`;
            break;
        }

        if (stateEndpoint) {
          try {
            const response = await fetch(stateEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwtToken}`,
              },
            });

            if (response.ok) {
              const data = await response.json();
              if (data.ok) {
                // Update the item's status in scannedItems
                setScannedItems((prev) =>
                  prev.map((scannedItem) =>
                    scannedItem.id === itemId
                      ? {
                          ...scannedItem,
                          cardData: {
                            ...scannedItem.cardData,
                            payload: {
                              ...scannedItem.cardData.payload,
                              status: newState,
                            },
                          },
                        }
                      : scannedItem,
                  ),
                );
                successCount++;
              }
            }
          } catch (error) {
            console.error('Error updating card state:', error);
          }
        }
      }

      setIsActionsMenuOpen(false);

      const totalCount = selectedItemsArray.length;
      if (successCount > 0) {
        const message =
          successCount === totalCount
            ? successMessages[newState]
            : `${successMessages[newState]} (${successCount}/${totalCount} cards)`;
        toast.success(message);
      } else {
        toast.error('Failed to change card state');
      }
    } catch (error) {
      console.error('Error changing card state:', error);
      if (handleAuthError(error)) {
        return;
      }
      toast.error('Error changing card state');
    }
  };

  const filteredItems = scannedItems.filter((item) => {
    const itemStatus = item.cardData.payload.status?.toUpperCase() || 'UNKNOWN';
    return selectedFilters.has(itemStatus);
  });

  useEffect(() => {
    if (scannedItems.length === 0) {
      setActiveCardId(null);
      if (currentView === 'card') {
        setCurrentView('list');
      }
      return;
    }

    if (
      !activeCardId ||
      !scannedItems.some((item) => item.id === activeCardId)
    ) {
      setActiveCardId(scannedItems[0].id);
    }
  }, [scannedItems, activeCardId, currentView]);

  const activeCard = activeCardId
    ? scannedItems.find((item) => item.id === activeCardId)
    : (filteredItems[0] ?? scannedItems[0] ?? null);
  const isCardViewActive = currentView === 'card' && !!activeCard;
  const activeToolbarButton =
    'bg-[#fc5a29] text-white rounded-lg px-3 py-2 flex items-center justify-center gap-1.5 text-sm font-medium hover:bg-[#e04a1f] transition-colors';
  const inactiveToolbarButton =
    'w-12 h-12 bg-[#262626] text-white rounded-lg flex items-center justify-center hover:bg-[#333] transition-colors';
  const cardButtonClass = isCardViewActive
    ? activeToolbarButton
    : inactiveToolbarButton;
  const cardIconClass = isCardViewActive ? 'w-4 h-4' : 'w-5 h-5';
  const isListViewActive = currentView === 'list';
  const listButtonClass = isListViewActive
    ? activeToolbarButton
    : `${inactiveToolbarButton} relative`;
  const listIconClass = isListViewActive ? 'w-4 h-4' : 'w-5 h-5';

  useEffect(() => {
    if (currentView === 'card' && activeCard) {
      setSelectedItems(new Set([activeCard.id]));
    }
  }, [currentView, activeCard]);

  return (
    <div className='fixed inset-0 z-50 bg-white flex flex-col w-screen h-screen overflow-hidden'>
      <div className='flex-1 relative overflow-hidden min-h-0'>
        {currentView === 'scan' ? (
          <div className='w-full h-full relative bg-black'>
            {/* Video element with camera feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className='w-full h-full object-cover'
            />

            {/* Blurred overlay - creates smooth blur effect from scan frame border outward */}
            <div
              className='absolute inset-0 pointer-events-none'
              style={{ zIndex: 35 }}
            >
              <div
                className='absolute inset-0'
                style={{
                  backdropFilter: 'blur(15px)',
                  WebkitBackdropFilter: 'blur(15px)',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  WebkitMaskImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cmask id='scanBlurMask'%3E%3Crect width='100%25' height='100%25' fill='white'/%3E%3Crect x='50%25' y='50%25' width='300' height='300' rx='32' ry='32' fill='black' transform='translate(-150, -150)'/%3E%3C/mask%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='black' mask='url(%23scanBlurMask)'/%3E%3C/svg%3E"`,
                  maskImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cmask id='scanBlurMask'%3E%3Crect width='100%25' height='100%25' fill='white'/%3E%3Crect x='50%25' y='50%25' width='300' height='300' rx='32' ry='32' fill='black' transform='translate(-150, -150)'/%3E%3C/mask%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='black' mask='url(%23scanBlurMask)'/%3E%3C/svg%3E"`,
                  maskSize: '100% 100%',
                  WebkitMaskSize: '100% 100%',
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  WebkitMaskPosition: 'center',
                }}
              />
            </div>

            {/* Scan frame - centered with clean rounded corners design */}
            <div
              className='absolute inset-0 flex items-center justify-center pointer-events-none'
              style={{ zIndex: 50 }}
            >
              <div
                className='relative'
                style={{ width: '300px', height: '300px' }}
              >
                {/* Main window - thin border with rounded corners */}
                <div
                  className='absolute'
                  style={{
                    top: '0px',
                    left: '0px',
                    borderRadius: '32px',
                    border: `1px solid ${
                      qrDetected ? 'var(--base-primary)' : '#fff'
                    }`,
                    boxSizing: 'border-box',
                    width: '300px',
                    height: '300px',
                    transition: 'border-color 0.2s ease-in-out',
                  }}
                />

                {/* Top-right corner accent - thick rounded */}
                <div
                  className='absolute'
                  style={{
                    top: '0px',
                    right: '0px',
                    width: '32px',
                    height: '32px',
                    borderTop: `4px solid ${
                      qrDetected ? 'var(--base-primary)' : '#fff'
                    }`,
                    borderRight: `4px solid ${
                      qrDetected ? 'var(--base-primary)' : '#fff'
                    }`,
                    borderTopRightRadius: '32px',
                    transition: 'border-color 0.2s ease-in-out',
                  }}
                />

                {/* Bottom-right corner accent - thick rounded */}
                <div
                  className='absolute'
                  style={{
                    bottom: '0px',
                    right: '0px',
                    width: '32px',
                    height: '32px',
                    borderBottom: `4px solid ${
                      qrDetected ? 'var(--base-primary)' : '#fff'
                    }`,
                    borderRight: `4px solid ${
                      qrDetected ? 'var(--base-primary)' : '#fff'
                    }`,
                    borderBottomRightRadius: '32px',
                    transition: 'border-color 0.2s ease-in-out',
                  }}
                />

                {/* Top-left corner accent - thick rounded */}
                <div
                  className='absolute'
                  style={{
                    top: '0px',
                    left: '0px',
                    width: '32px',
                    height: '32px',
                    borderTop: `4px solid ${
                      qrDetected ? 'var(--base-primary)' : '#fff'
                    }`,
                    borderLeft: `4px solid ${
                      qrDetected ? 'var(--base-primary)' : '#fff'
                    }`,
                    borderTopLeftRadius: '32px',
                    transition: 'border-color 0.2s ease-in-out',
                  }}
                />

                {/* Bottom-left corner accent - thick rounded */}
                <div
                  className='absolute'
                  style={{
                    bottom: '0px',
                    left: '0px',
                    width: '32px',
                    height: '32px',
                    borderBottom: `4px solid ${
                      qrDetected ? 'var(--base-primary)' : '#fff'
                    }`,
                    borderLeft: `4px solid ${
                      qrDetected ? 'var(--base-primary)' : '#fff'
                    }`,
                    borderBottomLeftRadius: '32px',
                    transition: 'border-color 0.2s ease-in-out',
                  }}
                />
              </div>
            </div>

            {/* Toast notification for successful scan */}
            {scanComplete && (
              <div
                className='absolute top-6 left-4 right-4 pointer-events-none'
                style={{ zIndex: 55 }}
              >
                <div className='bg-white rounded-lg p-3 shadow-lg'>
                  <p className='text-sm font-semibold text-gray-900'>
                    Item scanned!
                  </p>
                  <p className='text-xs text-gray-600 mt-1'>
                    Find scanned items on the list tab.
                  </p>
                </div>
              </div>
            )}

            {/* Camera error overlay */}
            {cameraError && (
              <div
                className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 text-white p-4'
                style={{ zIndex: 60 }}
              >
                <div className='text-center'>
                  <p className='text-sm mb-4'>{cameraError}</p>
                  <button
                    onClick={async () => {
                      scannerInitialized.current = false;
                      setCameraError(null);
                      try {
                        await startScanningRef.current();
                      } catch (error) {
                        console.error('Error starting scanner:', error);
                      }
                    }}
                    className='px-4 py-2 bg-[#fc5a29] rounded-lg text-sm'
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : isCardViewActive && activeCard ? (
          <div className='w-full flex-1 flex flex-col items-center justify-center px-5 py-6 overflow-y-auto bg-white'>
            <div className='w-full max-w-md flex flex-col'>
              <CardActions
                cardData={activeCard.cardData}
                onAddToOrderQueue={(eId) => {
                  const item = scannedItems.find(
                    (i) => i.cardData.payload.eId === eId,
                  );
                  if (item) {
                    setSelectedItems(new Set([item.id]));
                    handleAddToOrderQueue();
                  }
                }}
                onReceiveCard={() => {
                  if (activeCard) {
                    setSelectedItems(new Set([activeCard.id]));
                    handleReceiveCard();
                  }
                }}
                onViewItemDetails={() => {
                  if (activeCard) {
                    setSelectedItems(new Set([activeCard.id]));
                    handleViewItemDetails(activeCard.id);
                  }
                }}
                onClose={onClose || (() => {})}
                isAddToOrderQueueDisabled={isAddToOrderQueueDisabled}
                showDoneButton={false}
              />
            </div>
          </div>
        ) : (
          <div className='w-full h-full bg-white overflow-y-auto flex flex-col'>
            {/* Header */}
            <div
              className='sticky top-0 z-10 flex flex-col items-start gap-1 pt-4 pb-4 px-0'
              style={{
                background:
                  'linear-gradient(180deg, #fff, rgba(255, 255, 255, 0.7))',
              }}
            >
              <h2 className='w-full text-2xl font-bold text-black text-center leading-8'>
                Scan cards
              </h2>
              <p className='w-full text-sm text-black text-center leading-5 opacity-90'>
                Scan one card or an entire stack.
              </p>

              {/* Toolbar */}
              <div className='w-full flex items-start justify-between px-4 pb-1 gap-2 sm:gap-5 mt-1 relative'>
                <div
                  className='flex flex-col items-center justify-end relative'
                  ref={actionsMenuRef}
                >
                  <button
                    onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
                    className='h-8 shadow-sm rounded-lg bg-white border border-[#e5e5e5] flex items-center justify-center px-3 gap-2 cursor-pointer'
                  >
                    <span className='text-xs leading-4'>Actions</span>
                    <ChevronDown className='w-4 h-4' />
                  </button>

                  {/* Actions Menu Dropdown */}
                  {isActionsMenuOpen && (
                    <div
                      className='absolute top-full left-0 mt-1 w-[calc(100vw-2rem)] max-w-[284px] shadow-lg rounded-lg bg-white border border-[#e5e5e5] flex flex-col items-start p-1 z-50'
                      style={{
                        boxShadow:
                          '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      {/* Actions Section */}
                      <div className='w-full flex flex-col items-start py-1.5 px-2'>
                        <div className='w-full text-sm font-semibold text-[#0a0a0a] leading-5'>
                          Actions
                        </div>
                      </div>

                      <div className='w-full flex flex-col items-start'>
                        <button
                          onClick={handleAddToOrderQueue}
                          disabled={selectedItems.size === 0}
                          className={`w-full rounded-md flex items-center py-1.5 px-2 pl-8 relative gap-2 ${
                            selectedItems.size > 0
                              ? 'hover:bg-gray-50'
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <span className='flex-1 text-sm leading-5 text-[#0a0a0a] text-left truncate'>
                            Add to order queue
                          </span>
                          <ShoppingCart className='w-4 h-4 text-[#0a0a0a] absolute left-2' />
                        </button>
                      </div>

                      <div className='w-full flex flex-col items-start'>
                        <button
                          onClick={handleReceiveCard}
                          disabled={selectedItems.size === 0}
                          className={`w-full rounded-md flex items-center py-1.5 px-2 pl-8 relative gap-2 ${
                            selectedItems.size > 0
                              ? 'hover:bg-gray-50'
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <span className='flex-1 text-sm leading-5 text-[#0a0a0a] text-left truncate'>
                            Receive card
                          </span>
                          <PackageOpen className='w-4 h-4 text-[#0a0a0a] absolute left-2' />
                        </button>
                      </div>

                      <div className='w-full flex flex-col items-start'>
                        <button
                          onClick={() => {
                            const itemId = Array.from(selectedItems)[0];
                            if (itemId) {
                              setIsActionsMenuOpen(false);
                              handleViewItemDetails(itemId);
                            }
                          }}
                          disabled={selectedItems.size !== 1}
                          className={`w-full rounded-md flex items-center py-1.5 px-2 pl-8 relative gap-2 ${
                            selectedItems.size === 1
                              ? 'hover:bg-gray-50'
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <span className='flex-1 text-sm leading-5 text-[#0a0a0a] text-left truncate'>
                            View/Edit details
                          </span>
                          <FileText className='w-4 h-4 text-[#0a0a0a] absolute left-2' />
                        </button>
                      </div>

                      {/* Separator */}
                      <div className='w-full h-px bg-[#e5e5e5] my-1 mx-0' />

                      {/* Selection Section */}
                      <div className='w-full flex flex-col items-start py-1.5 px-2'>
                        <div className='w-full text-sm font-semibold text-[#0a0a0a] leading-5'>
                          Selection
                        </div>
                      </div>

                      <div className='w-full flex flex-col items-start'>
                        <button
                          onClick={() => {
                            setSelectedItems(new Set());
                            setIsActionsMenuOpen(false);
                          }}
                          className='w-full rounded-md flex items-center py-1.5 px-2 pl-8 relative gap-2 hover:bg-gray-50'
                        >
                          <span className='flex-1 text-sm leading-5 text-[#0a0a0a] text-left truncate'>
                            Deselect all
                          </span>
                          <div className='w-4 h-4 rounded-full border-2 border-[#0a0a0a] flex items-center justify-center absolute left-2'>
                            <X className='w-2.5 h-2.5 text-[#0a0a0a]' />
                          </div>
                        </button>
                      </div>

                      <div className='w-full flex flex-col items-start'>
                        <button
                          onClick={() => {
                            if (selectedItems.size > 0) {
                              setIsClearItemsModalOpen(true);
                              setIsActionsMenuOpen(false);
                            }
                          }}
                          disabled={selectedItems.size === 0}
                          className={`w-full rounded-md flex items-center py-1.5 px-2 pl-8 relative gap-2 ${
                            selectedItems.size > 0
                              ? 'hover:bg-gray-50'
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <span className='flex-1 text-sm leading-5 text-[#0a0a0a] text-left truncate'>
                            Remove selected from list
                          </span>
                          <X className='w-4 h-4 text-[#0a0a0a] absolute left-2' />
                        </button>
                      </div>

                      {/* Separator */}
                      <div className='w-full h-px bg-[#e5e5e5] my-1 mx-0' />

                      {/* Set state Section */}
                      <div className='w-full flex flex-col items-start py-1.5 px-2'>
                        <div className='w-full text-sm font-semibold text-[#0a0a0a] leading-5'>
                          Set state
                        </div>
                      </div>

                      {/* In Order Queue */}
                      <div className='w-full flex flex-col items-start'>
                        <button
                          onClick={() => handleSetCardState('REQUESTING')}
                          disabled={selectedItems.size === 0}
                          className={`w-full rounded-md flex items-center py-1.5 px-2 pl-8 relative gap-2 ${
                            selectedItems.size > 0
                              ? 'hover:bg-gray-50'
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <span className='flex-1 text-sm leading-5 text-[#0a0a0a] text-left truncate'>
                            In Order Queue
                          </span>
                        </button>
                      </div>

                      {/* In Progress */}
                      <div className='w-full flex flex-col items-start'>
                        <button
                          onClick={() => handleSetCardState('REQUESTED')}
                          disabled={selectedItems.size === 0}
                          className={`w-full rounded-md flex items-center py-1.5 px-2 pl-8 relative gap-2 ${
                            selectedItems.size > 0
                              ? 'hover:bg-gray-50'
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <span className='flex-1 text-sm leading-5 text-[#0a0a0a] text-left truncate'>
                            In Progress
                          </span>
                        </button>
                      </div>

                      {/* Receiving */}
                      <div className='w-full flex flex-col items-start'>
                        <button
                          onClick={() => handleSetCardState('IN_PROCESS')}
                          disabled={selectedItems.size === 0}
                          className={`w-full rounded-md flex items-center py-1.5 px-2 pl-8 relative gap-2 ${
                            selectedItems.size > 0
                              ? 'hover:bg-gray-50'
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <span className='flex-1 text-sm leading-5 text-[#0a0a0a] text-left truncate'>
                            Receiving
                          </span>
                        </button>
                      </div>

                      {/* Restocked */}
                      <div className='w-full flex flex-col items-start'>
                        <button
                          onClick={() => handleSetCardState('FULFILLED')}
                          disabled={selectedItems.size === 0}
                          className={`w-full rounded-md flex items-center py-1.5 px-2 pl-8 relative gap-2 ${
                            selectedItems.size > 0
                              ? 'hover:bg-gray-50'
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <span className='flex-1 text-sm leading-5 text-[#0a0a0a] text-left truncate'>
                            Restocked
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className='flex items-center justify-end gap-1'>
                  <span className='text-xs leading-[100%]'>Filter</span>
                  <div className='flex flex-col items-center justify-end relative'>
                    <button
                      onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                      className='h-8 shadow-sm rounded-lg bg-white border border-[#e5e5e5] flex items-center justify-center px-3 cursor-pointer'
                    >
                      <SlidersHorizontal className='w-4 h-4' />
                    </button>
                    {isFilterMenuOpen && (
                      <div
                        ref={filterMenuRef}
                        className='absolute top-full right-0 mt-2 w-[calc(100vw-2rem)] max-w-[224px] bg-white rounded-lg shadow-lg border border-[#e5e5e5] py-2 z-50'
                      >
                        {/* State Section */}
                        <div className='w-full flex flex-col items-start py-1.5 px-2'>
                          <div className='w-full text-sm font-semibold text-[#0a0a0a] leading-5'>
                            State
                          </div>
                        </div>

                        {getAllCardStates()
                          .filter(
                            (stateConfig) => stateConfig.status !== 'UNKNOWN',
                          )
                          .map((stateConfig) => {
                            const isSelected = selectedFilters.has(
                              stateConfig.status,
                            );
                            return (
                              <div
                                key={stateConfig.status}
                                className='w-full flex flex-col items-start'
                              >
                                <button
                                  onClick={() => {
                                    setSelectedFilters((prev) => {
                                      const newSet = new Set(prev);
                                      if (newSet.has(stateConfig.status)) {
                                        newSet.delete(stateConfig.status);
                                      } else {
                                        newSet.add(stateConfig.status);
                                      }
                                      return newSet;
                                    });
                                  }}
                                  className='w-full rounded-md flex items-center py-1.5 px-2 pl-8 relative gap-2 hover:bg-gray-50'
                                >
                                  <span className='flex-1 text-sm leading-5 text-[#0a0a0a] text-left truncate'>
                                    {stateConfig.label}
                                  </span>
                                  {isSelected && (
                                    <Check className='w-4 h-4 text-[#0a0a0a] absolute left-2' />
                                  )}
                                </button>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Scanned Items List */}
            {scannedItems.length === 0 ? (
              <div className='w-full h-full flex flex-col items-center justify-center p-6'>
                <div className='w-full max-w-md rounded-[10px] border border-dashed border-[#e5e5e5] flex flex-col items-center p-6 gap-6'>
                  <div className='w-full flex flex-col items-center gap-2'>
                    {/* Icon illustration */}
                    <div className='rounded-lg bg-white flex items-center justify-center'>
                      <div
                        className='h-20 w-20 flex items-center justify-center p-2 relative'
                        style={{ position: 'relative' }}
                      >
                        {/* Pink blob background */}
                        <div
                          className='absolute'
                          style={{
                            height: '85.75%',
                            width: '99.63%',
                            top: '7.5%',
                            right: '0.37%',
                            bottom: '6.75%',
                            left: '0%',
                            zIndex: 0,
                          }}
                        >
                          <svg
                            width='80'
                            height='80'
                            viewBox='0 0 80 80'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                          >
                            <path
                              d='M0 8C0 3.58172 3.58172 0 8 0H72C76.4183 0 80 3.58172 80 8V72C80 76.4183 76.4183 80 72 80H8C3.58172 80 0 76.4183 0 72V8Z'
                              fill='white'
                            />
                            <path
                              d='M44.1307 72.1433C21.5607 80.8633 23.6707 64.4133 23.9307 55.9733C24.0907 50.7933 4.17068 60.1633 0.180683 45.5933C-1.56932 39.2133 9.79068 24.1933 17.0607 18.5133C33.9507 5.31326 64.9507 -4.12674 77.5207 25.9933C87.2807 49.3833 62.4607 65.0433 44.1207 72.1333L44.1307 72.1433Z'
                              fill='#FEE2E2'
                            />
                            <path
                              d='M20.3333 33.3334H63.6666M28.9999 50.6667H54.9999M24.6666 24.6667H59.3333C61.7265 24.6667 63.6666 26.6068 63.6666 29V55C63.6666 57.3933 61.7265 59.3334 59.3333 59.3334H24.6666C22.2734 59.3334 20.3333 57.3933 20.3333 55V29C20.3333 26.6068 22.2734 24.6667 24.6666 24.6667Z'
                              stroke='white'
                              strokeWidth='3'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                            />
                            <path
                              d='M18.3333 31.3334H61.6666M26.9999 48.6667H52.9999M22.6666 22.6667H57.3333C59.7265 22.6667 61.6666 24.6068 61.6666 27V53C61.6666 55.3933 59.7265 57.3334 57.3333 57.3334H22.6666C20.2734 57.3334 18.3333 55.3933 18.3333 53V27C18.3333 24.6068 20.2734 22.6667 22.6666 22.6667Z'
                              stroke='#0A0A0A'
                              strokeWidth='3'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <p className='w-full text-xl font-semibold text-[#0a0a0a] leading-7 text-center'>
                      No scanned cards... yet
                    </p>

                    {/* Description */}
                    <p className='w-full text-sm leading-5 text-[#737373] text-center'>
                      Use your device&apos;s camera to scan cards from the
                      &quot;Scan cards&quot; button in the toolbar below.
                    </p>
                  </div>

                  {/* Arrow down icon */}
                  <div className='w-full flex items-center justify-center'>
                    <div className='h-9 rounded-lg bg-transparent flex items-center justify-center px-2.5 py-2'>
                      <ArrowDown className='w-4 h-4 text-black' />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className='flex flex-col items-center px-4 gap-2 pb-24'>
                {scannedItems
                  .filter(
                    (item, index, self) =>
                      index === self.findIndex((i) => i.id === item.id),
                  )
                  .filter((item) => {
                    const itemStatus =
                      item.cardData.payload.status?.toUpperCase() || 'UNKNOWN';
                    return selectedFilters.has(itemStatus);
                  })
                  .map((item, index) => {
                    const isSelected = selectedItems.has(item.id);
                    return (
                      <div
                        key={`${item.id}-${index}`}
                        className={`w-full shadow-sm rounded-[14px] bg-white flex flex-col items-start p-1 ${
                          isSelected
                            ? 'border-2 border-[#fc5a29]'
                            : 'border border-gray-200'
                        }`}
                        style={{
                          boxShadow:
                            '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        <div className='w-full flex items-center gap-2'>
                          {/* Checkbox */}
                          <button
                            onClick={() => {
                              setSelectedItems((prev) => {
                                const newSet = new Set(prev);
                                if (newSet.has(item.id)) {
                                  newSet.delete(item.id);
                                } else {
                                  newSet.add(item.id);
                                }
                                return newSet;
                              });
                            }}
                            className='flex items-center p-1 cursor-pointer'
                          >
                            <div className='flex items-start'>
                              {isSelected ? (
                                <div className='w-4 h-4 rounded bg-[#fc5a29] flex items-center justify-center'>
                                  <Check className='w-3 h-3 text-white' />
                                </div>
                              ) : (
                                <div className='w-4 h-4 rounded border border-gray-300 bg-white flex items-center justify-center' />
                              )}
                            </div>
                          </button>

                          {/* Content */}
                          <div className='flex-1 flex items-center justify-between gap-0'>
                            <div className='flex-1 flex flex-col items-start justify-center'>
                              <div className='flex items-center gap-2'>
                                {/* Image placeholder - you can replace with actual image */}
                                <div className='w-[34px] h-[34px] bg-gray-200 rounded flex items-center justify-center overflow-hidden flex-shrink-0'>
                                  {item.cardData.payload.itemDetails
                                    ?.imageUrl ? (
                                    <Image
                                      src={
                                        item.cardData.payload.itemDetails
                                          .imageUrl
                                      }
                                      alt={
                                        item.cardData.payload.itemDetails
                                          .name || 'Item image'
                                      }
                                      width={34}
                                      height={34}
                                      className='w-full h-full object-contain'
                                    />
                                  ) : (
                                    <div className='w-full h-full bg-gray-300' />
                                  )}
                                </div>
                                <p className='flex-1 text-xs leading-[100%] text-black truncate'>
                                  {item.cardData.payload.itemDetails.name}
                                </p>
                              </div>
                            </div>

                            {/* Delete button */}
                            <div className='flex items-center'>
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className='h-9 rounded-lg bg-transparent flex items-center justify-center px-2.5 py-2'
                              >
                                <X className='w-4 h-4 text-black' />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom toolbar for scan view */}
      {currentView === 'scan' && (
        <div
          className='fixed bottom-0 left-0 right-0 pointer-events-auto'
          style={{ zIndex: 50 }}
        >
          <div className='bg-white rounded-t-3xl px-5 pt-3 pb-4 relative border-t border-[#e5e5e5] shadow-[0_-4px_12px_rgba(0,0,0,0.08)]'>
            {/* Header */}
            <div className='mb-6'>
              <h2 className='text-xl font-bold text-black text-center mb-2'>
                Scan cards
              </h2>
              <p className='text-sm text-black text-center'>
                Scan one card or an entire stack.
              </p>
            </div>

            {/* Action buttons */}
            <div className='bg-[#111111] rounded-2xl px-3 py-3 flex items-center justify-center gap-2 relative border border-[#1f1f1f] shadow-[0_-4px_12px_rgba(0,0,0,0.18)]'>
              {/* Close button */}
              {onClose && (
                <button
                  onClick={onClose}
                  className='absolute -top-2 -right-2 w-9 h-9 rounded-full bg-[#262626] flex items-center justify-center hover:bg-[#333] transition-colors shadow-sm'
                  style={{ zIndex: 2 }}
                >
                  <X className='w-4 h-4 text-white' />
                </button>
              )}
              <button
                onClick={async () => {
                  setCurrentView('scan');
                  if (!scanning) {
                    scannerInitialized.current = false;
                    setTimeout(async () => {
                      try {
                        await startScanningRef.current();
                      } catch (error) {
                        console.error('Error starting scanner:', error);
                      }
                    }, 100);
                  }
                }}
                className='bg-[#fc5a29] text-white rounded-lg px-3 py-2 flex items-center justify-center gap-1.5 text-sm font-medium hover:bg-[#e04a1f] transition-colors'
              >
                <QrCode className='w-4 h-4' />
                <span>Scan cards</span>
              </button>
              <button
                onClick={() => {
                  setCurrentView('list');
                  stopScanning();
                }}
                className={`${listButtonClass} relative`}
              >
                <List className={listIconClass} />
                {isListViewActive && <span>Cards</span>}
                {scannedItems.length > 0 && (
                  <span className='absolute -top-2 -right-2 bg-[#fc5a29] text-white text-[11px] font-semibold rounded-full min-w-[20px] h-[20px] px-1 flex items-center justify-center'>
                    {scannedItems.length > 99 ? '99+' : scannedItems.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom toolbar for list view - show always when in list view */}
      {(currentView === 'list' || currentView === 'card') && (
        <div
          className='fixed bottom-0 left-0 right-0 pointer-events-auto z-20 px-6 pb-1.5 pt-1'
          style={{ zIndex: 50 }}
        >
          <div className='bg-[#111111] rounded-2xl px-2.5 py-2 flex items-center justify-center gap-2 relative max-w-[240px] mx-auto border border-[#1f1f1f] shadow-[0_-4px_12px_rgba(0,0,0,0.18)]'>
            {/* Close button */}
            {onClose && (
              <button
                onClick={onClose}
                className='absolute -top-2 -right-2 w-9 h-9 rounded-full bg-[#262626] flex items-center justify-center hover:bg-[#333] transition-colors shadow-sm'
                style={{ zIndex: 2 }}
              >
                <X className='w-4 h-4 text-white' />
              </button>
            )}
            {/* QR button - returns to scan view */}
            <button
              onClick={async () => {
                setCurrentView('scan');
                if (!scanning) {
                  scannerInitialized.current = false;
                  setTimeout(async () => {
                    try {
                      await startScanningRef.current();
                    } catch (error) {
                      console.error('Error starting scanner:', error);
                    }
                  }, 100);
                }
              }}
              className='relative w-12 h-12 bg-[#262626] text-white rounded-lg flex items-center justify-center hover:bg-[#333] transition-colors focus:outline-none focus-visible:outline-none'
            >
              <QrCode className='w-5 h-5' />
            </button>
            {/* Cards button */}
            <button
              onClick={() => {
                setCurrentView('list');
                stopScanning();
              }}
              className={`${listButtonClass} focus:outline-none focus-visible:outline-none relative`}
            >
              <List className={listIconClass} />
              {isListViewActive && <span>Cards</span>}
              {scannedItems.length > 0 && (
                <span className='absolute -top-2 -right-2 bg-[#fc5a29] text-white text-[11px] font-semibold rounded-full min-w-[20px] h-[20px] px-1 flex items-center justify-center'>
                  {scannedItems.length > 99 ? '99+' : scannedItems.length}
                </span>
              )}
            </button>
            {showCardToggle && (
              <button
                onClick={() => {
                  if (scannedItems.length === 0) return;
                  const fallbackCard = filteredItems[0] ?? scannedItems[0];
                  const targetId = activeCardId ?? fallbackCard?.id;
                  if (targetId) {
                    setActiveCardId(targetId);
                    setCurrentView('card');
                  }
                  stopScanning();
                }}
                className={`${cardButtonClass} ${
                  scannedItems.length === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
                disabled={scannedItems.length === 0}
              >
                <CreditCard className={cardIconClass} />
                {isCardViewActive && <span>Card</span>}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Item Details Panel */}
      {selectedItemForDetails && (
        <ItemDetailsPanel
          item={selectedItemForDetails}
          isOpen={isItemDetailsPanelOpen}
          onClose={() => {
            setIsItemDetailsPanelOpen(false);
            setSelectedItemForDetails(null);
          }}
          onOpenChange={() => {
            setIsItemDetailsPanelOpen(false);
            setSelectedItemForDetails(null);
          }}
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

      {/* Toaster for toast notifications */}
      <Toaster position='top-center' />

      {/* Can't Add Cards Modal */}
      {isCantAddCardsModalOpen && (
        <div
          className='fixed inset-0 z-[100] flex items-center justify-center'
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(0px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCantAddCardsModalOpen(false);
          }}
        >
          <div
            className='relative w-[353px] max-w-[425px] rounded-[10px] bg-white border border-[#e5e5e5] shadow-lg p-6 flex flex-col items-end gap-4'
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow:
                '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Close Icon */}
            <button
              onClick={() => {
                // Deselect items that can't be added
                const selectedItemsArray = Array.from(selectedItems);
                const itemsCantAdd = selectedItemsArray.filter((itemId) => {
                  const item = scannedItems.find((i) => i.id === itemId);
                  if (item) {
                    const itemStatus =
                      item.cardData.payload.status?.toUpperCase() || 'UNKNOWN';
                    return !canAddToOrderQueue(itemStatus);
                  }
                  return false;
                });
                // Remove items that can't be added from selection
                setSelectedItems((prev) => {
                  const newSet = new Set(prev);
                  itemsCantAdd.forEach((id) => newSet.delete(id));
                  return newSet;
                });
                setIsCantAddCardsModalOpen(false);
              }}
              className='absolute top-4 right-4 w-4 h-4 flex items-center justify-center'
            >
              <X className='w-4 h-4 text-[#0a0a0a] opacity-70' />
            </button>

            {/* Header */}
            <div className='w-full flex flex-col items-start gap-1.5'>
              <b className='w-full text-base leading-6 text-[#0a0a0a] font-semibold'>
                Can&apos;t add some cards to order queue
              </b>
              <div className='w-full text-sm leading-5 text-[#737373] font-normal'>
                <b>{cardsCantAddCount} cards</b>
                <span>
                  {' '}
                  are in a state that won&apos;t allow them to be added to the
                  order queue. Would you like to add the rest?
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className='w-full flex items-center justify-end gap-2'>
              <button
                onClick={() => {
                  // Deselect items that can't be added
                  const selectedItemsArray = Array.from(selectedItems);
                  const itemsCantAdd = selectedItemsArray.filter((itemId) => {
                    const item = scannedItems.find((i) => i.id === itemId);
                    if (item) {
                      const itemStatus =
                        item.cardData.payload.status?.toUpperCase() ||
                        'UNKNOWN';
                      return !canAddToOrderQueue(itemStatus);
                    }
                    return false;
                  });
                  // Remove items that can't be added from selection
                  setSelectedItems((prev) => {
                    const newSet = new Set(prev);
                    itemsCantAdd.forEach((id) => newSet.delete(id));
                    return newSet;
                  });
                  setIsCantAddCardsModalOpen(false);
                }}
                className='h-9 rounded-lg bg-white border border-[#e5e5e5] flex items-center justify-center px-4 text-sm leading-5 text-[#0a0a0a]'
                style={{
                  boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const jwtToken = localStorage.getItem('idToken');
                  if (!jwtToken) return;

                  const selectedItemsArray = Array.from(selectedItems);
                  const itemsCanAdd = selectedItemsArray.filter((itemId) => {
                    const item = scannedItems.find((i) => i.id === itemId);
                    if (item) {
                      const itemStatus =
                        item.cardData.payload.status?.toUpperCase() ||
                        'UNKNOWN';
                      return canAddToOrderQueue(itemStatus);
                    }
                    return false;
                  });

                  // Deselect items that can't be added before processing
                  const itemsCantAdd = selectedItemsArray.filter((itemId) => {
                    const item = scannedItems.find((i) => i.id === itemId);
                    if (item) {
                      const itemStatus =
                        item.cardData.payload.status?.toUpperCase() ||
                        'UNKNOWN';
                      return !canAddToOrderQueue(itemStatus);
                    }
                    return false;
                  });

                  // Remove items that can't be added from selection
                  setSelectedItems((prev) => {
                    const newSet = new Set(prev);
                    itemsCantAdd.forEach((id) => newSet.delete(id));
                    return newSet;
                  });

                  await addItemsToOrderQueue(itemsCanAdd, jwtToken);
                  setIsCantAddCardsModalOpen(false);
                }}
                className='h-9 rounded-lg bg-[#fc5a29] flex items-center justify-center px-4 text-sm leading-5 text-white'
                style={{
                  boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                }}
              >
                Add the rest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Can't Receive Cards Modal */}
      {isCantReceiveCardsModalOpen && (
        <div
          className='fixed inset-0 z-[100] flex items-center justify-center'
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(0px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget)
              setIsCantReceiveCardsModalOpen(false);
          }}
        >
          <div
            className='relative w-[353px] max-w-[425px] rounded-[10px] bg-white border border-[#e5e5e5] shadow-lg p-6 flex flex-col items-end gap-4'
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow:
                '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Close Icon */}
            <button
              onClick={() => {
                // Deselect items that can't be received
                const selectedItemsArray = Array.from(selectedItems);
                const itemsCantReceive = selectedItemsArray.filter((itemId) => {
                  const item = scannedItems.find((i) => i.id === itemId);
                  if (item) {
                    const itemStatus =
                      item.cardData.payload.status?.toUpperCase() || 'UNKNOWN';
                    return itemStatus === 'FULFILLED';
                  }
                  return false;
                });
                // Remove items that can't be received from selection
                setSelectedItems((prev) => {
                  const newSet = new Set(prev);
                  itemsCantReceive.forEach((id) => newSet.delete(id));
                  return newSet;
                });
                setIsCantReceiveCardsModalOpen(false);
              }}
              className='absolute top-4 right-4 w-4 h-4 flex items-center justify-center'
            >
              <X className='w-4 h-4 text-[#0a0a0a] opacity-70' />
            </button>

            {/* Header */}
            <div className='w-full flex flex-col items-start gap-1.5'>
              <b className='w-full text-base leading-6 text-[#0a0a0a] font-semibold'>
                Can&apos;t receive some cards
              </b>
              <div className='w-full text-sm leading-5 text-[#737373] font-normal'>
                <b>{cardsCantReceiveCount} cards</b>
                <span>
                  {' '}
                  are in a state that won&apos;t allow them to be received.
                  Would you like to receive the rest?
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className='w-full flex items-center justify-end gap-2'>
              <button
                onClick={() => {
                  // Deselect items that can't be received
                  const selectedItemsArray = Array.from(selectedItems);
                  const itemsCantReceive = selectedItemsArray.filter(
                    (itemId) => {
                      const item = scannedItems.find((i) => i.id === itemId);
                      if (item) {
                        const itemStatus =
                          item.cardData.payload.status?.toUpperCase() ||
                          'UNKNOWN';
                        return itemStatus === 'FULFILLED';
                      }
                      return false;
                    },
                  );
                  // Remove items that can't be received from selection
                  setSelectedItems((prev) => {
                    const newSet = new Set(prev);
                    itemsCantReceive.forEach((id) => newSet.delete(id));
                    return newSet;
                  });
                  setIsCantReceiveCardsModalOpen(false);
                }}
                className='h-9 rounded-lg bg-white border border-[#e5e5e5] flex items-center justify-center px-4 text-sm leading-5 text-[#0a0a0a]'
                style={{
                  boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const jwtToken = localStorage.getItem('idToken');
                  if (!jwtToken) return;

                  const selectedItemsArray = Array.from(selectedItems);
                  const itemsCanReceive = selectedItemsArray.filter(
                    (itemId) => {
                      const item = scannedItems.find((i) => i.id === itemId);
                      if (item) {
                        const itemStatus =
                          item.cardData.payload.status?.toUpperCase() ||
                          'UNKNOWN';
                        return itemStatus !== 'FULFILLED';
                      }
                      return false;
                    },
                  );

                  // Deselect items that can't be received before processing
                  const itemsCantReceive = selectedItemsArray.filter(
                    (itemId) => {
                      const item = scannedItems.find((i) => i.id === itemId);
                      if (item) {
                        const itemStatus =
                          item.cardData.payload.status?.toUpperCase() ||
                          'UNKNOWN';
                        return itemStatus === 'FULFILLED';
                      }
                      return false;
                    },
                  );

                  // Remove items that can't be received from selection
                  setSelectedItems((prev) => {
                    const newSet = new Set(prev);
                    itemsCantReceive.forEach((id) => newSet.delete(id));
                    return newSet;
                  });

                  await receiveItems(itemsCanReceive, jwtToken);
                  setIsCantReceiveCardsModalOpen(false);
                }}
                className='h-9 rounded-lg bg-[#fc5a29] flex items-center justify-center px-4 text-sm leading-5 text-white'
                style={{
                  boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                }}
              >
                Receive the rest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Scanned Items Modal */}
      {isClearItemsModalOpen && (
        <div
          className='fixed inset-0 z-[100] flex items-center justify-center'
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(0px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsClearItemsModalOpen(false);
          }}
        >
          <div
            className='relative w-[425px] max-w-[425px] rounded-[10px] bg-white border border-[#e5e5e5] shadow-lg p-6 flex flex-col items-end gap-4'
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow:
                '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Close Icon */}
            <button
              onClick={() => setIsClearItemsModalOpen(false)}
              className='absolute top-4 right-4 w-4 h-4 flex items-center justify-center'
            >
              <X className='w-4 h-4 text-[#0a0a0a] opacity-70' />
            </button>

            {/* Header */}
            <div className='w-full flex flex-col items-start gap-1.5'>
              <b className='w-full text-base leading-6 text-[#0a0a0a] font-semibold'>
                Clear scanned items?
              </b>
              <div className='w-full text-sm leading-5 text-[#737373] font-normal'>
                Are you sure you want to remove all selected scanned items?
              </div>
            </div>

            {/* Footer */}
            <div className='w-full flex items-center justify-end gap-2'>
              <button
                onClick={() => setIsClearItemsModalOpen(false)}
                className='h-9 rounded-lg bg-white border border-[#e5e5e5] flex items-center justify-center px-4 text-sm leading-5 text-[#0a0a0a]'
                style={{
                  boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                }}
              >
                Just kidding
              </button>
              <button
                onClick={() => {
                  if (selectedItems.size > 0) {
                    setScannedItems((prev) =>
                      prev.filter((item) => !selectedItems.has(item.id)),
                    );
                    setSelectedItems(new Set());
                    setIsClearItemsModalOpen(false);
                  }
                }}
                className='h-9 rounded-lg bg-[#fc5a29] flex items-center justify-center px-4 text-sm leading-5 text-white'
                style={{
                  boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                }}
              >
                Yup, clear &apos;em
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
