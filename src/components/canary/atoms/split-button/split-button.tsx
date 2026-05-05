'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button, type ButtonProps } from '../button/button';
import { ButtonGroup } from '../button-group/button-group';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/canary/primitives/dropdown-menu';

// --- Size mapping: main button size → chevron icon-only size ---

const chevronSizeMap = {
  xs: 'icon-xs',
  sm: 'icon-sm',
  md: 'icon',
  lg: 'icon-lg',
} as const;

// --- Separator color per variant ---

const separatorVariantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-white/30',
  secondary: 'bg-border',
  destructive: 'bg-white/30',
  ghost: 'bg-border',
  outline: 'bg-border',
};

// --- Interfaces ---

/** Design-time configuration for SplitButton. */
export interface ArdaSplitButtonStaticConfig {
  /** Color variant applied to both the action and chevron buttons. Defaults to `'primary'`. */
  variant?: ButtonProps['variant'];
  /** Size of the main action button. Defaults to `'md'`. */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Additional CSS classes on the outer ButtonGroup wrapper. */
  className?: string;
  /** Content for the dropdown menu. Compose with DropdownMenuItem, etc. */
  menuContent: React.ReactNode;
  /** Side for dropdown menu placement. Defaults to `'bottom'`. */
  menuSide?: 'bottom' | 'top';
  /** Alignment for dropdown menu. Defaults to `'end'`. */
  menuAlign?: 'start' | 'center' | 'end';
  /** Accessible label for the dropdown trigger. Defaults to `'More options'`. */
  menuLabel?: string;
  /** Show a vertical divider line between the action and chevron buttons. Defaults to `false`. */
  showDivider?: boolean;
  /** Tooltip text shown on hover over the primary action button. */
  tooltip?: string;
  /** Side of the button the tooltip appears on. Defaults to `'top'`. */
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right';
}

/** Runtime configuration for SplitButton. */
export interface ArdaSplitButtonRuntimeConfig {
  /** Called when the primary (left) action button is clicked. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Loading state for the primary action. Supports boolean or string (text replacement). */
  loading?: boolean | string;
  /** Disabled state for the entire split button. */
  disabled?: boolean;
}

/** Combined props for SplitButton. */
export interface SplitButtonProps
  extends ArdaSplitButtonStaticConfig, ArdaSplitButtonRuntimeConfig {
  children: React.ReactNode;
}

// --- Component ---

/**
 * SplitButton — primary action + dropdown for alternate actions.
 *
 * Composes Button, ButtonGroup, and DropdownMenu. The left button handles
 * the primary action; the right chevron opens a dropdown menu with
 * alternative options.
 */
export function SplitButton({
  variant = 'primary',
  size = 'md',
  className,
  menuContent,
  menuSide = 'bottom',
  menuAlign = 'end',
  menuLabel = 'More options',
  showDivider = false,
  tooltip,
  tooltipSide,
  onClick,
  loading,
  disabled,
  children,
}: SplitButtonProps) {
  const isDisabled = disabled || !!loading;
  const chevronSize = chevronSizeMap[size];
  const dividerClass = separatorVariantClasses[variant ?? 'primary'];

  return (
    <DropdownMenu>
      <ButtonGroup
        {...(className ? { className } : {})}
        {...(showDivider ? { showDivider, dividerClassName: dividerClass } : {})}
        aria-label="Split action"
      >
        <Button
          variant={variant}
          size={size}
          {...(onClick ? { onClick } : {})}
          {...(loading !== undefined ? { loading } : {})}
          {...(disabled !== undefined ? { disabled } : {})}
          {...(tooltip ? { tooltip } : {})}
          {...(tooltipSide ? { tooltipSide } : {})}
        >
          {children}
        </Button>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={chevronSize} disabled={isDisabled} aria-label={menuLabel}>
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
      </ButtonGroup>
      <DropdownMenuContent side={menuSide} align={menuAlign}>
        {menuContent}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
