import { Sparkles } from 'lucide-react';
import { cn } from '@/types/canary/utilities/utils';

export interface AutoFillLabelProps {
  /** The source that auto-filled this field (e.g. "Amazon", "Claude"). */
  source: string;
  /** CSS color class for the sparkle icon. Defaults to "text-orange-500". */
  iconClass?: string;
  /** Additional CSS classes on the root element. */
  className?: string;
}

export function AutoFillLabel({
  source,
  iconClass = 'text-orange-500',
  className,
}: AutoFillLabelProps) {
  return (
    <p
      data-slot="auto-fill-label"
      className={cn('mt-1 flex items-center gap-1 text-xs text-muted-foreground', className)}
    >
      <Sparkles className={cn('size-3 shrink-0', iconClass)} />
      Autofilled with {source}
    </p>
  );
}
