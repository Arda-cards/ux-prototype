'use client';

import { Button } from '@frontend/components/ui/button';
import { X } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/50' onClick={onClose} />

      {/* Modal */}
      <div className='relative bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 h-[70vh] flex flex-col'>
        {/* Close Button */}
        <div className='absolute top-4 right-4 z-10'>
          <Button
            variant='ghost'
            size='sm'
            onClick={onClose}
            className='h-8 w-8 p-0 hover:bg-gray-100 bg-white/80 backdrop-blur-sm'
          >
            <X className='h-4 w-4' />
          </Button>
        </div>

        {/* Content - Full iframe */}
        <div className='flex-1 overflow-hidden rounded-lg'>
          <iframe
            src='https://app.termly.io/policy-viewer/policy.html?policyUUID=08a78355-5593-4082-8f1d-edd32dd53aec'
            className='w-full h-full border-0'
            title='Terms and Conditions'
            sandbox='allow-same-origin allow-scripts'
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          />
        </div>

        {/* Footer */}
        <div className='px-6 py-4 flex justify-end'>
          <Button
            onClick={onClose}
            className='bg-white text-black border border-gray-300 hover:bg-gray-50'
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
