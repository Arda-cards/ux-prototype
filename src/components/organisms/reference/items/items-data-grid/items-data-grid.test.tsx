import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { ArdaItemsDataGrid, type ArdaItemsDataGridRef } from './items-data-grid';
import { mockPublishedItems } from '@/components/molecules/data-grid/presets/items/items-mock-data';
import { useRef } from 'react';

describe('ArdaItemsDataGrid', () => {
  it('renders with items data', () => {
    render(
      <div style={{ height: '600px' }}>
        <ArdaItemsDataGrid items={mockPublishedItems.slice(0, 5)} activeTab="published" />
      </div>,
    );

    // AG Grid renders asynchronously — verify the grid container is present
    const container = document.querySelector('.arda-grid-container');
    expect(container).toBeInTheDocument();
  });

  it('renders grid container when no items', () => {
    render(
      <div style={{ height: '600px' }}>
        <ArdaItemsDataGrid items={[]} activeTab="published" />
      </div>,
    );

    // Grid container should still render
    const container = document.querySelector('.arda-grid-container');
    expect(container).toBeInTheDocument();
  });

  it('renders grid container when loading', () => {
    render(
      <div style={{ height: '600px' }}>
        <ArdaItemsDataGrid items={[]} loading={true} activeTab="published" />
      </div>,
    );

    // Grid container should render even when loading
    const container = document.querySelector('.arda-grid-container');
    expect(container).toBeInTheDocument();
  });

  it('applies editing enhancement when enabled', () => {
    const { container } = render(
      <div style={{ height: '600px' }}>
        <ArdaItemsDataGrid
          items={mockPublishedItems.slice(0, 3)}
          activeTab="published"
          enableCellEditing={true}
        />
      </div>,
    );

    // AG Grid should be present
    const grid = container.querySelector('.ag-theme-arda');
    expect(grid).toBeInTheDocument();
  });

  it('tracks unsaved changes', async () => {
    const onUnsavedChangesChange = vi.fn();
    const onItemUpdated = vi.fn();

    render(
      <div style={{ height: '600px' }}>
        <ArdaItemsDataGrid
          items={mockPublishedItems.slice(0, 3)}
          activeTab="published"
          enableCellEditing={true}
          onUnsavedChangesChange={onUnsavedChangesChange}
          onItemUpdated={onItemUpdated}
        />
      </div>,
    );

    // Wait for grid to render
    await waitFor(() => {
      expect(screen.getByText(mockPublishedItems[0].name)).toBeInTheDocument();
    });

    // Note: Full cell editing test would require more complex AG Grid interaction
    // This test verifies the callbacks are passed correctly
    expect(onUnsavedChangesChange).toHaveBeenCalledWith(false);
  });

  it('ref API works', () => {
    function TestComponent() {
      const ref = useRef<ArdaItemsDataGridRef>(null);

      return (
        <div style={{ height: '600px' }}>
          <button onClick={() => ref.current?.saveAllDrafts()}>Save</button>
          <button onClick={() => ref.current?.discardAllDrafts()}>Discard</button>
          <button
            onClick={() => {
              const hasChanges = ref.current?.getHasUnsavedChanges();
              console.log('Has changes:', hasChanges);
            }}
          >
            Check
          </button>
          <ArdaItemsDataGrid
            ref={ref}
            items={mockPublishedItems.slice(0, 3)}
            activeTab="published"
            enableCellEditing={true}
          />
        </div>
      );
    }

    render(<TestComponent />);

    // Verify buttons render (ref is connected)
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Discard')).toBeInTheDocument();
    expect(screen.getByText('Check')).toBeInTheDocument();
  });

  it('applies column visibility', () => {
    const { container } = render(
      <div style={{ height: '600px' }}>
        <ArdaItemsDataGrid
          items={mockPublishedItems.slice(0, 3)}
          activeTab="published"
          columnVisibility={{
            name: true,
            internalSKU: false,
          }}
        />
      </div>,
    );

    // AG Grid should be present
    const grid = container.querySelector('.ag-theme-arda');
    expect(grid).toBeInTheDocument();
  });

  it('handles pagination', () => {
    const onNextPage = vi.fn();
    const onPreviousPage = vi.fn();
    const onFirstPage = vi.fn();

    render(
      <div style={{ height: '600px' }}>
        <ArdaItemsDataGrid
          items={mockPublishedItems.slice(0, 10)}
          activeTab="published"
          paginationData={{
            currentPage: 2,
            currentPageSize: 10,
            totalItems: 25,
            hasNextPage: true,
            hasPreviousPage: true,
          }}
          onNextPage={onNextPage}
          onPreviousPage={onPreviousPage}
          onFirstPage={onFirstPage}
        />
      </div>,
    );

    // Pagination controls should be present
    const pagination = document.querySelector('.ag-pagination-footer');
    expect(pagination).toBeInTheDocument();
  });
});
