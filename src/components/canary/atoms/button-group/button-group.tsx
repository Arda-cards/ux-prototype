'use client';

import React from 'react';
import { cn } from '@/types/canary/utilities/utils';

// --- Interfaces ---

/** Design-time configuration for ButtonGroup. */
export interface ArdaButtonGroupStaticConfig {
  /** Layout direction. Defaults to `'horizontal'`. */
  orientation?: 'horizontal' | 'vertical';
  /** Additional CSS classes. */
  className?: string;
  /** Accessible label for the group. */
  'aria-label'?: string;
  /** Automatically insert dividers between child buttons. Defaults to `false`. */
  showDivider?: boolean;
  /** CSS class for the auto-inserted dividers (e.g., `'bg-white/30'` for solid-color variants). */
  dividerClassName?: string;
}

/** Combined props for ButtonGroup. */
export interface ButtonGroupProps extends ArdaButtonGroupStaticConfig {
  children: React.ReactNode;
}

/** Props for ButtonGroupSeparator. */
export interface ButtonGroupSeparatorProps {
  /** Additional CSS classes. */
  className?: string;
  /** Orientation of the parent group. Controls whether the divider is vertical (default) or horizontal. */
  orientation?: 'horizontal' | 'vertical';
}

// --- Components ---

const horizontalClasses = [
  'inline-flex',
  '[&>*:not([data-slot=separator]):first-of-type]:rounded-r-none',
  '[&>*:not([data-slot=separator]):last-of-type]:rounded-l-none',
  '[&>*:not([data-slot=separator]):not(:first-of-type):not(:last-of-type)]:rounded-none',
  '[&>*:not(:first-child):not([data-slot=separator])]:-ml-px',
  '[&>*]:focus-visible:z-10',
].join(' ');

const verticalClasses = [
  'inline-flex flex-col',
  '[&>*:not([data-slot=separator]):first-of-type]:rounded-b-none',
  '[&>*:not([data-slot=separator]):last-of-type]:rounded-t-none',
  '[&>*:not([data-slot=separator]):not(:first-of-type):not(:last-of-type)]:rounded-none',
  '[&>*:not(:first-child):not([data-slot=separator])]:-mt-px',
  '[&>*]:focus-visible:z-10',
].join(' ');

/**
 * ButtonGroup — groups related action buttons with connected styling.
 *
 * Collapses borders between children and applies border-radius only to the
 * outer edges. When `showDivider` is true, inserts separator lines between
 * child elements automatically.
 */
export function ButtonGroup({
  orientation = 'horizontal',
  showDivider = false,
  dividerClassName,
  className,
  children,
  ...props
}: ButtonGroupProps) {
  let content = children;

  if (showDivider) {
    const items = React.Children.toArray(children).filter(Boolean);
    const withDividers: React.ReactNode[] = [];
    items.forEach((child, i) => {
      withDividers.push(child);
      if (i < items.length - 1) {
        withDividers.push(
          <ButtonGroupSeparator
            key={`sep-${i}`}
            orientation={orientation}
            {...(dividerClassName ? { className: dividerClassName } : {})}
          />,
        );
      }
    });
    content = withDividers;
  }

  return (
    <div
      role="group"
      data-slot="button-group"
      className={cn(orientation === 'vertical' ? verticalClasses : horizontalClasses, className)}
      {...props}
    >
      {content}
    </div>
  );
}

/**
 * ButtonGroupSeparator — visual divider between grouped buttons.
 *
 * Uses `data-slot="separator"` so ButtonGroup's CSS selectors skip it when
 * calculating border-radius and negative margins.
 */
export function ButtonGroupSeparator({
  className,
  orientation = 'horizontal',
}: ButtonGroupSeparatorProps) {
  return (
    <div
      role="separator"
      data-slot="separator"
      className={cn(
        'bg-border z-10',
        orientation === 'vertical' ? 'h-px w-full' : 'w-px self-stretch',
        className,
      )}
    />
  );
}
