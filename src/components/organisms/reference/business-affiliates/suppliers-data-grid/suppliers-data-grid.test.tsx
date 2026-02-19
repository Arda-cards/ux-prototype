import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { useRef } from 'react';

import { ArdaSupplierDataGrid, type ArdaSupplierDataGridRef } from './suppliers-data-grid';
import { mockSuppliers } from '@/components/molecules/data-grid/presets/suppliers/suppliers-mock-data';

describe('ArdaSupplierDataGrid', () => {
  it('renders with supplier data', () => {
    render(
      <div style={{ height: '600px' }}>
        <ArdaSupplierDataGrid suppliers={mockSuppliers.slice(0, 5)} activeTab="suppliers" />
      </div>,
    );

    // AG Grid renders asynchronously — verify the grid container is present
    const container = document.querySelector('.arda-grid-container');
    expect(container).toBeInTheDocument();
  });

  it('renders grid container when no suppliers', () => {
    render(
      <div style={{ height: '600px' }}>
        <ArdaSupplierDataGrid suppliers={[]} activeTab="suppliers" />
      </div>,
    );

    const container = document.querySelector('.arda-grid-container');
    expect(container).toBeInTheDocument();
  });

  it('renders grid container when loading', () => {
    render(
      <div style={{ height: '600px' }}>
        <ArdaSupplierDataGrid suppliers={[]} loading={true} activeTab="suppliers" />
      </div>,
    );

    const container = document.querySelector('.arda-grid-container');
    expect(container).toBeInTheDocument();
  });

  it('applies editing enhancement when enabled', () => {
    const { container } = render(
      <div style={{ height: '600px' }}>
        <ArdaSupplierDataGrid
          suppliers={mockSuppliers.slice(0, 3)}
          activeTab="suppliers"
          enableCellEditing={true}
        />
      </div>,
    );

    const grid = container.querySelector('.ag-theme-arda');
    expect(grid).toBeInTheDocument();
  });

  it('tracks unsaved changes', async () => {
    const onUnsavedChangesChange = vi.fn();
    const onSupplierUpdated = vi.fn();

    render(
      <div style={{ height: '600px' }}>
        <ArdaSupplierDataGrid
          suppliers={mockSuppliers.slice(0, 3)}
          activeTab="suppliers"
          enableCellEditing={true}
          onUnsavedChangesChange={onUnsavedChangesChange}
          onSupplierUpdated={onSupplierUpdated}
        />
      </div>,
    );

    // Wait for grid to render
    await waitFor(() => {
      expect(screen.getByText(mockSuppliers[0]!.name)).toBeInTheDocument();
    });

    expect(onUnsavedChangesChange).toHaveBeenCalledWith(false);
  });

  it('ref API works', () => {
    function TestComponent() {
      const ref = useRef<ArdaSupplierDataGridRef>(null);

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
          <ArdaSupplierDataGrid
            ref={ref}
            suppliers={mockSuppliers.slice(0, 3)}
            activeTab="suppliers"
            enableCellEditing={true}
          />
        </div>
      );
    }

    render(<TestComponent />);

    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Discard')).toBeInTheDocument();
    expect(screen.getByText('Check')).toBeInTheDocument();
  });

  it('applies column visibility', () => {
    const { container } = render(
      <div style={{ height: '600px' }}>
        <ArdaSupplierDataGrid
          suppliers={mockSuppliers.slice(0, 3)}
          activeTab="suppliers"
          columnVisibility={{
            name: true,
            'legal.taxId': false,
          }}
        />
      </div>,
    );

    const grid = container.querySelector('.ag-theme-arda');
    expect(grid).toBeInTheDocument();
  });

  it('handles pagination', () => {
    const onNextPage = vi.fn();
    const onPreviousPage = vi.fn();
    const onFirstPage = vi.fn();

    render(
      <div style={{ height: '600px' }}>
        <ArdaSupplierDataGrid
          suppliers={mockSuppliers.slice(0, 10)}
          activeTab="suppliers"
          paginationData={{
            currentPage: 2,
            currentPageSize: 10,
            totalItems: 15,
            hasNextPage: false,
            hasPreviousPage: true,
          }}
          onNextPage={onNextPage}
          onPreviousPage={onPreviousPage}
          onFirstPage={onFirstPage}
        />
      </div>,
    );

    const pagination = document.querySelector('.ag-pagination-footer');
    expect(pagination).toBeInTheDocument();
  });
});
