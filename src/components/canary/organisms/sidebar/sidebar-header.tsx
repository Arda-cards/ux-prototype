import { cn } from '@/lib/utils';
import { useSidebar } from './sidebar-context';

export interface ArdaSidebarHeaderProps {
  /** Content displayed in the header — typically ArdaBrandLogo/ArdaBrandIcon + ArdaCollapseToggle. */
  children: React.ReactNode;
  /** Additional CSS classes. */
  className?: string;
}

export function ArdaSidebarHeader({ children, className }: ArdaSidebarHeaderProps) {
  const { collapsed } = useSidebar();

  return (
    <div
      className={cn(
        'relative z-10 h-14 flex items-center border-b border-sidebar-border',
        collapsed ? 'justify-center px-2' : 'justify-between px-4',
        className,
      )}
    >
      {children}
    </div>
  );
}
