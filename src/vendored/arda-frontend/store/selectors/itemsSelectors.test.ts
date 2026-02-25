import {
  selectItems,
  selectItemCardsMap,
  selectSelectedItems,
  selectSelectedItem,
  selectItemToEdit,
  selectActiveTab,
  selectSearch,
  selectDebouncedSearch,
  selectPagination,
  selectColumnVisibility,
  selectDrafts,
  selectItemsLoading,
  selectLoadingArdaItems,
  selectLoadingCards,
  selectItemsError,
  selectMaxItemsSeen,
  selectHasUnsavedChanges,
  selectItemById,
  selectItemCards,
  selectColumnVisibilityForTab,
  selectDraft,
} from './itemsSelectors';
import { createTestStore } from '@frontend/test-utils/test-store';
import { createMockItem, createMockKanbanCard } from '@frontend/test-utils/mock-factories';

describe('itemsSelectors', () => {
  const item1 = createMockItem({ entityId: 'e1', name: 'Item 1' });
  const item2 = createMockItem({ entityId: 'e2', name: 'Item 2' });
  const card = createMockKanbanCard();

  function storeWith(overrides: Record<string, unknown>) {
    return createTestStore({
      items: {
        items: [item1, item2],
        itemCardsMap: { e1: [card] },
        selectedItems: [item1],
        selectedItem: item1,
        itemToEdit: null,
        activeTab: 'published',
        search: 'gloves',
        debouncedSearch: 'glov',
        pagination: { currentPage: 2, pageSize: 50, totalItems: 100, hasNextPage: true, hasPreviousPage: true },
        columnVisibility: { published: { sku: false } },
        drafts: { d1: { form: {} as never, createCardOnPublish: true, usingDefaultImage: false } },
        loading: false,
        loadingArdaItems: true,
        loadingCards: { e1: true },
        error: 'oops',
        maxItemsSeen: 42,
        hasUnsavedChanges: true,
        ...overrides,
      } as never,
    });
  }

  it('selectItems returns items array', () => {
    const s = storeWith({});
    expect(selectItems(s.getState())).toHaveLength(2);
  });

  it('selectItemCardsMap returns map', () => {
    expect(selectItemCardsMap(storeWith({}).getState())['e1']).toHaveLength(1);
  });

  it('selectSelectedItems', () => {
    expect(selectSelectedItems(storeWith({}).getState())).toHaveLength(1);
  });

  it('selectSelectedItem', () => {
    expect(selectSelectedItem(storeWith({}).getState())?.entityId).toBe('e1');
  });

  it('selectItemToEdit', () => {
    expect(selectItemToEdit(storeWith({}).getState())).toBeNull();
  });

  it('selectActiveTab', () => {
    expect(selectActiveTab(storeWith({}).getState())).toBe('published');
  });

  it('selectSearch', () => {
    expect(selectSearch(storeWith({}).getState())).toBe('gloves');
  });

  it('selectDebouncedSearch', () => {
    expect(selectDebouncedSearch(storeWith({}).getState())).toBe('glov');
  });

  it('selectPagination', () => {
    expect(selectPagination(storeWith({}).getState()).currentPage).toBe(2);
  });

  it('selectColumnVisibility', () => {
    expect(selectColumnVisibility(storeWith({}).getState())['published']).toEqual({ sku: false });
  });

  it('selectDrafts', () => {
    expect(selectDrafts(storeWith({}).getState())['d1']).toBeDefined();
  });

  it('selectItemsLoading', () => {
    expect(selectItemsLoading(storeWith({}).getState())).toBe(false);
  });

  it('selectLoadingArdaItems', () => {
    expect(selectLoadingArdaItems(storeWith({}).getState())).toBe(true);
  });

  it('selectLoadingCards', () => {
    expect(selectLoadingCards(storeWith({}).getState())['e1']).toBe(true);
  });

  it('selectItemsError', () => {
    expect(selectItemsError(storeWith({}).getState())).toBe('oops');
  });

  it('selectMaxItemsSeen', () => {
    expect(selectMaxItemsSeen(storeWith({}).getState())).toBe(42);
  });

  it('selectHasUnsavedChanges', () => {
    expect(selectHasUnsavedChanges(storeWith({}).getState())).toBe(true);
  });

  // Derived selectors
  it('selectItemById finds item by entityId', () => {
    const state = storeWith({}).getState();
    expect(selectItemById(state, 'e2')?.name).toBe('Item 2');
    expect(selectItemById(state, 'nonexistent')).toBeUndefined();
  });

  it('selectItemCards returns cards or empty array', () => {
    const state = storeWith({}).getState();
    expect(selectItemCards(state, 'e1')).toHaveLength(1);
    expect(selectItemCards(state, 'nope')).toEqual([]);
  });

  it('selectColumnVisibilityForTab returns tab visibility or empty object', () => {
    const state = storeWith({}).getState();
    expect(selectColumnVisibilityForTab(state, 'published')).toEqual({ sku: false });
    expect(selectColumnVisibilityForTab(state, 'draft')).toEqual({});
  });

  it('selectDraft returns draft or null', () => {
    const state = storeWith({}).getState();
    expect(selectDraft(state, 'd1')).not.toBeNull();
    expect(selectDraft(state, 'nope')).toBeNull();
  });
});
