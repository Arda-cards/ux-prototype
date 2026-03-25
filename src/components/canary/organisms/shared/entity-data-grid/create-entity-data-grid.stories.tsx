import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within, userEvent } from 'storybook/test';
import { useState, useRef } from 'react';

import type { ColDef } from 'ag-grid-community';
import { createEntityDataGrid, type EntityDataGridRef } from './create-entity-data-grid';
import { storyStepDelay } from './story-step-delay';
import { ImageCellDisplay } from '@/components/canary/atoms/grid/image/image-cell-display';
import { createImageCellEditor } from '@/components/canary/atoms/grid/image/image-cell-editor';
import type { ImageFieldConfig } from '@/types/canary/utilities/image-field-config';

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
// Story step delay (shared utility)
// ============================================================================

// Note: storyStepDelay is imported from a local shared file
// If the file doesn't exist, we inline a simple version.

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
          'pipeline, row-level auto-publish editing, search/filter UI, actions column, ' +
          'client/server pagination, toolbar slot, auto-height, and drag-to-scroll.',
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
    onRowPublish: {
      action: 'rowPublish',
      description: 'Called when a row is ready to publish (auto-publish on row blur).',
      table: { category: 'Events' },
    },
    onDirtyChange: {
      action: 'dirtyChange',
      description: 'Called when the dirty state changes.',
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
    onRowPublish: fn(),
    onDirtyChange: fn(),
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('Grid renders with data', async () => {
      const cells = await canvas.findAllByText('Widget Alpha');
      await expect(cells.length).toBeGreaterThan(0);
    });
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('Grid renders with data', async () => {
      const cells = await canvas.findAllByText('Widget Alpha');
      await expect(cells.length).toBeGreaterThan(0);
    });
  },
};

export const WithFiltering: Story = {
  args: {
    data: mockData,
    activeTab: 'demo',
    enableFiltering: true,
  },
};

// ============================================================================
// Sub-run 5a: Row Auto-Publish stories
// ============================================================================

/** Factory with auto-publish enabled — uses inline fast-resolving publish fn. */
const { Component: AutoPublishGrid } = createEntityDataGrid<DemoEntity>({
  displayName: 'AutoPublishGrid',
  persistenceKeyPrefix: 'canary-auto-publish-demo',
  columnDefs: demoCols,
  defaultColDef: { sortable: true, filter: false, resizable: true },
  getEntityId: (e) => e.id,
  enhanceEditableColumnDefs: enhanceDemoEditable,
});

/**
 * RowAutoPublish — demonstrates the row-level edit → blur → saving → success
 * lifecycle. Edit a cell, move to another row, and the saving visual feedback
 * appears briefly before resolving.
 */
export const RowAutoPublish: Story = {
  render: () => {
    const [publishLog, setPublishLog] = useState<string[]>([]);

    const handleRowPublish = async (
      rowId: string,
      changes: Record<string, unknown>,
    ): Promise<void> => {
      // Simulate a fast async publish.
      await new Promise<void>((resolve) => setTimeout(resolve, 300));
      setPublishLog((prev) => [...prev, `Row ${rowId} published: ${JSON.stringify(changes)}`]);
    };

    return (
      <div className="flex flex-col gap-4" style={{ height: '500px' }}>
        <div style={{ flex: 1 }}>
          <AutoPublishGrid
            data={mockData}
            enableCellEditing={true}
            activeTab="auto-publish"
            onRowPublish={handleRowPublish}
          />
        </div>
        <div className="text-xs text-muted-foreground font-mono max-h-24 overflow-auto">
          {publishLog.length === 0
            ? 'Edit a cell, then click a different row to trigger auto-publish.'
            : publishLog.map((entry, i) => <div key={i}>{entry}</div>)}
        </div>
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Grid renders with data', async () => {
      const cells = await canvas.findAllByText('Widget Alpha');
      await expect(cells.length).toBeGreaterThan(0);
    });

    await storyStepDelay(1000);

    await step('Double-click a cell to edit it', async () => {
      const cells = await canvas.findAllByText('Widget Alpha');
      if (cells[0]) await userEvent.dblClick(cells[0]);
    });

    await storyStepDelay(500);
  },
};

