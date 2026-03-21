/**
 * GEN::LST::0006 — Select Rows and Trigger Actions
 *
 * Demonstrates single select, multi-select, shift-click range, select-all,
 * and selection-driven toolbar actions.
 *
 * Maps to: GEN::LST::0006 — Select Rows and Trigger Actions
 */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, userEvent, waitFor } from 'storybook/test';
import type { ColDef } from 'ag-grid-community';
import { Printer, Trash2, Download, ShoppingCart } from 'lucide-react';

import { createEntityDataGrid } from '@/components/canary/organisms/shared/entity-data-grid/create-entity-data-grid';
import { Button } from '@/components/canary/atoms/button/button';
import { OverflowToolbar } from '@/components/canary/molecules/overflow-toolbar/overflow-toolbar';
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
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const demoData: DemoRow[] = [
  { id: '1', name: 'Nitrile Gloves (M)', category: 'PPE', status: 'Active', quantity: 500 },
  { id: '2', name: 'Surgical Mask L3', category: 'PPE', status: 'Active', quantity: 200 },
  { id: '3', name: 'IPA 70%', category: 'Chemicals', status: 'Active', quantity: 50 },
  { id: '4', name: 'Thermometer', category: 'Diagnostics', status: 'Low Stock', quantity: 8 },
  { id: '5', name: 'Gauze Dressing', category: 'Wound Care', status: 'Active', quantity: 300 },
  { id: '6', name: 'Latex-Free Tape', category: 'Wound Care', status: 'Active', quantity: 120 },
  { id: '7', name: 'Sharps Container', category: 'Safety', status: 'Active', quantity: 30 },
  { id: '8', name: 'IV Solution 0.9%', category: 'IV Therapy', status: 'Reorder', quantity: 12 },
];

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const columnDefs: ColDef<DemoRow>[] = [
  { field: 'name', headerName: 'Name', width: 220, sortable: true },
  { field: 'category', headerName: 'Category', width: 140, sortable: true },
  { field: 'status', headerName: 'Status', width: 120, sortable: true },
  { field: 'quantity', headerName: 'Qty', width: 90, sortable: true },
];

// ---------------------------------------------------------------------------
// Grid factory (multi-select enabled)
// ---------------------------------------------------------------------------

const { Component: SelectionGrid } = createEntityDataGrid<DemoRow>({
  displayName: 'RowSelectionGrid',
  persistenceKeyPrefix: 'gbl-row-selection',
  columnDefs,
  defaultColDef: { sortable: true, resizable: true, filter: false },
  getEntityId: (r) => r.id,
  searchConfig: {
    fields: ['name', 'category', 'status'],
    placeholder: 'Search items\u2026',
  },
});

// ---------------------------------------------------------------------------
// Wrapper with selection toolbar
// ---------------------------------------------------------------------------

function SelectionPage() {
  const [selected, setSelected] = useState<DemoRow[]>([]);

  const toolbar =
    selected.length > 0 ? (
      <OverflowToolbar>
        <Button
          variant="ghost"
          size="sm"
          data-overflow-label="Clear selection"
          onClick={() => setSelected([])}
        >
          Clear ({selected.length})
        </Button>
        <Button
          variant="outline"
          size="sm"
          data-overflow-label="Print"
          onClick={() => console.log('Print', selected.length, 'items')}
        >
          <Printer className="mr-1.5 h-4 w-4" />
          Print
        </Button>
        <Button
          variant="outline"
          size="sm"
          data-overflow-label="Add to queue"
          onClick={() => console.log('Queue', selected.length, 'items')}
        >
          <ShoppingCart className="mr-1.5 h-4 w-4" />
          Add to queue
        </Button>
        <Button
          variant="outline"
          size="sm"
          data-overflow-label="Export"
          onClick={() => console.log('Export', selected.length, 'items')}
        >
          <Download className="mr-1.5 h-4 w-4" />
          Export
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          data-overflow-label="Delete"
          onClick={() => console.log('Delete', selected.length, 'items')}
        >
          <Trash2 className="mr-1.5 h-4 w-4" />
          Delete
        </Button>
      </OverflowToolbar>
    ) : undefined;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Row Selection</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Click rows to select. Shift-click for range. The toolbar adapts to the selection.
        </p>
        {selected.length > 0 && (
          <p className="text-sm text-orange-600 mt-1 font-medium">
            {selected.length} row{selected.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>
      <div style={{ height: 440 }}>
        <SelectionGrid
          data={demoData}
          activeTab="row-selection"
          onSelectionChange={setSelected}
          {...(toolbar ? { toolbar } : {})}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Story meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof SelectionPage> = {
  title: 'Use Cases/General Behaviors/List Views/GEN-LST-0006 Row Selection',
  component: SelectionPage,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof SelectionPage>;

/**
 * Default — demonstrates row selection and selection-driven toolbar.
 * Play function: click a row, verify it is selected; select multiple rows;
 * verify toolbar actions appear; clear selection.
 */
export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Grid renders with all rows', async () => {
      await canvas.findByText(
        'Nitrile Gloves (M)',
        { selector: '[role="gridcell"]' },
        { timeout: 10000 },
      );
    });

    await storyStepDelay();

    await step('Click first row to select it', async () => {
      const firstRow = canvas.getByText('Nitrile Gloves (M)', {
        selector: '[role="gridcell"]',
      });
      await userEvent.click(firstRow);
    });

    await step('Selection count shows 1 row selected', async () => {
      await waitFor(
        () => {
          expect(canvas.getByText(/1 of \d+ selected/)).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();

    await step('Toolbar shows selection actions', async () => {
      await waitFor(
        () => {
          expect(canvas.getByRole('button', { name: /Clear/ })).toBeVisible();
        },
        { timeout: 10000 },
      );
    });

    await storyStepDelay();

    await step('Ctrl-click second row to add to selection', async () => {
      const secondRow = canvas.getByText('Surgical Mask L3', {
        selector: '[role="gridcell"]',
      });
      await userEvent.keyboard('{Control>}');
      await userEvent.click(secondRow);
      await userEvent.keyboard('{/Control}');
    });

    await step('Selection count shows 2 rows selected', async () => {
      await waitFor(
        () => {
          expect(canvas.getByText(/2 of \d+ selected/)).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();

    await step('Click Clear to deselect all', async () => {
      const clearButton = canvas.getByRole('button', { name: /clear/i });
      await userEvent.click(clearButton);
    });

    await step('Selection toolbar disappears after clearing', async () => {
      await waitFor(
        () => {
          expect(canvas.queryByText(/Clear/)).not.toBeInTheDocument();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();
  },
};
