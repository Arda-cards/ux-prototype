'use client';

import React, { useState, useEffect } from 'react';
import { XIcon } from 'lucide-react';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  editable?: boolean;
  initialValue?: string;
  onSave?: (value: string) => void;
}

export function NoteModal({
  isOpen,
  onClose,
  title,
  message,
  confirmText,
  editable = false,
  initialValue,
  onSave,
}: NoteModalProps) {
  const [value, setValue] = useState(initialValue ?? message ?? '');

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue ?? message ?? '');
    }
  }, [isOpen, initialValue, message]);

  if (!isOpen) return null;

  const handleDone = () => {
    if (editable && onSave) {
      onSave(value);
    }
    onClose();
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
        className='relative w-[500px] h-auto min-h-[206px] rounded-[10px] bg-white border border-[#E5E5E5] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] px-6 py-6 flex flex-col font-[Geist]'
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-muted-foreground hover:text-foreground z-[3]'
        >
          <XIcon className='w-4 h-4 opacity-70' />
        </button>

        <div className='flex flex-col gap-[6px] text-left z-[0] mb-4'>
          <h2
            style={{
              color: 'var(--base-foreground, #0A0A0A)',
              fontSize: 18,
              fontWeight: 600,
              lineHeight: '100%',
            }}
          >
            {title}
          </h2>
        </div>

        <div className='flex-1 mb-4'>
          <div
            style={{
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
              borderRadius: '8px',
              backgroundColor: '#fff',
              border: '1px solid #e5e5e5',
              boxSizing: 'border-box',
              padding: '8px 12px',
              minHeight: '100px',
            }}
          >
            {editable && onSave ? (
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className='w-full min-h-[100px] resize-y border-0 p-0 text-[14px] font-normal leading-5 text-[#0A0A0A] focus:outline-none focus:ring-0'
                style={{
                  lineHeight: '20px',
                  wordBreak: 'break-word',
                }}
                placeholder='Add a note...'
                autoFocus
              />
            ) : (
              <div
                style={{
                  color: 'var(--base-foreground, #0A0A0A)',
                  fontSize: 14,
                  fontWeight: 400,
                  lineHeight: '20px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {message}
              </div>
            )}
          </div>
        </div>

        <div className='flex justify-end gap-2 mt-auto z-[2]'>
          <button
            onClick={handleDone}
            className='h-9 px-4 py-2 bg-white border border-[#E5E5E5] rounded-lg shadow-[0px_1px_2px_rgba(0,0,0,0.05)] text-sm font-medium text-[#0a0a0a] hover:bg-gray-50 transition-colors'
            style={{
              fontSize: 14,
              fontWeight: 500,
              fontFamily: 'Geist',
              lineHeight: '20px',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
