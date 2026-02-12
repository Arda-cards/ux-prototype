import React from 'react';

import { cn } from '@/lib/utils';

export type ArdaBadgeVariant = 'default' | 'success' | 'warning' | 'info' | 'destructive' | 'outline';

/** Design-time configuration — visual properties chosen at composition time. */
export interface ArdaBadgeStaticConfig {
  /** Visual style variant determining colors and border. */
  variant?: ArdaBadgeVariant;
  /** Show a small colored dot indicator before the text. */
  dot?: boolean;
}

/** Combined props for ArdaBadge. Extends HTML div attributes for passthrough. */
export interface ArdaBadgeProps extends ArdaBadgeStaticConfig, React.HTMLAttributes<HTMLDivElement> {}

export function ArdaBadge({
  children,
  variant = 'default',
  dot = false,
  className,
  ...props
}: ArdaBadgeProps) {
  const variants = {
    default: 'bg-[#F5F5F5] text-[#0A0A0A] border-[#E5E5E5]',
    success: 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]',
    warning: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
    info: 'bg-[#DBEAFE] text-[#1E40AF] border-[#BFDBFE]',
    destructive: 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]',
    outline: 'bg-transparent text-[#737373] border-[#E5E5E5]',
  };

  const dotColors = {
    default: 'bg-[#0A0A0A]',
    success: 'bg-[#166534]',
    warning: 'bg-[#D97706]',
    info: 'bg-[#2563EB]',
    destructive: 'bg-[#DC2626]',
    outline: 'bg-[#737373]',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors',
        variants[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />
      )}
      {children}
    </div>
  );
}
