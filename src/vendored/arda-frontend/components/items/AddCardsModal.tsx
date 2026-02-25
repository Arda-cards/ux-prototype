'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface AddCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
}

export function AddCardsModal({
  isOpen,
  onClose,
  onConfirm,
}: AddCardsModalProps) {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(quantity);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center transition-all duration-300'
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(0px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className='relative w-[425px] h-[206px] rounded-[10px] bg-white border border-[#E5E5E5] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] px-6 py-6 flex flex-col font-[Geist]'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-muted-foreground hover:text-foreground z-[3]'
        >
          <X className='w-4 h-4 opacity-70' />
        </button>

        {/* Header */}
        <div className='flex flex-col gap-[6px] text-left z-[0]'>
          <h2
            style={{
              color: 'var(--base-foreground, #0A0A0A)',
              fontSize: 18,
              fontWeight: 600,
              lineHeight: '100%',
            }}
          >
            Add some cards
          </h2>
          <p
            style={{
              color: 'var(--base-muted-foreground, #737373)',
              fontSize: 14,
              fontWeight: 400,
              lineHeight: '20px',
            }}
          >
            How many cards do you want to create?
          </p>
        </div>

        {/* Input */}
        <div className='w-[121px]'>
          <input
            type='number'
            min='1'
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.max(1, parseInt(e.target.value) || 1))
            }
            onKeyDown={handleKeyDown}
            className='w-full mt-4 h-9 px-3 py-2 border border-[#E5E5E5] rounded-lg shadow-[0px_1px_2px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-[var(--base-primary)] focus:border-transparent'
            placeholder='1'
          />
        </div>

        {/* Footer */}
        <div className='flex justify-end gap-2 mt-auto z-[2]'>
          <button
            onClick={onClose}
            className='h-9 px-4 py-2 bg-white border border-[#E5E5E5] rounded-lg shadow-[0px_1px_2px_rgba(0,0,0,0.05)] text-sm font-medium text-[#0a0a0a] hover:bg-gray-50 transition-colors'
            style={{
              color: 'var(--base-foreground, #0A0A0A)',
              fontSize: 14,
              fontWeight: 500,
              fontFamily: 'Geist',
              lineHeight: '20px',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className='h-9 px-4 py-2 bg-[#fc5a29] rounded-lg shadow-[0px_1px_2px_rgba(0,0,0,0.05)] text-sm font-medium text-[#fafafa] hover:opacity-90 transition-opacity'
            style={{
              fontSize: 14,
              fontWeight: 500,
              fontFamily: 'Geist',
              lineHeight: '20px',
            }}
          >
            Make it so
          </button>
        </div>
      </div>
    </div>
  );
}
