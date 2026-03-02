// Extras exports — supplementary components that extend the core library.
// Consumers: import { ... } from '@arda-cards/ui-components/extras';

// --- Extras Placeholders ---

export { ExtrasAtomPlaceholder } from './extras/components/atoms/extras-placeholder/extras-placeholder';
export type {
  ExtrasAtomPlaceholderProps,
  ExtrasAtomPlaceholderStaticConfig,
} from './extras/components/atoms/extras-placeholder/extras-placeholder';

export { ExtrasMoleculePlaceholder } from './extras/components/molecules/extras-placeholder/extras-placeholder';
export type {
  ExtrasMoleculePlaceholderProps,
  ExtrasMoleculePlaceholderStaticConfig,
} from './extras/components/molecules/extras-placeholder/extras-placeholder';

export { ExtrasOrganismPlaceholder } from './extras/components/organisms/extras-placeholder/extras-placeholder';
export type {
  ExtrasOrganismPlaceholderProps,
  ExtrasOrganismPlaceholderStaticConfig,
} from './extras/components/organisms/extras-placeholder/extras-placeholder';

// --- Atoms ---

export { ArdaBadge } from './extras/components/atoms/badge/badge';
export type { ArdaBadgeVariant } from './extras/components/atoms/badge/badge';

export { ArdaButton } from './extras/components/atoms/button/button';
export type {
  ArdaButtonProps,
  ArdaButtonVariant,
  ArdaButtonSize,
} from './extras/components/atoms/button/button';

export { ArdaConfirmDialog } from './extras/components/atoms/confirm-dialog/confirm-dialog';
export type {
  ArdaConfirmDialogProps,
  ArdaConfirmDialogStaticConfig,
  ArdaConfirmDialogRuntimeConfig,
} from './extras/components/atoms/confirm-dialog/confirm-dialog';

export { ArdaTypeahead } from './extras/components/atoms/typeahead/typeahead';
export type {
  ArdaTypeaheadProps,
  ArdaTypeaheadStaticConfig,
  ArdaTypeaheadRuntimeConfig,
  TypeaheadOption,
} from './extras/components/atoms/typeahead/typeahead';

// --- Molecules ---

export { ArdaItemCard } from './extras/components/molecules/item-card/item-card';
export type { ArdaItemCardProps } from './extras/components/molecules/item-card/item-card';

export {
  ArdaTable,
  ArdaTableHeader,
  ArdaTableBody,
  ArdaTableRow,
  ArdaTableHead,
  ArdaTableCell,
} from './extras/components/molecules/table/table';

export { ArdaSupplyCard } from './extras/components/molecules/reference/items/supply-card/supply-card';
export type {
  ArdaSupplyCardProps,
  ArdaSupplyCardStaticConfig,
  ArdaSupplyCardRuntimeConfig,
} from './extras/components/molecules/reference/items/supply-card/supply-card';

// --- Organisms ---

export { ArdaSidebar } from './extras/components/organisms/sidebar/sidebar';
export type { ArdaSidebarProps, NavItem } from './extras/components/organisms/sidebar/sidebar';

export {
  ArdaItemDrawer,
  sampleItem,
  emptyItem,
  defaultMoney,
  defaultQuantity,
} from './extras/components/organisms/item-drawer/item-drawer';
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
} from './extras/components/organisms/item-drawer/item-drawer';

export { ArdaItemSupplySection } from './extras/components/organisms/reference/items/item-supply-section/item-supply-section';
export type {
  ArdaItemSupplySectionProps,
  ArdaItemSupplySectionStaticConfig,
  ArdaItemSupplySectionRuntimeConfig,
} from './extras/components/organisms/reference/items/item-supply-section/item-supply-section';

export { ArdaItemSupplyFormDialog } from './extras/components/organisms/reference/items/item-supply-form-dialog/item-supply-form-dialog';
export type {
  ArdaItemSupplyFormDialogProps,
  ArdaItemSupplyFormDialogStaticConfig,
  ArdaItemSupplyFormDialogRuntimeConfig,
  ItemSupplyFormMode,
} from './extras/components/organisms/reference/items/item-supply-form-dialog/item-supply-form-dialog';

export { ArdaSupplierForm } from './extras/components/organisms/reference/business-affiliates/supplier-form/supplier-form';
export type {
  ArdaSupplierFormProps,
  ArdaSupplierFormStaticConfig,
  ArdaSupplierFormRuntimeConfig,
} from './extras/components/organisms/reference/business-affiliates/supplier-form/supplier-form';

export { ArdaSupplierDrawer } from './extras/components/organisms/reference/business-affiliates/supplier-drawer/supplier-drawer';
export type {
  ArdaSupplierDrawerProps,
  ArdaSupplierDrawerStaticConfig,
  ArdaSupplierDrawerRuntimeConfig,
  SupplierDrawerMode,
} from './extras/components/organisms/reference/business-affiliates/supplier-drawer/supplier-drawer';

export { ArdaItemsDataGrid } from './extras/components/organisms/reference/items/items-data-grid/items-data-grid';
export type {
  ArdaItemsDataGridProps,
  ArdaItemsDataGridRef,
} from './extras/components/organisms/reference/items/items-data-grid/items-data-grid';

export { ArdaSupplierDataGrid } from './extras/components/organisms/reference/business-affiliates/suppliers-data-grid/suppliers-data-grid';
export type {
  ArdaSupplierDataGridProps,
  ArdaSupplierDataGridRef,
} from './extras/components/organisms/reference/business-affiliates/suppliers-data-grid/suppliers-data-grid';

export {
  createArdaEntityDataGrid,
  type EntityDataGridConfig,
  type EntityDataGridModelProps,
  type EntityDataGridViewProps,
  type EntityDataGridProps,
  type EntityDataGridRef,
} from './extras/components/organisms/shared/entity-data-grid';

// --- Types — Model ---

export type {
  Currency as ModelCurrency,
  Money as ModelMoney,
} from './extras/types/model/general/money';
export type {
  PostalAddress,
  CountrySymbol,
  GeoLocation,
} from './extras/types/model/general/geo/postal-address';
export type {
  TimeUnit as ModelTimeUnit,
  Duration as ModelDuration,
} from './extras/types/model/general/time/duration';
export type { CompanyInformation } from './extras/types/model/assets/company-information';
export type { Contact } from './extras/types/model/assets/contact';
export { getContactDisplayName } from './extras/types/model/assets/contact';

// --- Types — Reference ---

export type {
  BusinessAffiliate,
  BusinessAffiliateRoleDetails,
  BusinessRole,
  BusinessRoleType,
} from './extras/types/reference/business-affiliates/business-affiliate';
export { sampleAffiliates } from './extras/types/reference/business-affiliates/business-affiliate';

export type {
  ItemSupply,
  SupplyDesignation,
} from './extras/types/reference/business-affiliates/item-supply';
export { sampleItemSupplies } from './extras/types/reference/business-affiliates/item-supply';

// --- Utilities ---

export { cn } from './lib/utils';
export { getBrowserTimezone, getTimezoneAbbreviation } from './lib/data-types/formatters';
