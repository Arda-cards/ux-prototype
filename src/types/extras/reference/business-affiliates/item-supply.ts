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