/** Factory with failing publish for error state demonstration. */
const { Component: ErrorPublishGrid } = createEntityDataGrid<DemoEntity>({
  displayName: 'ErrorPublishGrid',
  persistenceKeyPrefix: 'canary-error-publish-demo',
  columnDefs: demoCols,
  defaultColDef: { sortable: true, filter: false, resizable: true },
  getEntityId: (e) => e.id,
  enhanceEditableColumnDefs: enhanceDemoEditable,
});

/**
 * RowAutoPublishError — demonstrates the error visual state when `onRowPublish`
 * rejects. The row remains in error state with a red background.
 */
export const RowAutoPublishError: Story = {
  render: () => {
    const [errorLog, setErrorLog] = useState<string[]>([]);

    const handleRowPublish = async (rowId: string): Promise<void> => {
      await new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error('Server error')), 200),
      );
      setErrorLog((prev) => [...prev, `Row ${rowId} publish failed`]);
    };

    return (
      <div className="flex flex-col gap-4" style={{ height: '500px' }}>
        <div style={{ flex: 1 }}>
          <ErrorPublishGrid
            data={mockData}
            enableCellEditing={true}
            activeTab="error-publish"
            onRowPublish={handleRowPublish}
          />
        </div>
        <div className="text-xs text-destructive font-mono max-h-24 overflow-auto">
          {errorLog.length === 0
            ? 'Edit a cell, then click a different row. The row will turn red (error state).'
            : errorLog.map((entry, i) => <div key={i}>{entry}</div>)}
        </div>
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Grid renders', async () => {
      const cells = await canvas.findAllByText('Widget Alpha');
      await expect(cells.length).toBeGreaterThan(0);
    });
  },
};

/** Factory for save/discard ref API stories. */
const { Component: RefApiGrid } = createEntityDataGrid<DemoEntity>({
  displayName: 'RefApiGrid',
  persistenceKeyPrefix: 'canary-ref-api-demo',
  columnDefs: demoCols,
  defaultColDef: { sortable: true, filter: false, resizable: true },
  getEntityId: (e) => e.id,
  enhanceEditableColumnDefs: enhanceDemoEditable,
});

/**
 * SaveAllDrafts — demonstrates `saveAll()` via the imperative ref API.
 * Toolbar buttons trigger save/discard programmatically.
 */
export const SaveAllDrafts: Story = {
  render: () => {
    const gridRef = useRef<EntityDataGridRef>(null);
    const [log, setLog] = useState<string[]>([]);
    const [isDirty, setIsDirty] = useState(false);

    const handleRowPublish = async (rowId: string, changes: Record<string, unknown>) => {
      await new Promise<void>((resolve) => setTimeout(resolve, 200));
      setLog((prev) => [...prev, `Saved row ${rowId}: ${JSON.stringify(changes)}`]);
    };

    return (
      <div className="flex flex-col gap-4" style={{ height: '520px' }}>
        <div className="flex gap-2">
          <button
            onClick={() => void gridRef.current?.saveAll()}
            disabled={!isDirty}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            Save All
          </button>
          <button
            onClick={() => gridRef.current?.discardAll()}
            disabled={!isDirty}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            Discard All
          </button>
          <span className="text-sm text-muted-foreground self-center">
            {isDirty ? 'Unsaved changes' : 'No changes'}
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <RefApiGrid
            ref={gridRef}
            data={mockData}
            enableCellEditing={true}
            activeTab="save-all"
            onRowPublish={handleRowPublish}
            onDirtyChange={setIsDirty}
          />
        </div>
        <div className="text-xs text-muted-foreground font-mono max-h-20 overflow-auto">
          {log.length === 0
            ? 'Edit cells, then click Save All.'
            : log.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Grid and toolbar render', async () => {
      await expect(canvas.getByText('Save All')).toBeInTheDocument();
      await expect(canvas.getByText('Discard All')).toBeInTheDocument();
      const cells = await canvas.findAllByText('Widget Alpha');
      await expect(cells.length).toBeGreaterThan(0);
    });

    await step('Save All button is initially disabled (no dirty rows)', async () => {
      const saveButton = canvas.getByText('Save All');
      await expect(saveButton).toBeDisabled();
    });
  },
};

/**
 * DiscardAllDrafts — demonstrates `discardAll()` which clears pending changes
 * without publishing them.
 */
