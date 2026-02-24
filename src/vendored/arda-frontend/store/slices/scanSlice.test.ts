import reducer, {
  addScannedItem,
  removeScannedItem,
  clearScannedItems,
  setSelectedItems,
  toggleItemSelection,
  setSelectedFilters,
  setCurrentView,
  setScanning,
  setCameraError,
  setScanComplete,
  setQrDetected,
  setInitialCardLoaded,
  setActiveCardId,
  setItemToEdit,
  setSelectedItemForDetails,
  setColumnVisibility,
  setCardsCantAddCount,
  setCardsCantReceiveCount,
  setIsAllSelected,
  setModalOpen,
} from './scanSlice';
import type { ScannedItem } from './scanSlice';
import { createMockItem } from '@frontend/test-utils/mock-factories';

const initialState = reducer(undefined, { type: '@@INIT' });

function createScannedItem(id: string): ScannedItem {
  return {
    id,
    cardData: {
      rId: `r-${id}`,
      asOf: { effective: 1000, recorded: 1000 },
      payload: {
        eId: `e-${id}`,
        rId: `r-${id}`,
        lookupUrlId: `url-${id}`,
        serialNumber: `SN-${id}`,
        item: { type: 'Item', eId: 'item-1', name: 'Test Item' },
        itemDetails: {
          eId: 'item-1',
          name: 'Test Item',
          notes: '',
          cardNotesDefault: '',
          primarySupply: {
            supplier: 'Sup',
            orderQuantity: { amount: 10, unit: 'Each' },
            unitCost: { value: 5, currency: 'USD' },
          },
          defaultSupply: 'PRIMARY',
          cardSize: 'STANDARD',
          labelSize: 'SMALL',
          breadcrumbSize: 'SMALL',
          itemColor: '#000',
        },
        cardQuantity: { amount: 1, unit: 'Each' },
        status: 'ACTIVE',
        printStatus: 'PRINTED',
      },
      metadata: { tenantId: 'tenant-1' },
      author: 'test@test.com',
      retired: false,
    },
  };
}

