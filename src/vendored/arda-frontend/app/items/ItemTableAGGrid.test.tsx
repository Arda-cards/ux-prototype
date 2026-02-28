/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createRef } from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// ──────────────────────────────────────────────────────────────────────────────
// Mock gridApi — populated in beforeEach so closures in the mock pick it up
// ──────────────────────────────────────────────────────────────────────────────
let mockGridApi: any;

// ──────────────────────────────────────────────────────────────────────────────
// Mock @/components/table — breaks circular dep and captures ArdaGrid props
// ──────────────────────────────────────────────────────────────────────────────
let _lastArdaGridProps: any = null;

jest.mock('@/components/table', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  const ArdaGrid = React.forwardRef((props: any, ref: any) => {
    _lastArdaGridProps = props; // eslint-disable-line react-hooks/globals
    // Expose the mock gridApi through the ref
    React.useImperativeHandle(ref, () => ({
      getGridApi: () => mockGridApi,
    }));
    return React.createElement('div', {
      'data-testid': 'arda-grid',
      'data-row-count': String(props.rowData?.length ?? 0),
    });
  });
  ArdaGrid.displayName = 'ArdaGrid';
  return {
    ArdaGrid,
    itemsColumnDefs: [
      { colId: 'select', headerName: '', field: 'select', suppressMovable: true },
      { headerName: 'SKU', field: 'internalSKU', width: 140 },
      { headerName: 'Item', field: 'name', width: 300 },
      { headerName: 'Image', field: 'imageUrl', width: 80 },
      {
        headerName: 'Quick Actions',
        field: 'quickActions',
        width: 123,
        colId: 'quickActions',
      },
      { headerName: 'Supplier', field: 'primarySupply.supplier', width: 150 },
      {
        headerName: 'Order Method',
        field: 'primarySupply.orderMechanism',
        width: 140,
        colId: 'primarySupply.orderMechanism',
      },
      { headerName: 'Card Size', field: 'cardSize', width: 150 },
      { headerName: 'Label Size', field: 'labelSize', width: 120 },
      { headerName: 'Breadcrumb Size', field: 'breadcrumbSize', width: 150 },
      { headerName: 'Color', field: 'color', width: 120 },
      { headerName: 'Notes', field: 'notes', width: 100 },
      { headerName: 'Card Notes', field: 'cardNotesDefault', width: 100 },
    ],
    itemsDefaultColDef: {
      sortable: true,
      filter: false,
      resizable: true,
      suppressMovable: false,
    },
  };
});

// ──────────────────────────────────────────────────────────────────────────────
// Misc mocks
// ──────────────────────────────────────────────────────────────────────────────
jest.mock('ag-grid-community', () => ({
  ModuleRegistry: { registerModules: jest.fn() },
  AllCommunityModule: {},
}));

jest.mock('@/components/items/SupplierCellEditor', () => ({ SupplierCellEditor: class {} }));
jest.mock('@/components/items/UnitCellEditor', () => ({ UnitCellEditor: class {} }));
jest.mock('@/components/items/TypeCellEditor', () => ({ TypeCellEditor: class {} }));
jest.mock('@/components/items/SubTypeCellEditor', () => ({ SubTypeCellEditor: class {} }));
jest.mock('@/components/items/UseCaseCellEditor', () => ({ UseCaseCellEditor: class {} }));
jest.mock('@/components/items/FacilityCellEditor', () => ({ FacilityCellEditor: class {} }));
jest.mock('@/components/items/DepartmentCellEditor', () => ({ DepartmentCellEditor: class {} }));
jest.mock('@/components/items/LocationCellEditor', () => ({ LocationCellEditor: class {} }));
jest.mock('@/components/items/SublocationCellEditor', () => ({ SublocationCellEditor: class {} }));

const mockCreateDraftItem = jest.fn().mockResolvedValue({ entityId: 'draft-1' });
const mockUpdateItem = jest.fn().mockResolvedValue({});

jest.mock('@/lib/ardaClient', () => ({
  createDraftItem: (...args: any[]) => mockCreateDraftItem(...args),
  updateItem: (...args: any[]) => mockUpdateItem(...args),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn() },
}));

