'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { Loader2 } from 'lucide-react';
import { cn } from '@/types/canary/utilities/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/canary/primitives/tooltip';

// --- CVA variant definition ---

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap cursor-pointer transition-colors motion-reduce:transition-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-active',
        ghost: 'hover:bg-accent-hover hover:text-accent-foreground active:bg-accent-active',
        destructive:
          'bg-destructive text-white hover:bg-destructive-hover active:bg-destructive-active focus-visible:ring-destructive/50',
        outline:
          'border border-input bg-background hover:bg-accent-hover hover:text-accent-foreground active:bg-accent-active',
      },
      size: {
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: 'h-8 gap-1.5 rounded-md px-3 text-sm',
        md: 'h-9 px-4 py-2',
        lg: 'h-10 rounded-md px-6',
        icon: 'size-9',
        'icon-xs': "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-8 rounded-md',
        'icon-lg': 'size-10 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

// --- Icon-only size detection ---

const iconSizes = new Set(['icon', 'icon-xs', 'icon-sm', 'icon-lg']);

// --- Interfaces ---

/** Design-time configuration for Button. */
export interface ArdaButtonStaticConfig extends VariantProps<typeof buttonVariants> {
  /* --- View / Layout / Controller --- */
  /** Render as a child element (Slot pattern for link-as-button). */
  asChild?: boolean;
  /** Additional CSS classes. */
  className?: string;
  /** Tooltip text shown on hover. When set on a disabled button, pointer events are handled automatically. */
  tooltip?: string;
  /** Side of the button the tooltip appears on. Defaults to `'top'`. */
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right';
}

/** Runtime configuration for Button. */
export interface ArdaButtonRuntimeConfig {
  /* --- Model / Data Binding --- */
  /**
   * Show a loading spinner and disable the button.
   * - `true`: shows spinner, keeps existing children text.
   * - `string`: shows spinner and replaces children with the given text (e.g., `"Downloading…"`).
   */
  loading?: boolean | string;
  /** Position of the loading spinner relative to button content. Defaults to `'start'`. */
  loadingPosition?: 'start' | 'end';
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
 * built-in loading state, optional tooltip, `motion-reduce` support, and
 * consistent focus rings. Use this instead of shadcn `Button`.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingPosition = 'start',
  asChild = false,
  className,
  disabled,
  tooltip,
  tooltipSide = 'top',
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button';

  const isLoading = !!loading;
  const loadingText = typeof loading === 'string' ? loading : undefined;
  const isIconSize = iconSizes.has(size ?? 'md');
  const isDisabled = disabled || isLoading;

  const spinner = (
    <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
  );

  // For icon-only sizes, spinner replaces children entirely
  let content: React.ReactNode;
  if (isLoading && isIconSize) {
    content = spinner;
  } else {
    content = (
      <>
        {isLoading && loadingPosition === 'start' && spinner}
        {loadingText ?? children}
        {isLoading && loadingPosition === 'end' && spinner}
      </>
    );
  }

  const button = (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={isDisabled}
      {...props}
    >
      {content}
    </Comp>
  );

  if (!tooltip) return button;

  // Disabled elements don't fire pointer/focus events — wrap in a span so
  // the tooltip still activates on hover.
  const trigger = isDisabled ? (
    <span className="inline-flex" tabIndex={0}>
      {button}
    </span>
  ) : (
    button
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent side={tooltipSide}>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

export { buttonVariants };

/** @deprecated Use Button */
export const ArdaButton = Button;
