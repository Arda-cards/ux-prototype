'use client';

import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '@frontend/lib/utils';
import { DropdownContent } from '@frontend/types/input';

interface InputDropdownProps extends DropdownContent {
  side?: 'prefix' | 'suffix';
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const InputDropdown = React.forwardRef<HTMLButtonElement, InputDropdownProps>(
  (
    {
      options,
      value,
      onValueChange,
      placeholder = 'Select...',
      className,
      disabled = false,
      side = 'prefix',
      isOpen,
      onOpenChange,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const selectedOption = options.find((option) => option.value === value);

    const handleOpenChange = (newOpen: boolean) => {
      setOpen(newOpen);
      onOpenChange?.(newOpen);
    };

    return (
      <DropdownMenuPrimitive.Root
        open={isOpen ?? open}
        onOpenChange={handleOpenChange}
      >
        <DropdownMenuPrimitive.Trigger
          ref={ref}
          disabled={disabled}
          className={cn(
            // Base styles matching Figma design
            'inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200',
            'border border-gray-300 bg-gray-50 text-gray-700 outline-none',
            'hover:bg-gray-100 focus:border-gray-900 focus:ring-0',
            'disabled:cursor-not-allowed disabled:opacity-50',

            // Side-specific styles
            side === 'prefix' && 'rounded-l-md border-r-0 px-3',
            side === 'suffix' && 'rounded-r-md border-l-0 px-3',

            className
          )}
          {...props}
        >
          <span className='flex items-center gap-1.5'>
            {selectedOption?.icon && (
              <span className='flex h-4 w-4 items-center justify-center'>
                {selectedOption.icon}
              </span>
            )}
            <span className='truncate'>
              {selectedOption?.label || placeholder}
            </span>
          </span>
          <ChevronDownIcon className='h-4 w-4 opacity-70' aria-hidden='true' />
        </DropdownMenuPrimitive.Trigger>

        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            className={cn(
              'z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-lg',
              'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
              'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
            )}
            sideOffset={5}
            align='start'
          >
            {options.map((option) => (
              <DropdownMenuPrimitive.Item
                key={option.value}
                className={cn(
                  'relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
                  'hover:bg-gray-100 focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                  value === option.value && 'bg-gray-100 font-medium'
                )}
                onClick={() => {
                  onValueChange?.(option.value);
                  handleOpenChange(false);
                }}
              >
                {option.icon && (
                  <span className='flex h-4 w-4 items-center justify-center'>
                    {option.icon}
                  </span>
                )}
                <span className='truncate'>{option.label}</span>
                {value === option.value && (
                  <span className='ml-auto h-4 w-4'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      className='h-4 w-4'
                    >
                      <polyline points='20,6 9,17 4,12' />
                    </svg>
                  </span>
                )}
              </DropdownMenuPrimitive.Item>
            ))}
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>
    );
  }
);

InputDropdown.displayName = 'InputDropdown';

export { InputDropdown };
export type { InputDropdownProps };