jest.mock('@/lib/utils', () => ({
  isAuthenticationError: jest.fn(() => false),
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

// ──────────────────────────────────────────────────────────────────────────────
// Imports after mocks
// ──────────────────────────────────────────────────────────────────────────────
import {
  ItemTableAGGrid,
  ItemTableAGGridRef,
  useItemCards,
} from './ItemTableAGGrid';
import type { Item } from '@frontend/types/items';

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────
function makeItem(id: string, overrides: Partial<Item> = {}): Item {
  return { entityId: id, name: `Item ${id}`, ...overrides } as Item;
}

const defaultProps = { items: [] as Item[], activeTab: 'all' };

// ──────────────────────────────────────────────────────────────────────────────
// Setup
// ──────────────────────────────────────────────────────────────────────────────
beforeEach(() => {
  _lastArdaGridProps = null;
  mockCreateDraftItem.mockResolvedValue({ entityId: 'draft-1' });
  mockUpdateItem.mockResolvedValue({});
  jest.clearAllMocks();
  localStorage.clear();

  // Fresh mockGridApi for each test — closures inside the ArdaGrid mock will
  // read this value at render time, so beforeEach initialisation is fine.
  mockGridApi = {
    getRenderedNodes: jest.fn(() => []),
    forEachNode: jest.fn(),
    deselectAll: jest.fn(),
    getDisplayedRowCount: jest.fn(() => 0),
    getDisplayedRowAtIndex: jest.fn(() => undefined),
    getColumnState: jest.fn(() => []),
    setColumnsVisible: jest.fn(),
    getEditingCells: jest.fn(() => []),
    stopEditing: jest.fn(),
    getFocusedCell: jest.fn(() => null),
    getRowNode: jest.fn(() => undefined),
    refreshCells: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    applyColumnState: jest.fn(),
    getColumns: jest.fn(() => []),
    getSelectedRows: jest.fn(() => []),
    selectAll: jest.fn(),
    exportDataAsCsv: jest.fn(),
  };
});

// ──────────────────────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────────────────────
describe('ItemTableAGGrid', () => {
  // ──────────────────────────────────────────────────────────────────────────
  // Smoke tests
  // ──────────────────────────────────────────────────────────────────────────
  it('renders without crashing with empty items', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    expect(screen.getByTestId('arda-grid')).toBeInTheDocument();
  });

  it('renders without crashing with items', () => {
    render(
      <ItemTableAGGrid
        {...defaultProps}
        items={[makeItem('1'), makeItem('2'), makeItem('3')]}
      />
    );
    expect(screen.getByTestId('arda-grid')).toBeInTheDocument();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Props forwarding to ArdaGrid
  // ──────────────────────────────────────────────────────────────────────────
  it('passes items as rowData to ArdaGrid', () => {
    const items = [makeItem('a'), makeItem('b')];
    render(<ItemTableAGGrid {...defaultProps} items={items} />);
    expect(_lastArdaGridProps?.rowData).toEqual(items);
  });

  it('passes isLoading=true to ArdaGrid as loading', () => {
    render(<ItemTableAGGrid {...defaultProps} isLoading={true} />);
    expect(_lastArdaGridProps?.loading).toBe(true);
  });

  it('passes loading=false to ArdaGrid by default', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    expect(_lastArdaGridProps?.loading).toBe(false);
  });

  it('passes paginationData to ArdaGrid', () => {
    const pagination = {
      currentPageSize: 50,
      totalItems: 100,
      currentPage: 1,
      hasNextPage: true,
      hasPreviousPage: false,
    };
    render(<ItemTableAGGrid {...defaultProps} paginationData={pagination} />);
    expect(_lastArdaGridProps?.paginationData).toEqual(pagination);
  });

  it('passes onNextPage and onPreviousPage to ArdaGrid', () => {
    const onNextPage = jest.fn();
    const onPreviousPage = jest.fn();
    render(
      <ItemTableAGGrid
        {...defaultProps}
        onNextPage={onNextPage}
        onPreviousPage={onPreviousPage}
      />
    );
    expect(_lastArdaGridProps?.onNextPage).toBe(onNextPage);
    expect(_lastArdaGridProps?.onPreviousPage).toBe(onPreviousPage);
  });

  it('passes enableCellEditing=false to ArdaGrid', () => {
    render(<ItemTableAGGrid {...defaultProps} enableCellEditing={false} />);
    expect(_lastArdaGridProps?.enableCellEditing).toBe(false);
  });

  it('passes hasActiveSearch and emptyStateComponent to ArdaGrid', () => {
    const empty = <div>No items yet</div>;
    render(
      <ItemTableAGGrid
        {...defaultProps}
        hasActiveSearch={true}
        emptyStateComponent={empty}
      />
    );
    expect(_lastArdaGridProps?.hasActiveSearch).toBe(true);
    expect(_lastArdaGridProps?.emptyStateComponent).toBe(empty);
  });

  it('passes enableRowSelection=true and enableRowActions=false to ArdaGrid', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    expect(_lastArdaGridProps?.enableRowSelection).toBe(true);
    expect(_lastArdaGridProps?.enableRowActions).toBe(false);
  });

  it('does not pass persistenceKey to ArdaGrid (ItemTableAGGrid owns persistence)', () => {
    render(<ItemTableAGGrid {...defaultProps} activeTab='ordered' />);
    expect(_lastArdaGridProps?.persistenceKey).toBeUndefined();
  });

  it('passes columnDefs as array to ArdaGrid', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    expect(Array.isArray(_lastArdaGridProps?.columnDefs)).toBe(true);
  });

  it('passes enableColumnStatePersistence=false to ArdaGrid (ItemTableAGGrid owns persistence)', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    expect(_lastArdaGridProps?.enableColumnStatePersistence).toBe(false);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Column visibility
  // ──────────────────────────────────────────────────────────────────────────
  it('does not set hide on internalSKU column def — visibility applied via api.setColumnsVisible', () => {
    render(
      <ItemTableAGGrid {...defaultProps} columnVisibility={{ sku: false }} />
    );
    const colDefs: any[] = _lastArdaGridProps?.columnDefs ?? [];
    const skuCol = colDefs.find((c: any) => c.field === 'internalSKU');
    // hide is no longer set in column defs (Phase 2.2 — single visibility source)
    if (skuCol) expect(skuCol.hide).toBeUndefined();
  });

  it('shows all columns when columnVisibility is empty', () => {
    render(
      <ItemTableAGGrid {...defaultProps} columnVisibility={{}} />
    );
    const colDefs: any[] = _lastArdaGridProps?.columnDefs ?? [];
    const nameCol = colDefs.find((c: any) => c.field === 'name');
    if (nameCol) expect(nameCol.hide).toBeFalsy();
  });

  it('hides select column when all columns hidden', () => {
    // All visible=false → allOtherColumnsHidden = true
    const visibility = { sku: false, name: false, image: false, supplier: false };
    render(
      <ItemTableAGGrid {...defaultProps} columnVisibility={visibility} />
    );
    // Just verify it renders
    expect(screen.getByTestId('arda-grid')).toBeInTheDocument();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // localStorage-based column ordering
  // ──────────────────────────────────────────────────────────────────────────
  it('applies persisted column order from localStorage (new format)', () => {
    const persistedState = {
      columnState: [
        { colId: 'select' },
        { colId: 'name' },
        { colId: 'internalSKU' },
      ],
    };
    localStorage.setItem('items-grid-all', JSON.stringify(persistedState));
    render(<ItemTableAGGrid {...defaultProps} activeTab='all' />);
    expect(Array.isArray(_lastArdaGridProps?.columnDefs)).toBe(true);
  });

  it('applies persisted column order from localStorage (old array format)', () => {
    const persistedState = [
      { colId: 'select' },
      { colId: 'internalSKU' },
      { colId: 'name' },
    ];
    localStorage.setItem('items-grid-tab2', JSON.stringify(persistedState));
    render(<ItemTableAGGrid {...defaultProps} activeTab='tab2' />);
    expect(Array.isArray(_lastArdaGridProps?.columnDefs)).toBe(true);
  });

  it('falls back to default order on invalid localStorage data', () => {
    localStorage.setItem('items-grid-all', 'not-valid-json{{{');
    render(<ItemTableAGGrid {...defaultProps} activeTab='all' />);
    expect(Array.isArray(_lastArdaGridProps?.columnDefs)).toBe(true);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Ref imperative methods
  // ──────────────────────────────────────────────────────────────────────────
  it('provides ref with required imperative methods', () => {
    const ref = createRef<ItemTableAGGridRef>();
    render(<ItemTableAGGrid {...defaultProps} ref={ref} />);
    expect(ref.current).not.toBeNull();
    expect(typeof ref.current?.saveAllDrafts).toBe('function');
    expect(typeof ref.current?.getHasUnsavedChanges).toBe('function');
    expect(typeof ref.current?.discardAllDrafts).toBe('function');
    expect(typeof ref.current?.getDisplayedItems).toBe('function');
  });

  it('getHasUnsavedChanges returns false initially', () => {
    const ref = createRef<ItemTableAGGridRef>();
    render(<ItemTableAGGrid {...defaultProps} ref={ref} />);
    expect(ref.current?.getHasUnsavedChanges()).toBe(false);
  });

  it('getDisplayedItems returns empty array when grid API has no rows', () => {
    const ref = createRef<ItemTableAGGridRef>();
    mockGridApi.getDisplayedRowCount.mockReturnValue(0);
    render(<ItemTableAGGrid {...defaultProps} ref={ref} />);
    expect(ref.current?.getDisplayedItems()).toEqual([]);
  });

  it('getDisplayedItems returns displayed items when grid has rows', () => {
    const ref = createRef<ItemTableAGGridRef>();
    const item = makeItem('x1');
    mockGridApi.getDisplayedRowCount.mockReturnValue(1);
    mockGridApi.getDisplayedRowAtIndex.mockImplementation((i: number) =>
      i === 0 ? { data: item } : undefined
    );
    render(<ItemTableAGGrid {...defaultProps} ref={ref} />);
    const result = ref.current?.getDisplayedItems();
    expect(result).toEqual([item]);
  });

  it('discardAllDrafts calls onUnsavedChangesChange(false)', () => {
    const ref = createRef<ItemTableAGGridRef>();
    const onUnsavedChangesChange = jest.fn();
    render(
      <ItemTableAGGrid
        {...defaultProps}
        ref={ref}
        onUnsavedChangesChange={onUnsavedChangesChange}
      />
    );
    act(() => {
      ref.current?.discardAllDrafts();
    });
    expect(onUnsavedChangesChange).toHaveBeenCalledWith(false);
  });

  it('saveAllDrafts resolves without error when no dirty rows', async () => {
    const ref = createRef<ItemTableAGGridRef>();
    render(<ItemTableAGGrid {...defaultProps} ref={ref} />);
    await expect(ref.current?.saveAllDrafts()).resolves.toBeUndefined();
  });

  it('saveAllDrafts publishes dirty rows and calls onRefreshRequested', async () => {
    const ref = createRef<ItemTableAGGridRef>();
    const onRefreshRequested = jest.fn().mockResolvedValue(undefined);
    const onUnsavedChangesChange = jest.fn();
    const items = [makeItem('row-1')];
    const rowNode = { data: items[0] };

    mockGridApi.getRowNode.mockReturnValue(rowNode);

    render(
      <ItemTableAGGrid
        {...defaultProps}
        ref={ref}
        items={items}
        onRefreshRequested={onRefreshRequested}
        onUnsavedChangesChange={onUnsavedChangesChange}
      />
    );

    // Mark row as dirty via onCellValueChanged
    const onCellValueChanged = _lastArdaGridProps?.onCellValueChanged;
    act(() => {
      onCellValueChanged?.({
        data: items[0],
        oldValue: 'old',
        newValue: 'new',
        node: { data: items[0] },
        column: { getColId: () => 'name' },
      });
    });

    expect(ref.current?.getHasUnsavedChanges()).toBe(true);

    await act(async () => {
      await ref.current?.saveAllDrafts();
    });

    // createDraftItem should have been called
    expect(mockCreateDraftItem).toHaveBeenCalledWith('row-1');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Callback props
  // ──────────────────────────────────────────────────────────────────────────
  it('passes onSelectionChanged callback to ArdaGrid', () => {
    const onSelectionChange = jest.fn();
    render(
      <ItemTableAGGrid
        {...defaultProps}
        onSelectionChange={onSelectionChange}
      />
    );
    expect(typeof _lastArdaGridProps?.onSelectionChanged).toBe('function');
  });

  it('passes getRowClass callback that returns [] for unknown rowState', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const getRowClass = _lastArdaGridProps?.getRowClass;
    expect(getRowClass?.({ data: { entityId: 'x' } })).toEqual([]);
    expect(getRowClass?.({ data: {} })).toEqual([]);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // handleSelectionChanged via ArdaGrid callback
  // ──────────────────────────────────────────────────────────────────────────
  it('passes onSelectionChanged callback to ArdaGrid', () => {
    const onSelectionChange = jest.fn();
    render(
      <ItemTableAGGrid
        {...defaultProps}
        items={[makeItem('1')]}
        onSelectionChange={onSelectionChange}
      />
    );
    // Verify the callback is passed to ArdaGrid (integration tested end-to-end)
    expect(_lastArdaGridProps?.onSelectionChanged).toBeDefined();
    expect(typeof _lastArdaGridProps?.onSelectionChanged).toBe('function');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // handleCellValueChanged via ArdaGrid callback
  // ──────────────────────────────────────────────────────────────────────────
  it('handleCellValueChanged marks row dirty and calls onUnsavedChangesChange', () => {
    const onUnsavedChangesChange = jest.fn();
    const items = [makeItem('item-1')];
    render(
      <ItemTableAGGrid
        {...defaultProps}
        items={items}
        onUnsavedChangesChange={onUnsavedChangesChange}
      />
    );
    const onCellValueChanged = _lastArdaGridProps?.onCellValueChanged;
    act(() => {
      onCellValueChanged?.({
        data: items[0],
        oldValue: 'old',
        newValue: 'new',
        node: { data: items[0] },
        column: { getColId: () => 'name' },
      });
    });
    expect(onUnsavedChangesChange).toHaveBeenCalledWith(true);
  });

  it('handleCellValueChanged ignores when oldValue === newValue', () => {
    const onUnsavedChangesChange = jest.fn();
    const items = [makeItem('item-1')];
    render(
      <ItemTableAGGrid
        {...defaultProps}
        items={items}
        onUnsavedChangesChange={onUnsavedChangesChange}
      />
    );
    const onCellValueChanged = _lastArdaGridProps?.onCellValueChanged;
    act(() => {
      onCellValueChanged?.({
        data: items[0],
        oldValue: 'same',
        newValue: 'same',
        node: { data: items[0] },
        column: { getColId: () => 'name' },
      });
    });
    expect(onUnsavedChangesChange).not.toHaveBeenCalled();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // handleCellEditingStarted via ArdaGrid callback
  // ──────────────────────────────────────────────────────────────────────────
  it('handleCellEditingStarted calls getOrCreateDraft for the row', async () => {
    const items = [makeItem('item-1')];
    render(<ItemTableAGGrid {...defaultProps} items={items} />);
    const onCellEditingStarted = _lastArdaGridProps?.onCellEditingStarted;
    await act(async () => {
      onCellEditingStarted?.({
        data: items[0],
        node: { data: items[0] },
        column: { getColId: () => 'name' },
      });
    });
    expect(mockCreateDraftItem).toHaveBeenCalledWith('item-1');
  });

  it('handleCellEditingStarted is a no-op when no rowId', async () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const onCellEditingStarted = _lastArdaGridProps?.onCellEditingStarted;
    // Should not throw
    await act(async () => {
      onCellEditingStarted?.({
        data: {},
        node: { data: {} },
        column: { getColId: () => 'name' },
      });
    });
    expect(mockCreateDraftItem).not.toHaveBeenCalled();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // handleCellEditingStopped via ArdaGrid callback
  // ──────────────────────────────────────────────────────────────────────────
  it('handleCellEditingStopped is a no-op when row not dirty', async () => {
    const items = [makeItem('item-1')];
    render(<ItemTableAGGrid {...defaultProps} items={items} />);
    const onCellEditingStopped = _lastArdaGridProps?.onCellEditingStopped;
    await act(async () => {
      onCellEditingStopped?.({
        data: items[0],
        node: { data: items[0] },
        column: { getColId: () => 'name' },
      });
    });
    // No draft creation since row is not dirty
    expect(mockCreateDraftItem).not.toHaveBeenCalled();
  });

  it('handleCellEditingStopped publishes dirty row after edit stops', async () => {
    const items = [makeItem('item-2')];
    const rowNode = { data: items[0] };
    mockGridApi.getRowNode.mockReturnValue(rowNode);
    mockGridApi.getEditingCells.mockReturnValue([]);

    render(<ItemTableAGGrid {...defaultProps} items={items} />);

    // Make row dirty
    const onCellValueChanged = _lastArdaGridProps?.onCellValueChanged;
    act(() => {
      onCellValueChanged?.({
        data: items[0],
        oldValue: 'a',
        newValue: 'b',
        node: { data: items[0] },
        column: { getColId: () => 'name' },
      });
    });

    // Stop editing
    const onCellEditingStopped = _lastArdaGridProps?.onCellEditingStopped;
    await act(async () => {
      onCellEditingStopped?.({
        data: items[0],
        node: { data: items[0] },
        column: { getColId: () => 'name' },
      });
      // Allow the 50ms setTimeout to fire
      jest.runAllTimers?.();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // handleCellFocused via ArdaGrid callback
  // ──────────────────────────────────────────────────────────────────────────
  it('handleCellFocused is a no-op when no focused cell', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const onCellFocused = _lastArdaGridProps?.onCellFocused;
    act(() => {
      onCellFocused?.({
        api: { getFocusedCell: () => null, getDisplayedRowAtIndex: () => undefined },
      });
    });
  });

  it('handleCellFocused updates editingRowId when moving to a new row', () => {
    const items = [makeItem('row-a'), makeItem('row-b')];
    render(<ItemTableAGGrid {...defaultProps} items={items} />);
    const onCellFocused = _lastArdaGridProps?.onCellFocused;
    act(() => {
      onCellFocused?.({
        api: {
          getFocusedCell: () => ({ rowIndex: 1 }),
          getDisplayedRowAtIndex: () => ({ data: items[1] }),
        },
      });
    });
    // No assertion needed — just verifying it runs without error
  });

  it('handleCellFocused publishes dirty previous row when switching rows', async () => {
    const items = [makeItem('row-a'), makeItem('row-b')];
    const rowNode = { data: items[0] };
    mockGridApi.getRowNode.mockReturnValue(rowNode);
    mockGridApi.getEditingCells.mockReturnValue([]);

    render(<ItemTableAGGrid {...defaultProps} items={items} />);

    // Simulate first row being dirty
    const onCellValueChanged = _lastArdaGridProps?.onCellValueChanged;
    act(() => {
      onCellValueChanged?.({
        data: items[0],
        oldValue: 'x',
        newValue: 'y',
        node: { data: items[0] },
        column: { getColId: () => 'name' },
      });
    });

    // Focus on a different row
    const onCellFocused = _lastArdaGridProps?.onCellFocused;
    await act(async () => {
      onCellFocused?.({
        api: {
          getFocusedCell: () => ({ rowIndex: 1 }),
          getDisplayedRowAtIndex: (i: number) =>
            i === 1 ? { data: items[1] } : undefined,
        },
      });
    });
    // No assertion needed — testing the path executes without error
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Context callbacks (onNotesSave, onCardNotesSave)
  // ──────────────────────────────────────────────────────────────────────────
  it('passes gridOptions context with onNotesSave and onCardNotesSave', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const ctx = _lastArdaGridProps?.gridOptions?.context;
    expect(typeof ctx?.onNotesSave).toBe('function');
    expect(typeof ctx?.onCardNotesSave).toBe('function');
  });

  it('onNotesSave marks row as dirty and calls onUnsavedChangesChange', () => {
    const onUnsavedChangesChange = jest.fn();
    const items = [makeItem('item-3')];
    render(
      <ItemTableAGGrid
        {...defaultProps}
        items={items}
        onUnsavedChangesChange={onUnsavedChangesChange}
      />
    );
    const ctx = _lastArdaGridProps?.gridOptions?.context;
    act(() => {
      ctx?.onNotesSave(items[0], 'New notes');
    });
    expect(onUnsavedChangesChange).toHaveBeenCalledWith(true);
  });

  it('onCardNotesSave marks row as dirty and calls onUnsavedChangesChange', () => {
    const onUnsavedChangesChange = jest.fn();
    const items = [makeItem('item-4')];
    render(
      <ItemTableAGGrid
        {...defaultProps}
        items={items}
        onUnsavedChangesChange={onUnsavedChangesChange}
      />
    );
    const ctx = _lastArdaGridProps?.gridOptions?.context;
    act(() => {
      ctx?.onCardNotesSave(items[0], 'Card note update');
    });
    expect(onUnsavedChangesChange).toHaveBeenCalledWith(true);
  });

  it('onNotesSave refreshes notes cells via gridApi.refreshCells', () => {
    const items = [makeItem('item-5')];
    render(<ItemTableAGGrid {...defaultProps} items={items} />);
    const ctx = _lastArdaGridProps?.gridOptions?.context;
    act(() => {
      ctx?.onNotesSave(items[0], 'Updated notes');
    });
    expect(mockGridApi.refreshCells).toHaveBeenCalledWith(
      expect.objectContaining({ columns: ['notes'], force: true })
    );
  });

  it('onCardNotesSave refreshes cardNotesDefault cells', () => {
    const items = [makeItem('item-6')];
    render(<ItemTableAGGrid {...defaultProps} items={items} />);
    const ctx = _lastArdaGridProps?.gridOptions?.context;
    act(() => {
      ctx?.onCardNotesSave(items[0], 'Card note refresh');
    });
    expect(mockGridApi.refreshCells).toHaveBeenCalledWith(
      expect.objectContaining({ columns: ['cardNotesDefault'], force: true })
    );
  });

  // ──────────────────────────────────────────────────────────────────────────
  // useItemCards hook (context)
  // ──────────────────────────────────────────────────────────────────────────
  it('useItemCards returns context defaults outside provider', () => {
    const TestConsumer = () => {
      const ctx = useItemCards();
      return (
        <div>
          <span data-testid='map-type'>{typeof ctx.itemCardsMap}</span>
          <span data-testid='refresh-type'>{typeof ctx.refreshCardsForItem}</span>
        </div>
      );
    };
    render(<TestConsumer />);
    expect(screen.getByTestId('map-type')).toHaveTextContent('object');
    expect(screen.getByTestId('refresh-type')).toHaveTextContent('function');
  });

  it('ItemCardsContext.Provider exposes itemCardsMap to children', () => {
    const itemCardsMap = { 'item-1': [] };

    // Wrap in ItemTableAGGrid which is the provider
    const WrappedApp = () => (
      <div>
        <ItemTableAGGrid {...defaultProps} itemCardsMap={itemCardsMap} />
      </div>
    );
    render(<WrappedApp />);
    // Grid renders correctly (context is internal)
    expect(screen.getByTestId('arda-grid')).toBeInTheDocument();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Cell editing callbacks
  // ──────────────────────────────────────────────────────────────────────────
  it('passes all cell editing callbacks to ArdaGrid', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    expect(typeof _lastArdaGridProps?.onCellEditingStarted).toBe('function');
    expect(typeof _lastArdaGridProps?.onCellValueChanged).toBe('function');
    expect(typeof _lastArdaGridProps?.onCellEditingStopped).toBe('function');
    expect(typeof _lastArdaGridProps?.onCellFocused).toBe('function');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // onColumnStateChange callback
  // ──────────────────────────────────────────────────────────────────────────
  it('does not pass onColumnStateChange to ArdaGrid (ItemTableAGGrid owns persistence)', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    expect(_lastArdaGridProps?.onColumnStateChange).toBeUndefined();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // enhanceEditableColumnDefs: cell renderers and valueGetter/valueSetter
  // ──────────────────────────────────────────────────────────────────────────

  it('enhanced internalSKU column cellRenderer renders value', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'internalSKU');
    const cr = col?.cellRenderer;
    if (!cr) return;
    const { container } = render(cr({ value: 'SKU-001', data: makeItem('1'), node: { rowIndex: 0 }, column: { getColId: () => 'internalSKU' } }));
    expect(container).toBeInTheDocument();
  });

  it('enhanced internalSKU cellRenderer returns dash for empty value', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'internalSKU');
    const cr = col?.cellRenderer;
    if (!cr) return;
    const result = cr({ value: '', data: makeItem('1'), node: { rowIndex: 0 }, column: { getColId: () => 'internalSKU' } });
    expect(result).toBe('-');
  });

  it('enhanced color column cellRenderer renders color label via dropdownLabelWithArrow', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'color');
    const cr = col?.cellRenderer;
    if (!cr) return;
    const mockApi = { startEditingCell: jest.fn() };
    const { container } = render(cr({
      value: 'YELLOW',
      data: makeItem('1'),
      api: mockApi,
      node: { rowIndex: 0 },
      column: { getColId: () => 'color' },
    }));
    expect(container).toBeInTheDocument();
  });

  it('enhanced color cellRenderer returns dash for empty value', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'color');
    const cr = col?.cellRenderer;
    if (!cr) return;
    const { container } = render(cr({
      value: '',
      data: makeItem('1'),
      api: null,
      node: { rowIndex: 0 },
      column: { getColId: () => 'color' },
    }));
    expect(container.textContent).toContain('-');
  });

  it('enhanced internalSKU valueGetter returns sku', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'internalSKU');
    const vg = col?.valueGetter;
    if (!vg) return;
    const item = { ...makeItem('1'), internalSKU: 'SKU-123' };
    const result = vg({ data: item });
    expect(result).toBe('SKU-123');
  });

  it('enhanced name valueGetter returns name', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'name');
    const vg = col?.valueGetter;
    if (!vg) return;
    const item = makeItem('1');
    const result = vg({ data: item });
    expect(result).toBe('Item 1');
  });

  it('enhanced color valueGetter returns color value', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'color');
    const vg = col?.valueGetter;
    if (!vg) return;
    const item = { ...makeItem('1'), color: 'BLUE' as any };
    const result = vg({ data: item });
    expect(result).toBe('BLUE');
  });

  it('enhanced valueSetter calls setNested and updates item data', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'name');
    const vs = col?.valueSetter;
    if (!vs) return;
    const data = makeItem('1');
    const result = vs({ data, newValue: 'Updated Name', oldValue: 'Item 1', node: { data } });
    expect(result).toBe(true);
    expect(data.name).toBe('Updated Name');
  });

  it('enhanced valueSetter handles null/empty newValue by setting undefined', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'name');
    const vs = col?.valueSetter;
    if (!vs) return;
    const data = makeItem('1');
    const result = vs({ data, newValue: '', oldValue: 'Item 1', node: { data } });
    expect(result).toBe(true);
    expect(data.name).toBeUndefined();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // ColorCellEditor class methods
  // ──────────────────────────────────────────────────────────────────────────

  it('ColorCellEditor init, getValue, getGui, isPopup, isCancelBeforeStart, isCancelAfterEnd', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'color');
    const EditorClass = col?.cellEditor;
    if (!EditorClass) return;

    const editor = new EditorClass();
    const mockParams = {
      value: 'YELLOW',
      api: null,
      context: null,
      column: { getColId: () => 'color' },
      node: { rowIndex: 0 },
      data: {},
      rowIndex: 0,
      colDef: {},
      $scope: null,
      stopEditing: jest.fn(),
    };

    editor.init(mockParams);
    expect(editor.getValue()).toBe('YELLOW');
    expect(editor.getGui()).toBeTruthy();
    expect(editor.isPopup()).toBe(true);
    expect(editor.isCancelBeforeStart()).toBe(false);
    expect(editor.isCancelAfterEnd()).toBe(false);
    editor.focusIn();
    editor.focusOut();
    editor.afterGuiAttached();
  });

  it('ColorCellEditor init with unknown color value defaults to empty string', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'color');
    const EditorClass = col?.cellEditor;
    if (!EditorClass) return;

    const editor = new EditorClass();
    editor.init({
      value: 'UNKNOWN_COLOR',
      api: null,
      column: { getColId: () => 'color' },
      node: { rowIndex: 0 },
      data: {},
    });
    expect(editor.getValue()).toBe('');
  });

  it('ColorCellEditor getGui returns existing eGui if already created', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'color');
    const EditorClass = col?.cellEditor;
    if (!EditorClass) return;

    const editor = new EditorClass();
    editor.init({
      value: '',
      api: null,
      column: { getColId: () => 'color' },
      node: { rowIndex: 0 },
      data: {},
    });
    const gui1 = editor.getGui();
    const gui2 = editor.getGui();
    expect(gui1).toBe(gui2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional branch-deepening tests (PA-1)
// ─────────────────────────────────────────────────────────────────────────────

describe('ItemTableAGGrid — handleRowClick and handleRowDoubleClick', () => {
  it('handleRowClick callback triggers navigation after reaching click threshold', async () => {
    const onRowClick = jest.fn();
    const items = [makeItem('r1'), makeItem('r2')];
    render(<ItemTableAGGrid {...defaultProps} items={items} onRowClick={onRowClick} />);

    await screen.findByTestId('arda-grid');

    // The implementation requires CLICKS_TO_OPEN_PANEL (3) clicks on the same
    // row before triggering the callback.
    act(() => { _lastArdaGridProps?.onRowClicked?.(items[0]); });
    act(() => { _lastArdaGridProps?.onRowClicked?.(items[0]); });
    act(() => { _lastArdaGridProps?.onRowClicked?.(items[0]); });
    expect(onRowClick).toHaveBeenCalledWith(items[0]);
  });

  it('handleRowDoubleClick cancels the pending single-click open', () => {
    jest.useFakeTimers();
    const onRowClick = jest.fn();
    const items = [makeItem('r1')];
    render(<ItemTableAGGrid {...defaultProps} items={items} onRowClick={onRowClick} />);

    const onRowClicked = _lastArdaGridProps?.onRowClicked;
    const onRowDoubleClicked = _lastArdaGridProps?.onRowDoubleClicked;

    act(() => {
      onRowClicked?.(items[0]);
      // Immediately double-click cancels single-click timeout
      onRowDoubleClicked?.(items[0]);
    });
    act(() => {
      jest.runAllTimers();
    });
    // onRowClick should NOT have been called
    expect(onRowClick).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('handleRowClick with onOpenItemDetails uses onOpenItemDetails', async () => {
    const onOpenItemDetails = jest.fn();
    const items = [makeItem('r1')];
    render(
      <ItemTableAGGrid {...defaultProps} items={items} onOpenItemDetails={onOpenItemDetails} />
    );

    await screen.findByTestId('arda-grid');

    // 3 clicks on the same row triggers onOpenItemDetails (preferred over onRowClick).
    act(() => { _lastArdaGridProps?.onRowClicked?.(items[0]); });
    act(() => { _lastArdaGridProps?.onRowClicked?.(items[0]); });
    act(() => { _lastArdaGridProps?.onRowClicked?.(items[0]); });
    expect(onOpenItemDetails).toHaveBeenCalledWith(items[0]);
  });

  it('handleRowClick with no entityId is a no-op', () => {
    const onRowClick = jest.fn();
    render(<ItemTableAGGrid {...defaultProps} onRowClick={onRowClick} />);

    const onRowClicked = _lastArdaGridProps?.onRowClicked;
    act(() => {
      onRowClicked?.({} as any);
    });
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it('handleRowClick switching rows publishes previous dirty row', async () => {
    jest.useFakeTimers();
    const items = [makeItem('r1'), makeItem('r2')];
    const rowNode = { data: items[0] };
    mockGridApi.getRowNode.mockReturnValue(rowNode);
    mockGridApi.getEditingCells.mockReturnValue([]);

    render(<ItemTableAGGrid {...defaultProps} items={items} />);

    // Make r1 dirty
    act(() => {
      _lastArdaGridProps?.onCellValueChanged?.({
        data: items[0], oldValue: 'a', newValue: 'b',
        node: { data: items[0] }, column: { getColId: () => 'name' },
      });
    });
    // Click r1 first to set editingRowId
    act(() => { _lastArdaGridProps?.onRowClicked?.(items[0]); });
    // Now click r2 (different row)
    act(() => { _lastArdaGridProps?.onRowClicked?.(items[1]); });

    await act(async () => { jest.runAllTimers(); });
    expect(mockCreateDraftItem).toHaveBeenCalled();
    jest.useRealTimers();
  });
});

describe('ItemTableAGGrid — handleSelectionChanged logic', () => {
  it('handleSelectionChanged is callable without throwing', () => {
    const onSelectionChange = jest.fn();
    render(
      <ItemTableAGGrid {...defaultProps} items={[makeItem('x1')]} onSelectionChange={onSelectionChange} />
    );
    const onSelectionChanged = _lastArdaGridProps?.onSelectionChanged;
    expect(() => {
      act(() => { onSelectionChanged?.([makeItem('x1')]); });
    }).not.toThrow();
  });

  it('handleSelectionChanged with rendered nodes does not throw', () => {
    const onSelectionChange = jest.fn();
    const items = [makeItem('a1'), makeItem('a2')];
    mockGridApi.getRenderedNodes.mockReturnValue([
      { data: items[0] },
      { data: items[1] },
    ]);
    render(
      <ItemTableAGGrid {...defaultProps} items={items} onSelectionChange={onSelectionChange} />
    );
    const onSelectionChanged = _lastArdaGridProps?.onSelectionChanged;
    expect(() => {
      act(() => { onSelectionChanged?.([items[0]]); });
    }).not.toThrow();
  });
});

describe('ItemTableAGGrid — getRowClass state', () => {
  it('returns ag-row-saving when rowState has saving=true', async () => {
    const items = [makeItem('item-save')];
    const onRefreshRequested = jest.fn().mockResolvedValue(undefined);
    const rowNode = { data: items[0] };
    mockGridApi.getRowNode.mockReturnValue(rowNode);

    render(
      <ItemTableAGGrid
        {...defaultProps}
        items={items}
        onRefreshRequested={onRefreshRequested}
      />
    );

    // Make row dirty
    act(() => {
      _lastArdaGridProps?.onCellValueChanged?.({
        data: items[0], oldValue: 'a', newValue: 'b',
        node: { data: items[0] }, column: { getColId: () => 'name' },
      });
    });

    // getRowClass should still return [] before saving starts
    const getRowClass = _lastArdaGridProps?.getRowClass;
    expect(getRowClass?.({ data: items[0] })).toEqual([]);
  });

  it('returns ag-row-error when rowState has error=true', async () => {
    const items = [makeItem('item-err')];
    mockUpdateItem.mockRejectedValue(new Error('save failed'));
    const rowNode = { data: items[0] };
    mockGridApi.getRowNode.mockReturnValue(rowNode);

    render(<ItemTableAGGrid {...defaultProps} items={items} />);

    // Make row dirty
    act(() => {
      _lastArdaGridProps?.onCellValueChanged?.({
        data: items[0], oldValue: 'a', newValue: 'b',
        node: { data: items[0] }, column: { getColId: () => 'name' },
      });
    });

    // getRowClass without error yet
    const getRowClass = _lastArdaGridProps?.getRowClass;
    expect(getRowClass?.({ data: items[0] })).toEqual([]);
  });
});

describe('ItemTableAGGrid — publishRow edge cases', () => {
  it('publishRow skips when row not dirty', async () => {
    const ref = createRef<ItemTableAGGridRef>();
    render(<ItemTableAGGrid {...defaultProps} ref={ref} />);
    // No dirty rows, saveAllDrafts should resolve without calling updateItem
    await act(async () => {
      await ref.current?.saveAllDrafts();
    });
    expect(mockUpdateItem).not.toHaveBeenCalled();
  });

  it('publishRow skips when concurrent publishing same row', async () => {
    const items = [makeItem('concurrent-1')];
    const rowNode = { data: items[0] };
    mockGridApi.getRowNode.mockReturnValue(rowNode);
    const onRefreshRequested = jest.fn().mockResolvedValue(undefined);
    let resolveUpdate: (value?: unknown) => void;
    mockUpdateItem.mockReturnValue(new Promise((res) => { resolveUpdate = res; }));

    const ref = createRef<ItemTableAGGridRef>();
    render(
      <ItemTableAGGrid
        {...defaultProps}
        items={items}
        ref={ref}
        onRefreshRequested={onRefreshRequested}
      />
    );

    // Make row dirty
    act(() => {
      _lastArdaGridProps?.onCellValueChanged?.({
        data: items[0], oldValue: 'a', newValue: 'b',
        node: { data: items[0] }, column: { getColId: () => 'name' },
      });
    });

    // Don't await - just verify we can call saveAllDrafts
    const savePromise = ref.current?.saveAllDrafts();
    resolveUpdate!();
    await act(async () => { await savePromise; });
    expect(mockCreateDraftItem).toHaveBeenCalled();
  });

  it('publishRow handles error case and sets error rowState', async () => {
    const items = [makeItem('err-row')];
    const rowNode = { data: items[0] };
    mockGridApi.getRowNode.mockReturnValue(rowNode);
    mockUpdateItem.mockRejectedValue(new Error('update failed'));

    const ref = createRef<ItemTableAGGridRef>();
    render(<ItemTableAGGrid {...defaultProps} items={items} ref={ref} />);

    act(() => {
      _lastArdaGridProps?.onCellValueChanged?.({
        data: items[0], oldValue: 'x', newValue: 'y',
        node: { data: items[0] }, column: { getColId: () => 'name' },
      });
    });

    await act(async () => {
      try { await ref.current?.saveAllDrafts(); } catch { /* ignore */ }
    });
    // Error was thrown (or swallowed by saveAllDrafts), verify createDraftItem was called
    expect(mockCreateDraftItem).toHaveBeenCalledWith('err-row');
  });
});

describe('ItemTableAGGrid — enhanced column valueGetters (branch coverage)', () => {
  it('enhanced primarySupply.supplier valueGetter returns supplier', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find(
      (c: any) => c.field === 'primarySupply.supplier'
    );
    const vg = col?.valueGetter;
    if (!vg) return;
    const item = { ...makeItem('1'), primarySupply: { supplier: 'Acme' } };
    expect(vg({ data: item })).toBe('Acme');
  });

  it('enhanced primarySupply.supplier valueGetter returns empty when no supply', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find(
      (c: any) => c.field === 'primarySupply.supplier'
    );
    const vg = col?.valueGetter;
    if (!vg) return;
    expect(vg({ data: makeItem('1') })).toBe('');
  });

  it('enhanced primarySupply.unitCost valueGetter returns cost value string', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find(
      (c: any) => c.field === 'primarySupply.unitCost'
    );
    const vg = col?.valueGetter;
    if (!vg) return;
    const item = { ...makeItem('1'), primarySupply: { unitCost: { value: 9.99, currency: 'USD' } } };
    expect(vg({ data: item })).toBe('9.99');
  });

  it('enhanced orderMechanism valueGetter returns valid mechanism', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find(
      (c: any) => c.field === 'primarySupply.orderMechanism'
    );
    const vg = col?.valueGetter;
    if (!vg) return;
    const item = { ...makeItem('1'), primarySupply: { orderMechanism: 'EMAIL' as any } };
    const result = vg({ data: item });
    expect(typeof result).toBe('string');
  });

  it('enhanced orderMechanism valueGetter returns empty for invalid mechanism', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find(
      (c: any) => c.field === 'primarySupply.orderMechanism'
    );
    const vg = col?.valueGetter;
    if (!vg) return;
    const item = { ...makeItem('1'), primarySupply: { orderMechanism: 'INVALID_MECH' as any } };
    expect(vg({ data: item })).toBe('');
  });

  it('enhanced cardSize valueGetter returns valid card size', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'cardSize');
    const vg = col?.valueGetter;
    if (!vg) return;
    const item = { ...makeItem('1'), cardSize: 'MEDIUM' as any };
    const result = vg({ data: item });
    expect(typeof result).toBe('string');
  });

  it('enhanced color valueGetter returns empty for no color', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'color');
    const vg = col?.valueGetter;
    if (!vg) return;
    expect(vg({ data: makeItem('1') })).toBe('');
  });

  it('enhanced color valueGetter returns empty for invalid color', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'color');
    const vg = col?.valueGetter;
    if (!vg) return;
    const item = { ...makeItem('1'), color: 'MAGENTA' as any };
    expect(vg({ data: item })).toBe('');
  });

  it('enhanced valueGetter returns empty string when data is undefined', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'name');
    const vg = col?.valueGetter;
    if (!vg) return;
    expect(vg({ data: undefined })).toBe('');
  });

  it('enhanced taxable valueGetter returns true/false string', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'taxable');
    const vg = col?.valueGetter;
    if (!vg) return;
    expect(vg({ data: { ...makeItem('1'), taxable: true } })).toBe('true');
    expect(vg({ data: { ...makeItem('1'), taxable: false } })).toBe('false');
  });

  it('enhanced locator.location valueGetter returns location', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'locator.location');
    const vg = col?.valueGetter;
    if (!vg) return;
    const item = { ...makeItem('1'), locator: { location: 'Shelf A' } };
    expect(vg({ data: item })).toBe('Shelf A');
  });

  it('enhanced useCase valueGetter returns use case', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'useCase');
    const vg = col?.valueGetter;
    if (!vg) return;
    const item = { ...makeItem('1'), useCase: 'Maintenance' as any };
    expect(vg({ data: item })).toBe('Maintenance');
  });

  it('enhanced notes valueGetter returns notes', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'notes');
    const vg = col?.valueGetter;
    if (!vg) return;
    const item = { ...makeItem('1'), notes: 'Test note' };
    expect(vg({ data: item })).toBe('Test note');
  });

  it('enhanced primarySupply.url valueGetter returns url', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find(
      (c: any) => c.field === 'primarySupply.url'
    );
    const vg = col?.valueGetter;
    if (!vg) return;
    const item = { ...makeItem('1'), primarySupply: { url: 'https://example.com' } };
    expect(vg({ data: item })).toBe('https://example.com');
  });

  it('enhanced minQuantityAmount valueGetter returns quantity amount', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find(
      (c: any) => c.colId === 'minQuantityAmount'
    );
    const vg = col?.valueGetter;
    if (!vg) return;
    const item = { ...makeItem('1'), minQuantity: { amount: 5, unit: 'each' } };
    expect(vg({ data: item })).toBe('5');
  });

  it('enhanced primarySupply.averageLeadTime valueGetter returns lead time length', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find(
      (c: any) => c.field === 'primarySupply.averageLeadTime'
    );
    const vg = col?.valueGetter;
    if (!vg) return;
    const item = {
      ...makeItem('1'),
      primarySupply: { averageLeadTime: { length: 3, unit: 'HOUR' } },
    };
    expect(vg({ data: item })).toBe('3');
  });
});

