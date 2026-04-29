'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Toggle as TogglePrimitive } from 'radix-ui';
import { cn } from '@/types/canary/utilities/utils';

// --- CVA variant definition ---

const toggleVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap !cursor-pointer transition-colors motion-reduce:transition-none outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-secondary-active data-[state=on]:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
  {
    variants: {
      variant: {
        default: 'bg-transparent hover:bg-secondary-hover hover:text-foreground',
        outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        sm: 'h-8 min-w-8 px-2 text-sm',
        md: 'h-9 min-w-9 px-3',
        lg: 'h-10 min-w-10 px-3.5',
        icon: 'size-9',
        'icon-sm': 'size-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

// --- Interfaces ---

/** Design-time configuration for Toggle. */
export interface ArdaToggleStaticConfig extends VariantProps<typeof toggleVariants> {
  /** Additional CSS classes. */
  className?: string;
}

/** Runtime configuration for Toggle. */
export interface ArdaToggleRuntimeConfig {
  /** Controlled pressed state. */
  pressed?: boolean;
  /** Default pressed state (uncontrolled). */
  defaultPressed?: boolean;
  /** Called when pressed state changes. */
  onPressedChange?: (pressed: boolean) => void;
  /** Whether the toggle is disabled. */
  disabled?: boolean;
}

/** Combined props for Toggle. */
export interface ToggleProps
  extends
    ArdaToggleStaticConfig,
    ArdaToggleRuntimeConfig,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'disabled'> {}

// --- Component ---

/**
 * Toggle — a two-state button that can be on or off.
 *
 * Wraps Radix Toggle with Arda conventions: CVA variants aligned to the
 * Button size scale, StaticConfig/RuntimeConfig split, and consistent
 * focus rings.
 */
export function Toggle({
  variant,
  size,
  className,
  pressed,
  defaultPressed,
  onPressedChange,
  disabled,
  children,
  ...props
}: ToggleProps) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size }), className)}
      {...(pressed !== undefined ? { pressed } : {})}
      {...(defaultPressed !== undefined ? { defaultPressed } : {})}
      {...(onPressedChange ? { onPressedChange } : {})}
      {...(disabled !== undefined ? { disabled } : {})}
      {...props}
    >
      {children}
    </TogglePrimitive.Root>
  );
}

export { toggleVariants };
