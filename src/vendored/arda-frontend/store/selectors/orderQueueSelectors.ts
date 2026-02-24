import { RootState } from '../store';

// Order Queue selectors
export const selectReadyToOrderCount = (state: RootState) =>
  state.orderQueue.readyToOrderCount;
export const selectTotalItemsCount = (state: RootState) =>
  state.orderQueue.totalItemsCount;
export const selectMissingUrlCount = (state: RootState) =>
  state.orderQueue.missingUrlCount;
export const selectSupplierGroups = (state: RootState) =>
  state.orderQueue.supplierGroups;
export const selectOrderMethodGroups = (state: RootState) =>
  state.orderQueue.orderMethodGroups;
export const selectOriginalApiData = (state: RootState) =>
  state.orderQueue.originalApiData;
export const selectItemsWithUrls = (state: RootState) =>
  state.orderQueue.itemsWithUrls;
export const selectSelectedItemsForEmail = (state: RootState) =>
  state.orderQueue.selectedItemsForEmail;
export const selectSelectedItemForDetails = (state: RootState) =>
  state.orderQueue.selectedItemForDetails;
export const selectOrderQueueActiveTab = (state: RootState) =>
  state.orderQueue.activeTab;
export const selectGroupBy = (state: RootState) => state.orderQueue.groupBy;
export const selectOrderQueueSearchTerm = (state: RootState) =>
  state.orderQueue.searchTerm;
export const selectOrderQueueIsLoading = (state: RootState) =>
  state.orderQueue.isLoading;
export const selectOrderQueueError = (state: RootState) =>
  state.orderQueue.error;