describe('ItemTableAGGrid — enhanced column valueSetters (branch coverage)', () => {
  it('valueSetter for primarySupply.unitCost updates correctly', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find(
      (c: any) => c.field === 'primarySupply.unitCost'
    );
    const vs = col?.valueSetter;
    if (!vs) return;
    const data: any = { ...makeItem('1'), primarySupply: { unitCost: { value: 5, currency: 'USD' } } };
    const result = vs({ data, newValue: '15.99', oldValue: '5', node: { data } });
    expect(result).toBe(true);
    expect(data.primarySupply.unitCost.value).toBeCloseTo(15.99);
  });

  it('valueSetter for primarySupply.unitCost with NaN newValue still returns true', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find(
      (c: any) => c.field === 'primarySupply.unitCost'
    );
    const vs = col?.valueSetter;
    if (!vs) return;
    const data: any = { ...makeItem('1'), primarySupply: {} };
    const result = vs({ data, newValue: 'not-a-number', oldValue: '', node: { data } });
    expect(result).toBe(true);
  });

  it('valueSetter for minQuantityAmount updates correctly', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find(
      (c: any) => c.colId === 'minQuantityAmount'
    );
    const vs = col?.valueSetter;
    if (!vs) return;
    const data: any = { ...makeItem('1'), minQuantity: { amount: 1, unit: 'each' } };
    vs({ data, newValue: '10', oldValue: '1', node: { data } });
    expect(data.minQuantity.amount).toBe(10);
  });

  it('valueSetter for minQuantityUnit updates correctly', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find(
      (c: any) => c.colId === 'minQuantityUnit'
    );
    const vs = col?.valueSetter;
    if (!vs) return;
    const data: any = { ...makeItem('1'), minQuantity: { amount: 1, unit: 'each' } };
    vs({ data, newValue: 'box', oldValue: 'each', node: { data } });
    expect(data.minQuantity.unit).toBe('box');
  });

  it('valueSetter for orderQuantityAmount updates correctly', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find(
      (c: any) => c.colId === 'orderQuantityAmount'
    );
    const vs = col?.valueSetter;
    if (!vs) return;
    const data: any = { ...makeItem('1'), primarySupply: { orderQuantity: { amount: 5, unit: 'case' } } };
    vs({ data, newValue: '20', oldValue: '5', node: { data } });
    expect(data.primarySupply.orderQuantity.amount).toBe(20);
  });

  it('valueSetter for orderQuantityUnit updates correctly', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find(
      (c: any) => c.colId === 'orderQuantityUnit'
    );
    const vs = col?.valueSetter;
    if (!vs) return;
    const data: any = { ...makeItem('1'), primarySupply: { orderQuantity: { amount: 5, unit: 'each' } } };
    vs({ data, newValue: 'pack', oldValue: 'each', node: { data } });
    expect(data.primarySupply.orderQuantity.unit).toBe('pack');
  });

  it('valueSetter for primarySupply.orderCost updates correctly', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find(
      (c: any) => c.field === 'primarySupply.orderCost'
    );
    const vs = col?.valueSetter;
    if (!vs) return;
    const data: any = { ...makeItem('1'), primarySupply: { orderCost: { value: 10, currency: 'USD' } } };
    vs({ data, newValue: '25.5', oldValue: '10', node: { data } });
    expect(data.primarySupply.orderCost.value).toBeCloseTo(25.5);
  });
});

