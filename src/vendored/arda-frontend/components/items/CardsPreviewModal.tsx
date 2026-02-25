'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@frontend/components/ui/button';
import { ItemCardView } from './ItemCardView';
import type { ItemCard } from '@frontend/constants/types';

/** Minimal shape for cardList: only payload.status is used for card status display. */
type CardWithStatus = { payload?: { status?: string } };

type CardsPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  item: ItemCard;
  cards: ItemCard[]; // Array of card data for pagination
  cardList?: CardWithStatus[]; // Optional card list with status (payload.status)
};

export function CardsPreviewModal({
  isOpen,
  onClose,
  item,
  cards,
  cardList,
}: CardsPreviewModalProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(1);
  const totalCards = cards.length;

  if (!isOpen) return null;

  const currentCard = cards[currentCardIndex - 1] || item;
  // Get the status from cardList if available
  const currentCardStatus =
    cardList && cardList[currentCardIndex - 1]
      ? cardList[currentCardIndex - 1].payload?.status
      : undefined;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center transition-all duration-300'
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(0px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className='relative w-[430px] min-h-[750px] rounded-2xl bg-white border border-[#E5E5E5] shadow-lg px-6 py-6 flex flex-col font-[Geist]'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-muted-foreground hover:text-foreground'
        >
          <X className='w-4 h-4' />
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
            Cards Preview
          </h2>
          <p
            style={{
              color: 'var(--base-muted-foreground, #737373)',
              fontSize: 14,
              fontWeight: 400,
              lineHeight: '20px',
            }}
          >
            Shuffle through the cards for this item. This is what your card(s)
            will look like when printed.
          </p>
        </div>

        {/* Content */}
        <div className='w-full flex flex-col items-center justify-center my-3 bg-[#fef7f5] pt-6 pb-2 px-4'>
          {/* Card Preview */}
          <div className='relative mb-2'>
            <ItemCardView
              item={{
                ...item,
                title: currentCard.title,
                minQty: item.minQty,
                minUnit: item.minUnit,
                location: currentCard.location,
                orderQty: item.orderQty,
                orderUnit: item.orderUnit,
                supplier: currentCard.supplier,
                sku: currentCard.sku,
                image: currentCard.image,
              }}
              cardIndex={currentCardIndex}
              totalCards={totalCards}
              cardStatus={currentCardStatus}
            />
            {/* Card Count Badge */}
            <div className='absolute -top-3 -left-4 bg-white border border-[#e5e5e5] rounded-full px-2.5 py-2 shadow-sm text-[#737373] font-semibold text-base'>
              x{totalCards}
            </div>
          </div>

          {/* Card Navigation */}
          <div className='flex items-center gap-4'>
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                setCurrentCardIndex(Math.max(1, currentCardIndex - 1))
              }
              disabled={currentCardIndex === 1}
              className='h-10 w-10 p-0 shadow-sm border-gray-300 bg-white'
            >
              <ChevronLeft className='w-5 h-5' />
            </Button>

            <span className='text-sm font-medium text-gray-900 min-w-[60px] text-center'>
              <strong>{currentCardIndex}</strong> of{' '}
              <strong>{totalCards}</strong>
            </span>

            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                setCurrentCardIndex(Math.min(totalCards, currentCardIndex + 1))
              }
              disabled={currentCardIndex === totalCards}
              className='h-10 w-10 p-0 shadow-sm border-gray-300 bg-white'
            >
              <ChevronRight className='w-5 h-5' />
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className='flex justify-end pt-4'>
          <Button
            variant='outline'
            onClick={onClose}
            className='px-6 py-2 text-sm font-medium text-gray-900 border-gray-300 bg-white'
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
