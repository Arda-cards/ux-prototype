import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { useState } from 'react';

import { ArdaItemsDataGrid } from './items-data-grid';
import { mockPublishedItems } from '@/components/molecules/data-grid/presets/items/items-mock-data';
import type { Item } from '@/types/reference/items/item-domain';

const meta: Meta<typeof ArdaItemsDataGrid> = {
  title: 'Components/Organisms/Reference/Items/Items Data Grid',
  component: ArdaItemsDataGrid,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Items-specific data grid organism built on the entity data grid factory. Supports inline editing, row selection, pagination, and dirty tracking.',
      },
    },
  },
  argTypes: {
    items: {
      control: false,
      description: 'Item data array.',
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
    onItemUpdated: {
      action: 'itemUpdated',
      description: 'Called when an item is updated via cell edit.',
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
    onItemUpdated: fn(),
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
type Story = StoryObj<typeof ArdaItemsDataGrid>;

export const Default: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const totalItems = mockPublishedItems.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const currentItems = mockPublishedItems.slice(startIndex, startIndex + pageSize);

    return (
      <ArdaItemsDataGrid
        items={currentItems}
        activeTab="published"
        enableCellEditing
        onItemUpdated={fn()}
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
    items: [],
    loading: false,
    activeTab: 'published',
  },
};

export const Loading: Story = {
  args: {
    items: [],
    loading: true,
    activeTab: 'published',
  },
};

export const WithEditing: Story = {
  args: {
    items: mockPublishedItems.slice(0, 10),
    loading: false,
    enableCellEditing: true,
    activeTab: 'published',
    onItemUpdated: fn(),
    onUnsavedChangesChange: fn(),
  },
};

export const WithSelection: Story = {
  render: () => {
    const [selectedItems, setSelectedItems] = useState<Item[]>([]);

    return (
      <div className="flex flex-col h-full gap-4">
        <div className="text-sm text-gray-600">Selected {selectedItems.length} item(s)</div>
        <div className="flex-1 min-h-0">
          <ArdaItemsDataGrid
            items={mockPublishedItems.slice(0, 10)}
            activeTab="published"
            onSelectionChange={setSelectedItems}
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
    const [selectedItems, setSelectedItems] = useState<Item[]>([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Item | null>(null);

    const totalItems = mockPublishedItems.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const currentItems = mockPublishedItems.slice(startIndex, startIndex + pageSize);

    return (
      <div className="flex flex-col h-full gap-4">
        <div className="flex gap-4 text-sm">
          <div className="text-gray-600">
            Selected: <span className="font-semibold">{selectedItems.length}</span>
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
          <ArdaItemsDataGrid
            items={currentItems}
            activeTab="published"
            enableCellEditing={true}
            onSelectionChange={setSelectedItems}
            onItemUpdated={setLastUpdated}
            onUnsavedChangesChange={setHasUnsavedChanges}
            onRowClick={(item) => console.log('Row clicked:', item.name)}
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

      // Find the text input inside the active cell editor (not a checkbox)
      const input = canvasElement.querySelector<HTMLInputElement>(
        '.ag-cell-editing input[type="text"], .ag-cell-editing input:not([type])',
      );
      if (input) {
        await userEvent.clear(input);
        await userEvent.type(input, 'Updated Name');
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
