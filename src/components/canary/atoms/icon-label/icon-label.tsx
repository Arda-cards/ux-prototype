import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ArdaIconLabelProps {
  icon: LucideIcon;
  label: string;
  className?: string;
}

export function ArdaIconLabel({ icon: Icon, label, className }: ArdaIconLabelProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-2 [&>svg]:size-4 [&>svg]:shrink-0', className)}
    >
      <Icon />
      <span className="truncate">{label}</span>
    </span>
  );
}
