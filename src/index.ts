// Nominal exports — production-ready components.
// Consumers: import { ... } from '@arda-cards/design-system';

// Atoms
export { StableAtomPlaceholder } from './components/atoms/stable-placeholder/stable-placeholder';
export type {
  StableAtomPlaceholderProps,
  StableAtomPlaceholderStaticConfig,
} from './components/atoms/stable-placeholder/stable-placeholder';

// Molecules
export { StableMoleculePlaceholder } from './components/molecules/stable-placeholder/stable-placeholder';
export type {
  StableMoleculePlaceholderProps,
  StableMoleculePlaceholderStaticConfig,
} from './components/molecules/stable-placeholder/stable-placeholder';

// Organisms
export { StableOrganismPlaceholder } from './components/organisms/stable-placeholder/stable-placeholder';
export type {
  StableOrganismPlaceholderProps,
  StableOrganismPlaceholderStaticConfig,
} from './components/organisms/stable-placeholder/stable-placeholder';

// Utilities
export { cn } from './lib/utils';
export { getBrowserTimezone, getTimezoneAbbreviation } from './lib/data-types/formatters';
