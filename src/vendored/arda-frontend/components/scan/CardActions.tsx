'use client';

import React from 'react';
import { Button } from '@frontend/components/ui/button';
import { ItemCardView } from '@frontend/components/items/ItemCardView';
import { ShoppingCart, Package, Eye } from 'lucide-react';

interface CardActionsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cardData: any;
  onAddToOrderQueue: (eId: string) => void;
  onReceiveCard?: () => void;
  onViewItemDetails: () => void;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isAddToOrderQueueDisabled: (cardData: any) => boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isReceiveCardDisabled?: (cardData: any) => boolean;
  showDoneButton?: boolean;
  onDoneClick?: () => void;
}

export function CardActions({
  cardData,
  onAddToOrderQueue,
  onReceiveCard,
  onViewItemDetails,
  onClose,
  isAddToOrderQueueDisabled,
  isReceiveCardDisabled,
  showDoneButton = true,
  onDoneClick,
}: CardActionsProps) {
  const handleDoneClick = () => {
    if (onDoneClick) {
      onDoneClick();
    } else {
      onClose();
    }
  };

  const isAddDisabled = isAddToOrderQueueDisabled(cardData);
  const isReceiveDisabled = isReceiveCardDisabled
    ? isReceiveCardDisabled(cardData)
    : false;

  return (
    <>
      {/* Card Preview Area */}
      <div className='w-full flex-1 my-3 sm:my-4 flex items-center justify-center overflow-auto'>
        <div className='transform scale-[0.95] sm:scale-95 lg:scale-100 max-w-full transition-transform'>
          <ItemCardView
            item={{
              eid: cardData?.payload?.eId || '',
              title: cardData?.payload?.itemDetails?.name || 'Unknown Item',
              minQty:
                cardData?.payload?.itemDetails?.minQuantity?.amount?.toString() ||
                '',
              minUnit: cardData?.payload?.itemDetails?.minQuantity?.unit || '',
              location: cardData?.payload?.itemDetails?.locator
                ? `${cardData.payload.itemDetails.locator.facility || ''} ${
                    cardData.payload.itemDetails.locator.location || ''
                  }`.trim() || ''
                : '',
              orderQty:
                cardData?.payload?.itemDetails?.primarySupply?.orderQuantity?.amount?.toString() ||
                '',
              orderUnit:
                cardData?.payload?.itemDetails?.primarySupply?.orderQuantity
                  ?.unit || '',
              supplier:
                cardData?.payload?.itemDetails?.primarySupply?.supplier || '',
              sku: cardData?.payload?.serialNumber || '',
              image: cardData?.payload?.itemDetails?.imageUrl || '',
              link: '',
              unitPrice: 0,
            }}
            cardIndex={1}
            totalCards={1}
            cardStatus={cardData?.payload?.status}
          />
        </div>
      </div>

      {/* Fixed Action Buttons */}
      <div className='flex-shrink-0 space-y-1.5 sm:space-y-2 lg:space-y-3 px-1 sm:px-2 lg:px-0 pb-2'>
        <Button
          onClick={() => {
            if (cardData?.payload?.eId) {
              onAddToOrderQueue(cardData.payload.eId);
            }
          }}
          disabled={isAddDisabled}
          className={`w-full flex items-center mt-2 sm:mt-3 lg:mt-4 justify-center gap-1.5 sm:gap-2 h-9 sm:h-10 lg:h-auto text-xs sm:text-sm lg:text-base ${
            isAddDisabled
              ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
          variant='outline'
        >
          <ShoppingCart className='w-4 h-4' />
          Add to order queue
        </Button>

        <Button
          onClick={onReceiveCard || (() => {})}
          disabled={isReceiveDisabled}
          className={`w-full flex items-center justify-center gap-1.5 sm:gap-2 h-9 sm:h-10 lg:h-auto text-xs sm:text-sm lg:text-base ${
            isReceiveDisabled
              ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
          variant='outline'
        >
          <Package className='w-4 h-4' />
          Receive card
        </Button>

        <Button
          onClick={onViewItemDetails}
          className='w-full flex items-center justify-center gap-1.5 sm:gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 h-9 sm:h-10 lg:h-auto text-xs sm:text-sm lg:text-base'
          variant='outline'
        >
          <Eye className='w-4 h-4' />
          View item details
        </Button>

        {showDoneButton && (
          <Button
            onClick={handleDoneClick}
            className='w-full mt-2 sm:mt-3 lg:mt-4 h-10 sm:h-11 lg:h-auto text-sm sm:text-base font-medium rounded-lg'
            style={{
              backgroundColor: 'var(--base-primary, #FC5A29)',
              color: 'white',
            }}
          >
            Done
          </Button>
        )}
      </div>
    </>
  );
}
