import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { useState } from 'react';
import { Pencil, Trash2, Eye } from 'lucide-react';

import type { ColDef } from 'ag-grid-community';
import { createEntityDataGridShim, type RowAction } from './create-entity-data-grid-shim';

// ============================================================================
// Demo Entity
// ============================================================================

interface DemoEntity {
  id: string;
  name: string;
  category: string;
  status: string;
  value: number;
  notes?: string;
}

const demoCols: ColDef<DemoEntity>[] = [
  { field: 'name', headerName: 'Name', width: 200 },
  { field: 'category', headerName: 'Category', width: 150 },
  { field: 'status', headerName: 'Status', width: 120 },
  {
    field: 'value',
    headerName: 'Value',
    width: 120,
    cellRenderer: (params: any) => {
      const e = params.data as DemoEntity;
      return `$${e.value.toFixed(2)}`;
    },
  },
  { field: 'notes', headerName: 'Notes', width: 200 },
];

const { Component: DemoShimGrid } = createEntityDataGridShim<DemoEntity>({
  displayName: 'DemoShimGrid',
  persistenceKeyPrefix: 'canary-demo-shim-grid',
  columnDefs: demoCols,
  defaultColDef: { sortable: true, filter: false, resizable: true },
  getEntityId: (e) => e.id,
});

const mockData: DemoEntity[] = [
  {
    id: '1',
    name: 'Widget Alpha',
    category: 'Hardware',
    status: 'Active',
    value: 29.99,
    notes: 'Best seller',
  },
  { id: '2', name: 'Gadget Beta', category: 'Electronics', status: 'Active', value: 149.5 },
  {
    id: '3',
    name: 'Part Gamma',
    category: 'Hardware',
    status: 'Inactive',
    value: 5.25,
    notes: 'Discontinued',
  },
  { id: '4', name: 'Module Delta', category: 'Software', status: 'Active', value: 499.0 },
  { id: '5', name: 'Sensor Epsilon', category: 'Electronics', status: 'Pending', value: 87.75 },
];

const rowActions: RowAction<DemoEntity>[] = [
  { label: 'View', icon: <Eye className="w-4 h-4" />, onClick: fn() },
  { label: 'Edit', icon: <Pencil className="w-4 h-4" />, onClick: fn() },
  { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: fn() },
];

// ============================================================================
// Meta
// ============================================================================

const meta: Meta<typeof DemoShimGrid> = {
  title: 'Components/Canary/Organisms/Shared/Entity Data Grid Shim',
  component: DemoShimGrid,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '`createEntityDataGridShim<T>()` wraps `createEntityDataGrid` and adds Tier 3b ' +
          'features: row actions (ActionCellRenderer pinned right), double-click handler, ' +
          'active-search empty state, and an extended ref API ' +
          '(`refreshData`, `getSelectedRows`, `selectAll`, `deselectAll`).',
      },
    },
  },
  argTypes: {
    data: {
      control: false,
      description: 'Entity data array.',
      table: { category: 'Runtime' },
    },
    loading: {
      control: 'boolean',
      description: 'Whether to show loading overlay.',
      table: { category: 'Runtime' },
    },
    enableRowActions: {
      control: 'boolean',
      description: 'Inject ActionCellRenderer as pinned-right column.',
      table: { category: 'Runtime' },
    },
    hasActiveSearch: {
      control: 'boolean',
      description: 'When true and data is empty, shows "No items found".',
      table: { category: 'Runtime' },
    },
    enableCellEditing: {
      control: 'boolean',
      description: 'Enable inline cell editing.',
      table: { category: 'Runtime' },
    },
    onEntityUpdated: {
      action: 'entityUpdated',
      table: { category: 'Events' },
    },
    onUnsavedChangesChange: {
      action: 'unsavedChangesChange',
      table: { category: 'Events' },
    },
    onRowClick: {
      action: 'rowClick',
      table: { category: 'Events' },
    },
    onRowDoubleClicked: {
      action: 'rowDoubleClicked',
      table: { category: 'Events' },
    },
    onSelectionChange: {
      action: 'selectionChange',
      table: { category: 'Events' },
    },
  },
  args: {
    onEntityUpdated: fn(),
    onUnsavedChangesChange: fn(),
    onRowClick: fn(),
    onRowDoubleClicked: fn(),
    onSelectionChange: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ height: '500px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DemoShimGrid>;

// ============================================================================
// Stories
// ============================================================================

export const Default: Story = {
  args: {
    data: mockData,
    loading: false,
    activeTab: 'demo',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cells = await canvas.findAllByText('Widget Alpha');
    await expect(cells.length).toBeGreaterThan(0);
  },
};

export const WithRowActions: Story = {
  args: {
    data: mockData,
    activeTab: 'demo',
    enableRowActions: true,
    rowActions,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cells = await canvas.findAllByText('Widget Alpha');
    await expect(cells.length).toBeGreaterThan(0);
  },
};

export const EmptyWithSearch: Story = {
  args: {
    data: [],
    activeTab: 'demo',
    hasActiveSearch: true,
  },
};

export const EmptyWithoutSearch: Story = {
  args: {
    data: [],
    activeTab: 'demo',
    hasActiveSearch: false,
  },
};

export const Loading: Story = {
  args: {
    data: [],
    loading: true,
    activeTab: 'demo',
  },
};

export const WithEditing: Story = {
  args: {
    data: mockData,
    enableCellEditing: true,
    activeTab: 'demo',
  },
};

export const WithPagination: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const pageSize = 3;
    const totalItems = mockData.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const currentItems = mockData.slice(startIndex, startIndex + pageSize);

    return (
      <DemoShimGrid
        data={currentItems}
        activeTab="demo"
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

export const FullFeatured: Story = {
  render: () => {
    const [selected, setSelected] = useState<DemoEntity[]>([]);
    const [hasUnsaved, setHasUnsaved] = useState(false);
    const [lastClicked, setLastClicked] = useState<string | null>(null);

    return (
      <div className="flex flex-col h-full gap-4">
        <div className="flex gap-6 text-sm">
          <span className="text-gray-600">
            Selected: <span className="font-semibold">{selected.length}</span>
          </span>
          <span className="text-gray-600">
            Unsaved:{' '}
            <span className={hasUnsaved ? 'text-orange-600 font-semibold' : ''}>
              {hasUnsaved ? 'Yes' : 'No'}
            </span>
          </span>
          {lastClicked && (
            <span className="text-gray-600">
              Last clicked: <span className="font-semibold">{lastClicked}</span>
            </span>
          )}
        </div>
        <div className="flex-1 min-h-0">
          <DemoShimGrid
            data={mockData}
            activeTab="demo"
            enableCellEditing={true}
            enableRowActions={true}
            rowActions={rowActions}
            onSelectionChange={setSelected}
            onUnsavedChangesChange={setHasUnsaved}
            onRowDoubleClicked={(entity) => setLastClicked(entity.name)}
          />
        </div>
      </div>
    );
  },
};
