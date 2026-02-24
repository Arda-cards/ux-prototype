import { RootState } from '../store';

// Items selectors
export const selectItems = (state: RootState) => state.items.items;
export const selectItemCardsMap = (state: RootState) => state.items.itemCardsMap;
export const selectSelectedItems = (state: RootState) => state.items.selectedItems;
export const selectSelectedItem = (state: RootState) => state.items.selectedItem;
export const selectItemToEdit = (state: RootState) => state.items.itemToEdit;
export const selectActiveTab = (state: RootState) => state.items.activeTab;
export const selectSearch = (state: RootState) => state.items.search;
export const selectDebouncedSearch = (state: RootState) => state.items.debouncedSearch;
export const selectPagination = (state: RootState) => state.items.pagination;
export const selectColumnVisibility = (state: RootState) => state.items.columnVisibility;
export const selectDrafts = (state: RootState) => state.items.drafts;
export const selectItemsLoading = (state: RootState) => state.items.loading;
export const selectLoadingArdaItems = (state: RootState) => state.items.loadingArdaItems;
export const selectLoadingCards = (state: RootState) => state.items.loadingCards;
export const selectItemsError = (state: RootState) => state.items.error;
export const selectMaxItemsSeen = (state: RootState) => state.items.maxItemsSeen;
export const selectHasUnsavedChanges = (state: RootState) => state.items.hasUnsavedChanges;

// Stable fallbacks — must be module-level constants, NOT inline literals.
// `|| []` and `|| {}` inside a selector create a new reference on every call,
// causing useAppSelector to think the value changed and trigger a re-render
// on every Redux action dispatched anywhere in the app.
const EMPTY_CARDS: never[] = [];
const EMPTY_COLUMN_VISIBILITY: Record<string, boolean> = {};

// Derived selectors
export const selectItemById = (state: RootState, entityId: string) =>
  state.items.items.find((item: { entityId: string }) => item.entityId === entityId);

export const selectItemCards = (state: RootState, entityId: string) =>
  state.items.itemCardsMap[entityId] || EMPTY_CARDS;

export const selectColumnVisibilityForTab = (
  state: RootState,
  tab: string
) => state.items.columnVisibility[tab] || EMPTY_COLUMN_VISIBILITY;

export const selectDraft = (state: RootState, entityId: string) => {
  return state.items.drafts[entityId] || null;
};
