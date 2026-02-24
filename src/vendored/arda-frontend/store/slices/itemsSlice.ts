import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as items from '@frontend/types/items';
import type { KanbanCardResult } from '@frontend/types/kanban';
import type { ItemFormState } from '@frontend/constants/types';

interface ItemsState {
  // Data
  items: items.Item[];
  itemCardsMap: Record<string, KanbanCardResult[]>;

  // Selection
  selectedItems: items.Item[];
  selectedItem: items.Item | null;
  itemToEdit: items.Item | null;

  // UI State
  activeTab: 'published' | 'draft' | 'uploaded';
  search: string;
  debouncedSearch: string;

  // Pagination
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    thisPage?: string;
    nextPage?: string;
    previousPage?: string;
  };

  // Column visibility (per tab)
  columnVisibility: Record<string, Record<string, boolean>>;

  // Drafts (form state)
  drafts: Record<string, {
    form: ItemFormState;
    createCardOnPublish: boolean;
    usingDefaultImage: boolean;
  }>;

  // Loading States
  loading: boolean;
  loadingArdaItems: boolean;
  loadingCards: Record<string, boolean>;
  error: string | null;

  // UI Flags
  maxItemsSeen: number;
  hasUnsavedChanges: boolean;
}

const initialState: ItemsState = {
  items: [],
  itemCardsMap: {},
  selectedItems: [],
  selectedItem: null,
  itemToEdit: null,
  activeTab: 'published',
  search: '',
  debouncedSearch: '',
  pagination: {
    currentPage: 1,
    pageSize: 50,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  columnVisibility: {},
  drafts: {},
  loading: false,
  loadingArdaItems: false,
  loadingCards: {},
  error: null,
  maxItemsSeen: 0,
  hasUnsavedChanges: false,
};

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<items.Item[]>) => {
      state.items = action.payload;
    },
    addItem: (state, action: PayloadAction<items.Item>) => {
      state.items.push(action.payload);
    },
    updateItem: (state, action: PayloadAction<items.Item>) => {
      const index = state.items.findIndex(
        (item) => item.entityId === action.payload.entityId
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.entityId !== action.payload
      );
      delete state.itemCardsMap[action.payload];
    },
    setSelectedItems: (state, action: PayloadAction<items.Item[]>) => {
      state.selectedItems = action.payload;
    },
    toggleItemSelection: (state, action: PayloadAction<items.Item>) => {
      const index = state.selectedItems.findIndex(
        (item) => item.entityId === action.payload.entityId
      );
      if (index === -1) {
        state.selectedItems.push(action.payload);
      } else {
        state.selectedItems.splice(index, 1);
      }
    },
    clearSelection: (state) => {
      state.selectedItems = [];
      state.selectedItem = null;
    },
    setSelectedItem: (state, action: PayloadAction<items.Item | null>) => {
      state.selectedItem = action.payload;
    },
    setItemToEdit: (state, action: PayloadAction<items.Item | null>) => {
      state.itemToEdit = action.payload;
    },
    setActiveTab: (
      state,
      action: PayloadAction<'published' | 'draft' | 'uploaded'>
    ) => {
      state.activeTab = action.payload;
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setDebouncedSearch: (state, action: PayloadAction<string>) => {
      state.debouncedSearch = action.payload;
    },
    setPagination: (
      state,
      action: PayloadAction<ItemsState['pagination']>
    ) => {
      state.pagination = action.payload;
    },
    setColumnVisibility: (
      state,
      action: PayloadAction<{
        tab: string;
        visibility: Record<string, boolean>;
      }>
    ) => {
      state.columnVisibility[action.payload.tab] = action.payload.visibility;
    },
    setItemCards: (
      state,
      action: PayloadAction<{
        entityId: string;
        cards: KanbanCardResult[];
      }>
    ) => {
      state.itemCardsMap[action.payload.entityId] = action.payload.cards;
    },
    saveDraft: (
      state,
      action: PayloadAction<{
        entityId: string;
        draft: {
          form: ItemFormState;
          createCardOnPublish: boolean;
          usingDefaultImage: boolean;
        };
      }>
    ) => {
      state.drafts[action.payload.entityId] = action.payload.draft;
    },
    clearDraft: (state, action: PayloadAction<string>) => {
      delete state.drafts[action.payload];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setLoadingArdaItems: (state, action: PayloadAction<boolean>) => {
      state.loadingArdaItems = action.payload;
    },
    setLoadingCards: (
      state,
      action: PayloadAction<{ entityId: string; loading: boolean }>
    ) => {
      state.loadingCards[action.payload.entityId] = action.payload.loading;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setMaxItemsSeen: (state, action: PayloadAction<number>) => {
      state.maxItemsSeen = action.payload;
    },
    setHasUnsavedChanges: (state, action: PayloadAction<boolean>) => {
      state.hasUnsavedChanges = action.payload;
    },
  },
});

export const {
  setItems,
  addItem,
  updateItem,
  removeItem,
  setSelectedItems,
  toggleItemSelection,
  clearSelection,
  setSelectedItem,
  setItemToEdit,
  setActiveTab,
  setSearch,
  setDebouncedSearch,
  setPagination,
  setColumnVisibility,
  setItemCards,
  saveDraft,
  clearDraft,
  setLoading,
  setLoadingArdaItems,
  setLoadingCards,
  setError,
  setMaxItemsSeen,
  setHasUnsavedChanges,
} = itemsSlice.actions;

export default itemsSlice.reducer;
