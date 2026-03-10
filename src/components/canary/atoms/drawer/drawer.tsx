'use client';

import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

// --- Interfaces ---

/** Design-time configuration for ArdaDrawer. */
export interface ArdaDrawerStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Width preset. `"md"` = 420px, `"lg"` = 460px, `"xl"` = 560px. Defaults to `"lg"`. */
  size?: 'md' | 'lg' | 'xl';
  /** Side the drawer slides in from. Defaults to `"right"`. */
  side?: 'left' | 'right';
  /** Additional CSS classes on the content panel. */
  className?: string;
  /** Drawer content — compose with ArdaDrawerHeader, ArdaDrawerBody, ArdaDrawerFooter. */
  children: React.ReactNode;
}

/** Runtime configuration for ArdaDrawer. */
export interface ArdaDrawerRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** Whether the drawer is open. */
  open: boolean;
  /** Called when open state changes (close button, overlay click, Escape key). */
  onOpenChange: (open: boolean) => void;
}

/** Combined props for ArdaDrawer. */
export interface ArdaDrawerProps extends ArdaDrawerStaticConfig, ArdaDrawerRuntimeConfig {}

// --- Size map ---

const sizeClasses = {
  md: 'sm:max-w-[420px]',
  lg: 'sm:max-w-[460px]',
  xl: 'sm:max-w-[560px]',
} as const;

// --- Components ---

/**
 * ArdaDrawer — Arda-branded slide-over panel wrapping shadcn Sheet.
 *
 * Provides consistent width presets, overlay styling, and compound component
 * slots (Header, Body, Footer) for entity detail/edit views.
 */
export function ArdaDrawer({
  open,
  onOpenChange,
  size = 'lg',
  side = 'right',
  className,
  children,
}: ArdaDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        showCloseButton={false}
        className={cn('w-full gap-0 p-0', sizeClasses[size], className)}
      >
        {children}
      </SheetContent>
    </Sheet>
  );
}

/** Sticky header slot for ArdaDrawer. */
export function ArdaDrawerHeader({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <SheetHeader
      className={cn('sticky top-0 z-40 border-b bg-background px-6 py-4', className)}
      {...props}
    >
      {children}
    </SheetHeader>
  );
}

/** Accessible title for ArdaDrawer (required by Radix for screen readers). */
export const ArdaDrawerTitle = SheetTitle;

/** Accessible description for ArdaDrawer (optional, for screen readers). */
export const ArdaDrawerDescription = SheetDescription;

/** Scrollable body slot for ArdaDrawer. */
export function ArdaDrawerBody({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex-1 overflow-y-auto', className)} {...props}>
      {children}
    </div>
  );
}

/** Sticky footer slot for ArdaDrawer. */
export function ArdaDrawerFooter({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <SheetFooter
      className={cn(
        'sticky bottom-0 z-40 flex-row justify-end border-t bg-background px-6 py-3',
        className,
      )}
      {...props}
    >
      {children}
    </SheetFooter>
  );
}
