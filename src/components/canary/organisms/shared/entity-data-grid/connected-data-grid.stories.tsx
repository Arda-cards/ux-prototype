import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';

import type { ColDef } from 'ag-grid-community';
import { createConnectedDataGrid } from './create-entity-data-grid';
import type { RowChange, CommitResult } from './use-commit-pipeline';

// ============================================================================
// Demo Entity
// ============================================================================

interface DemoVendor extends Record<string, any> {
  id: string;
  name: string;
  category: string;
  leadTimeDays: number;
  contact: string;
}

const EDITABLE_FIELDS = new Set(['name', 'category', 'leadTimeDays', 'contact']);

const vendorCols: ColDef<DemoVendor>[] = [
  { field: 'name', headerName: 'Vendor', width: 220 },
  { field: 'category', headerName: 'Category', width: 150 },
  { field: 'leadTimeDays', headerName: 'Lead time (days)', width: 160 },
  { field: 'contact', headerName: 'Contact', width: 220 },
];

function enhanceVendorEditable(
  defs: ColDef<DemoVendor>[],
  options?: { enabled?: boolean },
): ColDef<DemoVendor>[] {
  if (options?.enabled === false) return defs;
  return defs.map((col) => {
    const key = (col.field as string) || (col.colId as string);
    if (!key || !EDITABLE_FIELDS.has(key)) return col;
    return { ...col, editable: true };
  });
}

const { Component: ConnectedVendorGrid } = createConnectedDataGrid<DemoVendor>({
  displayName: 'ConnectedVendorGrid',
  persistenceKeyPrefix: 'canary-connected-vendor-grid',
  columnDefs: vendorCols,
  defaultColDef: { sortable: true, filter: false, resizable: true },
  getEntityId: (v) => v.id,
  enhanceEditableColumnDefs: enhanceVendorEditable,
});

const vendors: DemoVendor[] = [
  {
    id: '1',
    name: 'Acme Components',
    category: 'Hardware',
    leadTimeDays: 14,
    contact: 'sales@acme.example',
  },
  {
    id: '2',
    name: 'Bolt Supply Co',
    category: 'Fasteners',
    leadTimeDays: 7,
    contact: 'orders@bolt.example',
  },
  {
    id: '3',
    name: 'Circuit Works',
    category: 'Electronics',
    leadTimeDays: 21,
    contact: 'hello@circuit.example',
  },
  {
    id: '4',
    name: 'Delta Plastics',
    category: 'Materials',
    leadTimeDays: 10,
    contact: 'info@delta.example',
  },
  {
    id: '5',
    name: 'Edge Fabrication',
    category: 'Hardware',
    leadTimeDays: 30,
    contact: 'quotes@edge.example',
  },
];

// A realistic `onCommit`: the consumer routes by size (single PUT vs atomic
// `/bulk`) and returns a per-row result the pipeline reconciles against. Here
// we just echo success after a short delay so the saving → idle transition is
// visible in Storybook.
const demoCommit = async (changes: RowChange<DemoVendor>[]): Promise<CommitResult[]> => {
  await new Promise((r) => setTimeout(r, 300));
  return changes.map((c) => ({ rowId: c.rowId, status: 'ok' as const }));
};

// ============================================================================
// Meta
// ============================================================================

const meta: Meta<typeof ConnectedVendorGrid> = {
  title: 'Components/Canary/Organisms/Shared/Connected Data Grid',
  component: ConnectedVendorGrid,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '`createConnectedDataGrid<T>()` is the stateful container (DQ-008, renamed from ' +
          '`createEntityDataGrid`) that wraps the `DataGrid` molecule and adds a **read source** ' +
          '(`dataSource`) and a **write path** (bulk `onCommit` or per-row `onRowPublish`). ' +
          'Molecule capability props (`cellSelection`, `clipboardPaste`, `undoRedoLimit`, …) flow ' +
          'through via `Omit`-extend forwarding (DQ-006).',
      },
    },
  },
  argTypes: {
    dataSource: {
      control: false,
      description: 'Discriminated read source.',
      table: { category: 'Model' },
    },
    data: {
      control: false,
      description: 'Deprecated flat rows (implicit client mode).',
      table: { category: 'Model' },
    },
    enableCellEditing: { control: 'boolean', table: { category: 'Runtime' } },
    clipboardPaste: {
      control: 'select',
      options: ['range', 'single', 'off'],
      table: { category: 'Forwarded (DataGrid)' },
    },
    undoRedoLimit: { control: 'number', table: { category: 'Forwarded (DataGrid)' } },
    onCommit: {
      action: 'commit',
      description: 'Bulk write seam (batch flush).',
      table: { category: 'Events' },
    },
    onRowPublish: { action: 'rowPublish', table: { category: 'Events' } },
    onDirtyChange: { action: 'dirtyChange', table: { category: 'Events' } },
  },
  args: {
    onDirtyChange: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ height: '420px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ConnectedVendorGrid>;

// ============================================================================
// Stories
// ============================================================================

/**
 * Canonical usage: a client `dataSource`, a bulk `onCommit`, and the forwarded
 * spreadsheet capabilities (range selection + fill handle, range paste, undo).
 * Edit a cell and blur the row, or paste/fill a range — each settles into one
 * batched `onCommit`.
 */
export const Default: Story = {
  args: {
    dataSource: { mode: 'client', data: vendors },
    enableCellEditing: true,
    clipboardPaste: 'range',
    undoRedoLimit: 10,
    cellSelection: { handle: { mode: 'fill' } },
    onCommit: demoCommit,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cells = await canvas.findAllByText('Acme Components');
    await expect(cells.length).toBeGreaterThan(0);
  },
};

/**
 * The discriminated `server` (SSRM) mode is part of the type today but is wired
 * in Phase 2 — supplying it renders no rows (and warns in dev). Shown here as a
 * type-level placeholder; prefer `client` until SSRM lands.
 */
export const ServerSourcePlaceholder: Story = {
  args: {
    dataSource: {
      mode: 'server',
      getRows: async () => ({ rows: [], lastRow: 0 }),
    },
    enableCellEditing: false,
  },
};

/**
 * Backward-compatible: the deprecated flat `data` prop still works as implicit
 * client mode, so existing consumers keep rendering untouched.
 */
export const LegacyDataProp: Story = {
  args: {
    data: vendors,
    enableCellEditing: true,
    onCommit: demoCommit,
  },
};

/**
 * Read-only: a `dataSource` with no `onCommit`/`onRowPublish`. The commit
 * pipeline stays inert — edits live only in the grid.
 */
export const ReadOnly: Story = {
  args: {
    dataSource: { mode: 'client', data: vendors },
    enableCellEditing: false,
  },
};
