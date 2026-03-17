// Canary exports — in-development components not yet promoted to stable.
// Consumers: import { ... } from '@arda-cards/design-system/canary';

// --- Atoms ---

export { ArdaBadge } from './components/canary/atoms/badge/badge';
export type { ArdaBadgeProps } from './components/canary/atoms/badge/badge';

export { BrandLogo, BrandIcon } from './components/canary/atoms/brand-logo/brand-logo';

export { IconLabel } from './components/canary/atoms/icon-label/icon-label';
export type { IconLabelProps } from './components/canary/atoms/icon-label/icon-label';

export {
  ReadOnlyField,
  readOnlyFieldVariants,
} from './components/canary/atoms/read-only-field/read-only-field';
export type {
  ReadOnlyFieldProps,
  ReadOnlyFieldStaticConfig,
  ReadOnlyFieldRuntimeConfig,
} from './components/canary/atoms/read-only-field/read-only-field';

// --- Molecules — Sidebar ---

export { ArdaSidebarHeader } from './components/canary/molecules/sidebar/sidebar-header';
export type {
  ArdaSidebarHeaderProps,
  TeamOption,
} from './components/canary/molecules/sidebar/sidebar-header';

export { SidebarNav } from './components/canary/molecules/sidebar/sidebar-nav';

export { SidebarNavItem } from './components/canary/molecules/sidebar/sidebar-nav-item';
export type { SidebarNavItemProps } from './components/canary/molecules/sidebar/sidebar-nav-item';

export { SidebarNavGroup } from './components/canary/molecules/sidebar/sidebar-nav-group';
export type { SidebarNavGroupProps } from './components/canary/molecules/sidebar/sidebar-nav-group';

export { SidebarUserMenu } from './components/canary/molecules/sidebar/sidebar-user-menu';
export type {
  SidebarUserMenuProps,
  UserMenuAction,
} from './components/canary/molecules/sidebar/sidebar-user-menu';

// --- Organisms — Sidebar ---

export { ArdaSidebar } from './components/canary/organisms/sidebar/sidebar';
export type { ArdaSidebarProps } from './components/canary/organisms/sidebar/sidebar';
