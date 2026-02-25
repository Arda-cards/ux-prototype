import { RootState } from '../store';

// Scan selectors
export const selectScannedItems = (state: RootState) => state.scan.scannedItems;
export const selectSelectedItems = (state: RootState) => state.scan.selectedItems;
export const selectSelectedFilters = (state: RootState) =>
  state.scan.selectedFilters;
export const selectCurrentView = (state: RootState) => state.scan.currentView;
export const selectScanning = (state: RootState) => state.scan.scanning;
export const selectCameraError = (state: RootState) => state.scan.cameraError;
export const selectScanComplete = (state: RootState) => state.scan.scanComplete;
export const selectQrDetected = (state: RootState) => state.scan.qrDetected;
export const selectInitialCardLoaded = (state: RootState) =>
  state.scan.initialCardLoaded;
export const selectActiveCardId = (state: RootState) => state.scan.activeCardId;
export const selectScanItemToEdit = (state: RootState) => state.scan.itemToEdit;
export const selectSelectedItemForDetails = (state: RootState) =>
  state.scan.selectedItemForDetails;
export const selectScanColumnVisibility = (state: RootState) =>
  state.scan.columnVisibility;
export const selectCardsCantAddCount = (state: RootState) =>
  state.scan.cardsCantAddCount;
export const selectCardsCantReceiveCount = (state: RootState) =>
  state.scan.cardsCantReceiveCount;
export const selectIsAllSelected = (state: RootState) =>
  state.scan.isAllSelected;

// Modal selectors
export const selectIsItemDetailsPanelOpen = (state: RootState) =>
  state.scan.isItemDetailsPanelOpen;
export const selectIsEditFormOpen = (state: RootState) =>
  state.scan.isEditFormOpen;
export const selectIsClearItemsModalOpen = (state: RootState) =>
  state.scan.isClearItemsModalOpen;
export const selectIsCantAddCardsModalOpen = (state: RootState) =>
  state.scan.isCantAddCardsModalOpen;
export const selectIsCantReceiveCardsModalOpen = (state: RootState) =>
  state.scan.isCantReceiveCardsModalOpen;
