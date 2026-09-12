import * as React from 'react';

import { cn } from '@/types/canary/utilities/utils';

interface InputProps extends React.ComponentProps<'input'> {
  /**
   * When true, focusing highlights (selects) the current text so typing
   * replaces it.
   */
  selectOnFocus?: boolean;
}

function Input({ className, type, selectOnFocus = false, onFocus, ...props }: InputProps) {
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (selectOnFocus) {
      // rAF: on mouse focus the browser's mouseup would collapse a selection
      // made synchronously in the focus handler.
      const el = e.currentTarget;
      requestAnimationFrame(() => el.select());
    }
    onFocus?.(e);
  };

  return (
    <input
      type={type}
      data-slot="input"
      onFocus={handleFocus}
      className={cn(
        'h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
