'use client';

import { Button } from '@frontend/components/ui/button';
import { cn } from '@frontend/lib/utils';
import {
  Plus,
  CopyPlus,
  XIcon,
  ChevronLeft,
  ChevronRight,
  Dock,
} from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { ItemCard } from '@frontend/constants/types';
import { KanbanCard } from '@frontend/types/kanban-cards';
import { CardInfo } from './CardInfo';
import { toast } from 'sonner';
import { AddCardsModal } from './AddCardsModal';
import { CardsPreviewModalIndividual } from './CardsPreviewModalIndividual';
import { KanbanHistoryModal } from './KanbanHistoryModal';
import { createPortal } from 'react-dom';
import { flyToTarget } from '@frontend/lib/fly-to-target';
import { useOrderQueueToast } from '@frontend/hooks/useOrderQueueToast';
import { DeleteConfirmationModal } from '@frontend/components/common/DeleteConfirmationModal';
import EmailPanel from '@frontend/components/EmailPanel';
// Card state utilities are available through the centralized system

interface ManageCardsPanelProps {
  item: ItemCard;
  mode?: 'overlay' | 'inline';
  open?: boolean;
  onOpenChange?: (value: boolean) => void;
  onBack?: () => void;
  onClose?: () => void;
  onCardsChange?: (cards: KanbanCard[]) => void;
}

