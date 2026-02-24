import reducer, {
  setReadyToOrderCount,
  setTotalItemsCount,
  setMissingUrlCount,
  setSupplierGroups,
  setOrderMethodGroups,
  setOriginalApiData,
  setItemsWithUrls,
  setSelectedItemsForEmail,
  setSelectedItemForDetails,
  setActiveTab,
  setGroupBy,
  setSearchTerm,
  setIsLoading,
  setError,
} from './orderQueueSlice';
import type { SupplierGroup, OrderMethodGroup, OrderItem } from './orderQueueSlice';

const initialState = reducer(undefined, { type: '@@INIT' });

const mockOrderItem: OrderItem = {
  id: 'oi-1',
  name: 'Scalpel',
  quantity: '20',
  orderMethod: 'Online',
  status: 'Ready to order',
  supplier: 'SurgCo',
};

describe('orderQueueSlice', () => {
  describe('initial state', () => {
    it('has correct defaults', () => {
      expect(initialState.readyToOrderCount).toBe(0);
      expect(initialState.totalItemsCount).toBe(0);
      expect(initialState.missingUrlCount).toBe(0);
      expect(initialState.supplierGroups).toEqual([]);
      expect(initialState.activeTab).toBe('ready');
      expect(initialState.groupBy).toBe('supplier');
      expect(initialState.searchTerm).toBe('');
      expect(initialState.isLoading).toBe(false);
      expect(initialState.error).toBeNull();
    });
  });

  describe('count setters', () => {
    it('setReadyToOrderCount', () => {
      expect(reducer(initialState, setReadyToOrderCount(10)).readyToOrderCount).toBe(10);
    });

    it('setTotalItemsCount', () => {
      expect(reducer(initialState, setTotalItemsCount(50)).totalItemsCount).toBe(50);
    });

    it('setMissingUrlCount', () => {
      expect(reducer(initialState, setMissingUrlCount(3)).missingUrlCount).toBe(3);
    });
  });

  describe('setSupplierGroups', () => {
    it('sets supplier groups', () => {
      const group: SupplierGroup = {
        name: 'SurgCo',
        orderMethod: 'Online',
        items: [mockOrderItem],
        expanded: true,
      };
      const state = reducer(initialState, setSupplierGroups([group]));
      expect(state.supplierGroups).toHaveLength(1);
    });
  });

  describe('setOrderMethodGroups', () => {
    it('sets order method groups', () => {
      const group: OrderMethodGroup = {
        name: 'Online',
        orderMethod: 'Online',
        items: [mockOrderItem],
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

  describe('setItemsWithUrls', () => {
    it('sets items with URLs', () => {
      const state = reducer(initialState, setItemsWithUrls([mockOrderItem]));
      expect(state.itemsWithUrls).toHaveLength(1);
    });
  });

  describe('email selection', () => {
    it('setSelectedItemsForEmail', () => {
      const state = reducer(initialState, setSelectedItemsForEmail([mockOrderItem]));
      expect(state.selectedItemsForEmail).toHaveLength(1);
    });
  });

  describe('setSelectedItemForDetails', () => {
    it('sets and clears', () => {
      const state = reducer(initialState, setSelectedItemForDetails(null));
      expect(state.selectedItemForDetails).toBeNull();
    });
  });

  describe('UI state', () => {
    it('setActiveTab', () => {
      expect(reducer(initialState, setActiveTab('recent')).activeTab).toBe('recent');
    });

    it('setGroupBy', () => {
      expect(reducer(initialState, setGroupBy('orderMethod')).groupBy).toBe('orderMethod');
      expect(reducer(initialState, setGroupBy('none')).groupBy).toBe('none');
    });

    it('setSearchTerm', () => {
      expect(reducer(initialState, setSearchTerm('scalpel')).searchTerm).toBe('scalpel');
    });
  });

  describe('loading', () => {
    it('setIsLoading', () => {
      expect(reducer(initialState, setIsLoading(true)).isLoading).toBe(true);
    });

    it('setError', () => {
      const state = reducer(initialState, setError('API down'));
      expect(state.error).toBe('API down');
      expect(reducer(state, setError(null)).error).toBeNull();
    });
  });
});