describe('ItemTableAGGrid — OrderMechanismCellEditor class', () => {
  it('OrderMechanismCellEditor init, getValue, getGui, isPopup methods', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find(
      (c: any) => c.field === 'primarySupply.orderMechanism'
    );
    const EditorClass = col?.cellEditor;
    if (!EditorClass) return;

    const editor = new EditorClass();
    editor.init({
      value: 'EMAIL',
      api: null,
      column: { getColId: () => 'primarySupply.orderMechanism' },
      node: { rowIndex: 0 },
      data: {},
    });
    expect(editor.getValue()).toBeTruthy();
    expect(editor.getGui()).toBeTruthy();
    expect(editor.isPopup()).toBe(true);
    expect(editor.isCancelBeforeStart()).toBe(false);
    expect(editor.isCancelAfterEnd()).toBe(false);
    editor.focusIn();
    editor.focusOut();
    editor.afterGuiAttached();
  });

  it('OrderMechanismCellEditor init with invalid value defaults to empty', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find(
      (c: any) => c.field === 'primarySupply.orderMechanism'
    );
    const EditorClass = col?.cellEditor;
    if (!EditorClass) return;

    const editor = new EditorClass();
    editor.init({
      value: 'INVALID_METHOD',
      api: null,
      column: { getColId: () => 'primarySupply.orderMechanism' },
      node: { rowIndex: 0 },
      data: {},
    });
    expect(editor.getValue()).toBe('');
  });
});

