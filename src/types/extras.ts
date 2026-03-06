// Extras type exports — supplementary domain types used by extras-track components.
// Consumers: import type { ... } from '@arda-cards/design-system/types/extras';

// --- Model: General ---

export type { Currency, Money } from './extras/model/general/money';
export type { TimeUnit, Duration } from './extras/model/general/time/duration';
export type { Locator } from './extras/model/general/locator';
export type { PaginationData } from './extras/model/general/pagination';
export type {
  PostalAddress,
  CountrySymbol,
  GeoLocation,
} from './extras/model/general/geo/postal-address';

// --- Model: Assets ---

export type { CompanyInformation } from './extras/model/assets/company-information';
export type { Contact } from './extras/model/assets/contact';
export { getContactDisplayName } from './extras/model/assets/contact';

// --- Reference: Business Affiliates ---

export type {
  BusinessAffiliate,
  BusinessAffiliateRoleDetails,
  BusinessRole,
  BusinessRoleType,
} from './extras/reference/business-affiliates/business-affiliate';

export type {
  ItemSupply,
  SupplyDesignation,
} from './extras/reference/business-affiliates/item-supply';

// --- Reference: Items ---

export type {
  Item,
  Supply,
  ItemStatus,
  ItemClassification,
  CardSize,
  LabelSize,
  BreadcrumbSize,
  ItemColor,
  Quantity,
  QuantityUnit,
  OrderMechanism,
} from './extras/reference/items/item-domain';
