import reducer, {
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
} from './itemsSlice';
import { createMockItem, createMockKanbanCard } from '@frontend/test-utils/mock-factories';

const initialState = reducer(undefined, { type: '@@INIT' });

describe('itemsSlice', () => {
  describe('initial state', () => {
    it('has correct defaults', () => {
      expect(initialState.items).toEqual([]);
      expect(initialState.selectedItems).toEqual([]);
      expect(initialState.selectedItem).toBeNull();
      expect(initialState.activeTab).toBe('published');
      expect(initialState.search).toBe('');
      expect(initialState.pagination.currentPage).toBe(1);
      expect(initialState.pagination.pageSize).toBe(50);
      expect(initialState.loading).toBe(false);
      expect(initialState.error).toBeNull();
    });
  });

  describe('setItems', () => {
    it('replaces items array', () => {
      const items = [createMockItem({ entityId: '1' }), createMockItem({ entityId: '2' })];
      const state = reducer(initialState, setItems(items));
      expect(state.items).toHaveLength(2);
    });
  });

  describe('addItem', () => {
    it('appends an item', () => {
      const item = createMockItem({ entityId: 'new' });
      const state = reducer(initialState, addItem(item));
      expect(state.items).toHaveLength(1);
      expect(state.items[0].entityId).toBe('new');
    });
  });

  describe('updateItem', () => {
    it('updates item by entityId', () => {
      const original = createMockItem({ entityId: '1', name: 'Old' });
      let state = reducer(initialState, setItems([original]));
      const updated = createMockItem({ entityId: '1', name: 'New' });
      state = reducer(state, updateItem(updated));
      expect(state.items[0].name).toBe('New');
    });

    it('does nothing if entityId not found', () => {
      const state = reducer(initialState, setItems([createMockItem({ entityId: '1' })]));
      const result = reducer(state, updateItem(createMockItem({ entityId: 'nonexistent' })));
      expect(result.items).toHaveLength(1);
      expect(result.items[0].entityId).toBe('1');
    });
  });

  describe('removeItem', () => {
    it('removes item and its cards from the map', () => {
      const item = createMockItem({ entityId: 'rm' });
      let state = reducer(initialState, setItems([item]));
      state = reducer(state, setItemCards({ entityId: 'rm', cards: [createMockKanbanCard()] }));
      state = reducer(state, removeItem('rm'));
      expect(state.items).toHaveLength(0);
      expect(state.itemCardsMap['rm']).toBeUndefined();
    });
  });

  describe('selection actions', () => {
    it('setSelectedItems replaces selection', () => {
      const items = [createMockItem({ entityId: 'a' })];
      const state = reducer(initialState, setSelectedItems(items));
      expect(state.selectedItems).toHaveLength(1);
    });

    it('toggleItemSelection adds and removes', () => {
      const item = createMockItem({ entityId: 'a' });
      let state = reducer(initialState, toggleItemSelection(item));
      expect(state.selectedItems).toHaveLength(1);
      state = reducer(state, toggleItemSelection(item));
      expect(state.selectedItems).toHaveLength(0);
    });

    it('clearSelection resets selection and selectedItem', () => {
      let state = reducer(initialState, setSelectedItems([createMockItem()]));
      state = reducer(state, setSelectedItem(createMockItem()));
      state = reducer(state, clearSelection());
      expect(state.selectedItems).toHaveLength(0);
      expect(state.selectedItem).toBeNull();
    });

    it('setSelectedItem sets current item', () => {
      const item = createMockItem();
      const state = reducer(initialState, setSelectedItem(item));
      expect(state.selectedItem).toEqual(item);
    });
  });

  describe('setItemToEdit', () => {
    it('sets and clears itemToEdit', () => {
      const item = createMockItem();
      const state = reducer(initialState, setItemToEdit(item));
      expect(state.itemToEdit).toEqual(item);
      const cleared = reducer(state, setItemToEdit(null));
      expect(cleared.itemToEdit).toBeNull();
    });
  });

  describe('tab and search', () => {
    it('setActiveTab', () => {
      expect(reducer(initialState, setActiveTab('draft')).activeTab).toBe('draft');
      expect(reducer(initialState, setActiveTab('uploaded')).activeTab).toBe('uploaded');
    });

    it('setSearch', () => {
      expect(reducer(initialState, setSearch('gloves')).search).toBe('gloves');
    });

    it('setDebouncedSearch', () => {
      expect(reducer(initialState, setDebouncedSearch('gl')).debouncedSearch).toBe('gl');
    });
  });

  describe('setPagination', () => {
    it('replaces pagination state', () => {
      const pag = {
        currentPage: 3,
        pageSize: 25,
        totalItems: 100,
        hasNextPage: true,
        hasPreviousPage: true,
      };
      const state = reducer(initialState, setPagination(pag));
      expect(state.pagination).toEqual(pag);
    });
  });

  describe('setColumnVisibility', () => {
    it('sets visibility per tab', () => {
      const state = reducer(initialState, setColumnVisibility({
        tab: 'published',
        visibility: { sku: false },
      }));
      expect(state.columnVisibility['published']).toEqual({ sku: false });
    });
  });

  describe('setItemCards', () => {
    it('sets cards for an entity', () => {
      const card = createMockKanbanCard();
      const state = reducer(initialState, setItemCards({ entityId: 'e1', cards: [card] }));
      expect(state.itemCardsMap['e1']).toHaveLength(1);
    });
  });

  describe('drafts', () => {
    it('saveDraft stores draft and clearDraft removes it', () => {
      const draft = {
        form: {} as never,
        createCardOnPublish: true,
        usingDefaultImage: false,
      };
      let state = reducer(initialState, saveDraft({ entityId: 'd1', draft }));
      expect(state.drafts['d1']).toEqual(draft);
      state = reducer(state, clearDraft('d1'));
      expect(state.drafts['d1']).toBeUndefined();
    });
  });

  describe('loading states', () => {
    it('setLoading', () => {
      expect(reducer(initialState, setLoading(true)).loading).toBe(true);
    });

    it('setLoadingArdaItems', () => {
      expect(reducer(initialState, setLoadingArdaItems(true)).loadingArdaItems).toBe(true);
    });

    it('setLoadingCards', () => {
      const state = reducer(initialState, setLoadingCards({ entityId: 'e1', loading: true }));
      expect(state.loadingCards['e1']).toBe(true);
    });

    it('setError', () => {
      const state = reducer(initialState, setError('fail'));
      expect(state.error).toBe('fail');
      expect(reducer(state, setError(null)).error).toBeNull();
    });
  });

  describe('UI flags', () => {
    it('setMaxItemsSeen', () => {
      expect(reducer(initialState, setMaxItemsSeen(42)).maxItemsSeen).toBe(42);
    });

    it('setHasUnsavedChanges', () => {
      expect(reducer(initialState, setHasUnsavedChanges(true)).hasUnsavedChanges).toBe(true);
    });
  });
});
