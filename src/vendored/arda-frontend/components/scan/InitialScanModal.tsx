'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { X, Loader } from 'lucide-react';

interface InitialScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCardView: (cardId: string) => void;
}

export function InitialScanModal({
  isOpen,
  onClose,
  onOpenCardView,
}: InitialScanModalProps) {
  const scanInputRef = useRef<HTMLInputElement>(null);
  const scanBufferRef = useRef<string>('');
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Extract item ID from QR code text (for /item/[itemId] URLs)
  const extractItemIdFromQR = useCallback((qrText: string): string | null => {
    try {
      // Match full URLs first (e.g., https://stage.alpha002.app.arda.cards/item/...)
      const fullUrlMatch = qrText.match(
        /https?:\/\/[^\/\s]+\/item\/([a-f0-9-]+)/i
      );
      if (fullUrlMatch) {
        console.info('InitialScanModal: Full URL matched for item', fullUrlMatch[1]);
        return fullUrlMatch[1];
      }

      // Match relative URLs like /item/[itemId]
      const urlMatch = qrText.match(/\/item\/([a-f0-9-]+)/i);
      if (urlMatch) {
        console.info('InitialScanModal: Relative URL matched for item', urlMatch[1]);
        return urlMatch[1];
      }

      console.warn('InitialScanModal: No item ID found in QR text', qrText);
      return null;
    } catch (err) {
      console.error('Error extracting item ID:', err);
      return null;
    }
  }, []);

  // Extract card ID from QR code text
  const extractCardIdFromQR = useCallback((qrText: string): string | null => {
    try {
      // Match URLs like /kanban/cards/[cardId]?view=card&src=qr
      const urlMatch = qrText.match(/\/kanban\/cards\/([a-f0-9-]+)/i);
      if (urlMatch) return urlMatch[1];

      // Also match full URLs
      const fullUrlMatch = qrText.match(
        /https?:\/\/[^\/]+\/kanban\/cards\/([a-f0-9-]+)/i
      );
      if (fullUrlMatch) return fullUrlMatch[1];

      // Match UUID directly
      const uuidMatch = qrText.match(
        /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i
      );
      if (uuidMatch) return qrText;

      return null;
    } catch (err) {
      console.error('Error extracting card ID:', err);
      return null;
    }
  }, []);

  // Handle scanner input
  const handleScannerInput = useCallback(
    (scannedText: string) => {
      // Clean the scanned text (remove whitespace, newlines, etc.)
      const cleanText = scannedText.trim();
      console.info('InitialScanModal: Scanner input received', cleanText);
      
      // First check if it's an item URL
      const itemId = extractItemIdFromQR(cleanText);
      if (itemId) {
        console.info('InitialScanModal: Item ID extracted, redirecting to item page', itemId);
        const itemPath = `/item/${itemId}`;
        console.info('InitialScanModal: Navigating to', itemPath);
        // Close modal and navigate immediately
        onClose();
        // Use window.location for reliable full page navigation
        window.location.href = itemPath;
        return;
      }

      // Then check if it's a kanban card URL
      const cardId = extractCardIdFromQR(cleanText);
      if (cardId) {
        console.info('InitialScanModal: Card ID extracted', cardId);
        onOpenCardView(cardId);
      } else {
        console.warn('InitialScanModal: Invalid QR detected', cleanText);
      }
    },
    [extractItemIdFromQR, extractCardIdFromQR, onOpenCardView, onClose]
  );

  // Handle keyboard input from physical scanner
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const isOurHiddenInput =
        event.target instanceof HTMLInputElement &&
        event.target === scanInputRef.current;
      const isOtherTextInput =
        (event.target instanceof HTMLInputElement && !isOurHiddenInput) ||
        event.target instanceof HTMLTextAreaElement;
      if (isOtherTextInput) {
        return;
      }

      // Clear timeout if it exists
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }

      // If Enter is pressed, process the scanned code
      if (event.key === 'Enter') {
        event.preventDefault();
        const scannedCode = scanBufferRef.current.trim();
        if (scannedCode.length > 0) {
          handleScannerInput(scannedCode);
          scanBufferRef.current = '';
        }
      } else if (event.key.length === 1) {
        // Accumulate characters (scanners typically send characters very quickly)
        scanBufferRef.current += event.key;

        // Set timeout to clear buffer if no more input comes (handles slow typing)
        scanTimeoutRef.current = setTimeout(() => {
          scanBufferRef.current = '';
        }, 100);
      }
    };

    // Focus a hidden input to capture scanner input
    if (scanInputRef.current) {
      scanInputRef.current.focus();
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [isOpen, handleScannerInput]);

  // Reset buffer when modal closes
  useEffect(() => {
    if (!isOpen) {
      scanBufferRef.current = '';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className='bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden input for capturing scanner input */}
        <input
          ref={scanInputRef}
          type='text'
          autoFocus
          className='absolute opacity-0 pointer-events-none w-0 h-0'
          tabIndex={-1}
        />

        {/* Header */}
        <div className='px-6 pt-6 pb-4'>
          <div className='flex items-start justify-between'>
            <div>
              <b className='text-xl font-semibold text-[#0a0a0a] block mb-1'>
                Scan
              </b>
              <div className='text-sm text-[#737373]'>
                Scan one card or an entire stack.
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={onClose}
                className='text-[#0a0a0a] opacity-70 hover:opacity-100'
              >
                <X className='w-4 h-4' />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area with Spinner */}
        <div className='flex-1 w-full min-h-[400px] overflow-hidden relative p-5 flex items-center justify-center'>
          <div className='flex flex-col items-center justify-center'>
            <Loader className='w-[130px] h-[130px] text-gray-300' />
            <div className='mt-4 text-sm text-[#737373]'>
              Waiting for first scan...
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='px-6 py-4 flex justify-end'>
          <button
            onClick={onClose}
            className='px-4 py-2 rounded-md text-sm font-medium bg-white border border-[#e5e5e5] hover:bg-gray-50 text-[#0a0a0a]'
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
