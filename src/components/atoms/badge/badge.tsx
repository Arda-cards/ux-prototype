import React from 'react';

import { cn } from '@/lib/utils';

export type ArdaBadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'info'
  | 'destructive'
  | 'outline';

/** Design-time configuration — visual properties chosen at composition time. */
export interface ArdaBadgeStaticConfig {
  /* --- Model / Data Binding --- */
  // (No model/data props — Badge is purely presentational)

  /* --- View / Layout / Controller --- */
  /** Visual style variant determining colors and border. */
  variant?: ArdaBadgeVariant;
  /** Show a small colored dot indicator before the text. */
  dot?: boolean;
}

/** Combined props for ArdaBadge. Extends HTML div attributes for passthrough. */
export interface ArdaBadgeProps
  extends ArdaBadgeStaticConfig, React.HTMLAttributes<HTMLDivElement> {}

export function ArdaBadge({
  children,
  variant = 'default',
  dot = false,
  className,
  ...props
}: ArdaBadgeProps) {
  const variants = {
    default: 'bg-status-default-bg text-status-default-text border-status-default-border',
    success: 'bg-status-success-bg text-status-success-text border-status-success-border',
    warning: 'bg-status-warning-bg text-status-warning-text border-status-warning-border',
    info: 'bg-status-info-bg text-status-info-text border-status-info-border',
    destructive:
      'bg-status-destructive-bg text-status-destructive-text border-status-destructive-border',
    outline: 'bg-transparent text-muted-foreground border-border',
  };

  const dotColors = {
    default: 'bg-status-default-text',
    success: 'bg-status-success-text',
    warning: 'bg-status-warning-text',
    info: 'bg-status-info-text',
    destructive: 'bg-destructive',
    outline: 'bg-muted-foreground',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-xs font-medium border transition-colors',
        variants[variant],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />}
      {children}
    </div>
  );
}
