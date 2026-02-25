import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { KanbanCardResponse } from '@frontend/types/kanban';

// Types from ReceivingPage
export interface ReceivingItem {
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
  status: 'in_proccess' | 'Received' | 'Fulfilled';
  supplier: string;
  orderedAt?: string;
  fulfilledAt?: string;
  link?: string;
  notes?: string;
}

export interface ReceivingSupplierGroup {
  name: string;
  orderMethod: ReceivingItem['orderMethod'];
  items: ReceivingItem[];
  expanded: boolean;
}

export interface ReceivingOrderMethodGroup {
  name: string;
  orderMethod: ReceivingItem['orderMethod'];
  items: ReceivingItem[];
  expanded: boolean;
}

export interface ReceivingItemDetails {
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

export interface ReceivingFilters {
  [key: string]: unknown;
}

interface ReceivingState {
  // Data
  receivingItems: ReceivingItem[];
  supplierGroups: ReceivingSupplierGroup[];
  orderMethodGroups: ReceivingOrderMethodGroup[];
  originalApiData: KanbanCardResponse['results'];

  // Selection (stored as array for Redux serialization)
  selectedItems: string[];
  selectedItemForDetails: ReceivingItemDetails | null;

  // UI State
  activeTab: 'inTransit' | 'received' | 'fulfilled';
  searchTerm: string;
  filters: ReceivingFilters;

  // Pagination
  currentPage: number;
  hasMore: boolean;

  // Loading
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
}

const initialState: ReceivingState = {
  receivingItems: [],
  supplierGroups: [],
  orderMethodGroups: [],
  originalApiData: [],
  selectedItems: [],
  selectedItemForDetails: null,
  activeTab: 'inTransit',
  searchTerm: '',
  filters: {},
  currentPage: 0,
  hasMore: true,
  isLoading: false,
  isLoadingMore: false,
  error: null,
};

const receivingSlice = createSlice({
  name: 'receiving',
  initialState,
  reducers: {
    setReceivingItems: (state, action: PayloadAction<ReceivingItem[]>) => {
      state.receivingItems = action.payload;
    },
    setSupplierGroups: (
      state,
      action: PayloadAction<ReceivingSupplierGroup[]>
    ) => {
      state.supplierGroups = action.payload;
    },
    setOrderMethodGroups: (
      state,
      action: PayloadAction<ReceivingOrderMethodGroup[]>
    ) => {
      state.orderMethodGroups = action.payload;
    },
    setOriginalApiData: (
      state,
      action: PayloadAction<KanbanCardResponse['results']>
    ) => {
      state.originalApiData = action.payload;
    },
    setSelectedItems: (state, action: PayloadAction<string[]>) => {
      state.selectedItems = action.payload;
    },
    toggleItemSelection: (state, action: PayloadAction<string>) => {
      const index = state.selectedItems.indexOf(action.payload);
      if (index === -1) {
        state.selectedItems.push(action.payload);
      } else {
        state.selectedItems.splice(index, 1);
      }
    },
    setSelectedItemForDetails: (
      state,
      action: PayloadAction<ReceivingItemDetails | null>
    ) => {
      state.selectedItemForDetails = action.payload;
    },
    setActiveTab: (
      state,
      action: PayloadAction<'inTransit' | 'received' | 'fulfilled'>
    ) => {
      state.activeTab = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setFilters: (state, action: PayloadAction<ReceivingFilters>) => {
      state.filters = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setIsLoadingMore: (state, action: PayloadAction<boolean>) => {
      state.isLoadingMore = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setReceivingItems,
  setSupplierGroups,
  setOrderMethodGroups,
  setOriginalApiData,
  setSelectedItems,
  toggleItemSelection,
  setSelectedItemForDetails,
  setActiveTab,
  setSearchTerm,
  setFilters,
  setCurrentPage,
  setHasMore,
  setIsLoading,
  setIsLoadingMore,
  setError,
} = receivingSlice.actions;

export default receivingSlice.reducer;
