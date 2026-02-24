import * as general from './general';

/**
 * Generic ARDA API Response wrapper
 * Used by our proxy endpoints to normalize upstream responses
 */
export interface ArdaApiResponse<T> {
  ok: boolean;
  status: number;
  data: T;
  error?: string;
}

/**
 * ARDA Query Response structure for paginated endpoints
 * Contains pagination tokens and results array
 */
export interface ArdaQueryResponse<T> {
  thisPage: string;
  nextPage: string;
  previousPage: string;
  results: ArdaResult<T>[];
}

/**
 * Individual result wrapper from ARDA backend
 * Contains the actual payload plus metadata and journaling info
 */
export interface ArdaResult<T> {
  rId: general.UUID;
  asOf: {
    effective: general.Timestamp;
    recorded: general.Timestamp;
  };
  payload: T;
  metadata: {
    tenantId: general.UUID;
  };
  author: string;
  retired: boolean;
  createdBy?: string;
  createdAt?: general.Timestamp;
  previous?: string | null;
}

/**
 * ARDA Item raw payload structure as returned from backend
 * This matches the exact structure from the ARDA API
 */
export interface ArdaItemPayload {
  type: string;
  eId: general.UUID;
  name: string;
  imageUrl?: string;
  classification?: {
    type: string;
    subType?: string;
  };
  useCase?: string;
  locator?: {
    facility: string;
    department?: string;
    location?: string;
    subLocation?: string;
  };
  internalSKU?: string;
  generalLedgerCode?: string;
  glCode?: string;
  minQuantity?: {
    amount: number;
    unit: string;
  };
  notes?: string;
  cardNotesDefault?: string;
  taxable?: boolean;
  primarySupply?: {
    supplyEId?: general.UUID;
    supplier: string;
    name?: string;
    sku?: string;
    orderMethod?: string;
    url?: string;
    minimumQuantity?: {
      amount: number;
      unit: string;
    };
    orderQuantity?: {
      amount: number;
      unit: string;
    };
    unitCost?: {
      value: number;
      currency: string;
    };
    averageLeadTime?: {
      length: number;
      unit: string;
    };
  };
  secondarySupply?: {
    supplyEId?: general.UUID;
    supplier: string;
    name?: string;
    sku?: string;
    orderMethod?: string;
    url?: string;
    minimumQuantity?: {
      amount: number;
      unit: string;
    };
    orderQuantity?: {
      amount: number;
      unit: string;
    };
    unitCost?: {
      value: number;
      currency: string;
    };
    averageLeadTime?: {
      length: number;
      unit: string;
    };
  };
  defaultSupply?: string;
  cardSize?: string;
  labelSize?: string;
  breadcrumbSize?: string;
  itemColor?: string;
}

/**
 * Complete ARDA Item structure (result + payload)
 */
export type ArdaItem = ArdaResult<ArdaItemPayload>;

/**
 * ARDA Draft Item structure (different from regular items)
 * Used for draft creation responses
 */
export interface ArdaDraftItem {
  author: string;
  entityId: general.UUID;
  metadata: {
    tenantId: general.UUID;
  };
  tenantId: general.UUID;
  value: ArdaItemPayload;
}

/**
 * Query request payload for ARDA items endpoint
 */
export interface ArdaQueryItemsRequest {
  filter:
    | boolean
    | {
        and?: Array<{
          or?: Array<{
            locator: string;
            eq?: string;
            regex?: string;
          }>;
        }>;
      };
  paginate: {
    index: number;
    size: number;
  };
  pageToken?: string;
}

/**
 * Create item request payload for ARDA items endpoint
 * Maps to the internal Item type structure
 */
export interface ArdaCreateItemRequest {
  name: string;
  imageUrl?: string;
  classification?: {
    type: string;
    subType?: string;
  };
  useCase?: string;
  locator?: {
    facility: string;
    department?: string;
    location?: string;
    subLocation?: string;
  };
  internalSKU?: string;
  generalLedgerCode?: string;
  glCode?: string;
  minQuantity?: {
    amount: number;
    unit: string;
  };
  notes?: string;
  cardNotesDefault?: string;
  taxable?: boolean;
  primarySupply?: {
    supplyEId?: general.UUID;
    supplier: string;
    name?: string;
    sku?: string;
    orderMethod?: string;
    url?: string;
    minimumQuantity?: {
      amount: number;
      unit: string;
    };
    orderQuantity?: {
      amount: number;
      unit: string;
    };
    unitCost?: {
      value: number;
      currency: string;
    };
    averageLeadTime?: {
      length: number;
      unit: string;
    };
  };
  secondarySupply?: {
    supplyEId?: general.UUID;
    supplier: string;
    name?: string;
    sku?: string;
    orderMethod?: string;
    url?: string;
    minimumQuantity?: {
      amount: number;
      unit: string;
    };
    orderQuantity?: {
      amount: number;
      unit: string;
    };
    unitCost?: {
      value: number;
      currency: string;
    };
    averageLeadTime?: {
      length: number;
      unit: string;
    };
  };
  defaultSupply?: string;
  cardSize?: string;
  labelSize?: string;
  breadcrumbSize?: string;
  itemColor?: string;
}
