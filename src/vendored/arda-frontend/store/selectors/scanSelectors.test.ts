import * as sel from './scanSelectors';
import { createTestStore } from '@frontend/test-utils/test-store';

describe('scanSelectors', () => {
  const store = createTestStore();
  const state = store.getState();

  it('selectScannedItems returns empty array by default', () => {
    expect(sel.selectScannedItems(state)).toEqual([]);
  });

  it('selectSelectedItems returns empty array', () => {
    expect(sel.selectSelectedItems(state)).toEqual([]);
  });

  it('selectSelectedFilters returns empty array', () => {
    expect(sel.selectSelectedFilters(state)).toEqual([]);
  });

  it('selectCurrentView returns scan', () => {
    expect(sel.selectCurrentView(state)).toBe('scan');
  });

  it('selectScanning returns false', () => {
    expect(sel.selectScanning(state)).toBe(false);
  });

  it('selectCameraError returns null', () => {
    expect(sel.selectCameraError(state)).toBeNull();
  });

  it('selectScanComplete returns false', () => {
    expect(sel.selectScanComplete(state)).toBe(false);
  });

  it('selectQrDetected returns false', () => {
    expect(sel.selectQrDetected(state)).toBe(false);
  });

  it('selectInitialCardLoaded returns false', () => {
    expect(sel.selectInitialCardLoaded(state)).toBe(false);
  });

  it('selectActiveCardId returns null', () => {
    expect(sel.selectActiveCardId(state)).toBeNull();
  });

  it('selectScanItemToEdit returns null', () => {
    expect(sel.selectScanItemToEdit(state)).toBeNull();
  });

  it('selectSelectedItemForDetails returns null', () => {
    expect(sel.selectSelectedItemForDetails(state)).toBeNull();
  });

  it('selectScanColumnVisibility returns default column map', () => {
    const cv = sel.selectScanColumnVisibility(state);
    expect(cv.sku).toBe(true);
    expect(cv.item).toBe(true);
  });

  it('selectCardsCantAddCount returns 0', () => {
    expect(sel.selectCardsCantAddCount(state)).toBe(0);
  });

  it('selectCardsCantReceiveCount returns 0', () => {
    expect(sel.selectCardsCantReceiveCount(state)).toBe(0);
  });

  it('selectIsAllSelected returns false', () => {
    expect(sel.selectIsAllSelected(state)).toBe(false);
  });

  it('selectIsItemDetailsPanelOpen returns false', () => {
    expect(sel.selectIsItemDetailsPanelOpen(state)).toBe(false);
  });

  it('selectIsEditFormOpen returns false', () => {
    expect(sel.selectIsEditFormOpen(state)).toBe(false);
  });

  it('selectIsClearItemsModalOpen returns false', () => {
    expect(sel.selectIsClearItemsModalOpen(state)).toBe(false);
  });

  it('selectIsCantAddCardsModalOpen returns false', () => {
    expect(sel.selectIsCantAddCardsModalOpen(state)).toBe(false);
  });

  it('selectIsCantReceiveCardsModalOpen returns false', () => {
    expect(sel.selectIsCantReceiveCardsModalOpen(state)).toBe(false);
  });
});
