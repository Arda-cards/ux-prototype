import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { useState } from 'react';

import { ArdaSupplierDataGrid } from './suppliers-data-grid';
import { mockSuppliers } from '@/components/molecules/data-grid/presets/suppliers/suppliers-mock-data';
import type { BusinessAffiliate } from '@/types/reference/business-affiliates/business-affiliate';

const meta: Meta<typeof ArdaSupplierDataGrid> = {
  title: 'Components/Organisms/Suppliers Data Grid',
  component: ArdaSupplierDataGrid,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ height: '600px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ArdaSupplierDataGrid>;

export const Default: Story = {
  args: {
    suppliers: mockSuppliers.slice(0, 10),
    loading: false,
    enableCellEditing: false,
    activeTab: 'suppliers',
  },
};

export const Empty: Story = {
  args: {
    suppliers: [],
    loading: false,
    enableCellEditing: false,
    activeTab: 'suppliers',
  },
};

export const Loading: Story = {
  args: {
    suppliers: [],
    loading: true,
    enableCellEditing: false,
    activeTab: 'suppliers',
  },
};

export const WithEditing: Story = {
  args: {
    suppliers: mockSuppliers.slice(0, 10),
    loading: false,
    enableCellEditing: true,
    activeTab: 'suppliers',
    onSupplierUpdated: fn(),
    onUnsavedChangesChange: fn(),
  },
};

export const WithPagination: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const totalItems = mockSuppliers.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentItems = mockSuppliers.slice(startIndex, endIndex);

    return (
      <ArdaSupplierDataGrid
        suppliers={currentItems}
        activeTab="suppliers"
        paginationData={{
          currentPage: page,
          currentPageSize: pageSize,
          totalItems,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        }}
        onNextPage={() => setPage((p) => Math.min(p + 1, totalPages))}
        onPreviousPage={() => setPage((p) => Math.max(p - 1, 1))}
        onFirstPage={() => setPage(1)}
      />
    );
  },
};

export const WithSelection: Story = {
  render: () => {
    const [selectedSuppliers, setSelectedSuppliers] = useState<BusinessAffiliate[]>([]);

    return (
      <div className="flex flex-col h-full gap-4">
        <div className="text-sm text-gray-600">Selected {selectedSuppliers.length} supplier(s)</div>
        <div className="flex-1 min-h-0">
          <ArdaSupplierDataGrid
            suppliers={mockSuppliers.slice(0, 10)}
            activeTab="suppliers"
            onSelectionChange={setSelectedSuppliers}
          />
        </div>
      </div>
    );
  },
};

export const Interactive: Story = {
  render: () => {
    const pageSize = 10;
    const [page, setPage] = useState(1);
    const [selectedSuppliers, setSelectedSuppliers] = useState<BusinessAffiliate[]>([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<BusinessAffiliate | null>(null);

    const totalItems = mockSuppliers.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const currentSuppliers = mockSuppliers.slice(startIndex, startIndex + pageSize);

    return (
      <div className="flex flex-col h-full gap-4">
        <div className="flex gap-4 text-sm">
          <div className="text-gray-600">
            Selected: <span className="font-semibold">{selectedSuppliers.length}</span>
          </div>
          <div className="text-gray-600">
            Unsaved changes:{' '}
            <span className={hasUnsavedChanges ? 'text-orange-600 font-semibold' : ''}>
              {hasUnsavedChanges ? 'Yes' : 'No'}
            </span>
          </div>
          {lastUpdated && (
            <div className="text-gray-600">
              Last updated: <span className="font-semibold">{lastUpdated.name}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-h-0">
          <ArdaSupplierDataGrid
            suppliers={currentSuppliers}
            activeTab="suppliers"
            enableCellEditing={true}
            onSelectionChange={setSelectedSuppliers}
            onSupplierUpdated={setLastUpdated}
            onUnsavedChangesChange={setHasUnsavedChanges}
            onRowClick={(supplier) => console.log('Row clicked:', supplier.name)}
            paginationData={{
              currentPage: page,
              currentPageSize: pageSize,
              totalItems,
              hasNextPage: page < totalPages,
              hasPreviousPage: page > 1,
            }}
            onNextPage={() => setPage((p) => Math.min(p + 1, totalPages))}
            onPreviousPage={() => setPage((p) => Math.max(p - 1, 1))}
            onFirstPage={() => setPage(1)}
          />
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for grid to render
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Click on the first row
    const firstRow = canvasElement.querySelector('.ag-row[row-index="0"]');
    if (firstRow) {
      await userEvent.click(firstRow as HTMLElement);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Double-click on a cell to edit (name column)
    const nameCell = canvasElement.querySelector('.ag-row[row-index="0"] .ag-cell[col-id="name"]');
    if (nameCell) {
      await userEvent.dblClick(nameCell as HTMLElement);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Find the text input inside the active cell editor
      const input = canvasElement.querySelector<HTMLInputElement>(
        '.ag-cell-editing input[type="text"], .ag-cell-editing input:not([type])',
      );
      if (input) {
        await userEvent.clear(input);
        await userEvent.type(input, 'Updated Supplier');
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Press Enter to commit
        await userEvent.keyboard('{Enter}');
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Check that unsaved changes indicator appears
        const unsavedText = canvas.getByText(/Yes/);
        await expect(unsavedText).toBeInTheDocument();
      }
    }
  },
};
