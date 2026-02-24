'use client';

import { Button } from '@frontend/components/ui/button';
import { XIcon } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'You sure about that?',
  message = "Delete it like you mean it! Deleting an item also removes all of its cards, so make sure you're ready to say goodbye forever.",
  confirmText = 'Delete it',
  cancelText = 'Just kidding',
  isLoading = false,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

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
        className='relative w-[500px] rounded-2xl bg-white border border-[#E5E5E5] shadow-lg px-8 py-8 flex flex-col font-[Geist]'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-muted-foreground hover:text-foreground'
        >
          <XIcon className='w-4 h-4' />
        </button>

        {/* Header */}
        <div className='flex flex-col gap-4 text-left mb-6'>
          <h2
            style={{
              color: 'var(--base-foreground, #0A0A0A)',
              fontSize: 22,
              fontWeight: 600,
              lineHeight: '26px',
            }}
          >
            {title}
          </h2>
          <p
            style={{
              color: 'var(--base-muted-foreground, #737373)',
              fontSize: 16,
              fontWeight: 400,
              lineHeight: '24px',
            }}
          >
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className='flex justify-end gap-4 pt-4'>
          <Button
            variant='outline'
            onClick={onClose}
            className='rounded-md h-11 px-6'
            disabled={isLoading}
            style={{
              color: 'var(--base-foreground, #0A0A0A)',
              fontSize: 16,
              fontWeight: 500,
              fontFamily: 'Geist',
              lineHeight: '22px',
            }}
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className='rounded-md h-11 px-6 text-white'
            disabled={isLoading}
            style={{
              backgroundColor: 'var(--base-primary)',
              fontSize: 16,
              fontWeight: 500,
              fontFamily: 'Geist',
              lineHeight: '22px',
            }}
          >
            {isLoading ? 'Deleting...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
