import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface IconLabelProps {
  icon: LucideIcon;
  label: string;
  className?: string;
}

export function IconLabel({ icon: Icon, label, className }: IconLabelProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-2 [&>svg]:size-4 [&>svg]:shrink-0', className)}
    >
      <Icon />
      <span className="truncate">{label}</span>
    </span>
  );
}
