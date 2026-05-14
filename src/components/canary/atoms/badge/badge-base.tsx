import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/types/canary/utilities/utils';

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent py-0 font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary: 'bg-accent-light text-secondary-foreground [a&]:hover:bg-accent-light/90',
        destructive:
          'bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90',
        outline:
          'border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        ghost: '[a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 [a&]:hover:underline',
        'error-overlay':
          'absolute -top-1 -right-1 size-5 p-0 bg-destructive text-destructive-foreground border-background border-2',
      },
      size: {
        sm: 'h-4 px-1.5 text-[10px] [&>svg]:size-2.5',
        default: 'h-5 px-2 text-xs [&>svg]:size-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

interface BadgeBaseProps extends React.ComponentProps<'span'>, VariantProps<typeof badgeVariants> {
  asChild?: boolean;
  /** Icon component rendered before children. */
  icon?: React.ComponentType<{ className?: string }>;
  /** CSS color class applied to the icon. */
  iconColor?: string;
  /** When true, renders icon-only at rest and expands to show children on hover. */
  collapsible?: boolean;
}

function Badge({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  icon: Icon,
  iconColor,
  collapsible = false,
  children,
  ...props
}: BadgeBaseProps) {
  const Comp = asChild ? Slot.Root : 'span';

  const circleWidth = size === 'sm' ? 'w-4' : 'w-5';
  const isSingleChar =
    (typeof children === 'string' && children.length < 2) ||
    (typeof children === 'number' && String(children).length < 2);
  const isCircle = (Icon && !children) || (!Icon && isSingleChar);

  if (collapsible && Icon) {
    return (
      <Comp
        data-slot="badge"
        data-variant={variant}
        className={cn(
          badgeVariants({ variant, size }),
          // Collapsed: perfect circle
          `group/badge gap-0 rounded-full px-0 ${circleWidth}`,
          // Expanded: pill with text, auto width (hover + focus-visible for touch/keyboard)
          'hover:w-auto hover:rounded-md hover:px-2 hover:gap-1',
          'focus-visible:w-auto focus-visible:rounded-md focus-visible:px-2 focus-visible:gap-1',
          'transition-[width,padding,gap,border-radius] duration-200 ease-in-out',
          className,
        )}
        {...props}
      >
        <Icon className={cn('shrink-0', iconColor)} />
        <span
          className={cn(
            'font-semibold whitespace-nowrap overflow-hidden',
            'hidden group-hover/badge:inline group-focus-visible/badge:inline',
          )}
        >
          {children}
        </span>
      </Comp>
    );
  }

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(
        badgeVariants({ variant, size }),
        isCircle && `rounded-full px-0 ${circleWidth}`,
        className,
      )}
      {...props}
    >
      {Icon && <Icon className={cn('shrink-0', iconColor)} />}
      {children}
    </Comp>
  );
}

export { Badge, badgeVariants };
export type { BadgeBaseProps };
