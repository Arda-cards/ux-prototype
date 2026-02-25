import reducer, {
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
} from './receivingSlice';
import type { ReceivingItem, ReceivingSupplierGroup, ReceivingOrderMethodGroup } from './receivingSlice';

const initialState = reducer(undefined, { type: '@@INIT' });

const mockReceivingItem: ReceivingItem = {
  id: 'ri-1',
  name: 'Bandage',
  quantity: '50',
  orderMethod: 'Online',
  status: 'in_proccess',
  supplier: 'MedCo',
};

describe('receivingSlice', () => {
  describe('initial state', () => {
    it('has correct defaults', () => {
      expect(initialState.receivingItems).toEqual([]);
      expect(initialState.selectedItems).toEqual([]);
      expect(initialState.activeTab).toBe('inTransit');
      expect(initialState.searchTerm).toBe('');
      expect(initialState.currentPage).toBe(0);
      expect(initialState.hasMore).toBe(true);
      expect(initialState.isLoading).toBe(false);
      expect(initialState.isLoadingMore).toBe(false);
      expect(initialState.error).toBeNull();
    });
  });

  describe('setReceivingItems', () => {
    it('replaces items', () => {
      const state = reducer(initialState, setReceivingItems([mockReceivingItem]));
      expect(state.receivingItems).toHaveLength(1);
      expect(state.receivingItems[0].id).toBe('ri-1');
    });
  });

  describe('setSupplierGroups', () => {
    it('sets supplier groups', () => {
      const group: ReceivingSupplierGroup = {
        name: 'MedCo',
        orderMethod: 'Online',
        items: [mockReceivingItem],
        expanded: true,
      };
      const state = reducer(initialState, setSupplierGroups([group]));
      expect(state.supplierGroups).toHaveLength(1);
      expect(state.supplierGroups[0].name).toBe('MedCo');
    });
  });

  describe('setOrderMethodGroups', () => {
    it('sets order method groups', () => {
      const group: ReceivingOrderMethodGroup = {
        name: 'Online',
        orderMethod: 'Online',
        items: [mockReceivingItem],
        expanded: false,
      };
      const state = reducer(initialState, setOrderMethodGroups([group]));
      expect(state.orderMethodGroups).toHaveLength(1);
    });
  });

  describe('setOriginalApiData', () => {
    it('stores raw API data', () => {
      const state = reducer(initialState, setOriginalApiData([]));
      expect(state.originalApiData).toEqual([]);
    });
  });

  describe('selection', () => {
    it('setSelectedItems replaces selection', () => {
      const state = reducer(initialState, setSelectedItems(['a', 'b']));
      expect(state.selectedItems).toEqual(['a', 'b']);
    });

    it('toggleItemSelection adds then removes', () => {
      let state = reducer(initialState, toggleItemSelection('x'));
      expect(state.selectedItems).toEqual(['x']);
      state = reducer(state, toggleItemSelection('x'));
      expect(state.selectedItems).toEqual([]);
    });
  });

  describe('setSelectedItemForDetails', () => {
    it('sets and clears', () => {
      const state = reducer(initialState, setSelectedItemForDetails(null));
      expect(state.selectedItemForDetails).toBeNull();
    });
  });

  describe('setActiveTab', () => {
    it.each(['inTransit', 'received', 'fulfilled'] as const)('sets tab to %s', (tab) => {
      expect(reducer(initialState, setActiveTab(tab)).activeTab).toBe(tab);
    });
  });

  describe('setSearchTerm', () => {
    it('sets search term', () => {
      expect(reducer(initialState, setSearchTerm('bandage')).searchTerm).toBe('bandage');
    });
  });

  describe('setFilters', () => {
    it('sets filters object', () => {
      const state = reducer(initialState, setFilters({ status: 'received' }));
      expect(state.filters).toEqual({ status: 'received' });
    });
  });

  describe('pagination', () => {
    it('setCurrentPage', () => {
      expect(reducer(initialState, setCurrentPage(5)).currentPage).toBe(5);
    });

    it('setHasMore', () => {
      expect(reducer(initialState, setHasMore(false)).hasMore).toBe(false);
    });
  });

  describe('loading states', () => {
    it('setIsLoading', () => {
      expect(reducer(initialState, setIsLoading(true)).isLoading).toBe(true);
    });

    it('setIsLoadingMore', () => {
      expect(reducer(initialState, setIsLoadingMore(true)).isLoadingMore).toBe(true);
    });

    it('setError', () => {
      const state = reducer(initialState, setError('Network error'));
      expect(state.error).toBe('Network error');
      expect(reducer(state, setError(null)).error).toBeNull();
    });
  });
});
