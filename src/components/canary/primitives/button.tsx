import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/types/canary/utilities/utils';

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active',
        destructive:
          'bg-destructive text-white hover:bg-destructive-hover active:bg-destructive-active focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
        outline: 'border border-input bg-background hover:bg-accent-hover active:bg-accent-active',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-active',
        ghost: 'hover:bg-accent-hover hover:text-accent-foreground active:bg-accent-active',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-(--control-height) px-4 py-2 has-[>svg]:px-3',
        xs: "h-(--control-height-xs) gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: 'h-(--control-height-sm) gap-1.5 rounded-md px-3 has-[>svg]:px-2.5',
        lg: 'h-(--control-height-lg) rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-(--control-height)',
        'icon-xs': "size-(--control-height-xs) rounded-md [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-(--control-height-sm)',
        'icon-lg': 'size-(--control-height-lg)',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
