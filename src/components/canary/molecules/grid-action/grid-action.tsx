'use client';

import { cn } from '@/types/canary/utils';
import { Loader2, type LucideIcon } from 'lucide-react';

// --- Interfaces ---

/** Design-time configuration for ArdaGridAction. */
export interface ArdaGridActionStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Icon displayed in the container. */
  icon: LucideIcon;
  /** Full label — used for `aria-label`. */
  label: string;
  /** Short display label below the icon. Defaults to first word of `label`. */
  shortLabel?: string | undefined;
  /** Whether this is a destructive action (red tint). */
  destructive?: boolean | undefined;
  /** Additional CSS classes on the outer button. */
  className?: string | undefined;
}

/** Runtime configuration for ArdaGridAction. */
export interface ArdaGridActionRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** Called when the action is triggered. */
  onAction: () => void;
  /** Whether this action is currently loading. */
  loading?: boolean | undefined;
  /** Whether this action is disabled. */
  disabled?: boolean | undefined;
}

/** Combined props for ArdaGridAction. */
export interface ArdaGridActionProps
  extends ArdaGridActionStaticConfig, ArdaGridActionRuntimeConfig {}

// --- Component ---

/**
 * ArdaGridAction — an app-grid-style action cell with icon container and label.
 *
 * Used in action grids where actions are displayed as a grid of icon buttons
 * with short text labels underneath (similar to iOS share sheet or app launcher).
 */
export function ArdaGridAction({
  icon: Icon,
  label,
  shortLabel,
  destructive,
  className,
  onAction,
  loading,
  disabled,
}: ArdaGridActionProps) {
  const displayLabel = shortLabel ?? label.split(' ')[0];

  return (
    <button
      type="button"
      onClick={onAction}
      disabled={disabled || loading}
      className={cn(
        'group flex flex-col items-center gap-1.5 rounded-md py-1 text-foreground transition-colors motion-reduce:transition-none hover:text-foreground active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        destructive && 'text-destructive hover:text-destructive',
        className,
      )}
      aria-label={label}
    >
      <div
        className={cn(
          'flex size-11 items-center justify-center rounded-xl bg-background ring-1 ring-border/60 transition-colors motion-reduce:transition-none group-hover:bg-muted',
          destructive && 'bg-destructive/10 ring-destructive/20 group-hover:bg-destructive/15',
        )}
      >
        {loading ? (
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        ) : (
          <Icon className="size-5" aria-hidden="true" />
        )}
      </div>
      <span className="text-sm leading-tight">{loading ? 'Wait\u2026' : displayLabel}</span>
    </button>
  );
}
