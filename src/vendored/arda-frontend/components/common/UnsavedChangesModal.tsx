'use client';

import { Button } from '@frontend/components/ui/button';
import { XIcon } from 'lucide-react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void | Promise<void>;
  /** Called when user chooses to leave without saving; only shown when provided. */
  onLeaveWithoutSaving?: () => void;
  title?: string;
  message?: string;
  saveText?: string;
  continueEditingText?: string;
  leaveWithoutSavingText?: string;
  isLoading?: boolean;
}

export function UnsavedChangesModal({
  isOpen,
  onClose,
  onSave,
  onLeaveWithoutSaving,
  title = 'You have unsaved changes',
  message = 'If you leave now, your changes will not be saved. Do you want to save before leaving?',
  saveText = 'Save',
  continueEditingText = 'Continue editing',
  leaveWithoutSavingText = 'Leave without saving',
  isLoading = false,
}: UnsavedChangesModalProps) {
  if (!isOpen) return null;

  const handleSave = async () => {
    await onSave();
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
        <div className='flex justify-end gap-4 pt-4 flex-wrap'>
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
            {continueEditingText}
          </Button>
          {onLeaveWithoutSaving != null && (
            <Button
              variant='outline'
              onClick={onLeaveWithoutSaving}
              className='rounded-md h-11 px-6'
              disabled={isLoading}
              style={{
                color: 'var(--base-muted-foreground, #737373)',
                fontSize: 16,
                fontWeight: 500,
                fontFamily: 'Geist',
                lineHeight: '22px',
              }}
            >
              {leaveWithoutSavingText}
            </Button>
          )}
          <Button
            onClick={handleSave}
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
            {isLoading ? 'Saving...' : saveText}
          </Button>
        </div>
      </div>
    </div>
  );
}
