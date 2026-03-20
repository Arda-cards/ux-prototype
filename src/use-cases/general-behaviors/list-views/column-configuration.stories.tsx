/**
 * GEN::LST::0002 — Configure List Column Display
 *
 * Demonstrates column visibility toggle, reorder, resize, and pin using
 * the canary entity-data-grid factory with generic demo data.
 *
 * Maps to: GEN::LST::0002 — Configure List Column Display
 */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, userEvent, waitFor } from 'storybook/test';
import type { ColDef } from 'ag-grid-community';

import { createEntityDataGrid } from '@/components/canary/organisms/shared/entity-data-grid/create-entity-data-grid';
import { storyStepDelay } from '@/components/canary/organisms/shared/entity-data-grid/story-step-delay';

// ---------------------------------------------------------------------------
// Demo entity
// ---------------------------------------------------------------------------

interface DemoRow {
  id: string;
  name: string;
  category: string;
  status: string;
  quantity: number;
  unitCost: number;
  supplier: string;
  location: string;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const demoData: DemoRow[] = [
  {
    id: '1',
    name: 'Nitrile Gloves (M)',
    category: 'PPE',
    status: 'Active',
    quantity: 500,
    unitCost: 8.49,
    supplier: 'Medline',
    location: 'Bay 3',
  },
  {
    id: '2',
    name: 'Surgical Mask L3',
    category: 'PPE',
    status: 'Active',
    quantity: 200,
    unitCost: 12.0,
    supplier: 'Cardinal Health',
    location: 'Bay 1',
  },
  {
    id: '3',
    name: 'IPA 70%',
    category: 'Chemicals',
    status: 'Active',
    quantity: 50,
    unitCost: 22.5,
    supplier: 'Fisher Sci',
    location: 'Cabinet A',
  },
  {
    id: '4',
    name: 'Thermometer',
    category: 'Diagnostics',
    status: 'Low Stock',
    quantity: 8,
    unitCost: 45.0,
    supplier: 'Welch Allyn',
    location: 'Bay 5',
  },
  {
    id: '5',
    name: 'Gauze Dressing',
    category: 'Wound Care',
    status: 'Active',
    quantity: 300,
    unitCost: 3.25,
    supplier: 'Medline',
    location: 'Bay 2',
  },
  {
    id: '6',
    name: 'Latex-Free Tape',
    category: 'Wound Care',
    status: 'Active',
    quantity: 120,
    unitCost: 4.75,
    supplier: 'BD Medical',
    location: 'Bay 2',
  },
  {
    id: '7',
    name: 'Sharps Container 1L',
    category: 'Safety',
    status: 'Active',
    quantity: 30,
    unitCost: 11.0,
    supplier: 'Stericycle',
    location: 'Cabinet B',
  },
  {
    id: '8',
    name: 'IV Solution 0.9%',
    category: 'IV Therapy',
    status: 'Reorder',
    quantity: 12,
    unitCost: 8.9,
    supplier: 'Baxter',
    location: 'Refrigerator 1',
  },
];

// ---------------------------------------------------------------------------
// Column definitions — all resizable
// ---------------------------------------------------------------------------

const columnDefs: ColDef<DemoRow>[] = [
  { field: 'name', headerName: 'Name', width: 200, sortable: true, resizable: true },
  { field: 'category', headerName: 'Category', width: 140, sortable: true, resizable: true },
  { field: 'status', headerName: 'Status', width: 120, sortable: true, resizable: true },
  { field: 'quantity', headerName: 'Qty', width: 90, sortable: true, resizable: true },
  {
    field: 'unitCost',
    headerName: 'Unit Cost',
    width: 110,
    sortable: true,
    resizable: true,
    valueFormatter: (p) =>
      p.value !== null && p.value !== undefined ? `$${(p.value as number).toFixed(2)}` : '',
  },
  { field: 'supplier', headerName: 'Supplier', width: 160, sortable: true, resizable: true },
  { field: 'location', headerName: 'Location', width: 140, sortable: true, resizable: true },
];

// ---------------------------------------------------------------------------
// Grid with column visibility control
// ---------------------------------------------------------------------------

const { Component: ConfigGrid } = createEntityDataGrid<DemoRow>({
  displayName: 'ColumnConfigGrid',
  persistenceKeyPrefix: 'gbl-column-config',
  columnDefs,
  defaultColDef: { sortable: true, resizable: true, filter: false },
  getEntityId: (r) => r.id,
});

// ---------------------------------------------------------------------------
// Wrapper component with column visibility UI
// ---------------------------------------------------------------------------

const TOGGLEABLE_COLS = [
  { field: 'category', label: 'Category' },
  { field: 'status', label: 'Status' },
  { field: 'quantity', label: 'Quantity' },
  { field: 'unitCost', label: 'Unit Cost' },
  { field: 'supplier', label: 'Supplier' },
  { field: 'location', label: 'Location' },
] as const;

function ColumnConfigPage() {
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());