export function ManageCardsPanel({
  item,
  mode = 'overlay',
  open = false,
  onOpenChange,
  onBack,
  onClose,
  onCardsChange,
}: ManageCardsPanelProps) {
  const isInline = mode === 'inline';
  const isActive = isInline || open;
  const panelRef = useRef<HTMLDivElement>(null);
  const [cardList, setCardList] = useState<KanbanCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedCardForPreview, setSelectedCardForPreview] =
    useState<KanbanCard | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedCardForHistory, setSelectedCardForHistory] =
    useState<KanbanCard | null>(null);
  const [printingCardId, setPrintingCardId] = useState<string | null>(null);
  const [isPrintingLabel, setIsPrintingLabel] = useState(false);
  const [isPrintingBreadcrumb, setIsPrintingBreadcrumb] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<KanbanCard | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEmailPanelOpen, setIsEmailPanelOpen] = useState(false);
  const [selectedItemForEmail, setSelectedItemForEmail] =
    useState<ItemCard | null>(null);

  // Order queue toast hook
  const { showToast } = useOrderQueueToast();

  const handleViewPreview = (card: KanbanCard) => {
    setSelectedCardForPreview(card);
    setIsPreviewModalOpen(true);
  };

  const [historyData, setHistoryData] = useState<
    | {
        results: {
          rId: string;
          asOf: { effective: number; recorded: number };
          payload: {
            status: string;
            type: string;
            eId: string;
            serialNumber: string;
            item: { type: string; eId: string; name: string };
            cardQuantity?: { amount: number; unit: string };
            lastEvent?: {
              when: { effective: number; recorded: number };
              type: string;
              author: string;
            };
            printStatus: string;
          };
          metadata: { tenantId: string };
          author: string;
          previous?: string;
          retired: boolean;
        }[];
        thisPage?: string;
        nextPage?: string;
        previousPage?: string;
      }
    | undefined
  >(undefined);

  const handleViewHistory = async (card: KanbanCard) => {
    try {
      const jwtToken = localStorage.getItem('idToken');
      const timestampMs = Date.now();

      const response = await fetch(
        `/api/arda/kanban/kanban-card/${card.entityId}/history`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({
            since: {
              effective: 0,
              recorded: 0,
            },
            until: {
              effective: timestampMs,
              recorded: timestampMs,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.ok) {
          // Store the history data and open the modal
          setHistoryData(data.data);
          setSelectedCardForHistory(card);
          setIsHistoryModalOpen(true);
        } else {
          console.error('Failed to get kanban card history:', data);
          toast.error('Failed to get kanban card history');
        }
      } else {
        console.error('Failed to get kanban card history:', response.status);
        toast.error('Failed to get kanban card history');
      }
    } catch (error) {
      console.error('Error getting kanban card history:', error);
      toast.error('Error getting kanban card history');
    }
  };

  const handleDeleteCard = (card: KanbanCard) => {
    setCardToDelete(card);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!cardToDelete) return;

    try {
      setIsDeleting(true);

      const jwtToken = localStorage.getItem('idToken');
      const deletePromises = [
        async () => {
          const response = await fetch(
            `/api/arda/kanban/kanban-card/${cardToDelete.entityId}`,
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
            return { success: data.ok, card: cardToDelete };
          }
          return { success: false, card: cardToDelete };
        },
      ];

      const results = await Promise.all(
        deletePromises.map((promise) => promise())
      );
      const successful = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      if (successful.length === 1) {
        toast.success(
          `Successfully deleted ${successful.length} card${
            successful.length > 1 ? 's' : ''
          }`
        );
        // Remove the card from the local list
        setCardList((prev) =>
          prev.filter((card) => card.entityId !== cardToDelete.entityId)
        );
      } else if (successful.length > 0) {
        toast.warning(
          `Deleted ${successful.length} of 1 cards. ${failed.length} failed.`
        );
      } else {
        toast.error('Failed to delete card');
      }

      // Close modal
      setIsDeleteModalOpen(false);
      setCardToDelete(null);
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error('Error deleting card');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setCardToDelete(null);
  };

  const handleCopyToClipboard = () => {
    setIsEmailPanelOpen(false);
    setSelectedItemForEmail(null);
  };

  const handleSendEmail = async (itemIds: string[]) => {
    try {
      const jwtToken = localStorage.getItem('idToken');
      if (!jwtToken) {
        toast.error('Authentication token not found');
        return;
      }

      // Prepare email data for all items
      const emailItems = itemIds.map(() => ({
        name: item.title,
        quantity: item.orderQty || '1',
      }));

      // Call the email API
      const response = await fetch('/api/email/send-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          itemIds: itemIds,
          supplierContactName: item.supplier,
          items: emailItems,
          userContext: {
            name: 'User',
            email: 'user@example.com',
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.ok) {
          toast.success('Email sent successfully');
          // Close the email panel
          setIsEmailPanelOpen(false);
          setSelectedItemForEmail(null);
        } else {
          console.error('Failed to send email:', data);
          toast.error('Failed to send email');
        }
      } else {
        console.error('Failed to send email:', response.status);
        toast.error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Error sending email');
    }
  };

  const handlePrintCard = async (cardEid: string) => {
    try {
      setPrintingCardId(cardEid);
      const jwtToken = localStorage.getItem('idToken');

      const response = await fetch('/api/arda/kanban/kanban-card/print-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          ids: [cardEid],
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.ok && data.data && data.data.url) {
          window.open(data.data.url, '_blank', 'noopener,noreferrer');

          // Refresh cards list to show updated print status
          await fetchCards();
          toast.success('Card printed successfully!');
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
      toast.error('Error printing card');
    } finally {
      setPrintingCardId(null);
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
      toast.error('Error printing breadcrumb');
    } finally {
      setIsPrintingBreadcrumb(false);
    }
  };

  const handleAddToOrderQueue = async (cardEid: string) => {
    const fromEl = panelRef.current;
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
          // Execute animation first, then show toast
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

            // Show toast after animation completes
            showToast();

            // Refresh the cards list to show updated status
            await fetchCards();
          } catch (e) {
            console.error('Error in flyToTarget:', e);
            // Still show toast even if animation fails
            showToast();
            await fetchCards();
          }
        } else {
          console.error('Failed to add card to order queue:', data);
          toast.error('Failed to add card to order queue');
        }
      } else {
        console.error('Failed to add card to order queue:', response.status);
        toast.error('Failed to add card to order queue');
      }
    } catch (error) {
      console.error('Error adding card to order queue:', error);
      toast.error('Error adding card to order queue');
    }
  };

  const handleStateChange = async (cardEid: string, newState: string) => {
    try {
      const jwtToken = localStorage.getItem('idToken');
      let endpoint = '';
      let successMessage = '';

      // Determine the correct endpoint and message based on the new state
      switch (newState) {
        case 'REQUESTED':
          endpoint = `/api/arda/kanban/kanban-card/${cardEid}/event/accept`;
          successMessage = 'Card status changed to In Progress';
          break;
        case 'IN_PROCESS':
          endpoint = `/api/arda/kanban/kanban-card/${cardEid}/event/start-processing`;
          successMessage = 'Card status changed to Receiving';
          break;
        case 'FULFILLED':
          endpoint = `/api/arda/kanban/kanban-card/${cardEid}/event/fulfill`;
          successMessage = 'Card status changed to Restocked';
          break;
        default:
          console.error('Unknown state change:', newState);
          toast.error('Unknown state change');
          return;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.ok) {
          toast.success(successMessage);
          // Refresh the cards list to show updated status
          await fetchCards();
        } else {
          console.error('Failed to change card state:', data);
          toast.error('Failed to change card state');
        }
      } else {
        console.error('Failed to change card state:', response.status);
        toast.error('Failed to change card state');
      }
    } catch (error) {
      console.error('Error changing card state:', error);
      toast.error('Error changing card state');
    }
  };

  const fetchCards = useCallback(async () => {
    try {
      setLoading(true);

      const jwtToken = localStorage.getItem('idToken');

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
        console.log('ManageCardsPanel fetchCards response:', data);

        // Handle different response structures
        let records: Array<{
          payload?: {
            eId: string;
            serialNumber: string;
            status: string;
            printStatus: string;
            item: {
              eId: string;
              name: string;
            };
            cardQuantity: {
              amount: number;
              unit: string;
            };
          };
          rId?: string;
          author?: string;
          eId?: string;
          serialNumber?: string;
          status?: string;
          printStatus?: string;
          item?: {
            eId: string;
            name: string;
          };
          cardQuantity?: {
            amount: number;
            unit: string;
          };
        }> = [];
        
        if (data.ok && data.data) {
          // Try different possible structures
          if (data.data.records && Array.isArray(data.data.records)) {
            records = data.data.records;
          } else if (data.data.data && data.data.data.records && Array.isArray(data.data.data.records)) {
            records = data.data.data.records;
          } else if (Array.isArray(data.data)) {
            records = data.data;
          } else if (data.data.results && Array.isArray(data.data.results)) {
            records = data.data.results;
          }
        }

        if (records.length > 0) {
          // Map the API response to our local KanbanCard type
          const mappedCards = records
            .map(
              (result: {
                payload?: {
                  eId: string;
                  serialNumber: string;
                  status: string;
                  printStatus: string;
                  item: {
                    eId: string;
                    name: string;
                  };
                  cardQuantity: {
                    amount: number;
                    unit: string;
                  };
                };
                rId?: string;
                author?: string;
                eId?: string;
                serialNumber?: string;
                status?: string;
                printStatus?: string;
                item?: {
                  eId: string;
                  name: string;
                };
                cardQuantity?: {
                  amount: number;
                  unit: string;
                };
              }) => {
                // Handle both nested payload structure and flat structure
                const payload = result.payload || result;
                const entityId = payload.eId || result.eId || '';
                const recordId = result.rId || entityId;
                const author = result.author || 'system';
                const serialNumber = payload.serialNumber || result.serialNumber || '';
                const status = payload.status || result.status || 'UNKNOWN';
                const printStatus = payload.printStatus || result.printStatus || 'UNPRINTED';
                const itemData = payload.item || result.item;
                const cardQuantity = payload.cardQuantity || result.cardQuantity;

                if (!entityId) {
                  console.warn('Skipping card with no entityId:', result);
                  return null;
                }

                const now = Date.now();
                return {
                  entityId,
                  recordId,
                  author,
                  timeCoordinates: {
                    recordedAsOf: now,
                    effectiveAsOf: now,
                  },
                  createdCoordinates: {
                    recordedAsOf: now,
                    effectiveAsOf: now,
                  },
                  serialNumber,
                  item: itemData
                    ? {
                        entityId: itemData.eId,
                        recordId: itemData.eId,
                        author,
                        timeCoordinates: {
                          recordedAsOf: now,
                          effectiveAsOf: now,
                        },
                        createdCoordinates: {
                          recordedAsOf: now,
                          effectiveAsOf: now,
                        },
                        name: itemData.name,
                      }
                    : {
                        entityId: '',
                        recordId: '',
                        author,
                        timeCoordinates: {
                          recordedAsOf: now,
                          effectiveAsOf: now,
                        },
                        createdCoordinates: {
                          recordedAsOf: now,
                          effectiveAsOf: now,
                        },
                        name: '',
                      },
                  status: status as KanbanCard['status'],
                  printStatus: printStatus as KanbanCard['printStatus'],
                  cardQuantity: cardQuantity
                    ? {
                        amount: cardQuantity.amount,
                        unit: cardQuantity.unit,
                      }
                    : {
                        amount: 1,
                        unit: 'piece',
                      },
                };
              }
            )
            .filter((card): card is NonNullable<typeof card> => card !== null);
          
          console.log('ManageCardsPanel mapped cards:', mappedCards);
          setCardList(mappedCards);
          onCardsChange?.(mappedCards);
        } else {
          console.log('No cards found in response or empty records array');
          setCardList([]);
          onCardsChange?.([]);
        }
      } else {
        console.error('Failed to fetch cards:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        toast.error('Failed to fetch cards');
        setCardList([]);
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
      toast.error('Error fetching cards');
    } finally {
      setLoading(false);
    }
  }, [item.eid, onCardsChange]);

  // Trigger function for forcing data refresh (must be after fetchCards)
  const triggerDataRefresh = async () => {
    await fetchCards();
  };

  // Fetch cards when panel is active
  useEffect(() => {
    if (isActive) {
      fetchCards();
    }
  }, [isActive, fetchCards]);

  const handleAddCard = () => {
    setIsModalOpen(true);
  };

  const handleAddOneCard = async () => {
    try {
      setLoading(true);

      // Create a single card
      const response = await fetch('/api/arda/kanban/kanban-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('idToken')}`,
        },
        body: JSON.stringify({
          item: {
            eId: item.eid,
          },
          quantity: {
            amount: parseFloat(item.orderQty || '1'),
            unit: item.orderUnit || 'piece',
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create kanban card');
      }

      const cardData = await response.json();

      // Automatically fulfill the card after creation
      if (cardData.data?.payload?.eId) {
        try {
          const fulfillResponse = await fetch(
            `/api/arda/kanban/kanban-card/${cardData.data.payload.eId}/event/fulfill`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('idToken')}`,
              },
            }
          );

          if (!fulfillResponse.ok) {
            console.warn(
              'Failed to fulfill kanban card:',
              await fulfillResponse.text()
            );
          }
        } catch (fulfillError) {
          console.warn('Error fulfilling kanban card:', fulfillError);
        }
      }

      toast.success('Successfully created 1 kanban card!');
      await fetchCards(); // Refresh the card list
      
      // Dispatch event to notify other components (like QuickActionsCell) to refresh
      window.dispatchEvent(
        new CustomEvent('refreshItemCards', {
          detail: { itemEntityId: item.eid },
        })
      );
    } catch (error) {
      console.error('Error creating card:', error);
      toast.error('Error creating card');
    } finally {
      setLoading(false);
    }
  };

  const handleModalConfirm = async (quantity: number) => {
    try {
      setLoading(true);

      // Create multiple cards based on quantity
      for (let i = 0; i < quantity; i++) {
        const response = await fetch('/api/arda/kanban/kanban-card', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('idToken')}`,
          },
          body: JSON.stringify({
            item: {
              eId: item.eid,
            },
            quantity: {
              amount: parseFloat(item.orderQty || ''),
              unit: item.orderUnit || '',
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create kanban card');
        }

        const cardData = await response.json();

        // Automatically fulfill the card after creation
        if (cardData.data?.payload?.eId) {
          try {
            const fulfillResponse = await fetch(
              `/api/arda/kanban/kanban-card/${cardData.data.payload.eId}/event/fulfill`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${localStorage.getItem('idToken')}`,
                },
              }
            );

            if (!fulfillResponse.ok) {
              console.warn(
                `Failed to fulfill card ${i + 1}:`,
                await fulfillResponse.text()
              );
            }
          } catch (fulfillError) {
            console.warn(`Error fulfilling card ${i + 1}:`, fulfillError);
          }
        }
      }

      toast.success(
        `Successfully created ${quantity} kanban card${
          quantity > 1 ? 's' : ''
        }!`
      );
      // Refresh the cards list
      await fetchCards();
      
      // Dispatch event to notify other components (like QuickActionsCell) to refresh
      window.dispatchEvent(
        new CustomEvent('refreshItemCards', {
          detail: { itemEntityId: item.eid },
        })
      );
    } catch (error) {
      console.error('Error creating kanban cards:', error);
      toast.error('Error creating kanban cards');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isInline) {
      return;
    }
    if (e.target === e.currentTarget) {
      onOpenChange?.(false);
    }
  };

  const handleOnClose = async () => {
    if (isInline) {
      return;
    }
    onOpenChange?.(false);
    if (onClose) {
      await onClose();
    }
  };

  useEffect(() => {
    if (isInline) {
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange?.(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isInline, onOpenChange]);

  const actionButtons = isInline ? (
    <div className='-mx-6 flex justify-center gap-2 px-6 pt-2 pb-3 flex-wrap'>
      <Button
        variant='outline'
        size='sm'
        onClick={handleAddOneCard}
        disabled={loading}
        className='h-8 rounded-lg px-3 py-1.5 text-sm font-medium border border-transparent hover:border-[#E5E5E5] focus-visible:border-[#E5E5E5] gap-2'
      >
        <Plus className='h-4 w-4' />
        {loading ? 'Adding...' : 'Add card'}
      </Button>
      <Button
        variant='outline'
        size='sm'
        onClick={handleAddCard}
        disabled={loading}
        className='h-8 rounded-lg px-3 py-1.5 text-sm font-medium border border-transparent hover:border-[#E5E5E5] focus-visible:border-[#E5E5E5] gap-2'
      >
        <CopyPlus className='h-4 w-4' />
        {loading ? 'Adding...' : 'Add multiple'}
      </Button>
    </div>
  ) : (
    <div className='px-4 pt-4 flex gap-2 flex-wrap'>
      <Button
        variant='outline'
        size='sm'
        onClick={handleAddOneCard}
        disabled={loading}
        className='h-8 px-3 py-1.5 rounded-md font-medium text-sm gap-2'
      >
        <Plus className='w-4 h-4' />
        {loading ? 'Adding...' : 'Add card'}
      </Button>
      <Button
        variant='outline'
        size='sm'
        onClick={handleAddCard}
        disabled={loading}
        className='h-8 px-3 py-1.5 rounded-md font-medium text-sm gap-2'
      >
        <Plus className='w-4 h-4' />
        {loading ? 'Adding...' : 'Add multiple'}
      </Button>
    </div>
  );

  const renderCardsBody = () => {
    if (loading && cardList.length === 0) {
      return (
        <div className='border border-dashed border-[#E5E5E5] rounded-md p-6 text-center text-sm text-muted-foreground'>
          <div className='flex flex-col items-center gap-2'>
            <div className='bg-pink-100 p-2 rounded-full'>
              <Dock className='w-8 h-8 text-[#0A0A0A]' />
            </div>
            <p className='text-base font-semibold text-[#0A0A0A]'>
              Loading cards...
            </p>
          </div>
        </div>
      );
    }

    if (cardList.length === 0) {
      return (
        <div className='border border-dashed border-[#E5E5E5] rounded-md p-6 text-center text-sm text-muted-foreground'>
          <div className='flex flex-col items-center gap-2'>
            <div className='bg-pink-100 p-2 rounded-full'>
              <Dock className='w-8 h-8 text-[#0A0A0A]' />
            </div>
            <p className='text-base font-semibold text-[#0A0A0A]'>
              No cards... yet
            </p>
            <p className='text-muted-foreground text-sm max-w-[300px]'>
              Cards are the heart of your Kanban loops; they help track physical
              instances of your inventory items. Click Add cards to create some.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className='flex flex-col gap-4'>
        {cardList.map((card, index) => (
          <CardInfo
            key={index}
            card={card}
            index={index}
            totalCards={cardList.length}
            onDelete={() => handleDeleteCard(card)}
            onPrint={() => handlePrintCard(card.entityId)}
            onAddToOrderQueue={() => handleAddToOrderQueue(card.entityId)}
            onStateChange={(newState) =>
              handleStateChange(card.entityId, newState)
            }
            onViewPreview={() => handleViewPreview(card)}
            onViewHistory={() => handleViewHistory(card)}
            isPrinting={printingCardId === card.entityId}
            orderMethod={'Email'}
            link={item.link}
            onOpenEmailPanel={() => {
              setSelectedItemForEmail(item);
              setIsEmailPanelOpen(true);
            }}
            onTriggerRefresh={triggerDataRefresh}
            showToast={(message) => toast.success(message)}
            onPrintLabel={handlePrintLabel}
            onPrintBreadcrumb={handlePrintBreadcrumb}
            isPrintingLabel={isPrintingLabel}
            isPrintingBreadcrumb={isPrintingBreadcrumb}
          />
        ))}
      </div>
    );
  };

  const listContainerClass = isInline
    ? 'flex-1 overflow-y-auto px-4 pb-8'
    : 'flex-1 overflow-y-auto px-4 pt-4 pb-20';

  const modalPortals = (
    <>
      {createPortal(
        <AddCardsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleModalConfirm}
        />,
        document.body
      )}
      {createPortal(
        selectedCardForPreview && (
          <CardsPreviewModalIndividual
            isOpen={isPreviewModalOpen}
            onClose={() => {
              setIsPreviewModalOpen(false);
              setSelectedCardForPreview(null);
            }}
            item={item}
            card={selectedCardForPreview}
          />
        ),
        document.body
      )}
      {createPortal(
        selectedCardForHistory && (
          <KanbanHistoryModal
            isOpen={isHistoryModalOpen}
            onClose={() => {
              setIsHistoryModalOpen(false);
              setSelectedCardForHistory(null);
              setHistoryData(undefined);
            }}
            itemName={item.title}
            historyData={historyData}
          />
        ),
        document.body
      )}
      {createPortal(
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          isLoading={isDeleting}
          title='Delete card?'
          message='Are you sure you want to delete this card? This action cannot be undone.'
          confirmText='Delete card'
          cancelText='Cancel'
        />,
        document.body
      )}
      {createPortal(
        selectedItemForEmail && (
          <EmailPanel
            isOpen={isEmailPanelOpen}
            onClose={() => {
              setIsEmailPanelOpen(false);
              setSelectedItemForEmail(null);
            }}
            onSendEmail={handleSendEmail}
            onCopyToClipboard={handleCopyToClipboard}
            items={[
              {
                id: selectedItemForEmail.eid,
                name: selectedItemForEmail.title,
                quantity: selectedItemForEmail.orderQty || '1',
                supplier: selectedItemForEmail.supplier,
                orderMethod: 'Email',
              },
            ]}
          />
        ),
        document.body
      )}
    </>
  );

  if (isInline) {
    return (
      <>
        <div ref={panelRef} className='flex h-full flex-col'>
          {actionButtons}
          <div className={listContainerClass}>{renderCardsBody()}</div>
        </div>
        {modalPortals}
      </>
    );
  }

  return (
    <>
      <div
        onClick={handleOverlayClick}
        className={cn(
          'fixed inset-0 z-50 flex justify-end transition-all duration-300',
          open ? 'visible opacity-100' : 'invisible opacity-0'
        )}
        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      >
        <div
          ref={panelRef}
          className={cn(
            'relative w-full sm:w-[420px] lg:w-[460px] h-full bg-white border-l border-border flex flex-col shadow-xl transition-transform duration-300 overflow-hidden',
            open ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          {/* Header with back, breadcrumb and close */}
          <div className='relative'>
            <div className='flex flex-col  px-4 pt-4 pb-2 border-b'>
              <div className='flex items-center gap-2'>
                <button
                  onClick={onBack ?? (() => {})}
                  className='h-9 w-9 flex justify-center items-center rounded-md border border-[#E5E5E5] shadow-sm hover:bg-accent'
                >
                  <ChevronLeft className='w-4 h-4' />
                </button>
                <div className='text-[24px] font-semibold text-[#0A0A0A] leading-8 font-inter'>
                  {item?.title ?? 'Item Details'}
                </div>
              </div>

              {/* Breadcrumb */}
              <div className='px-4 mt-1 mb-2 flex items-center gap-2 text-sm text-muted-foreground font-normal font-geist'>
                <span>{item?.title ?? 'Item Details'}</span>
                <ChevronRight className='w-4 h-4 text-muted-foreground' />
                <span className='text-[#0A0A0A]'>Manage Cards</span>
              </div>
            </div>

            {/* Close (X) icon */}
            <button
              onClick={() => handleOnClose()}
              className='absolute right-4 top-4 text-muted-foreground hover:text-foreground'
            >
              <XIcon className='w-5 h-5' />
            </button>
          </div>

          {actionButtons}

          <div className={listContainerClass}>{renderCardsBody()}</div>

          {/* Done Button */}
          <div className='sticky bottom-0 left-0 w-full px-6 py-4 z-40 flex justify-end bg-white border-t border-[#E5E5E5]'>
            <Button
              variant='outline'
              className='text-sm font-medium text-[#0A0A0A] px-4 py-2 h-10 rounded-md border border-[#E5E5E5]'
              onClick={handleOnClose}
            >
              Done
            </Button>
          </div>
        </div>
      </div>
      {modalPortals}
    </>
  );
}