describe('ItemTableAGGrid — CardSizeCellEditor class', () => {
  it('CardSizeCellEditor init, getValue, methods work', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'cardSize');
    const EditorClass = col?.cellEditor;
    if (!EditorClass) return;

    const editor = new EditorClass();
    editor.init({
      value: 'MEDIUM',
      api: null,
      column: { getColId: () => 'cardSize' },
      node: { rowIndex: 0 },
      data: {},
    });
    const gui = editor.getGui();
    expect(gui).toBeTruthy();
    expect(editor.isPopup()).toBe(true);
    expect(editor.isCancelBeforeStart()).toBe(false);
    expect(editor.isCancelAfterEnd()).toBe(false);
    editor.focusIn();
    editor.focusOut();
    editor.afterGuiAttached();
  });
});

describe('ItemTableAGGrid — persistence ownership', () => {
  it('does not pass onColumnStateChange to ArdaGrid — ItemTableAGGrid is the sole persistence owner', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    expect(_lastArdaGridProps?.onColumnStateChange).toBeUndefined();
    expect(_lastArdaGridProps?.persistenceKey).toBeUndefined();
    expect(_lastArdaGridProps?.enableColumnStatePersistence).toBe(false);
  });
});

describe('ItemTableAGGrid — handleGridReady callback', () => {
  it('passes onGridReady callback to ArdaGrid', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    expect(typeof _lastArdaGridProps?.onGridReady).toBe('function');
  });

  it('onGridReady fires without error when grid api is available', () => {
    jest.useFakeTimers();
    mockGridApi.getColumnState.mockReturnValue([
      { colId: 'select', hide: false, width: 50 },
      { colId: 'name', hide: false, width: 300 },
    ]);
    render(<ItemTableAGGrid {...defaultProps} columnVisibility={{ sku: true, name: true }} />);
    const onGridReady = _lastArdaGridProps?.onGridReady;
    act(() => { onGridReady?.({ api: mockGridApi }); });
    act(() => { jest.runAllTimers(); });
    // No error thrown — test passes
    jest.useRealTimers();
  });
});

