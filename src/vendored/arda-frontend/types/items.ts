import * as domain from './domain';
import * as general from './general';
import * as entity from './entity';

/***********************************************************************************************************************************
 * Types supporting Items directly, most likely not reused outside the `Item` structure
 ***********************************************************************************************************************************/

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

export const defaultOrderMechanism: OrderMechanism = 'ONLINE';

export const OrderMechanismLabels: Record<OrderMechanism, string> = {
  PURCHASE_ORDER: 'Purchase Order',
  EMAIL: 'Email',
  PHONE: 'Phone',
  IN_STORE: 'In Store',
  ONLINE: 'Online',
  RFQ: 'RFQ',
  PRODUCTION: 'Production',
  THIRD_PARTY: '3rd Party',
  OTHER: 'Other',
};

export interface Quantity {
  amount: number;
  unit: string;
}

export const defaultQuantity: Quantity = {
  amount: 1,
  unit: 'each',
};

// Values for these types are TBD pending discussion with Business Stakeholders. If Dynamic, this will be a string.
export type CardSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE';

export const defaultCardSize: CardSize = 'LARGE';
export type LabelSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE';
export const defaultLabelSize: LabelSize = 'MEDIUM';
export type BreadcrumbSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'X_LARGE';
export const defaultBreadcrumbSize: BreadcrumbSize = 'X_LARGE';

// Values and calculation TBD after talking to Business Stakeholders. If Dynamic, this will be a string.
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
export const defaultItemColor: ItemColor = 'GRAY';

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
  url?: general.URL;
  minimumQuantity?: Quantity;
  orderQuantity?: Quantity;
  unitCost?: domain.Money;
  averageLeadTime?: general.Duration;

  // Refers to "Order Description"
  orderNotes?: string;
  orderCost: domain.Money;
}

// This will need a more sophisticated calculation in the future.
// Only for explanatory purposes, the orderCost will come from the Backend.
export function calculatedOrderCost(supply: Supply): domain.Money {
  return {
    value:
      (supply.unitCost?.value ?? 0.0) * (supply.orderQuantity?.amount ?? 0.0),
    currency: supply.unitCost?.currency ?? 'USD',
  };
}

export interface ItemStatus {
  // null if unknown.
  inCart?: boolean;
  toOrder?: Quantity;
  cardsInCart?: number;
  totalCost?: domain.Money;
  maxLeadTime?: general.Duration;
  queueAge?: general.Duration;
  labeled?: boolean;
}

export const defaultItemStatus: ItemStatus = {
  inCart: false,
  toOrder: defaultQuantity,
  cardsInCart: 0,
  totalCost: domain.defaultMoney,
  maxLeadTime: general.defaultDuration,
  queueAge: general.defaultDuration,
  labeled: false,
};

/***********************************************************************************************************************************
 * Item Type
 * See [System Entity Information Specification](https://coda.io/d/Development_dBCMe1Ojtkc/System-Entity-Information-Specification_susiViSS#Properties_tubVLpcr/r91) for business interpretation.
 * Note that the mapping is not 1:1 with the Coda table as this representation is more structured than the Coda Table.
 *
 * Also, some of the names of properties are slightly adjusted to better fit the future direction of the system. E.g. "* Price" is
 * replaced with "* Cost" in better fit with business/accounting terminology.

 **********************************************************************************************************************************/

export interface Item extends entity.JournalledEntity {
  name: string;
  imageUrl?: general.URL;
  classification?: ItemClassification;
  useCase?: string;
  locator?: domain.Locator;
  internalSKU?: string;
  generalLedgerCode?: string;
  minQuantity?: Quantity;
  notes?: string;
  cardNotesDefault?: string;

  taxable?: boolean;
  primarySupply?: Supply;
  // In the future, this will be a Record<string, Supply> to allow multiple suppliers.
  secondarySupply?: Supply;
  // Should match the `supplier` string of one of the supplies configured.
  defaultSupply?: string;
  cardSize?: CardSize;
  labelSize?: LabelSize;
  breadcrumbSize?: BreadcrumbSize;
  color?: ItemColor;
}
