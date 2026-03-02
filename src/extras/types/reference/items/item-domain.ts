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
  unitCost?: import('@/extras/types/model').Money;
  averageLeadTime?: import('@/extras/types/model').Duration;
  orderNotes?: string;
  orderCost: import('@/extras/types/model').Money;
}

export interface ItemStatus {
  inCart?: boolean;
  toOrder?: Quantity;
  cardsInCart?: number;
  totalCost?: import('@/extras/types/model').Money;
  maxLeadTime?: import('@/extras/types/model').Duration;
  queueAge?: import('@/extras/types/model').Duration;
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
  locator?: import('@/extras/types/model').Locator;
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
