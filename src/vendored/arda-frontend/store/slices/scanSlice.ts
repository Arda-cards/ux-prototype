import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as items from '@frontend/types/items';
import type { ItemCard } from '@frontend/constants/types';

// ScannedItem type from scan views
export interface ScannedItem {
  id: string;
  cardData: {
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
        imageUrl?: string;
        locator?: {
          facility: string;
          location: string;
        };
        notes: string;
        cardNotesDefault: string;
        minQuantity?: {
          amount: number;
          unit: string;
        };
        primarySupply: {
          supplier: string;
          orderQuantity: {
            amount: number;
            unit: string;
          };
          unitCost: {
            value: number;
            currency: string;
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
      status: string;
      printStatus: string;
    };
    metadata: {
      tenantId: string;
    };
    author: string;
    retired: boolean;
  };
}

interface ScanState {
  // Scanned items
  scannedItems: ScannedItem[];

  // Selection (stored as array for Redux serialization, converted to Set when needed)
  selectedItems: string[];
  selectedFilters: string[];

  // View state
  currentView: 'scan' | 'list' | 'card';

  // Scanning state
  scanning: boolean;
  cameraError: string | null;
  scanComplete: boolean;
  qrDetected: boolean;
  initialCardLoaded: boolean;

  // Active card/item
  activeCardId: string | null;
  itemToEdit: items.Item | null;
  selectedItemForDetails: ItemCard | null;

  // Column visibility
  columnVisibility: Record<string, boolean>;

  // Counts
  cardsCantAddCount: number;
  cardsCantReceiveCount: number;
  isAllSelected: boolean;

  // Modals
  isItemDetailsPanelOpen: boolean;
  isEditFormOpen: boolean;
  isClearItemsModalOpen: boolean;
  isCantAddCardsModalOpen: boolean;
  isCantReceiveCardsModalOpen: boolean;
}

const initialState: ScanState = {
  scannedItems: [],
  selectedItems: [],
  selectedFilters: [],
  currentView: 'scan',
  scanning: false,
  cameraError: null,
  scanComplete: false,
  qrDetected: false,
  initialCardLoaded: false,
  activeCardId: null,
  itemToEdit: null,
  selectedItemForDetails: null,
  columnVisibility: {
    sku: true,
    image: true,
    item: true,
    classification: true,
    supplier: true,
    location: true,
    unitCost: true,
    created: true,
    orderMethod: true,
    orderQty: true,
    minUnits: true,
    cardSize: true,
    cardCount: true,
    actions: true,
    notes: true,
  },
  cardsCantAddCount: 0,
  cardsCantReceiveCount: 0,
  isAllSelected: false,
  isItemDetailsPanelOpen: false,
  isEditFormOpen: false,
  isClearItemsModalOpen: false,
  isCantAddCardsModalOpen: false,
  isCantReceiveCardsModalOpen: false,
};

const scanSlice = createSlice({
  name: 'scan',
  initialState,
  reducers: {
    addScannedItem: (state, action: PayloadAction<ScannedItem>) => {
      // Avoid duplicates
      if (!state.scannedItems.find((item) => item.id === action.payload.id)) {
        state.scannedItems.push(action.payload);
      }
    },
    removeScannedItem: (state, action: PayloadAction<string>) => {
      state.scannedItems = state.scannedItems.filter(
        (item) => item.id !== action.payload
      );
      state.selectedItems = state.selectedItems.filter(
        (id) => id !== action.payload
      );
    },
    clearScannedItems: (state) => {
      state.scannedItems = [];
      state.selectedItems = [];
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
    setSelectedFilters: (state, action: PayloadAction<string[]>) => {
      state.selectedFilters = action.payload;
    },
    setCurrentView: (
      state,
      action: PayloadAction<'scan' | 'list' | 'card'>
    ) => {
      state.currentView = action.payload;
    },
    setScanning: (state, action: PayloadAction<boolean>) => {
      state.scanning = action.payload;
    },
    setCameraError: (state, action: PayloadAction<string | null>) => {
      state.cameraError = action.payload;
    },
    setScanComplete: (state, action: PayloadAction<boolean>) => {
      state.scanComplete = action.payload;
    },
    setQrDetected: (state, action: PayloadAction<boolean>) => {
      state.qrDetected = action.payload;
    },
    setInitialCardLoaded: (state, action: PayloadAction<boolean>) => {
      state.initialCardLoaded = action.payload;
    },
    setActiveCardId: (state, action: PayloadAction<string | null>) => {
      state.activeCardId = action.payload;
    },
    setItemToEdit: (state, action: PayloadAction<items.Item | null>) => {
      state.itemToEdit = action.payload;
    },
    setSelectedItemForDetails: (
      state,
      action: PayloadAction<ItemCard | null>
    ) => {
      state.selectedItemForDetails = action.payload;
    },
    setColumnVisibility: (
      state,
      action: PayloadAction<Record<string, boolean>>
    ) => {
      state.columnVisibility = action.payload;
    },
    setCardsCantAddCount: (state, action: PayloadAction<number>) => {
      state.cardsCantAddCount = action.payload;
    },
    setCardsCantReceiveCount: (state, action: PayloadAction<number>) => {
      state.cardsCantReceiveCount = action.payload;
    },
    setIsAllSelected: (state, action: PayloadAction<boolean>) => {
      state.isAllSelected = action.payload;
    },
    setModalOpen: (
      state,
      action: PayloadAction<{
        modal:
          | 'isItemDetailsPanelOpen'
          | 'isEditFormOpen'
          | 'isClearItemsModalOpen'
          | 'isCantAddCardsModalOpen'
          | 'isCantReceiveCardsModalOpen';
        open: boolean;
      }>
    ) => {
      state[action.payload.modal] = action.payload.open;
    },
  },
});

export const {
  addScannedItem,
  removeScannedItem,
  clearScannedItems,
  setSelectedItems,
  toggleItemSelection,
  setSelectedFilters,
  setCurrentView,
  setScanning,
  setCameraError,
  setScanComplete,
  setQrDetected,
  setInitialCardLoaded,
  setActiveCardId,
  setItemToEdit,
  setSelectedItemForDetails,
  setColumnVisibility,
  setCardsCantAddCount,
  setCardsCantReceiveCount,
  setIsAllSelected,
  setModalOpen,
} = scanSlice.actions;

export default scanSlice.reducer;
