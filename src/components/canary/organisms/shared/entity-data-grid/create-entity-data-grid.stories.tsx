import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { useState } from 'react';

import type { ColDef } from 'ag-grid-community';
import { createEntityDataGrid } from './create-entity-data-grid';

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

const EDITABLE_FIELDS = new Set(['name', 'category', 'status', 'notes']);

const demoCols: ColDef<DemoEntity>[] = [
  { field: 'name', headerName: 'Name', width: 200 },
  { field: 'category', headerName: 'Category', width: 150 },
  { field: 'status', headerName: 'Status', width: 120 },
  {
    field: 'value',
    headerName: 'Value',
    width: 120,
    cellRenderer: (params: any) => {
      const entity = params.data as DemoEntity;
      return `$${entity.value.toFixed(2)}`;
    },
  },
  {
    field: 'notes',
    headerName: 'Notes',
    width: 200,
    cellRenderer: (params: any) => {
      const entity = params.data as DemoEntity;
      return entity.notes ?? '\u2014';
    },
  },
];

function enhanceDemoEditable(
  defs: ColDef<DemoEntity>[],
  options?: { enabled?: boolean },
): ColDef<DemoEntity>[] {
  if (options?.enabled === false) return defs;
  return defs.map((col) => {
    const key = (col.field as string) || (col.colId as string);
    if (!key || !EDITABLE_FIELDS.has(key)) return col;
    return { ...col, editable: true };
  });
}

const { Component: DemoDataGrid } = createEntityDataGrid<DemoEntity>({
  displayName: 'DemoDataGrid',
  persistenceKeyPrefix: 'canary-demo-data-grid',
  columnDefs: demoCols,
  defaultColDef: { sortable: true, filter: false, resizable: true },
  getEntityId: (e) => e.id,
  enhanceEditableColumnDefs: enhanceDemoEditable,
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
  {
    id: '5',
    name: 'Sensor Epsilon',
    category: 'Electronics',
    status: 'Pending',
    value: 87.75,
    notes: 'New arrival',
  },
  { id: '6', name: 'Bracket Zeta', category: 'Hardware', status: 'Active', value: 12.3 },
  {
    id: '7',
    name: 'Controller Eta',
    category: 'Electronics',
    status: 'Active',
    value: 220.0,
    notes: 'Firmware v2.1',
  },
  { id: '8', name: 'Seal Theta', category: 'Hardware', status: 'Active', value: 3.5 },
];

// ============================================================================
// Stories
// ============================================================================

const meta: Meta<typeof DemoDataGrid> = {
  title: 'Components/Canary/Organisms/Shared/Entity Data Grid',
  component: DemoDataGrid,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '`createEntityDataGrid<T>()` is a canary factory that produces a fully typed, ' +
          'feature-rich data grid component for any entity type. It encapsulates column ' +
          'pipeline, dirty tracking (via `useDirtyTracking`), editing, pagination, and ' +
          'Tier 3a sort/filter/event passthrough features.',
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
    enableMultiSort: {
      control: 'boolean',
      description: 'Enable multi-column sorting.',
      table: { category: 'Runtime' },
    },
    enableFiltering: {
      control: 'boolean',
      description: 'Enable column filtering.',
      table: { category: 'Runtime' },
    },
    columnVisibility: {
      control: false,
      description: 'Column visibility map (colId to boolean).',
      table: { category: 'Runtime' },
    },
    onEntityUpdated: {
      action: 'entityUpdated',
      description: 'Called when an entity is updated via cell edit.',
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
    onSortChanged: {
      action: 'sortChanged',
      description: 'Called when the sort model changes.',
      table: { category: 'Events' },
    },
    onFilterChanged: {
      action: 'filterChanged',
      description: 'Called when the filter model changes.',
      table: { category: 'Events' },
    },
  },
  args: {
    onEntityUpdated: fn(),
    onUnsavedChangesChange: fn(),
    onSelectionChange: fn(),
    onRowClick: fn(),
    onSortChanged: fn(),
    onFilterChanged: fn(),
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
type Story = StoryObj<typeof DemoDataGrid>;

export const Default: Story = {
  args: {
    data: mockData,
    loading: false,
    enableCellEditing: true,
    activeTab: 'demo',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cells = await canvas.findAllByText('Widget Alpha');
    await expect(cells.length).toBeGreaterThan(0);
  },
};

export const Empty: Story = {
  args: {
    data: [],
    loading: false,
    activeTab: 'demo',
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

export const WithColumnVisibility: Story = {
  args: {
    data: mockData,
    activeTab: 'demo',
    columnVisibility: {
      notes: false,
      value: false,
    },
  },
};

export const WithMultiSort: Story = {
  args: {
    data: mockData,
    activeTab: 'demo',
    enableMultiSort: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cells = await canvas.findAllByText('Widget Alpha');
    await expect(cells.length).toBeGreaterThan(0);
  },
};

export const WithFiltering: Story = {
  args: {
    data: mockData,
    activeTab: 'demo',
    enableFiltering: true,
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
      <DemoDataGrid
        data={currentItems}
        activeTab="demo"
        enableCellEditing
        onEntityUpdated={fn()}
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

export const Interactive: Story = {
  render: () => {
    const [selected, setSelected] = useState<DemoEntity[]>([]);
    const [hasUnsaved, setHasUnsaved] = useState(false);

    return (
      <div className="flex flex-col h-full gap-4">
        <div className="flex gap-4 text-sm">
          <div className="text-gray-600">
            Selected: <span className="font-semibold">{selected.length}</span>
          </div>
          <div className="text-gray-600">
            Unsaved:{' '}
            <span className={hasUnsaved ? 'text-orange-600 font-semibold' : ''}>
              {hasUnsaved ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <DemoDataGrid
            data={mockData}
            activeTab="demo"
            enableCellEditing={true}
            onSelectionChange={setSelected}
            onUnsavedChangesChange={setHasUnsaved}
            onRowClick={(entity) => console.log('Clicked:', entity.name)}
          />
        </div>
      </div>
    );
  },
};
