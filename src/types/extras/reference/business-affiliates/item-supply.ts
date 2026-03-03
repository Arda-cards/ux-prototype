import type { Money } from '../../model/general/money';
import type { Duration } from '../../model/general/time/duration';
import type { Quantity, OrderMechanism } from '../items/item-domain';

export type SupplyDesignation = 'PRIMARY' | 'SECONDARY' | 'TERTIARY' | 'BACKUP';

export interface ItemSupply {
  entityId: string;
  affiliateId: string;
  itemId: string;
  designation: SupplyDesignation;
  supplierSku?: string;
  supplierProductName?: string;
  orderMechanism?: OrderMechanism;
  url?: string;
  minimumQuantity?: Quantity;
  orderQuantity?: Quantity;
  unitCost?: Money;
  orderCost?: Money;
  averageLeadTime?: Duration;
  orderNotes?: string;
}

export const sampleItemSupplies: ItemSupply[] = [
  {
    entityId: 'is-001',
    affiliateId: 'ba-001',
    itemId: 'item-001',
    designation: 'PRIMARY',
    supplierSku: 'FAS-HC500-A',
    supplierProductName: 'HC-500 Hydraulic Cylinder',
    orderMechanism: 'ONLINE',
    url: 'https://fastenal.com/hc500',
    minimumQuantity: { amount: 1, unit: 'EACH' },
    orderQuantity: { amount: 5, unit: 'EACH' },
    unitCost: { value: 189.99, currency: 'USD' },
    orderCost: { value: 949.95, currency: 'USD' },
    averageLeadTime: { length: 5, unit: 'DAY' },
    orderNotes: 'Free shipping over $500',
  },
  {
    entityId: 'is-002',
    affiliateId: 'ba-002',
    itemId: 'item-001',
    designation: 'SECONDARY',
    supplierSku: 'PH-HC500-OEM',
    supplierProductName: 'HC-500 OEM Hydraulic Cylinder',
    orderMechanism: 'PURCHASE_ORDER',
    minimumQuantity: { amount: 10, unit: 'EACH' },
    orderQuantity: { amount: 10, unit: 'EACH' },
    unitCost: { value: 165.0, currency: 'USD' },
    orderCost: { value: 1650.0, currency: 'USD' },
    averageLeadTime: { length: 2, unit: 'WEEK' },
    orderNotes: 'OEM direct — requires PO approval.',
  },
];
