// API Response Interfaces for Kanban
export interface KanbanCardResponse {
  thisPage: string;
  nextPage: string;
  previousPage: string;
  results: KanbanCardResult[];
}

export interface KanbanCardResponseData {
  data: {
    results: KanbanCardResult[];
  };
}
export interface KanbanCardResult {
  rId: string;
  asOf: {
    effective: number;
    recorded: number;
  };
  payload: {
    eId: string;
    rId: string;
    lookupUrlId: string;
    serialNumber: string;
    item: {
      type: string;
      eId: string;
      name: string;
    };
    itemDetails: {
      eId: string;
      name: string;
      imageUrl: string;
      classification: {
        type: string;
        subType: string;
      };
      useCase: string;
      locator: {
        facility: string;
        department: string;
        location: string;
      };
      internalSKU: string;
      generalLedgerCode?: string;
      notes: string;
      cardNotesDefault: string;
      taxable: boolean;
      minQuantity?: {
        amount: number;
        unit: string;
      };
      primarySupply: {
        supplyEId?: string;
        supplier: string;
        name?: string;
        sku: string;
        orderMethod: string;
        url: string;
        orderQuantity: {
          amount: number;
          unit: string;
        };
        unitCost: {
          value: number;
          currency: string;
        };
        averageLeadTime: {
          length: number;
          unit: string;
        };
      };
      secondarySupply?: {
        supplyEId?: string;
        supplier: string;
        name?: string;
        sku: string;
        orderMethod: string;
        url: string;
        orderQuantity: {
          amount: number;
          unit: string;
        };
        unitCost: {
          value: number;
          currency: string;
        };
        averageLeadTime: {
          length: number;
          unit: string;
        };
      };
      defaultSupply: string;
      cardSize: string;
      labelSize: string;
      breadcrumbSize: string;
      itemColor: string;
    };
    cardQuantity: {
      amount: number;
      unit: string;
    };
    lastEvent: {
      when: {
        effective: number;
        recorded: number;
      };
      type: string;
      author: string;
    };
    status: string;
    printStatus: string;
  };
  metadata: {
    tenantId: string;
  };
  author: string;
  retired: boolean;
}

// Types for creating kanban cards
export interface CreateKanbanCardRequest {
  item: {
    eId: string;
  };
  quantity: {
    amount: number;
    unit: string;
  };
}

export interface CreateKanbanCardResponse {
  rId: string;
  asOf: {
    effective: number;
    recorded: number;
  };
  payload: {
    type: string;
    eId: string;
    serialNumber: string;
    item: {
      type: string;
      eId: string;
      name: string;
    };
    cardQuantity: {
      amount: number;
      unit: string;
    };
    status: string;
    printStatus: string;
  };
  metadata: {
    tenantId: string;
  };
  author: string;
  retired: boolean;
}

// Request interface for querying kanban card details by item ID
export interface QueryKanbanCardDetailsByItemRequest {
  filter: {
    eq: string; // Item ID
    locator: string; // Should be "ITEM_REFERENCE_entity_id"
  };
  paginate: {
    index: number;
    size: number;
  };
}
