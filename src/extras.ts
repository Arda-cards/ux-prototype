// Extras exports — supplementary components that extend the core library.
// Consumers: import { ... } from '@arda-cards/ui-components/extras';

// --- Extras Placeholders ---

export { ExtrasAtomPlaceholder } from './components/extras/atoms/extras-placeholder/extras-placeholder';
export type {
  ExtrasAtomPlaceholderProps,
  ExtrasAtomPlaceholderStaticConfig,
} from './components/extras/atoms/extras-placeholder/extras-placeholder';

export { ExtrasMoleculePlaceholder } from './components/extras/molecules/extras-placeholder/extras-placeholder';
export type {
  ExtrasMoleculePlaceholderProps,
  ExtrasMoleculePlaceholderStaticConfig,
} from './components/extras/molecules/extras-placeholder/extras-placeholder';

export { ExtrasOrganismPlaceholder } from './components/extras/organisms/extras-placeholder/extras-placeholder';
export type {
  ExtrasOrganismPlaceholderProps,
  ExtrasOrganismPlaceholderStaticConfig,
} from './components/extras/organisms/extras-placeholder/extras-placeholder';

// --- Atoms ---

export { ArdaBadge } from './components/extras/atoms/badge/badge';
export type { ArdaBadgeVariant } from './components/extras/atoms/badge/badge';

export { ArdaButton } from './components/extras/atoms/button/button';
export type {
  ArdaButtonProps,
  ArdaButtonVariant,
  ArdaButtonSize,
} from './components/extras/atoms/button/button';

export { ArdaConfirmDialog } from './components/extras/atoms/confirm-dialog/confirm-dialog';
export type {
  ArdaConfirmDialogProps,
  ArdaConfirmDialogStaticConfig,
  ArdaConfirmDialogRuntimeConfig,
} from './components/extras/atoms/confirm-dialog/confirm-dialog';

export { ArdaTypeahead } from './components/extras/atoms/typeahead/typeahead';
export type {
  ArdaTypeaheadProps,
  ArdaTypeaheadStaticConfig,
  ArdaTypeaheadRuntimeConfig,
  TypeaheadOption,
} from './components/extras/atoms/typeahead/typeahead';

// --- Molecules ---

export { ArdaItemCard } from './components/extras/molecules/item-card/item-card';
export type { ArdaItemCardProps } from './components/extras/molecules/item-card/item-card';

export {
  ArdaTable,
  ArdaTableHeader,
  ArdaTableBody,
  ArdaTableRow,
  ArdaTableHead,
  ArdaTableCell,
} from './components/extras/molecules/table/table';

export { ArdaSupplyCard } from './components/extras/molecules/reference/items/supply-card/supply-card';
export type {
  ArdaSupplyCardProps,
  ArdaSupplyCardStaticConfig,
  ArdaSupplyCardRuntimeConfig,
} from './components/extras/molecules/reference/items/supply-card/supply-card';

// --- Organisms ---

export { ArdaSidebar } from './components/extras/organisms/sidebar/sidebar';
export type { ArdaSidebarProps, NavItem } from './components/extras/organisms/sidebar/sidebar';

export {
  ArdaItemDrawer,
  sampleItem,
  emptyItem,
  defaultMoney,
  defaultQuantity,
} from './components/extras/organisms/item-drawer/item-drawer';
export type {
  ArdaItemDrawerProps,
  ArdaItemDrawerStaticConfig,
  ArdaItemDrawerRuntimeConfig,
  ItemData,
  ItemDrawerMode,
  Supply,
  Money,
  Quantity,
  Duration,
  Locator,
  ItemClassification,
  OrderMechanism,
  Currency,
  TimeUnit,
} from './components/extras/organisms/item-drawer/item-drawer';

export { ArdaItemSupplySection } from './components/extras/organisms/reference/items/item-supply-section/item-supply-section';
export type {
  ArdaItemSupplySectionProps,
  ArdaItemSupplySectionStaticConfig,
  ArdaItemSupplySectionRuntimeConfig,
} from './components/extras/organisms/reference/items/item-supply-section/item-supply-section';

export { ArdaItemSupplyFormDialog } from './components/extras/organisms/reference/items/item-supply-form-dialog/item-supply-form-dialog';
export type {
  ArdaItemSupplyFormDialogProps,
  ArdaItemSupplyFormDialogStaticConfig,
  ArdaItemSupplyFormDialogRuntimeConfig,
  ItemSupplyFormMode,
} from './components/extras/organisms/reference/items/item-supply-form-dialog/item-supply-form-dialog';

export { ArdaSupplierForm } from './components/extras/organisms/reference/business-affiliates/supplier-form/supplier-form';
export type {
  ArdaSupplierFormProps,
  ArdaSupplierFormStaticConfig,
  ArdaSupplierFormRuntimeConfig,
} from './components/extras/organisms/reference/business-affiliates/supplier-form/supplier-form';

export { ArdaSupplierDrawer } from './components/extras/organisms/reference/business-affiliates/supplier-drawer/supplier-drawer';
export type {
  ArdaSupplierDrawerProps,
  ArdaSupplierDrawerStaticConfig,
  ArdaSupplierDrawerRuntimeConfig,
  SupplierDrawerMode,
} from './components/extras/organisms/reference/business-affiliates/supplier-drawer/supplier-drawer';

export { ArdaItemsDataGrid } from './components/extras/organisms/reference/items/items-data-grid/items-data-grid';
export type {
  ArdaItemsDataGridProps,
  ArdaItemsDataGridRef,
} from './components/extras/organisms/reference/items/items-data-grid/items-data-grid';

export { ArdaSupplierDataGrid } from './components/extras/organisms/reference/business-affiliates/suppliers-data-grid/suppliers-data-grid';
export type {
  ArdaSupplierDataGridProps,
  ArdaSupplierDataGridRef,
} from './components/extras/organisms/reference/business-affiliates/suppliers-data-grid/suppliers-data-grid';

export {
  createArdaEntityDataGrid,
  type EntityDataGridConfig,
  type EntityDataGridModelProps,
  type EntityDataGridViewProps,
  type EntityDataGridProps,
  type EntityDataGridRef,
} from './components/extras/organisms/shared/entity-data-grid';

// --- Types — Model ---

export type {
  Currency as ModelCurrency,
  Money as ModelMoney,
} from './types/extras/model/general/money';
export type {
  PostalAddress,
  CountrySymbol,
  GeoLocation,
} from './types/extras/model/general/geo/postal-address';
export type {
  TimeUnit as ModelTimeUnit,
  Duration as ModelDuration,
} from './types/extras/model/general/time/duration';
export type { CompanyInformation } from './types/extras/model/assets/company-information';
export type { Contact } from './types/extras/model/assets/contact';
export { getContactDisplayName } from './types/extras/model/assets/contact';

// --- Types — Reference ---

export type {
  BusinessAffiliate,
  BusinessAffiliateRoleDetails,
  BusinessRole,
  BusinessRoleType,
} from './types/extras/reference/business-affiliates/business-affiliate';
export { sampleAffiliates } from './types/extras/reference/business-affiliates/business-affiliate';

export type {
  ItemSupply,
  SupplyDesignation,
} from './types/extras/reference/business-affiliates/item-supply';
export { sampleItemSupplies } from './types/extras/reference/business-affiliates/item-supply';

// --- Utilities ---

export { cn } from './lib/utils';
export { getBrowserTimezone, getTimezoneAbbreviation } from './lib/data-types/formatters';
