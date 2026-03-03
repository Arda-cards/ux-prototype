import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { useState } from 'react';

import { ArdaSupplierDataGrid } from './suppliers-data-grid';
import { mockSuppliers } from '@/extras/components/molecules/data-grid/presets/suppliers/suppliers-mock-data';
import type { BusinessAffiliate } from '@/extras/types/reference/business-affiliates/business-affiliate';

const meta: Meta<typeof ArdaSupplierDataGrid> = {
  title: 'Components/Extras/Organisms/Reference/Business Affiliates/Suppliers Data Grid',
  component: ArdaSupplierDataGrid,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Supplier-specific data grid organism built on the entity data grid factory. Supports inline editing, row selection, pagination, and dirty tracking.',
      },
    },
  },
  argTypes: {
    suppliers: {
      control: false,
      description: 'Supplier data array.',
      table: { category: 'Runtime' },
    },
    loading: {
      control: 'boolean',
      description: 'Whether to show loading overlay.',
      table: { category: 'Runtime' },
    },
    enableCellEditing: {
      control: 'boolean',
      description: 'Enable inline cell editing.',
      table: { category: 'Runtime' },
    },
    activeTab: {
      control: 'text',
      description: 'Active tab for persistence key scoping.',
      table: { category: 'Runtime' },
    },
    onSupplierUpdated: {
      action: 'supplierUpdated',
      description: 'Called when a supplier is updated via cell edit.',
      table: { category: 'Events' },
    },
    onUnsavedChangesChange: {
      action: 'unsavedChangesChange',
      description: 'Called when unsaved changes state changes.',
      table: { category: 'Events' },
    },
    onSelectionChange: {
      action: 'selectionChange',
      description: 'Called when row selection changes.',
      table: { category: 'Events' },
    },
    onRowClick: {
      action: 'rowClick',
      description: 'Called when a row is clicked.',
      table: { category: 'Events' },
    },
  },
  args: {
    onSupplierUpdated: fn(),
    onUnsavedChangesChange: fn(),
    onSelectionChange: fn(),
    onRowClick: fn(),
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
  render: () => {
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const totalItems = mockSuppliers.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const currentSuppliers = mockSuppliers.slice(startIndex, startIndex + pageSize);

    return (
      <ArdaSupplierDataGrid
        suppliers={currentSuppliers}
        activeTab="suppliers"
        enableCellEditing
        onSupplierUpdated={fn()}
        onUnsavedChangesChange={fn()}
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

export const Empty: Story = {
  args: {
    suppliers: [],
    loading: false,
    activeTab: 'suppliers',
  },
};

export const Loading: Story = {
  args: {
    suppliers: [],
    loading: true,
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