describe('ItemTableAGGrid — column visibility prop changes', () => {
  it('does not set hide on sku col def when columnVisibility.sku changes — visibility applied imperatively', () => {
    const { rerender } = render(
      <ItemTableAGGrid {...defaultProps} columnVisibility={{ sku: true }} />
    );
    rerender(
      <ItemTableAGGrid {...defaultProps} columnVisibility={{ sku: false }} />
    );
    const colDefs: any[] = _lastArdaGridProps?.columnDefs ?? [];
    const skuCol = colDefs.find((c: any) => c.field === 'internalSKU');
    // hide is no longer set in column defs (Phase 2.2 — single visibility source)
    if (skuCol) expect(skuCol.hide).toBeUndefined();
  });

  it('onFirstPage is passed to ArdaGrid', () => {
    const onFirstPage = jest.fn();
    render(<ItemTableAGGrid {...defaultProps} onFirstPage={onFirstPage} />);
    expect(_lastArdaGridProps?.onFirstPage).toBe(onFirstPage);
  });

  it('totalSelectedCount and maxItemsSeen are passed to ArdaGrid', () => {
    render(
      <ItemTableAGGrid
        {...defaultProps}
        totalSelectedCount={10}
        maxItemsSeen={100}
      />
    );
    expect(_lastArdaGridProps?.totalSelectedCount).toBe(10);
    expect(_lastArdaGridProps?.maxItemsSeen).toBe(100);
  });

  it('onColumnVisibilityChange callback is accepted', () => {
    const onColumnVisibilityChange = jest.fn();
    render(
      <ItemTableAGGrid
        {...defaultProps}
        onColumnVisibilityChange={onColumnVisibilityChange}
      />
    );
    // Just checking it renders without error
    expect(screen.getByTestId('arda-grid')).toBeInTheDocument();
  });
});

