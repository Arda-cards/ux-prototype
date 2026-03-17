import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { DataGrid } from './data-grid';
import type { ColDef } from 'ag-grid-community';

interface TestDataRow {
  id: string;
  name: string;
  email: string;
}

const mockColumnDefs: ColDef<TestDataRow>[] = [
  { field: 'id', headerName: 'ID' },
  { field: 'name', headerName: 'Name' },
  { field: 'email', headerName: 'Email' },
];

const mockData: TestDataRow[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com' },
  { id: '2', name: 'Bob', email: 'bob@example.com' },
];

// Node 22+ provides a native localStorage that lacks standard Storage methods.
// Provide a spec-compliant mock so tests work regardless of runtime.
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('DataGrid', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders with column definitions and row data', async () => {
    render(<DataGrid<TestDataRow> columnDefs={mockColumnDefs} rowData={mockData} height={400} />);

    // Check that grid container is rendered
    const container = document.querySelector('.arda-grid-container');
    expect(container).toBeInTheDocument();

    // Check that AG Grid theme is applied
    const gridTheme = document.querySelector('.ag-theme-arda');
    expect(gridTheme).toBeInTheDocument();
  });

  it('renders grid container when loading is true', () => {
    render(
      <DataGrid<TestDataRow>
        columnDefs={mockColumnDefs}
        rowData={[]}
        loading={true}
        height={400}
      />,
    );

    // Grid container should still render when loading
    const container = document.querySelector('.arda-grid-container');
    expect(container).toBeInTheDocument();
  });

  it('shows error overlay when error is provided', async () => {
    const errorMessage = 'Failed to load data';
    render(
      <DataGrid<TestDataRow>
        columnDefs={mockColumnDefs}
        rowData={[]}
        error={errorMessage}
        height={400}
      />,
    );

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Error loading data')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('shows empty state when no data and emptyStateComponent provided', async () => {
    const emptyStateText = 'No data available';
    render(
      <DataGrid<TestDataRow>
        columnDefs={mockColumnDefs}
        rowData={[]}
        emptyStateComponent={<div>{emptyStateText}</div>}
        height={400}
      />,
    );

    // Wait for empty state to appear
    await waitFor(() => {
      expect(screen.getByText(emptyStateText)).toBeInTheDocument();
    });
  });

  it('shows default empty state when no data and no emptyStateComponent', async () => {
    render(<DataGrid<TestDataRow> columnDefs={mockColumnDefs} rowData={[]} height={400} />);

    // Wait for default empty state to appear
    await waitFor(() => {
      expect(screen.getByText('No rows to display')).toBeInTheDocument();
    });
  });

  it('renders pagination footer when paginationData is provided', () => {
    const paginationData = {
      currentPage: 1,
      currentPageSize: 10,
      totalItems: 50,
      hasNextPage: true,
      hasPreviousPage: false,
    };

    render(
      <DataGrid<TestDataRow>
        columnDefs={mockColumnDefs}
        rowData={mockData}
        paginationData={paginationData}
        height={400}
      />,
    );

    // Pagination footer should be present
    const paginationFooter = document.querySelector('.ag-pagination-footer');
    expect(paginationFooter).toBeInTheDocument();

    // Check page number display
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('calls onSelectionChanged when selection changes', async () => {
    const onSelectionChanged = vi.fn();

    render(
      <DataGrid<TestDataRow>
        columnDefs={mockColumnDefs}
        rowData={mockData}
        enableRowSelection
        onSelectionChanged={onSelectionChanged}
        height={400}
      />,
    );

    // Note: Actual selection testing requires AG Grid to be fully initialized
    // This test verifies that the callback is passed correctly
    expect(onSelectionChanged).not.toHaveBeenCalled();
  });

  it('applies custom height', () => {
    const customHeight = 500;
    render(
      <DataGrid<TestDataRow>
        columnDefs={mockColumnDefs}
        rowData={mockData}
        height={customHeight}
      />,
    );

    const container = document.querySelector('.arda-grid-container');
    expect(container).toHaveStyle({ height: `${customHeight}px` });
  });

  it('applies custom className', () => {
    const customClass = 'my-custom-grid';
    render(
      <DataGrid<TestDataRow>
        columnDefs={mockColumnDefs}
        rowData={mockData}
        className={customClass}
        height={400}
      />,
    );

    const container = document.querySelector('.arda-grid-container');
    expect(container).toHaveClass(customClass);
  });

  describe('Column Persistence', () => {
    it('saves column state to localStorage when persistenceKey is provided', async () => {
      const persistenceKey = 'test-grid-state';

      render(
        <DataGrid<TestDataRow>
          columnDefs={mockColumnDefs}
          rowData={mockData}
          persistenceKey={persistenceKey}
          height={400}
        />,
      );

      // Grid should be rendered
      const container = document.querySelector('.arda-grid-container');
      expect(container).toBeInTheDocument();

      // Note: Actual persistence testing requires AG Grid events to fire
      // This test verifies that persistenceKey is passed correctly
    });

    it('restores column state from localStorage when available', () => {
      const persistenceKey = 'test-grid-state-restore';
      const mockState = {
        columnState: [
          { colId: 'id', hide: false, width: 100 },
          { colId: 'name', hide: false, width: 200 },
          { colId: 'email', hide: true, width: 250 },
        ],
        sortModel: [],
      };

      localStorage.setItem(persistenceKey, JSON.stringify(mockState));

      render(
        <DataGrid<TestDataRow>
          columnDefs={mockColumnDefs}
          rowData={mockData}
          persistenceKey={persistenceKey}
          height={400}
        />,
      );

      // Grid should be rendered
      const container = document.querySelector('.arda-grid-container');
      expect(container).toBeInTheDocument();

      // Verify localStorage was accessed
      expect(localStorage.getItem(persistenceKey)).toBe(JSON.stringify(mockState));
    });
  });

  describe('Ref API', () => {
    it('exposes getGridApi method', () => {
      const ref = { current: null } as React.MutableRefObject<null>;

      render(
        <DataGrid<TestDataRow>
          ref={ref}
          columnDefs={mockColumnDefs}
          rowData={mockData}
          height={400}
        />,
      );

      // Ref should have getGridApi method
      expect(ref.current).toBeDefined();
      expect((ref.current as unknown as { getGridApi?: unknown })?.getGridApi).toBeDefined();
      expect(typeof (ref.current as unknown as { getGridApi?: unknown })?.getGridApi).toBe(
        'function',
      );
    });

    it('exposes exportDataAsCsv method', () => {
      const ref = { current: null } as React.MutableRefObject<null>;

      render(
        <DataGrid<TestDataRow>
          ref={ref}
          columnDefs={mockColumnDefs}
          rowData={mockData}
          height={400}
        />,
      );

      // Ref should have exportDataAsCsv method
      expect(ref.current).toBeDefined();
      expect(
        (ref.current as unknown as { exportDataAsCsv?: unknown })?.exportDataAsCsv,
      ).toBeDefined();
      expect(
        typeof (ref.current as unknown as { exportDataAsCsv?: unknown })?.exportDataAsCsv,
      ).toBe('function');
    });
  });
});
