'use client';

import React, { createContext, useContext } from 'react';
import { type VariantProps } from 'class-variance-authority';
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui';
import { cn } from '@/types/canary/utilities/utils';
import { toggleVariants } from '../toggle/toggle';

// --- Context ---

type ToggleGroupContextValue = {
  variant?: VariantProps<typeof toggleVariants>['variant'];
  size?: VariantProps<typeof toggleVariants>['size'];
};

const ToggleGroupContext = createContext<ToggleGroupContextValue>({});

// --- Interfaces ---

/** Design-time configuration shared by both single and multiple ToggleGroup. */
export interface ArdaToggleGroupStaticConfig {
  /** Toggle variant applied to all items. Defaults to `'default'`. */
  variant?: VariantProps<typeof toggleVariants>['variant'];
  /** Toggle size applied to all items. Defaults to `'md'`. */
  size?: VariantProps<typeof toggleVariants>['size'];
  /** Layout direction. Defaults to `'horizontal'`. */
  orientation?: 'horizontal' | 'vertical';
  /** Additional CSS classes on the root container. */
  className?: string;
}

/** Props for ToggleGroup with single selection. */
export interface ToggleGroupSingleProps extends ArdaToggleGroupStaticConfig {
  type: 'single';
  /** Controlled selected value. */
  value?: string;
  /** Default selected value (uncontrolled). */
  defaultValue?: string;
  /** Called when the selected value changes. */
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

/** Props for ToggleGroup with multiple selection. */
export interface ToggleGroupMultipleProps extends ArdaToggleGroupStaticConfig {
  type: 'multiple';
  /** Controlled selected values. */
  value?: string[];
  /** Default selected values (uncontrolled). */
  defaultValue?: string[];
  /** Called when the selected values change. */
  onValueChange?: (value: string[]) => void;
  children: React.ReactNode;
}

/** Combined props for ToggleGroup. */
export type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps;

/** Props for ToggleGroupItem. */
export interface ToggleGroupItemProps {
  /** Unique value identifying this item. */
  value: string;
  /** Whether this item is disabled. */
  disabled?: boolean;
  /** Additional CSS classes. */
  className?: string;
  /** Accessible label. */
  'aria-label'?: string;
  children: React.ReactNode;
}

// --- Components ---

/**
 * ToggleGroup — a set of two-state toggles with single or multiple selection.
 *
 * Wraps Radix ToggleGroup with Arda conventions. Passes `variant` and `size`
 * to child items via context so they render consistently.
 */
export function ToggleGroup({
  variant = 'default',
  size = 'md',
  orientation = 'horizontal',
  className,
  children,
  ...props
}: ToggleGroupProps) {
  const contextValue = React.useMemo(() => ({ variant, size }), [variant, size]);

  return (
    <ToggleGroupContext.Provider value={contextValue}>
      <ToggleGroupPrimitive.Root
        data-slot="toggle-group"
        orientation={orientation}
        className={cn(
          'inline-flex items-center gap-1',
          orientation === 'vertical' && 'flex-col',
          className,
        )}
        {...(props as React.ComponentProps<typeof ToggleGroupPrimitive.Root>)}
      >
        {children}
      </ToggleGroupPrimitive.Root>
    </ToggleGroupContext.Provider>
  );
}

/**
 * ToggleGroupItem — an individual toggle within a ToggleGroup.
 *
 * Reads `variant` and `size` from the parent ToggleGroup context and applies
 * the shared `toggleVariants` CVA for visual consistency with the Toggle atom.
 */
export function ToggleGroupItem({
  value,
  disabled,
  className,
  children,
  ...props
}: ToggleGroupItemProps) {
  const { variant, size } = useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      value={value}
      disabled={disabled}
      className={cn(toggleVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}
