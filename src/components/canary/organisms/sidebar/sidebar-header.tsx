import { cn } from '@/lib/utils';

export interface ArdaSidebarHeaderProps {
  /** Content displayed in the header — typically ArdaLogo/ArdaLogoFull + ArdaCollapseToggle. */
  children: React.ReactNode;
  /** Additional CSS classes. */
  className?: string;
}

export function ArdaSidebarHeader({ children, className }: ArdaSidebarHeaderProps) {
  return (
    <div
      className={cn(
        'relative z-10 h-14 flex items-center justify-between px-4 border-b border-sidebar-border',
        className,
      )}
    >
      {children}
    </div>
  );
}