export const DiscardAllDrafts: Story = {
  render: () => {
    const gridRef = useRef<EntityDataGridRef>(null);
    const [isDirty, setIsDirty] = useState(false);
    const [discardCount, setDiscardCount] = useState(0);

    return (
      <div className="flex flex-col gap-4" style={{ height: '520px' }}>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => {
              gridRef.current?.discardAll();
              setDiscardCount((c) => c + 1);
            }}
            className="rounded border px-3 py-1 text-sm"
          >
            Discard All
          </button>
          <span className="text-sm text-muted-foreground">
            {isDirty ? 'Has unsaved changes' : 'Clean'}
            {discardCount > 0 && ` (discarded ${discardCount} times)`}
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <RefApiGrid
            ref={gridRef}
            data={mockData}
            enableCellEditing={true}
            activeTab="discard-all"
            onRowPublish={async () => {}}
            onDirtyChange={setIsDirty}
          />
        </div>
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Grid and toolbar render', async () => {
      await expect(canvas.getByText('Discard All')).toBeInTheDocument();
      const cells = await canvas.findAllByText('Widget Alpha');
      await expect(cells.length).toBeGreaterThan(0);
    });

    await step('Dirty indicator shows Clean initially', async () => {
      await expect(canvas.getByText('Clean')).toBeInTheDocument();
    });
  },
};

// ============================================================================
// Sub-run 5b: Actions Column story
// ============================================================================

const { Component: ActionsGrid } = createEntityDataGrid<DemoEntity>({
  displayName: 'ActionsGrid',
  persistenceKeyPrefix: 'canary-actions-demo',
  columnDefs: demoCols,
  defaultColDef: { sortable: true, filter: false, resizable: true },
  getEntityId: (e) => e.id,
  actionsColumn: {
    actionCount: 2,
    cellRenderer: (params: any) => {
      const entity = params.data as DemoEntity;
      return (
        <div className="flex items-center gap-1 h-full">
          <button
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-secondary text-xs"
            onClick={() => alert(`Edit ${entity.name}`)}
            title="Edit"
          >
            E
          </button>
          <button
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-destructive/10 text-xs text-destructive"
            onClick={() => alert(`Delete ${entity.name}`)}
            title="Delete"
          >
            D
          </button>
        </div>
      );
    },
  },
});

/**
 * WithActionsColumn — demonstrates the pinned-right actions column with
 * auto-width calculated from `actionCount`.
 */
export const WithActionsColumn: Story = {
  render: () => <ActionsGrid data={mockData} activeTab="actions" />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Grid renders with data', async () => {
      const cells = await canvas.findAllByText('Widget Alpha');
      await expect(cells.length).toBeGreaterThan(0);
    });

    await storyStepDelay(500);
  },
};

// ============================================================================
// Sub-run 5c: Search stories
// ============================================================================

const { Component: SearchGrid } = createEntityDataGrid<DemoEntity>({
  displayName: 'SearchGrid',
  persistenceKeyPrefix: 'canary-search-demo',
  columnDefs: demoCols,
  defaultColDef: { sortable: true, filter: false, resizable: true },
  getEntityId: (e) => e.id,
  searchConfig: {
    fields: ['name', 'category', 'status'],
    placeholder: 'Search entities\u2026',
  },
});

/**
 * WithSearch — demonstrates the search bar with 150ms debounce and
 * filtered count display.
 */
export const WithSearch: Story = {
  render: () => <SearchGrid data={mockData} activeTab="search" />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Search bar renders', async () => {
      const searchInput = await canvas.findByRole('searchbox');
      await expect(searchInput).toBeInTheDocument();
    });

    await step('Count label shows total items initially', async () => {
      const countLabel = await canvas.findByText(`${mockData.length} items`);
      await expect(countLabel).toBeInTheDocument();
    });

    await storyStepDelay(500);

    await step('Type a search term', async () => {
      const searchInput = canvas.getByRole('searchbox');
      await userEvent.clear(searchInput);
      await userEvent.type(searchInput, 'Hardware');
    });

    // Wait for debounce (150ms) + extra buffer
    await new Promise<void>((resolve) => setTimeout(resolve, 300));

    await step('Count label updates to show filtered result', async () => {
      const hardwareCount = mockData.filter(
        (e) =>
          e.name.toLowerCase().includes('hardware') ||
          e.category.toLowerCase().includes('hardware'),
      ).length;
      const countLabel = canvas.getByText(
        new RegExp(`${hardwareCount} of ${mockData.length} items`),
      );
      await expect(countLabel).toBeInTheDocument();
    });
  },
};

