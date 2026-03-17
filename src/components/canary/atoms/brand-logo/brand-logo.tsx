import { cn } from '@/lib/utils';

// --- Types ---

type BrandLogoVariant = 'default' | 'inverted' | 'mono' | 'mono-inverted';

// --- SVG path map ---

const LOGO_PATHS: Record<'full' | 'small', Record<BrandLogoVariant, string>> = {
  full: {
    default: '/canary/images/arda-logo-default.svg',
    inverted: '/canary/images/arda-logo-inverted.svg',
    mono: '/canary/images/arda-logo-mono.svg',
    'mono-inverted': '/canary/images/arda-logo-mono-inverted.svg',
  },
  small: {
    default: '/canary/images/arda-logo-small-default.svg',
    inverted: '/canary/images/arda-logo-small-inverted.svg',
    mono: '/canary/images/arda-logo-small-mono.svg',
    'mono-inverted': '/canary/images/arda-logo-small-mono-inverted.svg',
  },
};

// --- Interfaces ---

/** Shared props for brand logo components. */
interface BrandBaseProps {
  /** Color variant. "default" = orange bg + white A, "inverted" = white bg + orange A. */
  variant?: BrandLogoVariant;
  /** Additional CSS classes. */
  className?: string;
}

export type BrandLogoProps = BrandBaseProps;
export type BrandIconProps = BrandBaseProps;

// --- Components ---

/** Full Arda wordmark (55x30). Use in expanded sidebars, headers, login pages. */
export function BrandLogo({ variant = 'default', className }: BrandLogoProps) {
  return (
    <img
      src={LOGO_PATHS.full[variant]}
      alt="Arda"
      width={55}
      height={30}
      className={cn('h-7 w-auto', className)}
    />
  );
}

/** Compact Arda icon (30x30). Use in collapsed sidebars, favicons, mobile headers. */
export function BrandIcon({ variant = 'default', className }: BrandIconProps) {
  return (
    <img
      src={LOGO_PATHS.small[variant]}
      alt="Arda"
      width={30}
      height={30}
      className={cn('h-7 w-auto', className)}
    />
  );
}
