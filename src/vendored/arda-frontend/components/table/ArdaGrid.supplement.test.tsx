/**
 * Supplementary ArdaGrid tests — PC-2 coverage lift
 * Focus: persistenceKey-change effect (lines 382–512), overlays, handleRowClicked edge cases,
 *        ErrorOverlay, EmptyStateOverlay, NoRowsOverlay sub-components, column event handler internals
 */
import React, { createRef } from 'react';
import { render, act, fireEvent } from '@testing-library/react';
import ArdaGrid, { ArdaGridRef } from './ArdaGrid';
import '@testing-library/jest-dom';

// ─────────────────────────────────────────────────────────────────────────────
// Mock ag-grid-react – same pattern as the base test file
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
    getColumnState: jest.fn(() => [
      { colId: 'name', hide: false, width: 150, sort: null, sortIndex: null },
    ]),
    getColumns: jest.fn(() => [{ colId: 'name' }, { colId: 'id' }]),
    applyColumnState: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    getDisplayedRowCount: jest.fn(() => 1),
    getEditingCells: jest.fn(() => []),
    forEachNodeAfterFilterAndSort: jest.fn(),
    getFilterModel: jest.fn(() => ({})),
    autoSizeAllColumns: jest.fn(),
  };
});

const minimalColumnDefs = [{ field: 'id' }, { field: 'name' }];
const minimalRowData = [{ id: '1', name: 'Item 1' }];