const { Component: SearchSelectionGrid } = createEntityDataGrid<DemoEntity>({
  displayName: 'SearchSelectionGrid',
  persistenceKeyPrefix: 'canary-search-selection-demo',
  columnDefs: demoCols,
  defaultColDef: { sortable: true, filter: false, resizable: true },
  getEntityId: (e) => e.id,
  searchConfig: {
    fields: ['name', 'category'],
    placeholder: 'Search\u2026',
  },
});

/**
 * WithSearchAndSelection — demonstrates how the count label switches from
 * "N of M items" to "N of M selected" when rows are selected.
 */
export const WithSearchAndSelection: Story = {
  render: () => {
    const [_selected, setSelected] = useState<DemoEntity[]>([]);
    return (
      <SearchSelectionGrid
        data={mockData}
        activeTab="search-selection"
        onSelectionChange={setSelected}
      />
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Search bar and grid render', async () => {
      const searchInput = await canvas.findByRole('searchbox');
      await expect(searchInput).toBeInTheDocument();
    });
  },
};

// ============================================================================
// Sub-run 5d: Pagination Mode story
// ============================================================================

/** Lots of rows for client pagination demo. */
const paginationData: DemoEntity[] = Array.from({ length: 50 }, (_, i) => ({
  id: String(i + 1),
  name: `Entity ${i + 1}`,
  category: i % 3 === 0 ? 'Hardware' : i % 3 === 1 ? 'Electronics' : 'Software',
  status: i % 2 === 0 ? 'Active' : 'Inactive',
  value: parseFloat(((i + 1) * 9.99).toFixed(2)),
}));

const { Component: ClientPaginationGrid } = createEntityDataGrid<DemoEntity>({
  displayName: 'ClientPaginationGrid',
  persistenceKeyPrefix: 'canary-client-pagination-demo',
  columnDefs: demoCols,
  defaultColDef: { sortable: true, filter: false, resizable: true },
  getEntityId: (e) => e.id,
  paginationMode: 'client',
  pageSize: 10,
});

/**
 * ClientPagination — demonstrates AG Grid's built-in client-side pagination
 * with 10 rows per page over 50 total rows.
 */
export const ClientPagination: Story = {
  render: () => <ClientPaginationGrid data={paginationData} activeTab="client-pagination" />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Grid renders with client pagination', async () => {
      const cells = await canvas.findAllByText('Entity 1');
      await expect(cells.length).toBeGreaterThan(0);
    });
  },
};

/**
 * WithPagination (server-driven) — verifies the existing server pagination still works.
 */
export const WithPagination: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const pageSize = 3;
    const totalItems = mockData.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const currentItems = mockData.slice(startIndex, startIndex + pageSize);

    const { Component: ServerPaginationGrid } = createEntityDataGrid<DemoEntity>({
      displayName: 'ServerPaginationGrid',
      persistenceKeyPrefix: 'canary-server-pagination-demo',
      columnDefs: demoCols,
      defaultColDef: { sortable: true, filter: false, resizable: true },
      getEntityId: (e) => e.id,
      paginationMode: 'server',
    });

    return (
      <ServerPaginationGrid
        data={currentItems}
        activeTab="server-pagination"
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

// ============================================================================
// Sub-run 5e: Toolbar, AutoHeight, DragToScroll stories
// ============================================================================

const { Component: ToolbarGrid } = createEntityDataGrid<DemoEntity>({
  displayName: 'ToolbarGrid',
  persistenceKeyPrefix: 'canary-toolbar-demo',
  columnDefs: demoCols,
  defaultColDef: { sortable: true, filter: false, resizable: true },
  getEntityId: (e) => e.id,
  searchConfig: { fields: ['name', 'category'], placeholder: 'Search\u2026' },
});

/**
 * WithToolbar — demonstrates a custom ReactNode toolbar in the same row as
 * the search bar, right-aligned with `ml-auto`.
 */
export const WithToolbar: Story = {
  render: () => (
    <ToolbarGrid
      data={mockData}
      activeTab="toolbar"
      toolbar={
        <div className="flex gap-2">
          <button className="rounded border px-3 py-1 text-sm">Export</button>
          <button className="rounded border px-3 py-1 text-sm">Filter</button>
        </div>
      }
    />
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Search bar and toolbar render', async () => {
      await expect(canvas.getByText('Export')).toBeInTheDocument();
      await expect(canvas.getByText('Filter')).toBeInTheDocument();
      const searchInput = canvas.getByRole('searchbox');
      await expect(searchInput).toBeInTheDocument();
    });
  },
};