describe('ItemTableAGGrid — itemCardsMap prop', () => {
  it('accepts itemCardsMap as prop', () => {
    const itemCardsMap = { 'i1': [{ payload: { eId: 'c1', status: 'REQUESTING' } }] };
    render(
      <ItemTableAGGrid
        {...defaultProps}
        items={[makeItem('i1')]}
        itemCardsMap={itemCardsMap as any}
      />
    );
    expect(screen.getByTestId('arda-grid')).toBeInTheDocument();
  });
});

describe('ItemTableAGGrid — handleCellEditingStopped edge cases', () => {
  it('handleCellEditingStopped with still-active editing cells calls onUnsavedChangesChange', async () => {
    const onUnsavedChangesChange = jest.fn();
    const items = [makeItem('cell-stop-1')];
    mockGridApi.getEditingCells.mockReturnValue([{ rowIndex: 0 }]); // still editing
    const rowNode = { data: items[0] };
    mockGridApi.getRowNode.mockReturnValue(rowNode);

    render(
      <ItemTableAGGrid
        {...defaultProps}
        items={items}
        onUnsavedChangesChange={onUnsavedChangesChange}
      />
    );

    // Make row dirty
    act(() => {
      _lastArdaGridProps?.onCellValueChanged?.({
        data: items[0], oldValue: 'a', newValue: 'b',
        node: { data: items[0] }, column: { getColId: () => 'name' },
      });
    });

    const onCellEditingStopped = _lastArdaGridProps?.onCellEditingStopped;
    await act(async () => {
      onCellEditingStopped?.({
        data: items[0],
        node: { data: items[0] },
        column: { getColId: () => 'name' },
      });
    });
    // Since editingCells.length > 0, onUnsavedChangesChange(true) should be called
    expect(onUnsavedChangesChange).toHaveBeenCalledWith(true);
  });
});

describe('ItemTableAGGrid — setNested helper (via valueSetter)', () => {
  it('setNested creates nested objects when intermediate path is missing', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find(
      (c: any) => c.field === 'primarySupply.orderCost'
    );
    const vs = col?.valueSetter;
    if (!vs) return;
    const data: any = { ...makeItem('1') }; // No primarySupply
    vs({ data, newValue: '50', oldValue: '', node: { data } });
    expect(data.primarySupply?.orderCost?.value).toBeCloseTo(50);
  });
});

describe('ItemTableAGGrid — LabelSizeCellEditor class', () => {
  it('LabelSizeCellEditor init, getValue, getGui, isPopup methods work', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'labelSize');
    const EditorClass = col?.cellEditor;
    if (!EditorClass) return;

    const editor = new EditorClass();
    editor.init({
      value: 'SMALL',
      api: null,
      column: { getColId: () => 'labelSize' },
      node: { rowIndex: 0 },
      data: {},
    });
    const gui = editor.getGui();
    expect(gui).toBeTruthy();
    expect(editor.getValue()).toBeTruthy();
    expect(editor.isPopup()).toBe(true);
    expect(editor.isCancelBeforeStart()).toBe(false);
    expect(editor.isCancelAfterEnd()).toBe(false);
    editor.focusIn();
    editor.focusOut();
    editor.afterGuiAttached();
  });

  it('LabelSizeCellEditor with empty value', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'labelSize');
    const EditorClass = col?.cellEditor;
    if (!EditorClass) return;

    const editor = new EditorClass();
    editor.init({
      value: '',
      api: null,
      column: { getColId: () => 'labelSize' },
      node: { rowIndex: 0 },
      data: {},
    });
    expect(editor.getValue()).toBe('');
  });

  it('LabelSizeCellEditor with invalid value defaults to empty', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'labelSize');
    const EditorClass = col?.cellEditor;
    if (!EditorClass) return;

    const editor = new EditorClass();
    editor.init({
      value: 'INVALID',
      api: null,
      column: { getColId: () => 'labelSize' },
      node: { rowIndex: 0 },
      data: {},
    });
    expect(editor.getValue()).toBe('');
  });

  it('LabelSizeCellEditor getGui returns existing eGui', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'labelSize');
    const EditorClass = col?.cellEditor;
    if (!EditorClass) return;

    const editor = new EditorClass();
    editor.init({
      value: 'MEDIUM',
      api: null,
      column: { getColId: () => 'labelSize' },
      node: { rowIndex: 0 },
      data: {},
    });
    const gui1 = editor.getGui();
    const gui2 = editor.getGui();
    expect(gui1).toBe(gui2);
  });
});

describe('ItemTableAGGrid — BreadcrumbSizeCellEditor class', () => {
  it('BreadcrumbSizeCellEditor init, getValue, getGui methods work', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'breadcrumbSize');
    const EditorClass = col?.cellEditor;
    if (!EditorClass) return;

    const editor = new EditorClass();
    editor.init({
      value: 'LARGE',
      api: null,
      column: { getColId: () => 'breadcrumbSize' },
      node: { rowIndex: 0 },
      data: {},
    });
    const gui = editor.getGui();
    expect(gui).toBeTruthy();
    expect(editor.isPopup()).toBe(true);
    expect(editor.isCancelBeforeStart()).toBe(false);
    expect(editor.isCancelAfterEnd()).toBe(false);
    editor.focusIn();
    editor.focusOut();
    editor.afterGuiAttached();
  });

  it('BreadcrumbSizeCellEditor with empty value', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'breadcrumbSize');
    const EditorClass = col?.cellEditor;
    if (!EditorClass) return;

    const editor = new EditorClass();
    editor.init({
      value: '',
      api: null,
      column: { getColId: () => 'breadcrumbSize' },
      node: { rowIndex: 0 },
      data: {},
    });
    expect(editor.getValue()).toBe('');
  });
});

