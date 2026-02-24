import * as sel from './receivingSelectors';
import { createTestStore } from '@frontend/test-utils/test-store';

describe('receivingSelectors', () => {
  const store = createTestStore();
  const state = store.getState();

  it('selectReceivingItems', () => expect(sel.selectReceivingItems(state)).toEqual([]));
  it('selectReceivingSupplierGroups', () => expect(sel.selectReceivingSupplierGroups(state)).toEqual([]));
  it('selectReceivingOrderMethodGroups', () => expect(sel.selectReceivingOrderMethodGroups(state)).toEqual([]));
  it('selectReceivingOriginalApiData', () => expect(sel.selectReceivingOriginalApiData(state)).toEqual([]));
  it('selectReceivingSelectedItems', () => expect(sel.selectReceivingSelectedItems(state)).toEqual([]));
  it('selectReceivingSelectedItemForDetails', () => expect(sel.selectReceivingSelectedItemForDetails(state)).toBeNull());
  it('selectReceivingActiveTab', () => expect(sel.selectReceivingActiveTab(state)).toBe('inTransit'));
  it('selectReceivingSearchTerm', () => expect(sel.selectReceivingSearchTerm(state)).toBe(''));
  it('selectReceivingFilters', () => expect(sel.selectReceivingFilters(state)).toEqual({}));
  it('selectReceivingCurrentPage', () => expect(sel.selectReceivingCurrentPage(state)).toBe(0));
  it('selectReceivingHasMore', () => expect(sel.selectReceivingHasMore(state)).toBe(true));
  it('selectReceivingIsLoading', () => expect(sel.selectReceivingIsLoading(state)).toBe(false));
  it('selectReceivingIsLoadingMore', () => expect(sel.selectReceivingIsLoadingMore(state)).toBe(false));
  it('selectReceivingError', () => expect(sel.selectReceivingError(state)).toBeNull());
});
