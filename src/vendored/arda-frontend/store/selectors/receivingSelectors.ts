import { RootState } from '../store';

// Receiving selectors
export const selectReceivingItems = (state: RootState) =>
  state.receiving.receivingItems;
export const selectReceivingSupplierGroups = (state: RootState) =>
  state.receiving.supplierGroups;
export const selectReceivingOrderMethodGroups = (state: RootState) =>
  state.receiving.orderMethodGroups;
export const selectReceivingOriginalApiData = (state: RootState) =>
  state.receiving.originalApiData;
export const selectReceivingSelectedItems = (state: RootState) =>
  state.receiving.selectedItems;
export const selectReceivingSelectedItemForDetails = (state: RootState) =>
  state.receiving.selectedItemForDetails;
export const selectReceivingActiveTab = (state: RootState) =>
  state.receiving.activeTab;
export const selectReceivingSearchTerm = (state: RootState) =>
  state.receiving.searchTerm;
export const selectReceivingFilters = (state: RootState) =>
  state.receiving.filters;
export const selectReceivingCurrentPage = (state: RootState) =>
  state.receiving.currentPage;
export const selectReceivingHasMore = (state: RootState) =>
  state.receiving.hasMore;
export const selectReceivingIsLoading = (state: RootState) =>
  state.receiving.isLoading;
export const selectReceivingIsLoadingMore = (state: RootState) =>
  state.receiving.isLoadingMore;
export const selectReceivingError = (state: RootState) =>
  state.receiving.error;
