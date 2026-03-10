import { cn } from '@/lib/utils';

// --- Types ---

type BrandLogoVariant = 'dark' | 'light' | 'mono-dark' | 'mono-light';

// --- SVG path map ---

const LOGO_PATHS: Record<'full' | 'small', Record<BrandLogoVariant, string>> = {
  full: {
    dark: '/images/brand/arda-logo-dark.svg',
    light: '/images/brand/arda-logo-light.svg',
    'mono-dark': '/images/brand/arda-logo-mono-dark.svg',
    'mono-light': '/images/brand/arda-logo-mono-light.svg',
  },
  small: {
    dark: '/images/brand/arda-logo-small-dark.svg',
    light: '/images/brand/arda-logo-small-light.svg',
    'mono-dark': '/images/brand/arda-logo-small-mono-dark.svg',
    'mono-light': '/images/brand/arda-logo-small-mono-light.svg',
  },
};

// --- Interfaces ---

/** Shared props for brand logo components. */
interface ArdaBrandBaseProps {
  /** Color variant. Use "dark" on dark backgrounds, "light" on light backgrounds. */
  variant?: BrandLogoVariant;
  /** Additional CSS classes. */
  className?: string;
}

export type ArdaBrandLogoProps = ArdaBrandBaseProps;
export type ArdaBrandIconProps = ArdaBrandBaseProps;

// --- Components ---

/** Full Arda wordmark (55x30). Use in expanded sidebars, headers, login pages. */
export function ArdaBrandLogo({ variant = 'dark', className }: ArdaBrandLogoProps) {
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
export function ArdaBrandIcon({ variant = 'dark', className }: ArdaBrandIconProps) {
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
