/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { cn } from '@frontend/lib/utils';
import {
  EnhancedInputProps,
  isStaticContent,
  isDropdownContent,
} from '@frontend/types/input';
import { InputDropdown } from './input-dropdown';

const Input = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  (
    {
      className,
      type,
      prefix,
      suffix,
      containerClassName,
      error,
      description,
      loading,
      disabled,
      ...props
    },
    ref
  ) => {
    const hasPrefix = Boolean(prefix);
    const hasSuffix = Boolean(suffix);
    const isDisabled = disabled || loading;
    const isSimpleInput =
      !hasPrefix &&
      !hasSuffix &&
      !containerClassName &&
      !error &&
      !description &&
      !loading;

    // Simple input for backward compatibility (like navbar search)
    if (isSimpleInput) {
      return (
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          ref={ref}
          disabled={isDisabled}
          {...props}
        />
      );
    }

    // Enhanced input with Figma design for prefix/suffix functionality
    const inputClassName = cn(
      // Base styling
      'flex h-10 w-full bg-white px-3 py-2 text-sm text-gray-900',
      'border border-gray-300 transition-all duration-200 outline-none',
      'focus:border-gray-900 focus:ring-0',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'file:border-0 file:bg-transparent file:text-sm file:font-medium',

      // Figma-specific placeholder styling
      'placeholder:text-muted-foreground placeholder:font-normal placeholder:text-[14px] placeholder:leading-[20px]',
      'placeholder:overflow-hidden placeholder:text-ellipsis',
      'placeholder:[font-family:var(--font-font-sans,Geist)]',

      // Conditional border radius and borders based on prefix/suffix
      hasPrefix && hasSuffix && 'rounded-none border-l-0 border-r-0',
      hasPrefix && !hasSuffix && 'rounded-l-none border-l-0 rounded-r-md',
      !hasPrefix && hasSuffix && 'rounded-r-none border-r-0 rounded-l-md',
      !hasPrefix && !hasSuffix && 'rounded-md',

      // Error state
      error && 'border-red-500 focus:border-red-500',

      className
    );

    // Container styles for the input group - Figma layout
    const containerStyles = cn(
      'flex w-full max-w-[373px] flex-col items-start gap-2',
      containerClassName
    );

    // Render static content
    const renderStaticContent = (content: any, side: 'prefix' | 'suffix') => (
      <div
        className={cn(
          'inline-flex h-10 items-center px-3 text-sm text-gray-700 bg-gray-50 border border-gray-300',
          side === 'prefix' && 'rounded-l-md border-r-0',
          side === 'suffix' && 'rounded-r-md border-l-0',
          error && 'border-red-500',
          isDisabled && 'opacity-50 cursor-not-allowed',
          content.className
        )}
      >
        {content.content}
      </div>
    );

    // Render dropdown content
    const renderDropdownContent = (content: any, side: 'prefix' | 'suffix') => (
      <InputDropdown
        {...content}
        side={side}
        disabled={isDisabled}
        className={cn(error && 'border-red-500', content.className)}
      />
    );

    // Render prefix/suffix based on content type
    const renderPrefixSuffix = (content: any, side: 'prefix' | 'suffix') => {
      if (isStaticContent(content)) {
        return renderStaticContent(content, side);
      }
      if (isDropdownContent(content)) {
        return renderDropdownContent(content, side);
      }
      return null;
    };

    return (
      <div className={containerStyles}>
        {/* Input Group */}
        <div className='relative flex w-full'>
          {prefix && renderPrefixSuffix(prefix, 'prefix')}

          <input
            type={type}
            data-slot='input'
            className={inputClassName}
            ref={ref}
            disabled={isDisabled}
            aria-invalid={error}
            aria-describedby={
              description ? `${props.id}-description` : undefined
            }
            {...props}
          />

          {suffix && renderPrefixSuffix(suffix, 'suffix')}

          {loading && (
            <div className='absolute right-3 top-1/2 -translate-y-1/2'>
              <svg
                className='animate-spin h-4 w-4 text-gray-400'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                />
              </svg>
            </div>
          )}
        </div>

        {description && (
          <p
            id={`${props.id}-description`}
            className={cn('text-sm text-gray-600', error && 'text-red-500')}
          >
            {description}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { EnhancedInputProps as InputProps };
