import { cn } from '@/lib/utils';

// --- Interfaces ---

/** Props for ArdaSidebarNav. */
export interface ArdaSidebarNavProps {
  /* --- View / Layout / Controller --- */
  /** ArdaNavItem and ArdaSidebarNavGroup children. */
  children: React.ReactNode;
  /** Accessible label for the nav landmark. */
  'aria-label'?: string;
  /** Additional CSS classes. */
  className?: string;
}

// --- Component ---

export function ArdaSidebarNav({
  children,
  'aria-label': ariaLabel = 'Primary',
  className,
}: ArdaSidebarNavProps) {
  return (
    <nav aria-label={ariaLabel} className={cn('relative z-10 flex-1 py-4 px-2', className)}>
      <ul role="list" className="space-y-1 list-none">
        {children}
      </ul>
    </nav>
  );
}
