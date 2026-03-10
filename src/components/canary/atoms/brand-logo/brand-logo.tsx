import { cn } from '@/lib/utils';

// --- Types ---

type BrandLogoVariant = 'default' | 'inverted' | 'mono' | 'mono-inverted';

// --- SVG path map ---

const LOGO_PATHS: Record<'full' | 'small', Record<BrandLogoVariant, string>> = {
  full: {
    default: '/images/brand/arda-logo-default.svg',
    inverted: '/images/brand/arda-logo-inverted.svg',
    mono: '/images/brand/arda-logo-mono.svg',
    'mono-inverted': '/images/brand/arda-logo-mono-inverted.svg',
  },
  small: {
    default: '/images/brand/arda-logo-small-default.svg',
    inverted: '/images/brand/arda-logo-small-inverted.svg',
    mono: '/images/brand/arda-logo-small-mono.svg',
    'mono-inverted': '/images/brand/arda-logo-small-mono-inverted.svg',
  },
};

// --- Interfaces ---

/** Shared props for brand logo components. */
interface ArdaBrandBaseProps {
  /** Color variant. "default" = orange bg + white A, "inverted" = white bg + orange A. */
  variant?: BrandLogoVariant;
  /** Additional CSS classes. */
  className?: string;
}

export type ArdaBrandLogoProps = ArdaBrandBaseProps;
export type ArdaBrandIconProps = ArdaBrandBaseProps;

// --- Components ---

/** Full Arda wordmark (55x30). Use in expanded sidebars, headers, login pages. */
export function ArdaBrandLogo({ variant = 'default', className }: ArdaBrandLogoProps) {
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
export function ArdaBrandIcon({ variant = 'default', className }: ArdaBrandIconProps) {
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