const { Component: AutoHeightGrid } = createEntityDataGrid<DemoEntity>({
  displayName: 'AutoHeightGrid',
  persistenceKeyPrefix: 'canary-auto-height-demo',
  columnDefs: demoCols,
  defaultColDef: { sortable: true, filter: false, resizable: true },
  getEntityId: (e) => e.id,
  autoHeight: true,
});

/**
 * AutoHeight — demonstrates the grid growing to fit its content without a
 * fixed height container. Uses `domLayout: 'autoHeight'` from AG Grid.
 */
export const AutoHeight: Story = {
  decorators: [
    (Story) => (
      // Override the default height decorator — auto-height should not be constrained.
      <div style={{ padding: '16px' }}>
        <Story />
      </div>
    ),
  ],
  render: () => <AutoHeightGrid data={mockData.slice(0, 3)} activeTab="auto-height" />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Grid renders with limited rows', async () => {
      const cells = await canvas.findAllByText('Widget Alpha');
      await expect(cells.length).toBeGreaterThan(0);
    });
  },
};

const wideColumnDefs: ColDef<DemoEntity>[] = [
  { field: 'name', headerName: 'Name', width: 300 },
  { field: 'category', headerName: 'Category', width: 300 },
  { field: 'status', headerName: 'Status', width: 300 },
  { field: 'value', headerName: 'Value', width: 300 },
  { field: 'notes', headerName: 'Notes', width: 300 },
  { field: 'id', headerName: 'ID', width: 300 },
];

const { Component: DragToScrollGrid } = createEntityDataGrid<DemoEntity>({
  displayName: 'DragToScrollGrid',
  persistenceKeyPrefix: 'canary-drag-scroll-demo',
  columnDefs: wideColumnDefs,
  defaultColDef: { sortable: true, filter: false, resizable: true },
  getEntityId: (e) => e.id,
  enableDragToScroll: true,
});

/**
 * DragToScroll — demonstrates horizontal drag-to-scroll on a wide grid.
 * Click and drag on the grid body to scroll horizontally.
 */
export const DragToScroll: Story = {
  render: () => <DragToScrollGrid data={mockData} activeTab="drag-scroll" />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Wide grid renders', async () => {
      const cells = await canvas.findAllByText('Widget Alpha');
      await expect(cells.length).toBeGreaterThan(0);
    });
  },
};

// ============================================================================
// Interactive story (unchanged — uses new onRowPublish)
// ============================================================================

