// Canary exports — in-development components not yet promoted to stable.
// Consumers: import { ... } from '@arda-cards/design-system/canary';

// --- Placeholders ---

export { CanaryAtomPlaceholder } from './components/canary/atoms/canary-placeholder/canary-placeholder';
export type {
  CanaryAtomPlaceholderProps,
  CanaryAtomPlaceholderStaticConfig,
} from './components/canary/atoms/canary-placeholder/canary-placeholder';

export { CanaryMoleculePlaceholder } from './components/canary/molecules/canary-placeholder/canary-placeholder';
export type {
  CanaryMoleculePlaceholderProps,
  CanaryMoleculePlaceholderStaticConfig,
} from './components/canary/molecules/canary-placeholder/canary-placeholder';

export { CanaryOrganismPlaceholder } from './components/canary/organisms/canary-placeholder/canary-placeholder';
export type {
  CanaryOrganismPlaceholderProps,
  CanaryOrganismPlaceholderStaticConfig,
} from './components/canary/organisms/canary-placeholder/canary-placeholder';

// --- Atoms ---

export { ArdaBadge } from './components/canary/atoms/badge/badge';
export type { ArdaBadgeProps } from './components/canary/atoms/badge/badge';

export { ArdaBrandLogo, ArdaBrandIcon } from './components/canary/atoms/brand-logo/brand-logo';

export { ArdaIconLabel } from './components/canary/atoms/icon-label/icon-label';
export type { ArdaIconLabelProps } from './components/canary/atoms/icon-label/icon-label';

export {
  ArdaDetailField,
  detailFieldVariants,
} from './components/canary/atoms/detail-field/detail-field';
export type {
  ArdaDetailFieldProps,
  ArdaDetailFieldStaticConfig,
  ArdaDetailFieldRuntimeConfig,
} from './components/canary/atoms/detail-field/detail-field';

// --- Molecules — Sidebar ---

export { ArdaSidebarHeader } from './components/canary/molecules/sidebar/sidebar-header';
export type {
  ArdaSidebarHeaderProps,
  TeamOption,
} from './components/canary/molecules/sidebar/sidebar-header';

export { ArdaSidebarNav } from './components/canary/molecules/sidebar/sidebar-nav';

export { ArdaSidebarNavItem } from './components/canary/molecules/sidebar/sidebar-nav-item';
export type { ArdaSidebarNavItemProps } from './components/canary/molecules/sidebar/sidebar-nav-item';

export { ArdaSidebarNavGroup } from './components/canary/molecules/sidebar/sidebar-nav-group';
export type { ArdaSidebarNavGroupProps } from './components/canary/molecules/sidebar/sidebar-nav-group';

export { ArdaSidebarUserMenu } from './components/canary/molecules/sidebar/sidebar-user-menu';
export type {
  ArdaSidebarUserMenuProps,
  UserMenuAction,
} from './components/canary/molecules/sidebar/sidebar-user-menu';

// --- Organisms — Sidebar ---

export { ArdaSidebar } from './components/canary/organisms/sidebar/sidebar';
export type { ArdaSidebarProps } from './components/canary/organisms/sidebar/sidebar';
