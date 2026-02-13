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
