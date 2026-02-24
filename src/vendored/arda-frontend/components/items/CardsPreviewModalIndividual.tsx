'use client';

import { Button } from '@frontend/components/ui/button';
import { XIcon } from 'lucide-react';
import { ItemCard } from '@frontend/constants/types';
import { ItemCardView } from './ItemCardView';
import { KanbanCard } from '@frontend/types/kanban-cards';

interface CardsPreviewModalIndividualProps {
  isOpen: boolean;
  onClose: () => void;
  item: ItemCard;
  card: KanbanCard;
}

export function CardsPreviewModalIndividual({
  isOpen,
  onClose,
  item,
  card,
}: CardsPreviewModalIndividualProps) {
  if (!isOpen) return null;
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
      <div className='relative w-[450px] max-h-[80vh] rounded-2xl bg-white border border-[#E5E5E5] shadow-lg overflow-hidden transform -translate-y-2'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-[#E5E5E5]'>
          <div>
            <h2 className='text-lg font-semibold text-[#0A0A0A]'>
              Card Preview
            </h2>
            <p className='text-xs text-muted-foreground mt-1'>
              Preview of the selected card. This is what your card will look
              like when printed.
            </p>
          </div>
          <button
            onClick={onClose}
            className='text-muted-foreground hover:text-foreground'
          >
            <XIcon className='w-4 h-4' />
          </button>
        </div>

        {/* Content */}
        <div className='p-4 overflow-y-auto max-h-[60vh] flex justify-center'>
          <div className='relative w-full max-w-[396px] flex flex-col items-center gap-2'>
            {/* Card without badge and pagination */}
            <div className='w-full'>
              <div className='relative w-full bg-[#fef7f5] px-4 sm:px-6 pt-4 pb-12 flex flex-col items-center gap-1'>
                <div className='w-full max-w-[396px] flex flex-col items-center gap-2'>
                  {/* Card content without badge */}
                  <div className='w-full'>
                    <ItemCardView
                      item={{
                        ...item,
                        title: item.title,
                        minQty: item.minQty || '',
                        minUnit: item.minUnit || '',
                        location: item.location || '',
                        orderQty: item.orderQty || '',
                        orderUnit: item.orderUnit || '',
                        supplier: item.location || '',
                        sku: card.serialNumber,
                        image: item.image || '',
                      }}
                      cardIndex={1}
                      totalCards={1}
                      cardStatus={card.status}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='flex justify-end p-4 border-t border-[#E5E5E5]'>
          <Button onClick={onClose} className='px-3 py-2 text-sm font-medium'>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
