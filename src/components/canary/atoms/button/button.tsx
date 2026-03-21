'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { Loader2 } from 'lucide-react';
import { cn } from '@/types/canary/utils';

// --- CVA variant definition ---

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors motion-reduce:transition-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/50',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        sm: 'h-8 gap-1.5 rounded-md px-3 text-sm',
        md: 'h-9 px-4 py-2',
        lg: 'h-10 rounded-md px-6',
        icon: 'size-9',
        'icon-sm': 'size-8 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

// --- Interfaces ---

/** Design-time configuration for Button. */
export interface ArdaButtonStaticConfig extends VariantProps<typeof buttonVariants> {
  /* --- View / Layout / Controller --- */
  /** Render as a child element (Slot pattern for link-as-button). */
  asChild?: boolean;
  /** Additional CSS classes. */
  className?: string;
}

/** Runtime configuration for Button. */
export interface ArdaButtonRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** Show a loading spinner and disable the button. */
  loading?: boolean;
}

/** Combined props for Button. */
export interface ButtonProps
  extends
    ArdaButtonStaticConfig,
    ArdaButtonRuntimeConfig,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {}

/** @deprecated Use ButtonProps */
export type ArdaButtonProps = ButtonProps;

// --- Component ---

/**
 * Button — canonical button for the Arda design system.
 *
 * Wraps CVA variants with Arda conventions: StaticConfig/RuntimeConfig split,
 * built-in loading state, `motion-reduce` support, and consistent focus rings.
 * Use this instead of shadcn `Button`.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  asChild = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
      )}
      {children}
    </Comp>
  );
}

export { buttonVariants };

/** @deprecated Use Button */
export const ArdaButton = Button;