  const colVisibility = Object.fromEntries(
    TOGGLEABLE_COLS.map((c) => [c.field, !hiddenCols.has(c.field)]),
  );

  const toggleCol = (field: string) => {
    setHiddenCols((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <h1 className="text-xl font-semibold">Column Configuration</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Toggle column visibility using the checkboxes below.
        </p>
      </div>

      {/* Column toggle controls */}
      <div className="flex flex-wrap gap-3 p-3 rounded-lg border bg-muted/30">
        <span className="text-xs font-medium text-muted-foreground self-center mr-1">
          Visible columns:
        </span>
        {TOGGLEABLE_COLS.map((col) => (
          <label key={col.field} className="flex items-center gap-1.5 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={!hiddenCols.has(col.field)}
              onChange={() => toggleCol(col.field)}
              className="rounded"
              aria-label={`Toggle ${col.label} column`}
            />
            {col.label}
          </label>
        ))}
      </div>

      <div style={{ height: 440 }}>
        <ConfigGrid data={demoData} activeTab="column-config" columnVisibility={colVisibility} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Story meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof ColumnConfigPage> = {
  title: 'Use Cases/General Behaviors/List Views/GEN-LST-0002 Column Configuration',
  component: ColumnConfigPage,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof ColumnConfigPage>;

/**
 * Default — demonstrates toggling column visibility.
 * Play function: toggle a column off, verify it disappears; toggle it back on.
 */
export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Grid renders with all columns visible', async () => {
      const firstRow = await canvas.findByText(
        'Nitrile Gloves (M)',
        { selector: '[role="gridcell"]' },
        { timeout: 10000 },
      );
      expect(firstRow).toBeVisible();
      // Verify Supplier column is visible
      expect(canvas.getByRole('columnheader', { name: 'Supplier' })).toBeVisible();
    });

    await storyStepDelay();

    await step('Toggle Supplier column off', async () => {
      const toggle = canvas.getByRole('checkbox', { name: /toggle supplier column/i });
      await userEvent.click(toggle);
    });

    await step('Supplier column header disappears', async () => {
      await waitFor(
        () => {
          expect(canvas.queryByRole('columnheader', { name: 'Supplier' })).not.toBeInTheDocument();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();

    await step('Toggle Supplier column back on', async () => {
      const toggle = canvas.getByRole('checkbox', { name: /toggle supplier column/i });
      await userEvent.click(toggle);
    });

    await step('Supplier column header reappears', async () => {
      await waitFor(
        () => {
          expect(canvas.getByRole('columnheader', { name: 'Supplier' })).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();
  },
};

/**
 * HideMultipleColumns — hide several columns simultaneously.
 */
export const HideMultipleColumns: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Grid renders', async () => {
      await canvas.findByText(
        'Nitrile Gloves (M)',
        { selector: '[role="gridcell"]' },
        { timeout: 10000 },
      );
    });

    await storyStepDelay();

    await step('Toggle off Category, Quantity, and Location', async () => {
      await userEvent.click(canvas.getByRole('checkbox', { name: /toggle category column/i }));
      await userEvent.click(canvas.getByRole('checkbox', { name: /toggle quantity column/i }));
      await userEvent.click(canvas.getByRole('checkbox', { name: /toggle location column/i }));
    });

    await step('Three column headers are hidden', async () => {
      await waitFor(
        () => {
          expect(canvas.queryByRole('columnheader', { name: 'Category' })).not.toBeInTheDocument();
          expect(canvas.queryByRole('columnheader', { name: 'Qty' })).not.toBeInTheDocument();
          expect(canvas.queryByRole('columnheader', { name: 'Location' })).not.toBeInTheDocument();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();
  },
};