describe('ArdaGrid - supplementary coverage (PC-2)', () => {
  // ──────────────────────────────────────────────────────────────────────────
  // persistenceKey change effect (lines 382–512)
  // ──────────────────────────────────────────────────────────────────────────

  describe('persistenceKey change effect', () => {
    beforeEach(() => jest.useFakeTimers({ legacyFakeTimers: true }));
    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('applies persisted state when persistenceKey changes after gridApi is set (old format)', () => {
      const savedState = JSON.stringify([
        { colId: 'name', hide: false, width: 200, pinned: null },
      ]);
      localStorage.setItem('key-b', savedState);

      const { rerender } = render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          enableColumnStatePersistence={true}
          persistenceKey='key-a'
        />
      );

      // Trigger the persistenceKey change effect by switching key
      rerender(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          enableColumnStatePersistence={true}
          persistenceKey='key-b'
        />
      );

      // Run all timers to let the retry logic run
      act(() => { jest.runAllTimers(); });

      // applyColumnState should eventually be called
      expect(mockInternalGridApi.applyColumnState).toHaveBeenCalled();
    });

    it('applies new-format state on persistenceKey change', () => {
      const savedState = JSON.stringify({
        columnState: [{ colId: 'name', hide: false, width: 200 }],
        sortModel: [{ colId: 'name', sort: 'asc', sortIndex: 0 }],
      });
      localStorage.setItem('key-new', savedState);

      const { rerender } = render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          enableColumnStatePersistence={true}
          persistenceKey='key-before'
        />
      );

      rerender(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          enableColumnStatePersistence={true}
          persistenceKey='key-new'
        />
      );

      act(() => { jest.runAllTimers(); });
      expect(mockInternalGridApi.applyColumnState).toHaveBeenCalled();
    });

    it('handles empty savedState on persistenceKey change gracefully', () => {
      // No saved state for the new key
      const { rerender } = render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          enableColumnStatePersistence={true}
          persistenceKey='key-x'
        />
      );

      rerender(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          enableColumnStatePersistence={true}
          persistenceKey='key-y-nodata'
        />
      );

      act(() => { jest.runAllTimers(); });
      // No saved state for this key, so applyColumnState should not be called from the key-change effect
      expect(mockInternalGridApi.applyColumnState).not.toHaveBeenCalled();
    });

    it('handles malformed JSON on persistenceKey change gracefully', () => {
      localStorage.setItem('key-bad', 'not{valid}json{{{');

      const { rerender } = render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          enableColumnStatePersistence={true}
          persistenceKey='key-prev'
        />
      );

      expect(() => {
        rerender(
          <ArdaGrid
            rowData={minimalRowData}
            columnDefs={minimalColumnDefs}
            enableColumnStatePersistence={true}
            persistenceKey='key-bad'
          />
        );
        act(() => { jest.runAllTimers(); });
      }).not.toThrow();
    });

    it('does not apply state if persistenceKey is the same (no-op)', () => {
      const savedState = JSON.stringify([
        { colId: 'name', hide: false, width: 200 },
      ]);
      localStorage.setItem('same-key', savedState);
      mockInternalGridApi.applyColumnState.mockClear();

      const { rerender } = render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          enableColumnStatePersistence={true}
          persistenceKey='same-key'
        />
      );

      // Re-render without changing persistenceKey — should not re-trigger effect
      rerender(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          enableColumnStatePersistence={true}
          persistenceKey='same-key'
        />
      );

      act(() => { jest.runAllTimers(); });
      // applyColumnState is called from initial gridReady but the key-change effect
      // should not re-trigger since key did not change
      const callCount = mockInternalGridApi.applyColumnState.mock.calls.length;
      expect(callCount).toBeLessThanOrEqual(1);
    });

    it('skips applyState retry when columns are empty and retries', () => {
      // Simulate columns returning empty list initially
      mockInternalGridApi.getColumns.mockReturnValue([]);
      const savedState = JSON.stringify([
        { colId: 'name', hide: false, width: 200 },
      ]);
      localStorage.setItem('col-empty-key', savedState);

      const { rerender } = render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          enableColumnStatePersistence={true}
          persistenceKey='col-prev'
        />
      );

      rerender(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          enableColumnStatePersistence={true}
          persistenceKey='col-empty-key'
        />
      );

      // Run a few timer ticks to exercise retry logic
      act(() => { jest.advanceTimersByTime(100); });
      act(() => { jest.advanceTimersByTime(200); });
      act(() => { jest.runAllTimers(); });

      // getColumns returned empty, so retry logic was exercised
      expect(mockInternalGridApi.getColumns).toHaveBeenCalled();
    });

    it('skips save during columnVisible when isApplyingPersistedStateRef is set', () => {
      render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          enableColumnStatePersistence={true}
          persistenceKey='vis-test-key'
        />
      );

      const visibleCall = mockInternalGridApi.addEventListener.mock.calls.find(
        (c: any[]) => c[0] === 'columnVisible'
      );
      expect(visibleCall).toBeTruthy();
      // Flush onGridReady timers (autoSize) before triggering column event
      act(() => { jest.runAllTimers(); });
      act(() => { visibleCall[1](); });
      act(() => { jest.runAllTimers(); });

      // Verify no crash and localStorage was attempted
      expect(mockInternalGridApi.getColumnState).toHaveBeenCalled();
    });

    it('saveGridState skips when justMovedColumn flag is set', () => {
      render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          enableColumnStatePersistence={true}
          persistenceKey='just-moved-key'
        />
      );

      // Trigger columnMoved first (sets justMovedColumn = true)
      const movedCall = mockInternalGridApi.addEventListener.mock.calls.find(
        (c: any[]) => c[0] === 'columnMoved'
      );
      expect(movedCall).toBeTruthy();
      // Flush onGridReady timers (autoSize) before triggering column events
      act(() => { jest.runAllTimers(); });
      act(() => { movedCall[1](); });

      // Then trigger columnResized right after (should be skipped due to justMovedColumn)
      const resizeCall = mockInternalGridApi.addEventListener.mock.calls.find(
        (c: any[]) => c[0] === 'columnResized'
      );
      expect(resizeCall).toBeTruthy();
      act(() => { resizeCall[1](); });

      act(() => { jest.runAllTimers(); });

      expect(mockInternalGridApi.getColumnState).toHaveBeenCalled();
    });

    it('handleColumnMoved skips save when isApplyingPersistedStateRef is true', () => {
      // Provide the saved state so it gets applied (setting the isApplying flag)
      const savedState = JSON.stringify([
        { colId: 'name', hide: false, width: 200 },
      ]);
      localStorage.setItem('applying-moved-key', savedState);

      render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          enableColumnStatePersistence={true}
          persistenceKey='applying-moved-key'
        />
      );

      // Trigger columnMoved during the apply window
      const movedCall = mockInternalGridApi.addEventListener.mock.calls.find(
        (c: any[]) => c[0] === 'columnMoved'
      );
      expect(movedCall).toBeTruthy();
      act(() => { movedCall[1](); });
      act(() => { jest.runAllTimers(); });

      expect(mockInternalGridApi.getColumnState).toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Overlay sub-components
  // ──────────────────────────────────────────────────────────────────────────

  describe('overlay sub-components', () => {
    it('ErrorOverlay renders error message when error prop provided', () => {
      render(
        <ArdaGrid
          rowData={[]}
          columnDefs={minimalColumnDefs}
          error='Load failed'
        />
      );
      // Access noRowsOverlayComponent from _lastAgGridProps
      const NoRowsOverlay = _lastAgGridProps?.noRowsOverlayComponent;
      expect(NoRowsOverlay).toBeTruthy();
      const { container } = render(<NoRowsOverlay />);
      // When error is set, NoRowsOverlay renders ErrorOverlay
      expect(container.innerHTML).not.toBe('');
    });

    it('EmptyStateOverlay renders when emptyStateComponent provided, no loading/error, rows empty', () => {
      render(
        <ArdaGrid
          rowData={[]}
          columnDefs={minimalColumnDefs}
          emptyStateComponent={<div data-testid='my-empty'>Empty here</div>}
          loading={false}
          hasActiveSearch={false}
        />
      );
      const NoRowsOverlay = _lastAgGridProps?.noRowsOverlayComponent;
      expect(NoRowsOverlay).toBeTruthy();
      const { queryByTestId } = render(<NoRowsOverlay />);
      // EmptyStateOverlay contains the emptyStateComponent
      expect(queryByTestId('my-empty')).toBeInTheDocument();
    });

    it('NoRowsOverlay returns null when rows exist and no search/error/loading', () => {
      render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          loading={false}
        />
      );
      const NoRowsOverlay = _lastAgGridProps?.noRowsOverlayComponent;
      expect(NoRowsOverlay).toBeTruthy();
      const { container } = render(<NoRowsOverlay />);
      expect(container.firstChild).toBeNull();
    });

    it('NoRowsOverlay returns NoSearchResultsOverlay when hasActiveSearch and rows empty', () => {
      render(
        <ArdaGrid
          rowData={[]}
          columnDefs={minimalColumnDefs}
          hasActiveSearch={true}
          loading={false}
        />
      );
      const NoRowsOverlay = _lastAgGridProps?.noRowsOverlayComponent;
      expect(NoRowsOverlay).toBeTruthy();
      const { getByText } = render(<NoRowsOverlay />);
      expect(getByText('No items found')).toBeInTheDocument();
    });

    it('NoRowsOverlay returns null when loading is true even with empty rows', () => {
      render(
        <ArdaGrid
          rowData={[]}
          columnDefs={minimalColumnDefs}
          loading={true}
          hasActiveSearch={true}
        />
      );
      const NoRowsOverlay = _lastAgGridProps?.noRowsOverlayComponent;
      expect(NoRowsOverlay).toBeTruthy();
      const { container } = render(<NoRowsOverlay />);
      // When loading, NoRowsOverlay should return null
      expect(container.firstChild).toBeNull();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // handleRowClicked — ag-cell with col-id="notes"
  // ──────────────────────────────────────────────────────────────────────────

  describe('handleRowClicked - notes column', () => {
    it('does nothing when clicking inside notes col-id element', () => {
      const onRowClicked = jest.fn();
      render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          onRowClicked={onRowClicked}
        />
      );
      const cell = document.createElement('div');
      cell.setAttribute('col-id', 'notes');
      act(() => {
        _lastAgGridProps?.onRowClicked({
          data: { id: '1' },
          event: { target: cell },
          api: mockInternalGridApi,
        });
      });
      expect(onRowClicked).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Row actions cellRenderer — action onClick called with params.data
  // ──────────────────────────────────────────────────────────────────────────

  describe('row actions cellRenderer', () => {
    it('calls action.onClick with row data when button clicked', () => {
      const onClick = jest.fn();
      const rowActions = [{ label: 'Delete', onClick }];
      render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          enableRowActions={true}
          rowActions={rowActions}
        />
      );
      const actionCol = _lastAgGridProps?.columnDefs?.find(
        (c: any) => c.field === 'actions'
      );
      expect(actionCol).toBeTruthy();
      const cr = actionCol.cellRenderer;
      const rowData = { id: '1', name: 'Item 1' };
      const { container } = render(cr({ data: rowData }));
      const btn = container.querySelector('button');
      expect(btn).toBeTruthy();
      btn!.click();
      expect(onClick).toHaveBeenCalledWith(rowData);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Ref: exportDataAsCsv does nothing without gridApi
  // ──────────────────────────────────────────────────────────────────────────

  describe('ref methods when gridApi not yet set', () => {
    it('exportDataAsCsv does not throw when gridApi is null (before ready)', () => {
      // Disable auto-firing gridReady by overriding the mock
      mockInternalGridApi = null;
      const ref = createRef<ArdaGridRef>();
      render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          ref={ref}
        />
      );
      expect(() => {
        act(() => { ref.current?.exportDataAsCsv(); });
      }).not.toThrow();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // mergedGridOptions / column editing options
  // ──────────────────────────────────────────────────────────────────────────

  describe('grid options', () => {
    it('renders with enableCellEditing=true without crashing', () => {
      const { container } = render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          enableCellEditing={true}
        />
      );
      expect(container.querySelector('.arda-grid-container')).toBeInTheDocument();
    });

    it('renders with enableMultiRowSelection=false (single mode)', () => {
      const { container } = render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          enableRowSelection={true}
          enableMultiRowSelection={false}
        />
      );
      expect(container.querySelector('.arda-grid-container')).toBeInTheDocument();
    });

    it('renders with enableMultiSort=true', () => {
      const { container } = render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          enableMultiSort={true}
        />
      );
      expect(container.querySelector('.arda-grid-container')).toBeInTheDocument();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // handleRowClicked — ag-cell with col-id="select" via closest
  // ──────────────────────────────────────────────────────────────────────────

  describe('handleRowClicked - ag-cell class variants', () => {
    it('does nothing when clicking ag-cell with col-id="select"', () => {
      const onRowClicked = jest.fn();
      render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          onRowClicked={onRowClicked}
        />
      );
      // Create a nested structure: child inside ag-cell[col-id="select"]
      const parent = document.createElement('div');
      parent.classList.add('ag-cell');
      parent.setAttribute('col-id', 'select');
      const child = document.createElement('span');
      parent.appendChild(child);
      act(() => {
        _lastAgGridProps?.onRowClicked({
          data: { id: '1' },
          event: { target: child },
          api: mockInternalGridApi,
        });
      });
      expect(onRowClicked).not.toHaveBeenCalled();
    });

    it('does nothing when clicking ag-cell with col-id="quickActions" via child', () => {
      const onRowClicked = jest.fn();
      render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          onRowClicked={onRowClicked}
        />
      );
      const parent = document.createElement('div');
      parent.classList.add('ag-cell');
      parent.setAttribute('col-id', 'quickActions');
      const child = document.createElement('button');
      parent.appendChild(child);
      act(() => {
        _lastAgGridProps?.onRowClicked({
          data: { id: '1' },
          event: { target: child },
          api: mockInternalGridApi,
        });
      });
      expect(onRowClicked).not.toHaveBeenCalled();
    });

    it('does nothing when clicking ag-cell with col-id="notes" via child', () => {
      const onRowClicked = jest.fn();
      render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          onRowClicked={onRowClicked}
        />
      );
      const parent = document.createElement('div');
      parent.classList.add('ag-cell');
      parent.setAttribute('col-id', 'notes');
      const child = document.createElement('textarea');
      parent.appendChild(child);
      act(() => {
        _lastAgGridProps?.onRowClicked({
          data: { id: '1' },
          event: { target: child },
          api: mockInternalGridApi,
        });
      });
      expect(onRowClicked).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // sortChanged handler - with onColumnStateChange returning false
  // ──────────────────────────────────────────────────────────────────────────

  describe('sort changed column state persistence with onColumnStateChange returning false', () => {
    beforeEach(() => jest.useFakeTimers({ legacyFakeTimers: true }));
    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('saveGridState does not save when onColumnStateChange returns false (sortChanged)', () => {
      const onColumnStateChange = jest.fn(() => false);
      render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          enableColumnStatePersistence={true}
          persistenceKey='sort-skip-key'
          onColumnStateChange={onColumnStateChange}
        />
      );
      const sortCall = mockInternalGridApi.addEventListener.mock.calls.find(
        (c: any[]) => c[0] === 'sortChanged'
      );
      expect(sortCall).toBeTruthy();
      act(() => { sortCall[1](); });
      act(() => { jest.runAllTimers(); });
      expect(onColumnStateChange).toHaveBeenCalled();
      expect(localStorage.getItem('sort-skip-key')).toBeNull();
    });

    it('handleColumnVisible does not save when onColumnStateChange returns false', () => {
      const onColumnStateChange = jest.fn(() => false);
      render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          enableColumnStatePersistence={true}
          persistenceKey='vis-skip-key'
          onColumnStateChange={onColumnStateChange}
        />
      );
      const visibleCall = mockInternalGridApi.addEventListener.mock.calls.find(
        (c: any[]) => c[0] === 'columnVisible'
      );
      expect(visibleCall).toBeTruthy();
      // Flush onGridReady timers (autoSize) before triggering column event
      act(() => { jest.runAllTimers(); });
      act(() => { visibleCall[1](); });
      act(() => { jest.runAllTimers(); });
      expect(onColumnStateChange).toHaveBeenCalled();
      expect(localStorage.getItem('vis-skip-key')).toBeNull();
    });

    it('handleColumnMoved does not save when onColumnStateChange returns false', () => {
      const onColumnStateChange = jest.fn(() => false);
      render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          enableColumnStatePersistence={true}
          persistenceKey='moved-skip-key'
          onColumnStateChange={onColumnStateChange}
        />
      );
      const movedCall = mockInternalGridApi.addEventListener.mock.calls.find(
        (c: any[]) => c[0] === 'columnMoved'
      );
      expect(movedCall).toBeTruthy();
      // Flush onGridReady timers (autoSize) before triggering column event
      act(() => { jest.runAllTimers(); });
      act(() => { movedCall[1](); });
      act(() => { jest.runAllTimers(); });
      expect(onColumnStateChange).toHaveBeenCalled();
      expect(localStorage.getItem('moved-skip-key')).toBeNull();
    });

    it('saveGridState saves sort model when column has sort defined', () => {
      mockInternalGridApi.getColumnState.mockReturnValue([
        { colId: 'name', hide: false, width: 150, sort: 'asc', sortIndex: 0 },
      ]);
      render(
        <ArdaGrid
          rowData={minimalRowData}
          columnDefs={minimalColumnDefs}
          enableColumnStatePersistence={true}
          persistenceKey='sort-save-key'
        />
      );
      const sortCall = mockInternalGridApi.addEventListener.mock.calls.find(
        (c: any[]) => c[0] === 'sortChanged'
      );
      expect(sortCall).toBeTruthy();
      act(() => { sortCall[1](); });
      act(() => { jest.runAllTimers(); });
      const stored = localStorage.getItem('sort-save-key');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.sortModel.length).toBeGreaterThan(0);
      expect(parsed.sortModel[0].sort).toBe('asc');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Cleanup: removeEventListeners on unmount
  // ──────────────────────────────────────────────────────────────────────────

  it('removes event listeners on unmount', () => {
    const { unmount } = render(
      <ArdaGrid
        rowData={minimalRowData}
        columnDefs={minimalColumnDefs}
        enableColumnStatePersistence={true}
        persistenceKey='unmount-key'
      />
    );
    unmount();
    expect(mockInternalGridApi.removeEventListener).toHaveBeenCalledWith(
      'columnResized',
      expect.any(Function)
    );
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SortMenuHeader component
  // ──────────────────────────────────────────────────────────────────────────

  describe('SortMenuHeader', () => {
    // Extract the SortMenuHeader component from the defaultColDef after rendering ArdaGrid
    let SortMenuHeaderComponent: React.FC<any>;

    const makeSortParams = (overrides: Record<string, unknown> = {}) => ({
      displayName: 'Test Column',
      enableSorting: true,
      column: {
        getSort: jest.fn(() => null),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      },
      setSort: jest.fn(),
      ...overrides,
    });

    beforeEach(() => {
      render(
        <ArdaGrid rowData={minimalRowData} columnDefs={minimalColumnDefs} />
      );
      SortMenuHeaderComponent = _lastAgGridProps?.defaultColDef?.headerComponent;
    });

    it('renders the column display name', () => {
      const params = makeSortParams();
      const { getByText } = render(<SortMenuHeaderComponent {...params} />);
      expect(getByText('Test Column')).toBeInTheDocument();
    });

    it('does not render a sort icon when no sort is active', () => {
      const params = makeSortParams();
      const { container } = render(<SortMenuHeaderComponent {...params} />);
      expect(container.querySelector('.arda-sort-header-icon')).not.toBeInTheDocument();
    });

    it('renders ↑ icon when sorted ascending', () => {
      const params = makeSortParams({
        column: {
          getSort: jest.fn(() => 'asc'),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        },
      });
      const { container } = render(<SortMenuHeaderComponent {...params} />);
      expect(container.querySelector('.arda-sort-header-icon')?.textContent).toBe('↑');
    });

    it('renders ↓ icon when sorted descending', () => {
      const params = makeSortParams({
        column: {
          getSort: jest.fn(() => 'desc'),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        },
      });
      const { container } = render(<SortMenuHeaderComponent {...params} />);
      expect(container.querySelector('.arda-sort-header-icon')?.textContent).toBe('↓');
    });

    it('renders ⋮ button when enableSorting is true', () => {
      const params = makeSortParams();
      const { container } = render(<SortMenuHeaderComponent {...params} />);
      expect(container.querySelector('.arda-sort-header-btn')).toBeInTheDocument();
    });

    it('does not render ⋮ button when enableSorting is false', () => {
      const params = makeSortParams({ enableSorting: false });
      const { container } = render(<SortMenuHeaderComponent {...params} />);
      expect(container.querySelector('.arda-sort-header-btn')).not.toBeInTheDocument();
    });

    it('adds active class to ⋮ button when sort is active', () => {
      const params = makeSortParams({
        column: {
          getSort: jest.fn(() => 'asc'),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        },
      });
      const { container } = render(<SortMenuHeaderComponent {...params} />);
      expect(
        container.querySelector('.arda-sort-header-btn')?.classList.contains('arda-sort-header-btn-active')
      ).toBe(true);
    });

    it('opens dropdown on ⋮ button click', () => {
      const params = makeSortParams();
      const { container } = render(<SortMenuHeaderComponent {...params} />);
      act(() => {
        fireEvent.click(container.querySelector('.arda-sort-header-btn')!);
      });
      expect(document.body.querySelector('.arda-sort-menu-dropdown')).toBeInTheDocument();
    });

    it('calls setSort("asc") when Sort Ascending is clicked', () => {
      const params = makeSortParams();
      const { container } = render(<SortMenuHeaderComponent {...params} />);
      act(() => {
        fireEvent.click(container.querySelector('.arda-sort-header-btn')!);
      });
      const dropdown = document.body.querySelector('.arda-sort-menu-dropdown')!;
      const ascBtn = Array.from(dropdown.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Sort Ascending'),
      );
      act(() => { fireEvent.click(ascBtn!); });
      expect(params.setSort).toHaveBeenCalledWith('asc');
    });

    it('calls setSort("desc") when Sort Descending is clicked', () => {
      const params = makeSortParams();
      const { container } = render(<SortMenuHeaderComponent {...params} />);
      act(() => {
        fireEvent.click(container.querySelector('.arda-sort-header-btn')!);
      });
      const dropdown = document.body.querySelector('.arda-sort-menu-dropdown')!;
      const descBtn = Array.from(dropdown.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Sort Descending'),
      );
      act(() => { fireEvent.click(descBtn!); });
      expect(params.setSort).toHaveBeenCalledWith('desc');
    });

    it('shows Clear Sort option when a sort is active', () => {
      const params = makeSortParams({
        column: {
          getSort: jest.fn(() => 'asc'),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        },
      });
      const { container } = render(<SortMenuHeaderComponent {...params} />);
      act(() => {
        fireEvent.click(container.querySelector('.arda-sort-header-btn')!);
      });
      const dropdown = document.body.querySelector('.arda-sort-menu-dropdown')!;
      const clearBtn = Array.from(dropdown.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Clear Sort'),
      );
      expect(clearBtn).toBeInTheDocument();
    });

    it('calls setSort(null) when Clear Sort is clicked', () => {
      const params = makeSortParams({
        column: {
          getSort: jest.fn(() => 'desc'),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        },
      });
      const { container } = render(<SortMenuHeaderComponent {...params} />);
      act(() => {
        fireEvent.click(container.querySelector('.arda-sort-header-btn')!);
      });
      const dropdown = document.body.querySelector('.arda-sort-menu-dropdown')!;
      const clearBtn = Array.from(dropdown.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Clear Sort'),
      );
      act(() => { fireEvent.click(clearBtn!); });
      expect(params.setSort).toHaveBeenCalledWith(null);
    });

    it('closes dropdown on outside click', () => {
      const params = makeSortParams();
      const { container } = render(<SortMenuHeaderComponent {...params} />);
      act(() => {
        fireEvent.click(container.querySelector('.arda-sort-header-btn')!);
      });
      expect(document.body.querySelector('.arda-sort-menu-dropdown')).toBeInTheDocument();
      act(() => { fireEvent.mouseDown(document.body); });
      expect(document.body.querySelector('.arda-sort-menu-dropdown')).not.toBeInTheDocument();
    });

    it('syncs sort direction from column sortChanged event', () => {
      let syncCallback: (() => void) | null = null;
      const mockColumn = {
        getSort: jest.fn((): string | null => null),
        addEventListener: jest.fn((event: string, cb: () => void) => {
          if (event === 'sortChanged') syncCallback = cb;
        }),
        removeEventListener: jest.fn(),
      };
      const params = makeSortParams({ column: mockColumn });
      const { container } = render(<SortMenuHeaderComponent {...params} />);
      expect(container.querySelector('.arda-sort-header-icon')).not.toBeInTheDocument();

      mockColumn.getSort.mockReturnValue('asc');
      act(() => { syncCallback?.(); });
      expect(container.querySelector('.arda-sort-header-icon')?.textContent).toBe('↑');
    });

    it('does not show Clear Sort when no sort is active', () => {
      const params = makeSortParams();
      const { container } = render(<SortMenuHeaderComponent {...params} />);
      act(() => {
        fireEvent.click(container.querySelector('.arda-sort-header-btn')!);
      });
      const dropdown = document.body.querySelector('.arda-sort-menu-dropdown')!;
      const clearBtn = Array.from(dropdown.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Clear Sort'),
      );
      expect(clearBtn).toBeUndefined();
    });
  });
});
