import * as React from 'react';
import { X } from 'lucide-react';

import { cn } from '@/types/canary/utilities/utils';
import { Badge } from '../badge/badge';

// --- Types ---

/** Hover-revealed inline action rendered before the × (the chip expands to fit it). */
export interface TokenChipAction {
  /** Accessible label + tooltip for the action button. */
  label: string;
  /** Icon for the action button (size it yourself, e.g. `h-3 w-3`). */
  icon: React.ReactNode;
  onAction: () => void;
}

export interface TokenChipProps extends Omit<React.ComponentProps<'span'>, 'children'> {
  /** Text shown inside the chip. */
  value: string;
  /** When set, renders the trailing × remove button. */
  onRemove?: () => void;
  /** Accessible label for the × button. Defaults to `Remove ${value}`. */
  removeLabel?: string;
  /** Optional inline action revealed on hover, before the ×. */
  action?: TokenChipAction | null;
  /** Force-reveal the action without hover (e.g. while the token has keyboard focus). */
  actionVisible?: boolean;
}

// --- Component ---

/**
 * TokenChip — the recipient/token pill shared by chip fields and
 * `MultiSelectTypeaheadInput` tokens: neutral rounded-full Badge with a
 * hover-revealed border, an optional inline action that the chip expands to
 * fit on hover, and an always-visible × remove button.
 *
 * Internal buttons fire on pointerdown and shield the event
 * (preventDefault + stopPropagation) so host containers that react to
 * pointerdown — focusing a token, opening a dropdown, double-press editing —
 * don't also fire.
 */
export function TokenChip({
  value,
  onRemove,
  removeLabel,
  action,
  actionVisible = false,
  className,
  ...props
}: TokenChipProps) {
  return (
    // bg-secondary overrides the Badge secondary variant's accent-light
    // (peach) fill — token chips are neutral grey.
    <Badge
      variant="secondary"
      className={cn(
        'group/chip h-6 max-w-full gap-1 bg-secondary pl-2.5 pr-1 text-xs font-medium text-secondary-foreground hover:border-border',
        className,
      )}
      {...props}
    >
      <span className="min-w-0 truncate">{value}</span>
      {action && (
        <button
          type="button"
          tabIndex={-1}
          aria-label={action.label}
          title={action.label}
          className={cn(
            'inline-flex h-4 items-center justify-center overflow-hidden rounded-sm',
            'text-muted-foreground transition-all hover:text-primary',
            // Collapsed to zero width at rest (the -ml-1 cancels the badge
            // gap); the chip expands to fit the icon on hover / actionVisible.
            '-ml-1 w-0 opacity-0',
            'group-hover/chip:ml-0 group-hover/chip:w-4 group-hover/chip:opacity-100',
            actionVisible && 'ml-0 w-4 opacity-100',
          )}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            action.onAction();
          }}
          onClick={(e) => {
            e.stopPropagation();
            // Keyboard / assistive-tech activation arrives as a click with
            // detail 0 and no preceding pointerdown.
            if (e.detail === 0) action.onAction();
          }}
        >
          {action.icon}
        </button>
      )}
      {onRemove && (
        <button
          type="button"
          tabIndex={-1}
          aria-label={removeLabel ?? `Remove ${value}`}
          className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-border hover:text-foreground"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (e.detail === 0) onRemove();
          }}
        >
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      )}
    </Badge>
  );
}
