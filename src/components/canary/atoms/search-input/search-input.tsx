import { Search } from 'lucide-react';

import { cn } from '@/types/canary/utils';
import { Input } from '@/components/canary/primitives/input';

// --- Interfaces ---

/** Design-time configuration for ArdaSearchInput. */
export interface ArdaSearchInputStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Placeholder text shown when the input is empty. */
  placeholder?: string;
  /** Maximum width of the search container. Defaults to 373px. */
  maxWidth?: string;
}

/** Runtime configuration for ArdaSearchInput. */
export interface ArdaSearchInputRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** Controlled search value. */
  value?: string;
  /** Called when the search value changes. */
  onChange?: (value: string) => void;
}

/** Combined props for ArdaSearchInput. */
export interface ArdaSearchInputProps
  extends
    ArdaSearchInputStaticConfig,
    ArdaSearchInputRuntimeConfig,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {}

// --- Component ---

/**
 * ArdaSearchInput — a search field with a leading search icon.
 *
 * Wraps shadcn/ui Input with a positioned Search icon.
 */
export function ArdaSearchInput({
  placeholder = 'Search',
  maxWidth = '373px',
  value,
  onChange,
  className,
  ...props
}: ArdaSearchInputProps) {
  return (
    <div className={cn('relative w-full', className)} style={{ maxWidth }} {...props}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
        aria-hidden="true"
      />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="pl-10"
        aria-label={placeholder}
      />
    </div>
  );
}
