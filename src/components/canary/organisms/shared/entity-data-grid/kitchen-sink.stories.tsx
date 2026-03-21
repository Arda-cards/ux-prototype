/**
 * KitchenSink — Developer reference story exercising ALL entity-data-grid capabilities.
 *
 * Demonstrates simultaneously:
 *   - Auto-publish lifecycle (edit → blur → saving → success)
 *   - Search/filter UI with count display
 *   - Custom toolbar slot
 *   - Actions column (pinned right, auto-width)
 *   - Drag-to-scroll (wide grid)
 *   - Client-side pagination
 *   - Column visibility
 *   - Row selection
 *   - Multi-sort
 *
 * This is the developer reference: "here is everything the grid can do."
 */
import { useState, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, userEvent, waitFor } from 'storybook/test';
import type { ColDef } from 'ag-grid-community';
import { Eye, Trash2, Download, Printer, ShoppingCart } from 'lucide-react';

import { createEntityDataGrid, type EntityDataGridRef } from './create-entity-data-grid';
import { storyStepDelay } from './story-step-delay';

// ---------------------------------------------------------------------------
// Demo entity
// ---------------------------------------------------------------------------

interface KitchenSinkEntity {
  id: string;
  name: string;
  category: string;
  status: string;
  quantity: number;
  unitCost: number;
  supplier: string;
  location: string;
  lastUpdated: string;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Mock data — 25 rows for pagination demo
// ---------------------------------------------------------------------------

const CATEGORIES = [
  'PPE',
  'Chemicals',
  'Diagnostics',
  'Wound Care',
  'Safety',
  'IV Therapy',
  'Lab Supplies',
];
const STATUSES = ['Active', 'Low Stock', 'Reorder', 'Inactive'];
const SUPPLIERS = [
  'Medline',
  'Cardinal Health',
  'Fisher Sci',
  'Welch Allyn',
  'BD Medical',
  'Baxter',
  'Stericycle',
];
const LOCATIONS = ['Bay 1', 'Bay 2', 'Bay 3', 'Bay 4', 'Cabinet A', 'Cabinet B', 'Refrigerator 1'];

const kitchenSinkData: KitchenSinkEntity[] = Array.from({ length: 25 }, (_, i) => {
  const category = CATEGORIES[i % CATEGORIES.length] as string;
  const status = STATUSES[i % STATUSES.length] as string;
  const supplier = SUPPLIERS[i % SUPPLIERS.length] as string;
  const location = LOCATIONS[i % LOCATIONS.length] as string;
  const base: KitchenSinkEntity = {
    id: String(i + 1),
    name: `Item ${String(i + 1).padStart(3, '0')} \u2014 ${category}`,
    category,
    status,
    quantity: (i + 1) * 10 + (i % 7) * 3,
    unitCost: parseFloat(((i + 1) * 3.75 + (i % 5) * 2.5).toFixed(2)),
    supplier,
    location,
    lastUpdated: `2026-03-${String((i % 28) + 1).padStart(2, '0')}`,
  };
  if (i % 4 === 0) base.notes = `Reorder note for item ${i + 1}`;
  return base;
});

// ---------------------------------------------------------------------------
// Column definitions — all editable text fields except computed columns
// ---------------------------------------------------------------------------

const EDITABLE_FIELDS = new Set(['name', 'category', 'status', 'supplier', 'location', 'notes']);

const allColumnDefs: ColDef<KitchenSinkEntity>[] = [
  { field: 'name', headerName: 'Name', width: 260 },
  { field: 'category', headerName: 'Category', width: 140 },
  { field: 'status', headerName: 'Status', width: 120 },
  { field: 'quantity', headerName: 'Qty', width: 90 },
  {
    field: 'unitCost',
    headerName: 'Unit Cost',
    width: 110,
    valueFormatter: (p) =>
      p.value !== null && p.value !== undefined ? `$${(p.value as number).toFixed(2)}` : '',
  },
  { field: 'supplier', headerName: 'Supplier', width: 160 },
  { field: 'location', headerName: 'Location', width: 140 },
  { field: 'lastUpdated', headerName: 'Last Updated', width: 140 },
  { field: 'notes', headerName: 'Notes', width: 220 },
];

function enhanceEditable(defs: ColDef<KitchenSinkEntity>[], opts?: { enabled?: boolean }) {
  if (opts?.enabled === false) return defs;
  return defs.map((col) => {
    const key = (col.field as string) || (col.colId as string);
    if (!key || !EDITABLE_FIELDS.has(key)) return col;
    return { ...col, editable: true };
  });
}

// ---------------------------------------------------------------------------
// Kitchen Sink grid factory — all features enabled at factory time
// ---------------------------------------------------------------------------

const { Component: KitchenSinkGrid } = createEntityDataGrid<KitchenSinkEntity>({
  displayName: 'KitchenSinkGrid',
  persistenceKeyPrefix: 'kitchen-sink-grid',
  columnDefs: allColumnDefs,
  defaultColDef: { sortable: true, filter: false, resizable: true },
  getEntityId: (e) => e.id,
  enhanceEditableColumnDefs: enhanceEditable,

  // Search
  searchConfig: {
    fields: ['name', 'category', 'status', 'supplier', 'location'],
    placeholder: 'Search all fields\u2026',
  },

  // Pagination — client-side, 10 per page
  paginationMode: 'client',
  pageSize: 10,

  // Drag-to-scroll
  enableDragToScroll: true,

  // Actions column — 2 actions
  actionsColumn: {
    actionCount: 2,
    cellRenderer: (params: { data?: KitchenSinkEntity }) => {
      if (!params.data) return null;
      const item = params.data;
      return (
        <div className="flex h-full items-center gap-1">
          <button
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              console.log('View', item.name);
            }}
            title="View details"
            aria-label={`View ${item.name}`}
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Delete', item.name);
            }}
            title="Delete"
            aria-label={`Delete ${item.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      );
    },
  },
});

// ---------------------------------------------------------------------------
// Kitchen Sink wrapper
// ---------------------------------------------------------------------------

function KitchenSinkPage() {
  const gridRef = useRef<EntityDataGridRef>(null);
  const [selected, setSelected] = useState<KitchenSinkEntity[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [publishLog, setPublishLog] = useState<string[]>([]);
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());

  const handlePublish = async (rowId: string, changes: Record<string, unknown>) => {
    await new Promise<void>((resolve) => setTimeout(resolve, 300));
    setPublishLog((prev) => [
      ...prev.slice(-4),
      `Row ${rowId}: ${Object.keys(changes).join(', ')} updated`,
    ]);
  };

  const colVisibility = Object.fromEntries(
    allColumnDefs
      .map((c) => c.field as string)
      .filter(Boolean)
      .map((f) => [f, !hiddenCols.has(f)]),
  );

  const toolbar = (
    <div className="flex items-center gap-2">
      {/* Save/Discard */}
      {isDirty && (
        <>
          <button
            onClick={() => void gridRef.current?.saveAll()}
            className="h-8 rounded border px-3 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Save All
          </button>
          <button
            onClick={() => gridRef.current?.discardAll()}
            className="h-8 rounded border px-3 text-xs"
          >
            Discard
          </button>
        </>
      )}
      {/* Column toggle example */}
      <button
        onClick={() => {
          setHiddenCols((prev) => {
            const next = new Set(prev);
            if (next.has('notes')) next.delete('notes');
            else next.add('notes');
            return next;
          });
        }}
        className="h-8 rounded border px-3 text-xs"
      >
        {hiddenCols.has('notes') ? 'Show Notes' : 'Hide Notes'}
      </button>
      {/* Selection actions */}
      {selected.length > 0 && (
        <>
          <button
            onClick={() => console.log('Print', selected.length)}
            className="h-8 rounded border px-3 text-xs flex items-center gap-1"
          >
            <Printer className="h-3.5 w-3.5" />
            Print ({selected.length})
          </button>
          <button
            onClick={() => console.log('Export', selected.length)}
            className="h-8 rounded border px-3 text-xs flex items-center gap-1"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <button
            onClick={() => console.log('Queue', selected.length)}
            className="h-8 rounded border px-3 text-xs flex items-center gap-1"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Queue
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Entity Data Grid — Kitchen Sink</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All features active: search + auto-publish + toolbar + actions + pagination +
          drag-to-scroll + column visibility + selection.
        </p>
      </div>

      {/* Status bar */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>
          Selected: <strong className="text-foreground">{selected.length}</strong>
        </span>
        <span>
          Dirty:{' '}
          <strong className={isDirty ? 'text-orange-600' : 'text-foreground'}>
            {isDirty ? 'Yes' : 'No'}
          </strong>
        </span>
        <span>25 total items, 10/page</span>
      </div>

      <div style={{ height: 520 }}>
        <KitchenSinkGrid
          ref={gridRef}
          data={kitchenSinkData}
          activeTab="kitchen-sink"
          enableCellEditing
          onRowPublish={handlePublish}
          onDirtyChange={setIsDirty}
          onSelectionChange={setSelected}
          columnVisibility={colVisibility}
          enableMultiSort
          toolbar={toolbar}
        />
      </div>

      {/* Publish log */}
      {publishLog.length > 0 && (
        <div className="rounded border bg-muted/30 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Publish Log
          </p>
          {publishLog.map((entry, i) => (
            <p key={i} className="text-xs font-mono text-muted-foreground">
              {entry}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Story meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof KitchenSinkPage> = {
  title: 'Components/Canary/Organisms/Shared/Entity Data Grid/Kitchen Sink',
  component: KitchenSinkPage,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Developer reference story exercising all entity-data-grid capabilities at once. ' +
          'Use this as the starting point for understanding what the grid can do.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof KitchenSinkPage>;

/**
 * KitchenSink — all capabilities active simultaneously.
 * Play function: verify grid renders, search filters, select rows,
 * edit a cell and verify auto-publish fires.
 */
export const KitchenSink: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Grid renders with 10 rows on first page', async () => {
      await canvas.findByText(
        'Item 001 \u2014 PPE',
        { selector: '[role="gridcell"]' },
        { timeout: 10000 },
      );
    });

    await storyStepDelay();

    await step('Search filters rows by category', async () => {
      const searchInput = canvas.getByRole('searchbox');
      await userEvent.type(searchInput, 'PPE');
      await waitFor(
        () => {
          // 25 items with PPE category pattern (every 7th)
          const countLabel = canvas.getByText(/of 25 items/);
          expect(countLabel).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();

    await step('Clear search to restore all rows', async () => {
      const searchInput = canvas.getByRole('searchbox');
      await userEvent.clear(searchInput);
      await waitFor(
        () => {
          expect(canvas.getByText('25 items')).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();

    await step('Click a row to select it', async () => {
      const firstRow = canvas.getByText('Item 001 \u2014 PPE', {
        selector: '[role="gridcell"]',
      });
      await userEvent.click(firstRow);
    });

    await step('Selection count updates', async () => {
      await waitFor(
        () => {
          expect(canvas.getByText(/1 of 25 selected/)).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();

    await step('Double-click a cell to start editing', async () => {
      // AG Grid may render buffer rows — use getAllByText and take first
      const nameCells = canvas.getAllByText('Item 002 \u2014 Chemicals', {
        selector: '[role="gridcell"]',
      });
      const nameCell = nameCells[0] as HTMLElement;
      await userEvent.dblClick(nameCell);
      // Wait for the cell editor input to mount before typing
      await waitFor(
        () => {
          expect(
            canvasElement.querySelector('.ag-cell-edit-wrapper input, .ag-text-field-input'),
          ).toBeTruthy();
        },
        { timeout: 5000 },
      );
      await userEvent.keyboard(' (edited)');
    });

    await storyStepDelay(600);

    await step('Click away to trigger auto-publish', async () => {
      // Click a different row to trigger the publish lifecycle
      const thirdRow = await canvas.findByText(
        'Item 003 \u2014 Diagnostics',
        { selector: '[role="gridcell"]' },
        { timeout: 5000 },
      );
      await userEvent.click(thirdRow);
    });

    await step('Publish log appears', async () => {
      await waitFor(
        () => {
          expect(canvas.getByText('Publish Log')).toBeVisible();
        },
        { timeout: 8000 },
      );
    });

    await storyStepDelay();

    await step('Toggle Notes column visibility', async () => {
      const toggleButton = canvas.getByRole('button', { name: /hide notes/i });
      await userEvent.click(toggleButton);
      await waitFor(
        () => {
          expect(canvas.queryByRole('columnheader', { name: 'Notes' })).not.toBeInTheDocument();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();
  },
};
