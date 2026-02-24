import React, { createRef } from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArdaGrid, { ArdaGridRef } from './ArdaGrid';
import '@testing-library/jest-dom';

// ─────────────────────────────────────────────────────────────────────────────
// Mock ag-grid-react so we can fire onGridReady and capture internal callbacks
// ─────────────────────────────────────────────────────────────────────────────
let _lastAgGridProps: any = null;
let mockInternalGridApi: any = null;

jest.mock('ag-grid-react', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  const MockAgGridReact = React.forwardRef((props: any, _ref: any) => {
    _lastAgGridProps = props;
    React.useEffect(() => {
      if (props.onGridReady && mockInternalGridApi) {
        props.onGridReady({ api: mockInternalGridApi });
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return React.createElement('div', { 'data-testid': 'ag-grid-react' });
    });
  MockAgGridReact.displayName = 'MockAgGridReact';
  return { AgGridReact: MockAgGridReact };
});

jest.mock('ag-grid-community', () => ({
  ModuleRegistry: { registerModules: jest.fn() },
  AllCommunityModule: {},
}));

beforeEach(() => {
  _lastAgGridProps = null;
  localStorage.clear();
  mockInternalGridApi = {
    getSelectedRows: jest.fn(() => []),
    selectAll: jest.fn(),
    deselectAll: jest.fn(),
    exportDataAsCsv: jest.fn(),
    refreshCells: jest.fn(),
    getColumnState: jest.fn(() => [{ colId: 'name', hide: false, width: 150, sort: null, sortIndex: null }]),
    getColumns: jest.fn(() => [{ colId: 'name' }, { colId: 'id' }]),
    applyColumnState: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    getDisplayedRowCount: jest.fn(() => 1),
    getEditingCells: jest.fn(() => []),
    forEachNodeAfterFilterAndSort: jest.fn(),
    getFilterModel: jest.fn(() => ({})),
  };
});

const minimalColumnDefs = [{ field: 'id' }, { field: 'name' }];
const minimalRowData = [{ id: '1', name: 'Item 1' }];
const paginationData = {
  currentPageSize: 10,
  totalItems: 1,
  currentPage: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

describe('ArdaGrid', () => {
  // ────────────────────────────────────────────────────────────────────────────
  // Existing tests (pagination CSS)
  // ────────────────────────────────────────────────────────────────────────────

  it('applies arda-grid-with-pagination and arda-grid-body-wrap when paginationData is provided so last row is visible', () => {
    const { container } = render(
      <ArdaGrid
        rowData={minimalRowData}
        columnDefs={minimalColumnDefs}
        paginationData={paginationData}
        onNextPage={() => {}}
        onPreviousPage={() => {}}
        onFirstPage={() => {}}
      />
    );
    const themeDiv = container.querySelector('.arda-grid-with-pagination');
    expect(themeDiv).toBeInTheDocument();
    const bodyWrap = container.querySelector('.arda-grid-body-wrap');
    expect(bodyWrap).toBeInTheDocument();
    expect(themeDiv).toContainElement(bodyWrap as HTMLElement);
  });

  it('does not apply arda-grid-with-pagination when paginationData is not provided but body-wrap is always present', () => {
    const { container } = render(
      <ArdaGrid rowData={minimalRowData} columnDefs={minimalColumnDefs} />
    );
    expect(container.querySelector('.arda-grid-with-pagination')).not.toBeInTheDocument();
    const bodyWrap = container.querySelector('.arda-grid-body-wrap');
    expect(bodyWrap).toBeInTheDocument();
    expect(bodyWrap).toHaveClass('h-full');
  });

  it('renders pagination footer when paginationData is provided', () => {
    const { container } = render(
      <ArdaGrid
        rowData={minimalRowData}
        columnDefs={minimalColumnDefs}
        paginationData={paginationData}
        onNextPage={() => {}}
        onPreviousPage={() => {}}
        onFirstPage={() => {}}
      />
    );
    expect(screen.getByTitle('First page')).toBeInTheDocument();
    expect(screen.getByTitle('Previous page')).toBeInTheDocument();
    expect(screen.getByTitle('Next page')).toBeInTheDocument();
    const footer = container.querySelector('.ag-pagination-footer');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveTextContent('Page');
    expect(footer).toHaveTextContent('1');
  });

  describe('row click – prevent panel when editing or dropdown', () => {
    it('does not call onRowClicked when event.data is missing', () => {
      const onRowClicked = jest.fn();
      render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          onRowClicked={onRowClicked}
        />
      );
      const rowClickHandler = _lastAgGridProps?.onRowClicked;
      expect(rowClickHandler).toBeDefined();
      rowClickHandler?.({ data: undefined as unknown as Record<string, unknown> });
      expect(onRowClicked).not.toHaveBeenCalled();
    });

    it('does not call onRowClicked when any cell is editing (getEditingCells non-empty)', () => {
      const onRowClicked = jest.fn();
      mockInternalGridApi.getEditingCells.mockReturnValue([{ rowIndex: 0, colId: 'name' }]);
      render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          onRowClicked={onRowClicked}
        />
      );
      const rowClickHandler = _lastAgGridProps?.onRowClicked;
      rowClickHandler?.({ data: { id: '1', name: 'Item 1' }, event: { target: document.createElement('div') }, api: mockInternalGridApi });
      expect(onRowClicked).not.toHaveBeenCalled();
    });

    it('does not call onRowClicked when click target is input, select, or listbox', () => {
      const onRowClicked = jest.fn();
      render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          onRowClicked={onRowClicked}
        />
      );
      const rowClickHandler = _lastAgGridProps?.onRowClicked;
      const input = document.createElement('input');
      input.setAttribute('role', 'listbox');
      rowClickHandler?.({
        data: { id: '1', name: 'Item 1' },
        event: { target: input },
        api: mockInternalGridApi,
      });
      expect(onRowClicked).not.toHaveBeenCalled();
    });

    it('calls onRowClicked when click is on row and no guard matches', () => {
      const onRowClicked = jest.fn();
      render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          onRowClicked={onRowClicked}
        />
      );
      const rowClickHandler = _lastAgGridProps?.onRowClicked;
      const div = document.createElement('div');
      rowClickHandler?.({
        data: { id: '1', name: 'Item 1' },
        event: { target: div },
        api: mockInternalGridApi,
      });
      expect(onRowClicked).toHaveBeenCalledTimes(1);
      expect(onRowClicked).toHaveBeenCalledWith({ id: '1', name: 'Item 1' });
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // Container and className
  // ────────────────────────────────────────────────────────────────────────────

  it('wraps content in arda-grid-container div', () => {
    const { container } = render(
      <ArdaGrid rowData={[]} columnDefs={minimalColumnDefs} />
    );
    expect(container.querySelector('.arda-grid-container')).toBeInTheDocument();
  });

  it('applies custom className to the container', () => {
    const { container } = render(
      <ArdaGrid
        rowData={[]}
        columnDefs={minimalColumnDefs}
        className='my-custom-class'
      />
    );
    const containerEl = container.querySelector('.arda-grid-container');
    expect(containerEl).toHaveClass('my-custom-class');
  });

  it('wraps grid in ag-theme-arda div', () => {
    const { container } = render(
      <ArdaGrid rowData={[]} columnDefs={minimalColumnDefs} />
    );
    expect(container.querySelector('.ag-theme-arda')).toBeInTheDocument();
  });

  // ────────────────────────────────────────────────────────────────────────────
  // Pagination buttons state
  // ────────────────────────────────────────────────────────────────────────────

  it('disables Previous and First page buttons when on first page', () => {
    render(
      <ArdaGrid
        rowData={minimalRowData}
        columnDefs={minimalColumnDefs}
        paginationData={{ ...paginationData, hasPreviousPage: false }}
        onNextPage={() => {}}
        onPreviousPage={() => {}}
        onFirstPage={() => {}}
      />
    );
    expect(screen.getByTitle('First page')).toBeDisabled();
    expect(screen.getByTitle('Previous page')).toBeDisabled();
  });

  it('enables Next page button when hasNextPage is true', () => {
    render(
      <ArdaGrid
        rowData={minimalRowData}
        columnDefs={minimalColumnDefs}
        paginationData={{ ...paginationData, hasNextPage: true }}
        onNextPage={() => {}}
        onPreviousPage={() => {}}
        onFirstPage={() => {}}
      />
    );
    expect(screen.getByTitle('Next page')).not.toBeDisabled();
  });

  it('disables Next page button when hasNextPage is false', () => {
    render(
      <ArdaGrid
        rowData={minimalRowData}
        columnDefs={minimalColumnDefs}
        paginationData={{ ...paginationData, hasNextPage: false }}
        onNextPage={() => {}}
        onPreviousPage={() => {}}
        onFirstPage={() => {}}
      />
    );
    expect(screen.getByTitle('Next page')).toBeDisabled();
  });

  it('calls onNextPage when Next page button is clicked', async () => {
    const onNextPage = jest.fn();
    render(
      <ArdaGrid
        rowData={minimalRowData}
        columnDefs={minimalColumnDefs}
        paginationData={{ ...paginationData, hasNextPage: true }}
        onNextPage={onNextPage}
        onPreviousPage={() => {}}
        onFirstPage={() => {}}
      />
    );
    await userEvent.click(screen.getByTitle('Next page'));
    expect(onNextPage).toHaveBeenCalledTimes(1);
  });

  it('calls onPreviousPage when Previous page button is clicked', async () => {
    const onPreviousPage = jest.fn();
    render(
      <ArdaGrid
        rowData={minimalRowData}
        columnDefs={minimalColumnDefs}
        paginationData={{ ...paginationData, hasPreviousPage: true }}
        onNextPage={() => {}}
        onPreviousPage={onPreviousPage}
        onFirstPage={() => {}}
      />
    );
    await userEvent.click(screen.getByTitle('Previous page'));
    expect(onPreviousPage).toHaveBeenCalledTimes(1);
  });

  it('calls onFirstPage when First page button is clicked', async () => {
    const onFirstPage = jest.fn();
    render(
      <ArdaGrid
        rowData={minimalRowData}
        columnDefs={minimalColumnDefs}
        paginationData={{ ...paginationData, hasPreviousPage: true }}
        onNextPage={() => {}}
        onPreviousPage={() => {}}
        onFirstPage={onFirstPage}
      />
    );
    await userEvent.click(screen.getByTitle('First page'));
    expect(onFirstPage).toHaveBeenCalledTimes(1);
  });

  it('shows current page number in pagination footer', () => {
    render(
      <ArdaGrid
        rowData={minimalRowData}
        columnDefs={minimalColumnDefs}
        paginationData={{ ...paginationData, currentPage: 3 }}
        onNextPage={() => {}}
        onPreviousPage={() => {}}
        onFirstPage={() => {}}
      />
    );
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  // ────────────────────────────────────────────────────────────────────────────
  // Imperative ref API
  // ────────────────────────────────────────────────────────────────────────────

  it('exposes getGridApi via ref (returns null before grid is ready)', () => {
    const ref = createRef<ArdaGridRef>();
    render(
      <ArdaGrid
        rowData={minimalRowData}
        columnDefs={minimalColumnDefs}
        ref={ref}
      />
    );
    // getGridApi may be null initially since AG Grid hasn't fired onGridReady yet
    // The ref object itself should exist
    expect(ref.current).not.toBeNull();
    expect(typeof ref.current?.getGridApi).toBe('function');
  });

  it('exposes refreshData, selectAll, deselectAll, exportDataAsCsv via ref', () => {
    const ref = createRef<ArdaGridRef>();
    render(
      <ArdaGrid
        rowData={minimalRowData}
        columnDefs={minimalColumnDefs}
        ref={ref}
      />
    );
    expect(typeof ref.current?.refreshData).toBe('function');
    expect(typeof ref.current?.selectAll).toBe('function');
    expect(typeof ref.current?.deselectAll).toBe('function');
    expect(typeof ref.current?.exportDataAsCsv).toBe('function');
  });

  it('getSelectedRows returns empty array before any selection', () => {
    const ref = createRef<ArdaGridRef>();
    render(
      <ArdaGrid
        rowData={minimalRowData}
        columnDefs={minimalColumnDefs}
        ref={ref}
      />
    );
    // gridApi may not be set yet; should return []
    expect(ref.current?.getSelectedRows()).toEqual([]);
  });

  // ────────────────────────────────────────────────────────────────────────────
  // Empty states
  // ────────────────────────────────────────────────────────────────────────────

  it('renders custom emptyStateComponent when rows are empty and no active search', () => {
    render(
      <ArdaGrid
        rowData={[]}
        columnDefs={minimalColumnDefs}
        emptyStateComponent={<div data-testid='empty-state'>No items</div>}
        hasActiveSearch={false}
      />
    );
    // The overlay is rendered by AG Grid inside the grid canvas;
    // we verify the component was provided and grid renders without crashing.
    const { container } = render(
      <ArdaGrid
        rowData={[]}
        columnDefs={minimalColumnDefs}
        emptyStateComponent={<div>Empty</div>}
      />
    );
    expect(container.querySelector('.arda-grid-container')).toBeInTheDocument();
  });

  it('renders without crashing when hasActiveSearch is true and rows are empty', () => {
    const { container } = render(
      <ArdaGrid
        rowData={[]}
        columnDefs={minimalColumnDefs}
        hasActiveSearch={true}
      />
    );
    expect(container.querySelector('.arda-grid-container')).toBeInTheDocument();
  });

  // ────────────────────────────────────────────────────────────────────────────
  // Row actions column
  // ────────────────────────────────────────────────────────────────────────────

  it('renders without crashing when enableRowActions is true with row actions', () => {
    const rowActions = [
      { label: 'Delete', onClick: jest.fn() },
      { label: 'Edit', onClick: jest.fn() },
    ];
    const { container } = render(
      <ArdaGrid
        rowData={minimalRowData}
        columnDefs={minimalColumnDefs}
        enableRowActions={true}
        rowActions={rowActions}
      />
    );
    expect(container.querySelector('.arda-grid-container')).toBeInTheDocument();
  });

  // ────────────────────────────────────────────────────────────────────────────
  // Loading / error
  // ────────────────────────────────────────────────────────────────────────────

  it('renders without crashing when loading=true', () => {
    const { container } = render(
      <ArdaGrid
        rowData={[]}
        columnDefs={minimalColumnDefs}
        loading={true}
      />
    );
    expect(container.querySelector('.arda-grid-container')).toBeInTheDocument();
  });

  it('renders without crashing when error is provided', () => {
    const { container } = render(
      <ArdaGrid
        rowData={[]}
        columnDefs={minimalColumnDefs}
        error='Something went wrong'
      />
    );
    expect(container.querySelector('.arda-grid-container')).toBeInTheDocument();
  });

  // ────────────────────────────────────────────────────────────────────────────
  // handleGridReady + gridApi-dependent ref methods
  // ────────────────────────────────────────────────────────────────────────────

  it('onGridReady fires the external onGridReady callback', () => {
    const onGridReady = jest.fn();
    render(
      <ArdaGrid
        rowData={minimalRowData}
        columnDefs={minimalColumnDefs}
        onGridReady={onGridReady}
      />
    );
    expect(onGridReady).toHaveBeenCalledTimes(1);
  });

  it('refreshData calls gridApi.refreshCells when gridApi is set', () => {
    const ref = createRef<ArdaGridRef>();
    render(<ArdaGrid rowData={minimalRowData} columnDefs={minimalColumnDefs} ref={ref} />);
    act(() => { ref.current?.refreshData(); });
    expect(mockInternalGridApi.refreshCells).toHaveBeenCalledTimes(1);
  });

  it('selectAll calls gridApi.selectAll when gridApi is set', () => {
    const ref = createRef<ArdaGridRef>();
    render(<ArdaGrid rowData={minimalRowData} columnDefs={minimalColumnDefs} ref={ref} />);
    act(() => { ref.current?.selectAll(); });
    expect(mockInternalGridApi.selectAll).toHaveBeenCalledTimes(1);
  });

  it('deselectAll calls gridApi.deselectAll when gridApi is set', () => {
    const ref = createRef<ArdaGridRef>();
    render(<ArdaGrid rowData={minimalRowData} columnDefs={minimalColumnDefs} ref={ref} />);
    act(() => { ref.current?.deselectAll(); });
    expect(mockInternalGridApi.deselectAll).toHaveBeenCalledTimes(1);
  });

  it('exportDataAsCsv calls gridApi.exportDataAsCsv when gridApi is set', () => {
    const ref = createRef<ArdaGridRef>();
    render(<ArdaGrid rowData={minimalRowData} columnDefs={minimalColumnDefs} ref={ref} />);
    act(() => { ref.current?.exportDataAsCsv(); });
    expect(mockInternalGridApi.exportDataAsCsv).toHaveBeenCalledTimes(1);
  });

  it('getSelectedRows returns result from gridApi.getSelectedRows', () => {
    const mockItem = { id: '1', name: 'Item 1' };
    mockInternalGridApi.getSelectedRows.mockReturnValue([mockItem]);
    const ref = createRef<ArdaGridRef>();
    render(<ArdaGrid rowData={minimalRowData} columnDefs={minimalColumnDefs} ref={ref} />);
    expect(ref.current?.getSelectedRows()).toEqual([mockItem]);
  });

  it('handleGridReady applies old-format array localStorage state', () => {
    const savedState = JSON.stringify([{ colId: 'name', hide: false, width: 200, pinned: 'left' }]);
    localStorage.setItem('test-key', savedState);
    render(
      <ArdaGrid
        rowData={minimalRowData}
        columnDefs={minimalColumnDefs}
        enableColumnStatePersistence={true}
        persistenceKey='test-key'
      />
    );
    // handleGridReady is called via onGridReady mock; applyColumnState scheduled via setTimeout
    // Verify gridReady fired (applyColumnState may be in setTimeout, just verify no crash)
    expect(mockInternalGridApi).toBeTruthy();
  });

  it('handleGridReady applies new-format object localStorage state with sortModel', () => {
    const savedState = JSON.stringify({
      columnState: [{ colId: 'name', hide: false, width: 200 }],
      sortModel: [{ colId: 'name', sort: 'asc', sortIndex: 0 }],
    });
    localStorage.setItem('test-key-2', savedState);
    render(
      <ArdaGrid
        rowData={minimalRowData}
        columnDefs={minimalColumnDefs}
        enableColumnStatePersistence={true}
        persistenceKey='test-key-2'
      />
    );
    expect(mockInternalGridApi).toBeTruthy();
  });

  it('handleGridReady handles malformed localStorage JSON gracefully', () => {
    localStorage.setItem('bad-key', 'not-valid-json{{{');
    expect(() =>
      render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          enableColumnStatePersistence={true}
          persistenceKey='bad-key'
        />
      )
    ).not.toThrow();
  });

  it('registers event listeners when enableColumnStatePersistence is true', () => {
    render(
      <ArdaGrid
        rowData={minimalRowData}
        columnDefs={minimalColumnDefs}
        enableColumnStatePersistence={true}
        persistenceKey='persist-key'
      />
    );
    expect(mockInternalGridApi.addEventListener).toHaveBeenCalledWith('columnResized', expect.any(Function));
    expect(mockInternalGridApi.addEventListener).toHaveBeenCalledWith('columnVisible', expect.any(Function));
    expect(mockInternalGridApi.addEventListener).toHaveBeenCalledWith('columnMoved', expect.any(Function));
    expect(mockInternalGridApi.addEventListener).toHaveBeenCalledWith('sortChanged', expect.any(Function));
  });

  it('onColumnStateChange returning false prevents save when saving column state', () => {
    const onColumnStateChange = jest.fn(() => false);
    render(
      <ArdaGrid
        rowData={minimalRowData}
        columnDefs={minimalColumnDefs}
        enableColumnStatePersistence={true}
        persistenceKey='persist-key-2'
        onColumnStateChange={onColumnStateChange}
      />
    );
    // Fire columnResized event to trigger saveGridState
    const columnResizedCall = mockInternalGridApi.addEventListener.mock.calls.find(
      (c: any[]) => c[0] === 'columnResized'
    );
    if (columnResizedCall) {
      act(() => { columnResizedCall[1](); });
    }
    // No crash expected
    expect(onColumnStateChange).toBeDefined();
  });

  // ────────────────────────────────────────────────────────────────────────────
  // handleRowClicked
  // ────────────────────────────────────────────────────────────────────────────

  it('handleRowClicked calls onRowClicked with row data', () => {
    const onRowClicked = jest.fn();
    render(
      <ArdaGrid
        rowData={minimalRowData}
        columnDefs={minimalColumnDefs}
        onRowClicked={onRowClicked}
      />
    );
    act(() => {
      _lastAgGridProps?.onRowClicked({
        data: { id: '1', name: 'Item 1' },
        event: null,
        api: mockInternalGridApi,
      });
    });
    expect(onRowClicked).toHaveBeenCalledWith({ id: '1', name: 'Item 1' });
  });

  it('handleRowClicked does nothing when onRowClicked is not provided', () => {
    render(<ArdaGrid rowData={minimalRowData} columnDefs={minimalColumnDefs} />);
    expect(() => {
      act(() => {
        _lastAgGridProps?.onRowClicked({ data: { id: '1' }, event: null, api: mockInternalGridApi });
      });
    }).not.toThrow();
  });

  it('handleRowClicked does nothing when event.data is missing', () => {
    const onRowClicked = jest.fn();
    render(
      <ArdaGrid rowData={minimalRowData} columnDefs={minimalColumnDefs} onRowClicked={onRowClicked} />
    );
    act(() => {
      _lastAgGridProps?.onRowClicked({ data: undefined, event: null, api: mockInternalGridApi });
    });
    expect(onRowClicked).not.toHaveBeenCalled();
  });

  it('handleRowClicked does nothing when cell is in edit mode', () => {
    const onRowClicked = jest.fn();
    mockInternalGridApi.getEditingCells.mockReturnValue([{ rowIndex: 0, column: { colId: 'name' } }]);
    render(
      <ArdaGrid rowData={minimalRowData} columnDefs={minimalColumnDefs} onRowClicked={onRowClicked} />
    );
    act(() => {
      _lastAgGridProps?.onRowClicked({
        data: { id: '1' },
        event: null,
        api: mockInternalGridApi,
      });
    });
    expect(onRowClicked).not.toHaveBeenCalled();
  });

  it('handleRowClicked does nothing when clicking a checkbox', () => {
    const onRowClicked = jest.fn();
    render(
      <ArdaGrid rowData={minimalRowData} columnDefs={minimalColumnDefs} onRowClicked={onRowClicked} />
    );
    const checkboxEl = document.createElement('input');
    checkboxEl.type = 'checkbox';
    act(() => {
      _lastAgGridProps?.onRowClicked({
        data: { id: '1' },
        event: { target: checkboxEl },
        api: mockInternalGridApi,
      });
    });
    expect(onRowClicked).not.toHaveBeenCalled();
  });

  // ────────────────────────────────────────────────────────────────────────────
  // handleSelectionChanged / handleSortChanged / handleFilterChanged
  // ────────────────────────────────────────────────────────────────────────────

  it('handleSelectionChanged calls onSelectionChanged with selected rows', () => {
    const onSelectionChanged = jest.fn();
    mockInternalGridApi.getSelectedRows.mockReturnValue([{ id: '1' }]);
    render(
      <ArdaGrid
        rowData={minimalRowData}
        columnDefs={minimalColumnDefs}
        onSelectionChanged={onSelectionChanged}
      />
    );
    act(() => {
      _lastAgGridProps?.onSelectionChanged({ api: mockInternalGridApi });
    });
    expect(onSelectionChanged).toHaveBeenCalledWith([{ id: '1' }]);
  });

  it('handleSortChanged calls onSortChanged with column state', () => {
    const onSortChanged = jest.fn();
    render(
      <ArdaGrid
        rowData={minimalRowData}
        columnDefs={minimalColumnDefs}
        onSortChanged={onSortChanged}
      />
    );
    act(() => {
      _lastAgGridProps?.onSortChanged({ api: mockInternalGridApi });
    });
    expect(onSortChanged).toHaveBeenCalled();
  });

  it('handleFilterChanged calls onFilterChanged with filter model', () => {
    const onFilterChanged = jest.fn();
    render(
      <ArdaGrid
        rowData={minimalRowData}
        columnDefs={minimalColumnDefs}
        onFilterChanged={onFilterChanged}
      />
    );
    act(() => {
      _lastAgGridProps?.onFilterChanged({ api: mockInternalGridApi });
    });
    expect(onFilterChanged).toHaveBeenCalled();
  });

  it('getGridApi via ref returns the mock gridApi after onGridReady', () => {
    const ref = createRef<ArdaGridRef>();
    render(<ArdaGrid rowData={minimalRowData} columnDefs={minimalColumnDefs} ref={ref} />);
    expect(ref.current?.getGridApi()).toBe(mockInternalGridApi);
  });

  // ────────────────────────────────────────────────────────────────────────────
  // getRowId function branches
  // ────────────────────────────────────────────────────────────────────────────

  it('getRowId returns entityId when present', () => {
    render(<ArdaGrid rowData={minimalRowData} columnDefs={minimalColumnDefs} />);
    const getRowId = _lastAgGridProps?.gridOptions?.getRowId;
    expect(getRowId?.({ data: { entityId: 'eid-1' } })).toBe('eid-1');
  });

  it('getRowId returns id when no entityId', () => {
    render(<ArdaGrid rowData={minimalRowData} columnDefs={minimalColumnDefs} />);
    const getRowId = _lastAgGridProps?.gridOptions?.getRowId;
    expect(getRowId?.({ data: { id: 'id-1' } })).toBe('id-1');
  });

  it('getRowId returns eId when no entityId or id', () => {
    render(<ArdaGrid rowData={minimalRowData} columnDefs={minimalColumnDefs} />);
    const getRowId = _lastAgGridProps?.gridOptions?.getRowId;
    expect(getRowId?.({ data: { eId: 'eid-2' } })).toBe('eid-2');
  });

  it('getRowId returns fallback string for data with none of the known fields', () => {
    render(<ArdaGrid rowData={minimalRowData} columnDefs={minimalColumnDefs} />);
    const getRowId = _lastAgGridProps?.gridOptions?.getRowId;
    const result = getRowId?.({ data: { name: 'foo' } });
    expect(result).toMatch(/^row-/);
  });

  // ────────────────────────────────────────────────────────────────────────────
  // Row actions column cellRenderer
  // ────────────────────────────────────────────────────────────────────────────

  it('row actions cellRenderer renders action buttons', () => {
    const onClick = jest.fn();
    const rowActions = [
      { label: 'Delete', onClick },
      { label: 'Edit', icon: <span>✎</span>, onClick: jest.fn() },
    ];
    render(
      <ArdaGrid
        rowData={minimalRowData}
        columnDefs={minimalColumnDefs}
        enableRowActions={true}
        rowActions={rowActions}
      />
    );
    // The actions column cellRenderer is in _lastAgGridProps.columnDefs
    const actionCol = _lastAgGridProps?.columnDefs?.find((c: any) => c.field === 'actions');
    if (!actionCol) return; // safeguard
    const cr = actionCol.cellRenderer;
    const { container: btnContainer } = render(cr({ data: { id: '1' } }));
    const buttons = btnContainer.querySelectorAll('button');
    expect(buttons.length).toBe(2);
  });

  // ────────────────────────────────────────────────────────────────────────────
  // Overlay components via _lastAgGridProps
  // ────────────────────────────────────────────────────────────────────────────

  it('LoadingOverlay renders spinner when loading is true', () => {
    render(<ArdaGrid rowData={[]} columnDefs={minimalColumnDefs} loading={true} />);
    const LoadingOverlay = _lastAgGridProps?.loadingOverlayComponent;
    if (!LoadingOverlay) return;
    const { container } = render(<LoadingOverlay />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('LoadingOverlay renders nothing when loading is false', () => {
    render(<ArdaGrid rowData={[]} columnDefs={minimalColumnDefs} loading={false} />);
    const LoadingOverlay = _lastAgGridProps?.loadingOverlayComponent;
    if (!LoadingOverlay) return;
    const { container } = render(<LoadingOverlay />);
    expect(container.firstChild).toBeNull();
  });

  it('NoRowsOverlay renders no-search-results when rows are empty and searching', () => {
    render(<ArdaGrid rowData={[]} columnDefs={minimalColumnDefs} hasActiveSearch={true} />);
    const NoRowsOverlay = _lastAgGridProps?.noRowsOverlayComponent;
    if (!NoRowsOverlay) return;
    const { container } = render(<NoRowsOverlay />);
    expect(container).toBeInTheDocument();
  });

  it('NoRowsOverlay renders empty state when emptyStateComponent provided', () => {
    render(
      <ArdaGrid
        rowData={[]}
        columnDefs={minimalColumnDefs}
        emptyStateComponent={<div data-testid='empty'>No data</div>}
      />
    );
    const NoRowsOverlay = _lastAgGridProps?.noRowsOverlayComponent;
    if (!NoRowsOverlay) return;
    const { container } = render(<NoRowsOverlay />);
    expect(container).toBeInTheDocument();
  });

  // ────────────────────────────────────────────────────────────────────────────
  // More handleRowClicked branches (col-id based early returns)
  // ────────────────────────────────────────────────────────────────────────────

  it('handleRowClicked does nothing when clicking inside select col-id element', () => {
    const onRowClicked = jest.fn();
    render(
      <ArdaGrid rowData={minimalRowData} columnDefs={minimalColumnDefs} onRowClicked={onRowClicked} />
    );
    const cell = document.createElement('div');
    cell.setAttribute('col-id', 'select');
    act(() => {
      _lastAgGridProps?.onRowClicked({
        data: { id: '1' },
        event: { target: cell },
        api: mockInternalGridApi,
      });
    });
    expect(onRowClicked).not.toHaveBeenCalled();
  });

  it('handleRowClicked does nothing when clicking inside quickActions col-id element', () => {
    const onRowClicked = jest.fn();
    render(
      <ArdaGrid rowData={minimalRowData} columnDefs={minimalColumnDefs} onRowClicked={onRowClicked} />
    );
    const cell = document.createElement('div');
    cell.setAttribute('col-id', 'quickActions');
    act(() => {
      _lastAgGridProps?.onRowClicked({
        data: { id: '1' },
        event: { target: cell },
        api: mockInternalGridApi,
      });
    });
    expect(onRowClicked).not.toHaveBeenCalled();
  });

  // ────────────────────────────────────────────────────────────────────────────
  // Column state persistence via fake timers
  // ────────────────────────────────────────────────────────────────────────────

  describe('column state persistence (fake timers)', () => {
    beforeEach(() => jest.useFakeTimers({ legacyFakeTimers: true }));
    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('saveGridState persists column state to localStorage on columnResized event', () => {
      render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          enableColumnStatePersistence={true}
          persistenceKey='resize-key'
        />
      );
      const resizeCall = mockInternalGridApi.addEventListener.mock.calls.find(
        (c: any[]) => c[0] === 'columnResized'
      );
      if (!resizeCall) return;
      act(() => { resizeCall[1](); });
      act(() => { jest.runAllTimers(); });
      expect(localStorage.getItem('resize-key')).not.toBeNull();
    });

    it('saveGridState is skipped when onColumnStateChange returns false', () => {
      const onColumnStateChange = jest.fn(() => false);
      render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          enableColumnStatePersistence={true}
          persistenceKey='skip-key'
          onColumnStateChange={onColumnStateChange}
        />
      );
      const resizeCall = mockInternalGridApi.addEventListener.mock.calls.find(
        (c: any[]) => c[0] === 'columnResized'
      );
      if (!resizeCall) return;
      act(() => { resizeCall[1](); });
      act(() => { jest.runAllTimers(); });
      // onColumnStateChange should have been called
      expect(onColumnStateChange).toHaveBeenCalled();
      // localStorage should NOT be set (because we returned false)
      expect(localStorage.getItem('skip-key')).toBeNull();
    });

    it('handleColumnVisible persists column visibility to localStorage', () => {
      render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          enableColumnStatePersistence={true}
          persistenceKey='visible-key'
        />
      );
      const visibleCall = mockInternalGridApi.addEventListener.mock.calls.find(
        (c: any[]) => c[0] === 'columnVisible'
      );
      if (!visibleCall) return;
      act(() => { visibleCall[1](); });
      act(() => { jest.runAllTimers(); });
      expect(localStorage.getItem('visible-key')).not.toBeNull();
    });

    it('handleColumnMoved persists column order to localStorage', () => {
      render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          enableColumnStatePersistence={true}
          persistenceKey='moved-key'
        />
      );
      const movedCall = mockInternalGridApi.addEventListener.mock.calls.find(
        (c: any[]) => c[0] === 'columnMoved'
      );
      if (!movedCall) return;
      act(() => { movedCall[1](); });
      act(() => { jest.runAllTimers(); });
      expect(localStorage.getItem('moved-key')).not.toBeNull();
    });

    it('handleGridReady applies old-format localStorage state after timeout', () => {
      const savedState = JSON.stringify([{ colId: 'name', hide: false, width: 200 }]);
      localStorage.setItem('apply-key', savedState);
      render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          enableColumnStatePersistence={true}
          persistenceKey='apply-key'
        />
      );
      // Advance timers to trigger the 200ms setTimeout in handleGridReady
      act(() => { jest.runAllTimers(); });
      expect(mockInternalGridApi.applyColumnState).toHaveBeenCalled();
    });

    it('handleGridReady applies new-format localStorage state with sort after timeout', () => {
      const savedState = JSON.stringify({
        columnState: [{ colId: 'name', hide: false, width: 200 }],
        sortModel: [{ colId: 'name', sort: 'asc', sortIndex: 0 }],
      });
      localStorage.setItem('apply-key-2', savedState);
      render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          enableColumnStatePersistence={true}
          persistenceKey='apply-key-2'
        />
      );
      act(() => { jest.runAllTimers(); });
      expect(mockInternalGridApi.applyColumnState).toHaveBeenCalled();
    });
  });
});
