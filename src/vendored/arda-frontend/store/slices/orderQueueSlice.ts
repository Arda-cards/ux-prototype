import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { KanbanCardResponse } from '@frontend/types/kanban';

// Types from OrderQueuePage
export interface OrderItem {
  id: string;
  name: string;
  quantity: string;
  orderMethod:
    | 'Online'
    | 'Purchase order'
    | 'Phone'
    | 'Email'
    | 'In store'
    | 'Request for quotation (RFQ)'
    | 'Production'
    | '3rd party';
  status:
    | 'Ready to order'
    | 'In progress'
    | 'Requesting'
    | 'Requested'
    | 'Ordered'
    | 'In transit'
    | 'Received'
    | 'Fulfilled';
  supplier: string;
  orderedAt?: string;
  link?: string;
  image?: string;
  taxable?: boolean;
  sku?: string;
  unitPrice?: number;
  notes?: string;
}

export interface SupplierGroup {
  name: string;
  orderMethod: OrderItem['orderMethod'];
  items: OrderItem[];
  expanded: boolean;
}

export interface OrderMethodGroup {
  name: string;
  orderMethod: OrderItem['orderMethod'];
  items: OrderItem[];
  expanded: boolean;
}

export interface OrderItemDetails {
  eid: string;
  title: string;
  minQty: string;
  minUnit: string;
  orderQty: string;
  orderUnit: string;
  location: string;
  supplier: string;
  sku: string;
  image: string;
  link: string;
  unitPrice: number;
  notes: string;
  classification: Record<string, unknown>;
  locator: Record<string, unknown>;
  cardSize: string;
  labelSize: string;
  breadcrumbSize: string;
  itemColor: string;
  internalSKU: string;
  useCase: string;
  taxable: boolean;
  cardNotesDefault: string;
  defaultSupply: string;
  secondarySupply: Record<string, unknown> | null;
  orderMechanism:
    | 'PURCHASE_ORDER'
    | 'EMAIL'
    | 'PHONE'
    | 'IN_STORE'
    | 'ONLINE'
    | 'RFQ'
    | 'PRODUCTION'
    | 'THIRD_PARTY'
    | 'OTHER';
}

interface OrderQueueState {
  // Counts
  readyToOrderCount: number;
  totalItemsCount: number;
  missingUrlCount: number;

  // Data
  supplierGroups: SupplierGroup[];
  orderMethodGroups: OrderMethodGroup[];
  originalApiData: KanbanCardResponse['results'];
  itemsWithUrls: OrderItem[];

  // Selection
  selectedItemsForEmail: OrderItem[];
  selectedItemForDetails: OrderItemDetails | null;

  // UI State
  activeTab: 'ready' | 'recent';
  groupBy: 'none' | 'supplier' | 'orderMethod';
  searchTerm: string;

  // Loading
  isLoading: boolean;
  error: string | null;
}

const initialState: OrderQueueState = {
  readyToOrderCount: 0,
  totalItemsCount: 0,
  missingUrlCount: 0,
  supplierGroups: [],
  orderMethodGroups: [],
  originalApiData: [],
  itemsWithUrls: [],
  selectedItemsForEmail: [],
  selectedItemForDetails: null,
  activeTab: 'ready',
  groupBy: 'supplier',
  searchTerm: '',
  isLoading: false,
  error: null,
};

const orderQueueSlice = createSlice({
  name: 'orderQueue',
  initialState,
  reducers: {
    setReadyToOrderCount: (state, action: PayloadAction<number>) => {
      state.readyToOrderCount = action.payload;
    },
    setTotalItemsCount: (state, action: PayloadAction<number>) => {
      state.totalItemsCount = action.payload;
    },
    setMissingUrlCount: (state, action: PayloadAction<number>) => {
      state.missingUrlCount = action.payload;
    },
    setSupplierGroups: (state, action: PayloadAction<SupplierGroup[]>) => {
      state.supplierGroups = action.payload;
    },
    setOrderMethodGroups: (state, action: PayloadAction<OrderMethodGroup[]>) => {
      state.orderMethodGroups = action.payload;
    },
    setOriginalApiData: (
      state,
      action: PayloadAction<KanbanCardResponse['results']>
    ) => {
      state.originalApiData = action.payload;
    },
    setItemsWithUrls: (state, action: PayloadAction<OrderItem[]>) => {
      state.itemsWithUrls = action.payload;
    },
    setSelectedItemsForEmail: (state, action: PayloadAction<OrderItem[]>) => {
      state.selectedItemsForEmail = action.payload;
    },
    setSelectedItemForDetails: (
      state,
      action: PayloadAction<OrderItemDetails | null>
    ) => {
      state.selectedItemForDetails = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<'ready' | 'recent'>) => {
      state.activeTab = action.payload;
    },
    setGroupBy: (
      state,
      action: PayloadAction<'none' | 'supplier' | 'orderMethod'>
    ) => {
      state.groupBy = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setReadyToOrderCount,
  setTotalItemsCount,
  setMissingUrlCount,
  setSupplierGroups,
  setOrderMethodGroups,
  setOriginalApiData,
  setItemsWithUrls,
  setSelectedItemsForEmail,
  setSelectedItemForDetails,
  setActiveTab,
  setGroupBy,
  setSearchTerm,
  setIsLoading,
  setError,
} = orderQueueSlice.actions;

export default orderQueueSlice.reducer;