export const Interactive: Story = {
  render: () => {
    const [selected, setSelected] = useState<DemoEntity[]>([]);
    const [isDirty, setIsDirty] = useState(false);
    const [publishCount, setPublishCount] = useState(0);

    return (
      <div className="flex flex-col h-full gap-4">
        <div className="flex gap-4 text-sm">
          <div className="text-gray-600">
            Selected: <span className="font-semibold">{selected.length}</span>
          </div>
          <div className="text-gray-600">
            Unsaved:{' '}
            <span className={isDirty ? 'text-orange-600 font-semibold' : ''}>
              {isDirty ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="text-gray-600">
            Published: <span className="font-semibold">{publishCount} row(s)</span>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <DemoDataGrid
            data={mockData}
            activeTab="demo"
            enableCellEditing={true}
            onSelectionChange={setSelected}
            onDirtyChange={setIsDirty}
            onRowPublish={async () => {
              await new Promise<void>((resolve) => setTimeout(resolve, 300));
              setPublishCount((c) => c + 1);
            }}
            onRowClick={(entity) => console.log('Clicked:', entity.name)}
          />
        </div>
      </div>
    );
  },
};

// ============================================================================
// With Image Column — demonstrates ImageCellDisplay inside the entity grid
// ============================================================================

interface ImageDemoEntity {
  id: string;
  imageUrl: string | null;
  name: string;
  sku: string;
  unitCost: number;
}

const IMAGE_DEMO_CONFIG: ImageFieldConfig = {
  aspectRatio: 1,
  acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
  maxFileSizeBytes: 10 * 1024 * 1024,
  maxDimension: 2048,
  entityTypeDisplayName: 'Part',
  propertyDisplayName: 'Product Image',
};

const imageDemoCols: ColDef<ImageDemoEntity>[] = [
  {
    field: 'imageUrl',
    headerName: 'Image',
    width: 60,
    sortable: false,
    cellRenderer: ImageCellDisplay,
    cellRendererParams: { config: IMAGE_DEMO_CONFIG },
    cellEditor: createImageCellEditor(IMAGE_DEMO_CONFIG),
    editable: true,
  },
  { field: 'name', headerName: 'Name', editable: true, flex: 1 },
  { field: 'sku', headerName: 'SKU', width: 120 },
  {
    field: 'unitCost',
    headerName: 'Unit Cost',
    width: 110,
    cellRenderer: (params: { data: ImageDemoEntity }) => `$${params.data.unitCost.toFixed(2)}`,
  },
];

const imageDemoData: ImageDemoEntity[] = [
  {
    id: '1',
    imageUrl: 'https://picsum.photos/seed/arda-item-1/400/400',
    name: 'Hex Bolt M10x30',
    sku: 'HB-1030',
    unitCost: 0.45,
  },
  {
    id: '2',
    imageUrl: 'https://picsum.photos/seed/arda-item-2/400/400',
    name: 'Flat Washer 3/8"',
    sku: 'FW-0375',
    unitCost: 0.12,
  },
  {
    id: '3',
    imageUrl: null,
    name: 'Spring Pin 4x20',
    sku: 'SP-0420',
    unitCost: 0.28,
  },
  {
    id: '4',
    imageUrl: 'https://example.com/nonexistent-image-404.jpg',
    name: 'Tee Nut 1/4-20',
    sku: 'TN-2520',
    unitCost: 0.65,
  },
  {
    id: '5',
    imageUrl: 'https://picsum.photos/seed/arda-item-5/400/400',
    name: 'Cap Screw 5/16-18x1',
    sku: 'CS-3118',
    unitCost: 0.33,
  },
  {
    id: '6',
    imageUrl: 'https://picsum.photos/seed/arda-item-6/400/400',
    name: 'Lock Washer #10',
    sku: 'LW-0010',
    unitCost: 0.08,
  },
];

const IMAGE_EDITABLE_FIELDS = new Set(['imageUrl']);

const { Component: ImageDemoGrid } = createEntityDataGrid<ImageDemoEntity>({
  displayName: 'ImageDemoGrid',
  persistenceKeyPrefix: 'canary-image-demo-grid',
  columnDefs: imageDemoCols,
  defaultColDef: { sortable: true, filter: false, resizable: true },
  getEntityId: (e) => e.id,
  enhanceEditableColumnDefs: (defs, { enabled }) => {
    if (!enabled) return defs;
    return defs.map((col) => {
      const key = (col.field as string) || '';
      if (!IMAGE_EDITABLE_FIELDS.has(key)) return col;
      return { ...col, editable: true };
    });
  },
});

/**
 * Entity grid with an image column. Demonstrates the full ImageCellDisplay +
 * ImageCellEditor integration inside the entity data grid factory:
 *
 * **Display behaviors (hover):**
 * - Hover a loaded image to see a 256&#215;256 preview popover (500ms delay).
 * - Action icons (eye, pencil) appear on hover.
 * - Eye icon is suppressed when the image URL is null or broken.
 *
 * **Editing behaviors (double-click / Enter):**
 * - Double-click or press Enter on an image cell to open ImageUploadDialog.
 * - The dialog shows the current image for comparison (if one exists).
 * - Confirm an upload to commit a new URL to the cell.
 * - Cancel to discard without changing the cell value.
 * - Single click selects the row (suppressClickEdit is set).
 *
 * **Row states:**
 * - **Rows 1, 2, 5, 6**: Loaded images
 * - **Row 3**: No image (null) &#8212; initials placeholder "P"
 * - **Row 4**: Broken URL &#8212; initials + error badge
 */
export const WithImageColumn: Story = {
  render: () => (
    <ImageDemoGrid
      data={imageDemoData}
      loading={false}
      enableCellEditing={true}
      activeTab="image-demo"
    />
  ),
};

// ============================================================================
// Playground — interactive controls for runtime props
// ============================================================================

export const Playground: Story = {
  argTypes: {
    loading: { control: 'boolean' },
    enableCellEditing: { control: 'boolean' },
  },
  args: {
    data: mockData,
    loading: false,
    enableCellEditing: true,
    activeTab: 'playground',
  },
};

// ============================================================================
// Basic stories
// ============================================================================
