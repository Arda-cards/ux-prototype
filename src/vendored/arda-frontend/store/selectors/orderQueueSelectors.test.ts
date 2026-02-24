import * as sel from './orderQueueSelectors';
import { createTestStore } from '@frontend/test-utils/test-store';

describe('orderQueueSelectors', () => {
  const store = createTestStore();
  const state = store.getState();

  it('selectReadyToOrderCount', () => expect(sel.selectReadyToOrderCount(state)).toBe(0));
  it('selectTotalItemsCount', () => expect(sel.selectTotalItemsCount(state)).toBe(0));
  it('selectMissingUrlCount', () => expect(sel.selectMissingUrlCount(state)).toBe(0));
  it('selectSupplierGroups', () => expect(sel.selectSupplierGroups(state)).toEqual([]));
  it('selectOrderMethodGroups', () => expect(sel.selectOrderMethodGroups(state)).toEqual([]));
  it('selectOriginalApiData', () => expect(sel.selectOriginalApiData(state)).toEqual([]));
  it('selectItemsWithUrls', () => expect(sel.selectItemsWithUrls(state)).toEqual([]));
  it('selectSelectedItemsForEmail', () => expect(sel.selectSelectedItemsForEmail(state)).toEqual([]));
  it('selectSelectedItemForDetails', () => expect(sel.selectSelectedItemForDetails(state)).toBeNull());
  it('selectOrderQueueActiveTab', () => expect(sel.selectOrderQueueActiveTab(state)).toBe('ready'));
  it('selectGroupBy', () => expect(sel.selectGroupBy(state)).toBe('supplier'));
  it('selectOrderQueueSearchTerm', () => expect(sel.selectOrderQueueSearchTerm(state)).toBe(''));
  it('selectOrderQueueIsLoading', () => expect(sel.selectOrderQueueIsLoading(state)).toBe(false));
  it('selectOrderQueueError', () => expect(sel.selectOrderQueueError(state)).toBeNull());
});
