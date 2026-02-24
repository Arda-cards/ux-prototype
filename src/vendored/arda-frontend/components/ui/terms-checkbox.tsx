'use client';

import { useState } from 'react';
import { Checkbox } from '@frontend/components/ui/checkbox';
import { TermsModal } from './terms-modal';

interface TermsCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function TermsCheckbox({
  checked,
  onCheckedChange,
  className = '',
}: TermsCheckboxProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className={`flex items-center space-x-2 ${className}`}>
        <Checkbox
          id='terms'
          checked={checked}
          onCheckedChange={onCheckedChange}
          className='data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500'
        />
        <label
          htmlFor='terms'
          className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
        >
          <span className='text-gray-700'>I agree to the </span>
          <button
            type='button'
            onClick={() => setIsModalOpen(true)}
            className='text-blue-600 hover:text-blue-800 underline cursor-pointer'
          >
            Terms & Conditions
          </button>
        </label>
      </div>

      <TermsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
