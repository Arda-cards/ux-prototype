import React from 'react';

import { cn } from '@/lib/utils';
import './button.css';

export type ArdaButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ArdaButtonSize = 'sm' | 'md' | 'lg';

/** Design-time configuration — variant and size chosen at composition time. */
export interface ArdaButtonStaticConfig {
  /** Visual style variant. */
  variant?: ArdaButtonVariant;
  /** Button size affecting height and font size. */
  size?: ArdaButtonSize;
}

/** Runtime configuration — properties that change during component lifetime. */
export interface ArdaButtonRuntimeConfig {
  /** Show a loading spinner and disable the button. */
  loading?: boolean;
}

/** Combined props for ArdaButton. Extends HTML button attributes for passthrough. */
export interface ArdaButtonProps
  extends
    ArdaButtonStaticConfig,
    ArdaButtonRuntimeConfig,
    React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function ArdaButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  ...props
}: ArdaButtonProps) {
  return (
    <button
      className={cn(
        'arda-btn',
        `arda-btn-${variant}`,
        `arda-btn-${size}`,
        loading && 'arda-btn-loading',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {children}
    </button>
  );
}