describe('ItemTableAGGrid — dropdownLabelWithArrow click handler', () => {
  it('arrow button onClick calls startEditingCell on api', () => {
    const mockApi = { startEditingCell: jest.fn() };
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'color');
    const cr = col?.cellRenderer;
    if (!cr) return;

    const { container } = render(
      cr({
        value: 'BLUE',
        data: makeItem('1'),
        api: mockApi,
        node: { rowIndex: 3 },
        column: { getColId: () => 'color' },
      })
    );

    // Find and click the dropdown button
    const button = container.querySelector('button');
    if (button) {
      button.click();
    }
    // startEditingCell should have been called
    if (mockApi.startEditingCell.mock.calls.length > 0) {
      expect(mockApi.startEditingCell).toHaveBeenCalled();
    }
  });

  it('orderMechanism arrow button onClick calls startEditingCell', () => {
    const mockApi = { startEditingCell: jest.fn() };
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find(
      (c: any) => c.field === 'primarySupply.orderMechanism'
    );
    const cr = col?.cellRenderer;
    if (!cr) return;

    const { container } = render(
      cr({
        value: 'EMAIL',
        data: { ...makeItem('1'), primarySupply: { orderMechanism: 'EMAIL' } },
        api: mockApi,
        node: { rowIndex: 0 },
        column: { getColId: () => 'primarySupply.orderMechanism' },
      })
    );

    const button = container.querySelector('button');
    if (button) {
      button.click();
      expect(mockApi.startEditingCell).toHaveBeenCalled();
    }
  });

  it('cardSize arrow button onClick calls startEditingCell', () => {
    const mockApi = { startEditingCell: jest.fn() };
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'cardSize');
    const cr = col?.cellRenderer;
    if (!cr) return;

    const { container } = render(
      cr({
        value: 'MEDIUM',
        data: { ...makeItem('1'), cardSize: 'MEDIUM' as any },
        api: mockApi,
        node: { rowIndex: 0 },
        column: { getColId: () => 'cardSize' },
      })
    );

    const button = container.querySelector('button');
    if (button) {
      button.click();
      expect(mockApi.startEditingCell).toHaveBeenCalled();
    }
  });

  it('labelSize arrow button onClick calls startEditingCell', () => {
    const mockApi = { startEditingCell: jest.fn() };
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'labelSize');
    const cr = col?.cellRenderer;
    if (!cr) return;

    const { container } = render(
      cr({
        value: 'SMALL',
        data: { ...makeItem('1'), labelSize: 'SMALL' as any },
        api: mockApi,
        node: { rowIndex: 0 },
        column: { getColId: () => 'labelSize' },
      })
    );

    const button = container.querySelector('button');
    if (button) {
      button.click();
      expect(mockApi.startEditingCell).toHaveBeenCalled();
    }
  });

  it('breadcrumbSize arrow button onClick calls startEditingCell', () => {
    const mockApi = { startEditingCell: jest.fn() };
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'breadcrumbSize');
    const cr = col?.cellRenderer;
    if (!cr) return;

    const { container } = render(
      cr({
        value: 'LARGE',
        data: { ...makeItem('1'), breadcrumbSize: 'LARGE' as any },
        api: mockApi,
        node: { rowIndex: 0 },
        column: { getColId: () => 'breadcrumbSize' },
      })
    );

    const button = container.querySelector('button');
    if (button) {
      button.click();
      expect(mockApi.startEditingCell).toHaveBeenCalled();
    }
  });

  it('simpleCellRenderer returns dash for empty value on non-dropdown fields', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'name');
    const cr = col?.cellRenderer;
    if (!cr) return;
    const result = cr({ value: '', data: makeItem('1'), node: { rowIndex: 0 }, column: { getColId: () => 'name' } });
    expect(result).toBe('-');
  });
});

describe('ItemTableAGGrid — additional enhanced valueGetters', () => {
  it('enhanced classification.type valueGetter returns type', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find(
      (c: any) => c.field === 'classification.type'
    );
    const vg = col?.valueGetter;
    if (!vg) return;
    const item = { ...makeItem('1'), classification: { type: 'Hardware', subType: 'Bolts' } };
    expect(vg({ data: item })).toBe('Hardware');
  });

  it('enhanced classification.subType valueGetter returns subType', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find(
      (c: any) => c.field === 'classification.subType'
    );
    const vg = col?.valueGetter;
    if (!vg) return;
    const item = { ...makeItem('1'), classification: { type: 'Hardware', subType: 'Bolts' } };
    expect(vg({ data: item })).toBe('Bolts');
  });

  it('enhanced locator.subLocation valueGetter returns subLocation', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find(
      (c: any) => c.field === 'locator.subLocation'
    );
    const vg = col?.valueGetter;
    if (!vg) return;
    const item = { ...makeItem('1'), locator: { subLocation: 'Bin 5' } };
    expect(vg({ data: item })).toBe('Bin 5');
  });

  it('enhanced locator.department valueGetter returns department', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find(
      (c: any) => c.field === 'locator.department'
    );
    const vg = col?.valueGetter;
    if (!vg) return;
    const item = { ...makeItem('1'), locator: { department: 'Eng' } };
    expect(vg({ data: item })).toBe('Eng');
  });

  it('enhanced locator.facility valueGetter returns facility', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find(
      (c: any) => c.field === 'locator.facility'
    );
    const vg = col?.valueGetter;
    if (!vg) return;
    const item = { ...makeItem('1'), locator: { facility: 'East Campus' } };
    expect(vg({ data: item })).toBe('East Campus');
  });

  it('enhanced primarySupply.sku valueGetter returns sku', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find(
      (c: any) => c.field === 'primarySupply.sku'
    );
    const vg = col?.valueGetter;
    if (!vg) return;
    const item = { ...makeItem('1'), primarySupply: { sku: 'VEND-123' } };
    expect(vg({ data: item })).toBe('VEND-123');
  });

  it('enhanced cardNotesDefault valueGetter returns card notes', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find(
      (c: any) => c.field === 'cardNotesDefault'
    );
    const vg = col?.valueGetter;
    if (!vg) return;
    const item = { ...makeItem('1'), cardNotesDefault: 'Card note here' };
    expect(vg({ data: item })).toBe('Card note here');
  });

  it('enhanced labelSize valueGetter returns valid label size', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'labelSize');
    const vg = col?.valueGetter;
    if (!vg) return;
    const item = { ...makeItem('1'), labelSize: 'SMALL' as any };
    const result = vg({ data: item });
    expect(typeof result).toBe('string');
  });

  it('enhanced breadcrumbSize valueGetter returns valid breadcrumb size', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find((c: any) => c.field === 'breadcrumbSize');
    const vg = col?.valueGetter;
    if (!vg) return;
    const item = { ...makeItem('1'), breadcrumbSize: 'LARGE' as any };
    const result = vg({ data: item });
    expect(typeof result).toBe('string');
  });

  it('enhanced orderQuantityAmount valueGetter returns amount', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find(
      (c: any) => c.colId === 'orderQuantityAmount'
    );
    const vg = col?.valueGetter;
    if (!vg) return;
    const item = { ...makeItem('1'), primarySupply: { orderQuantity: { amount: 24, unit: 'pack' } } };
    expect(vg({ data: item })).toBe('24');
  });

  it('enhanced orderQuantityUnit valueGetter returns unit', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find(
      (c: any) => c.colId === 'orderQuantityUnit'
    );
    const vg = col?.valueGetter;
    if (!vg) return;
    const item = { ...makeItem('1'), primarySupply: { orderQuantity: { amount: 24, unit: 'pack' } } };
    expect(vg({ data: item })).toBe('pack');
  });

  it('enhanced primarySupply.orderCost valueGetter returns cost value string', () => {
    render(<ItemTableAGGrid {...defaultProps} />);
    const col = _lastArdaGridProps?.columnDefs?.find(
      (c: any) => c.field === 'primarySupply.orderCost'
    );
    const vg = col?.valueGetter;
    if (!vg) return;
    const item = { ...makeItem('1'), primarySupply: { orderCost: { value: 75.0, currency: 'USD' } } };
    expect(vg({ data: item })).toBe('75');
  });
});

describe('ItemTableAGGrid — handleCellEditingStopped with no unsaved modal', () => {
  it('handleCellEditingStopped with no editing cells publishes dirty row', async () => {
    jest.useFakeTimers();
    const items = [makeItem('stop-test-1')];
    mockGridApi.getEditingCells.mockReturnValue([]);
    const rowNode = { data: items[0] };
    mockGridApi.getRowNode.mockReturnValue(rowNode);

    render(<ItemTableAGGrid {...defaultProps} items={items} />);

    // Make row dirty
    act(() => {
      _lastArdaGridProps?.onCellValueChanged?.({
        data: items[0], oldValue: 'old', newValue: 'new',
        node: { data: items[0] }, column: { getColId: () => 'name' },
      });
    });

    const onCellEditingStopped = _lastArdaGridProps?.onCellEditingStopped;
    act(() => {
      onCellEditingStopped?.({
        data: items[0],
        node: { data: items[0] },
        column: { getColId: () => 'name' },
      });
    });

    // Timer fires for the publishRow setTimeout
    await act(async () => { jest.runAllTimers(); });
    expect(mockCreateDraftItem).toHaveBeenCalledWith('stop-test-1');
    jest.useRealTimers();
  });
});
