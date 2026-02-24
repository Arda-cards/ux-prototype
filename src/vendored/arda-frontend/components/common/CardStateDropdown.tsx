'use client';

import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuItem,
} from '@frontend/components/ui/dropdown-menu';
import { canAddToOrderQueue } from '@frontend/lib/cardStateUtils';
import { KanbanCard } from '@frontend/types/kanban-cards';
import { toast } from 'sonner';
import { flyToTarget } from '@frontend/lib/fly-to-target';

interface CardStateDropdownProps {
  card: KanbanCard;
  onAddToOrderQueue?: () => void;
  onStateChange?: (newState: string) => void;
  orderMethod?: string;
  link?: string;
  onOpenEmailPanel?: () => void;
  onRefreshCards?: () => void | Promise<void>;
  showToast?: (message: string) => void;
  // New trigger prop for forcing data refresh
  onTriggerRefresh?: () => void;
}

export function CardStateDropdown({
  card,
  onAddToOrderQueue,
  onStateChange,
  orderMethod,
  link,
  onOpenEmailPanel,
  onRefreshCards,
  showToast,
  onTriggerRefresh,
}: CardStateDropdownProps) {
  const canAddToQueue = canAddToOrderQueue(card.status);

  // Helper function to show toast with fallback
  const showToastWithFallback = (
    message: string,
    type: 'success' | 'error' = 'error'
  ) => {
    if (showToast) {
      showToast(message);
    } else {
      if (type === 'success') {
        toast.success(message);
      } else {
        toast.error(message);
      }
    }
  };

  // Internal function to handle state changes with API calls
  const handleInternalStateChange = async (newState: string) => {
    try {
      const jwtToken = localStorage.getItem('idToken');
      if (!jwtToken) {
        showToastWithFallback('Authentication token not found');
        return;
      }

      let endpoint = '';
      let successMessage = '';

      switch (newState) {
        case 'REQUESTING':
          endpoint = `/api/arda/kanban/kanban-card/${card.entityId}/event/request`;
          successMessage = 'Card status changed to In Order Queue';
          break;
        case 'REQUESTED':
          endpoint = `/api/arda/kanban/kanban-card/${card.entityId}/event/accept`;
          successMessage = 'Card status changed to In Progress';
          break;
        case 'IN_PROCESS':
          endpoint = `/api/arda/kanban/kanban-card/${card.entityId}/event/start-processing`;
          successMessage = 'Card status changed to Receiving';
          break;
        case 'FULFILLED':
          endpoint = `/api/arda/kanban/kanban-card/${card.entityId}/event/fulfill`;
          successMessage = 'Card status changed to Restocked';
          break;
        default:
          showToastWithFallback('Unknown state change');
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
          // Execute animation for REQUESTING state
          if (newState === 'REQUESTING') {
            try {
              // Find the card element using data-card-id attribute
              const cardElement = document.querySelector(`[data-card-id="${card.entityId}"]`) as HTMLElement;
              
              const fromEl = cardElement as HTMLElement;
              const toEl = document.getElementById('order-queue-target');

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
            } catch (animationError) {
              console.error('Error in flyToTarget:', animationError);
              // Continue even if animation fails
            }
          }

          showToastWithFallback(successMessage, 'success');

          // Use trigger refresh if available, otherwise fallback to onRefreshCards
          if (onTriggerRefresh) {
            await onTriggerRefresh();
          } else if (onRefreshCards) {
            await onRefreshCards();
          }
        } else {
          showToastWithFallback('Failed to change card state');
        }
      } else {
        showToastWithFallback('Failed to change card state');
      }
    } catch {
      showToastWithFallback('Error changing card state');
    }
  };

  // Define all available states
  const allStates = [
    {
      key: 'REQUESTING',
      label: 'In Order Queue',
      action: () => {
        if (onTriggerRefresh || (onRefreshCards && showToast)) {
          handleInternalStateChange('REQUESTING');
        } else {
          onAddToOrderQueue?.();
        }
      },
    },
    {
      key: 'REQUESTED',
      label: 'In Progress',
      action: () => {
        // Handle email panel and links for REQUESTED state
        if (orderMethod === 'Email' && onOpenEmailPanel) {
          onOpenEmailPanel();
          return;
        }

        if (link) {
          window.open(link, '_blank');
        }

        if (onTriggerRefresh || (onRefreshCards && showToast)) {
          handleInternalStateChange('REQUESTED');
        } else {
          onStateChange?.('REQUESTED');
        }
      },
    },
    {
      key: 'IN_PROCESS',
      label: 'Receiving',
      action: () => {
        if (onTriggerRefresh || (onRefreshCards && showToast)) {
          handleInternalStateChange('IN_PROCESS');
        } else {
          onStateChange?.('IN_PROCESS');
        }
      },
    },
    {
      key: 'FULFILLED',
      label: 'Restocked',
      action: () => {
        if (onTriggerRefresh || (onRefreshCards && showToast)) {
          handleInternalStateChange('FULFILLED');
        } else {
          onStateChange?.('FULFILLED');
        }
      },
    },
  ];

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>Card state</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {allStates.map((state) => {
          const isCurrentState = card.status === state.key;
          const isDisabled =
            isCurrentState || (state.key === 'REQUESTING' && !canAddToQueue);

          return (
            <DropdownMenuItem
              key={state.key}
              onClick={isCurrentState ? undefined : state.action}
              disabled={isDisabled}
              className={
                isCurrentState
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-60'
                  : isDisabled
                  ? 'text-gray-400 cursor-not-allowed'
                  : ''
              }
            >
              {isCurrentState && (
                <div className='w-2 h-2 rounded-full bg-black mr-2'></div>
              )}
              <div className='flex items-center justify-between w-full'>
                <span>{state.label}</span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