describe('scanSlice', () => {
  describe('initial state', () => {
    it('returns correct defaults', () => {
      expect(initialState.scannedItems).toEqual([]);
      expect(initialState.selectedItems).toEqual([]);
      expect(initialState.currentView).toBe('scan');
      expect(initialState.scanning).toBe(false);
      expect(initialState.cameraError).toBeNull();
      expect(initialState.scanComplete).toBe(false);
      expect(initialState.qrDetected).toBe(false);
      expect(initialState.initialCardLoaded).toBe(false);
      expect(initialState.activeCardId).toBeNull();
      expect(initialState.itemToEdit).toBeNull();
      expect(initialState.selectedItemForDetails).toBeNull();
      expect(initialState.isItemDetailsPanelOpen).toBe(false);
      expect(initialState.isEditFormOpen).toBe(false);
    });
  });

  describe('addScannedItem', () => {
    it('adds a new scanned item', () => {
      const item = createScannedItem('1');
      const state = reducer(initialState, addScannedItem(item));
      expect(state.scannedItems).toHaveLength(1);
      expect(state.scannedItems[0].id).toBe('1');
    });

    it('does not add duplicates', () => {
      const item = createScannedItem('1');
      let state = reducer(initialState, addScannedItem(item));
      state = reducer(state, addScannedItem(item));
      expect(state.scannedItems).toHaveLength(1);
    });
  });

  describe('removeScannedItem', () => {
    it('removes item by id and clears from selectedItems', () => {
      const item = createScannedItem('1');
      let state = reducer(initialState, addScannedItem(item));
      state = reducer(state, setSelectedItems(['1']));
      state = reducer(state, removeScannedItem('1'));
      expect(state.scannedItems).toHaveLength(0);
      expect(state.selectedItems).not.toContain('1');
    });
  });

  describe('clearScannedItems', () => {
    it('clears all scanned items and selection', () => {
      let state = reducer(initialState, addScannedItem(createScannedItem('1')));
      state = reducer(state, addScannedItem(createScannedItem('2')));
      state = reducer(state, setSelectedItems(['1', '2']));
      state = reducer(state, clearScannedItems());
      expect(state.scannedItems).toHaveLength(0);
      expect(state.selectedItems).toHaveLength(0);
    });
  });

  describe('setSelectedItems', () => {
    it('replaces selected items array', () => {
      const state = reducer(initialState, setSelectedItems(['a', 'b']));
      expect(state.selectedItems).toEqual(['a', 'b']);
    });
  });

  describe('toggleItemSelection', () => {
    it('adds item if not selected', () => {
      const state = reducer(initialState, toggleItemSelection('a'));
      expect(state.selectedItems).toContain('a');
    });

    it('removes item if already selected', () => {
      let state = reducer(initialState, setSelectedItems(['a', 'b']));
      state = reducer(state, toggleItemSelection('a'));
      expect(state.selectedItems).toEqual(['b']);
    });
  });

  describe('setSelectedFilters', () => {
    it('sets filter array', () => {
      const state = reducer(initialState, setSelectedFilters(['f1', 'f2']));
      expect(state.selectedFilters).toEqual(['f1', 'f2']);
    });
  });

  describe('setCurrentView', () => {
    it.each(['scan', 'list', 'card'] as const)('sets view to %s', (view) => {
      const state = reducer(initialState, setCurrentView(view));
      expect(state.currentView).toBe(view);
    });
  });

  describe('simple boolean setters', () => {
    it('setScanning', () => {
      expect(reducer(initialState, setScanning(true)).scanning).toBe(true);
    });

    it('setScanComplete', () => {
      expect(reducer(initialState, setScanComplete(true)).scanComplete).toBe(true);
    });

    it('setQrDetected', () => {
      expect(reducer(initialState, setQrDetected(true)).qrDetected).toBe(true);
    });

    it('setInitialCardLoaded', () => {
      expect(reducer(initialState, setInitialCardLoaded(true)).initialCardLoaded).toBe(true);
    });

    it('setIsAllSelected', () => {
      expect(reducer(initialState, setIsAllSelected(true)).isAllSelected).toBe(true);
    });
  });

  describe('setCameraError', () => {
    it('sets and clears camera error', () => {
      const state = reducer(initialState, setCameraError('No camera found'));
      expect(state.cameraError).toBe('No camera found');
      const cleared = reducer(state, setCameraError(null));
      expect(cleared.cameraError).toBeNull();
    });
  });

  describe('setActiveCardId', () => {
    it('sets and clears active card', () => {
      const state = reducer(initialState, setActiveCardId('card-1'));
      expect(state.activeCardId).toBe('card-1');
      expect(reducer(state, setActiveCardId(null)).activeCardId).toBeNull();
    });
  });

  describe('setItemToEdit', () => {
    it('sets item to edit', () => {
      const item = createMockItem();
      const state = reducer(initialState, setItemToEdit(item));
      expect(state.itemToEdit).toEqual(item);
    });
  });

  describe('setSelectedItemForDetails', () => {
    it('sets and clears selected item for details', () => {
      const state = reducer(initialState, setSelectedItemForDetails(null));
      expect(state.selectedItemForDetails).toBeNull();
    });
  });

  describe('setColumnVisibility', () => {
    it('replaces column visibility map', () => {
      const vis = { sku: false, image: true, item: true };
      const state = reducer(initialState, setColumnVisibility(vis));
      expect(state.columnVisibility.sku).toBe(false);
    });
  });

  describe('count setters', () => {
    it('setCardsCantAddCount', () => {
      expect(reducer(initialState, setCardsCantAddCount(5)).cardsCantAddCount).toBe(5);
    });

    it('setCardsCantReceiveCount', () => {
      expect(reducer(initialState, setCardsCantReceiveCount(3)).cardsCantReceiveCount).toBe(3);
    });
  });

  describe('setModalOpen', () => {
    it.each([
      'isItemDetailsPanelOpen',
      'isEditFormOpen',
      'isClearItemsModalOpen',
      'isCantAddCardsModalOpen',
      'isCantReceiveCardsModalOpen',
    ] as const)('opens and closes %s', (modal) => {
      const opened = reducer(initialState, setModalOpen({ modal, open: true }));
      expect(opened[modal]).toBe(true);
      const closed = reducer(opened, setModalOpen({ modal, open: false }));
      expect(closed[modal]).toBe(false);
    });
  });
});
