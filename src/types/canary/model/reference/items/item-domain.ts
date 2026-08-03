// Mirrored from `types/extras/reference/items/item-domain.ts` into the canary type
// tree so canary components depend only on canary (not extras). `extras` is internal
// to this repo and is not part of the published package.
//
// `Item` is the row type of the canary `ItemGrid`, so it must be reachable from the
// canary entry point — otherwise consumers cannot type the grid's rows without
// importing from extras.

import type { Money } from '@/types/canary/model/general/money';
import type { Duration } from '@/types/canary/model/general/time/duration';
import type { Locator } from '@/types/canary/model/general/locator';

export type QuantityUnit =
  | 'EACH'
  | 'PAIR'
  | 'DOZEN'
  | 'CASE'
  | 'BOX'
  | 'PALLET'
  | 'ROLL'
  | 'GALLON'
  | 'LITER'
  | 'POUND'
  | 'KILOGRAM'
  | 'FOOT'
  | 'METER';

export interface Quantity {
  amount: number;
  unit: QuantityUnit;
}

export type OrderMechanism =
  | 'PURCHASE_ORDER'
  | 'EMAIL'
  | 'PHONE'
  | 'IN_STORE'
  | 'ONLINE'
  | 'RFQ'
  | 'PRODUCTION'
  | 'THIRD_PARTY'
  | 'OTHER';

export type CardSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE';

export type LabelSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE';

export type BreadcrumbSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE';

export type ItemColor =
  | 'RED'
  | 'GREEN'
  | 'BLUE'
  | 'YELLOW'
  | 'BLACK'
  | 'WHITE'
  | 'GRAY'
  | 'ORANGE'
  | 'PURPLE'
  | 'PINK';

export interface ItemClassification {
  type: string;
  subType?: string;
}

export interface Supply {
  supplyEId?: string;
  supplier: string;
  name?: string;
  sku?: string;
  orderMechanism?: OrderMechanism;
  url?: string;
  minimumQuantity?: Quantity;
  orderQuantity?: Quantity;
  unitCost?: Money;
  averageLeadTime?: Duration;
  orderNotes?: string;
  orderCost: Money;
}

export interface ItemStatus {
  inCart?: boolean;
  toOrder?: Quantity;
  cardsInCart?: number;
  totalCost?: Money;
  maxLeadTime?: Duration;
  queueAge?: Duration;
  labeled?: boolean;
}

export interface Item {
  entityId: string;
  recordId: string;
  author: string;
  timeCoordinates: { recordedAsOf: number; effectiveAsOf: number };
  createdCoordinates: { recordedAsOf: number; effectiveAsOf: number };
  name: string;
  imageUrl?: string;
  classification?: ItemClassification;
  useCase?: string;
  locator?: Locator;
  internalSKU?: string;
  generalLedgerCode?: string;
  minQuantity?: Quantity;
  notes?: string;
  cardNotesDefault?: string;
  taxable?: boolean;
  primarySupply?: Supply;
  secondarySupply?: Supply;
  defaultSupply?: string;
  cardSize?: CardSize;
  labelSize?: LabelSize;
  breadcrumbSize?: BreadcrumbSize;
  color?: ItemColor;
}
