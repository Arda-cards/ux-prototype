import { useMemo, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, userEvent, waitFor, screen } from 'storybook/test';
import { DataGrid, type DataGridRef } from './data-grid';
import type { ColDef } from 'ag-grid-community';
import { createTokenDataType } from './cell-data-types';
import { createMultiSelectCellEditor } from '../typeahead-input/multiselect-cell-editor';
import { lookupRoles } from '@/components/canary/__mocks__/role-lookup';
import { roleLookupHandler } from '@/components/canary/__mocks__/handlers/role-lookup';

interface SampleRow {
  [key: string]: unknown;
  id: string;
  name: string;
  email: string;
  role: string;
  city: string;
  status: string;
}

const roles = ['Vendor', 'Customer', 'Carrier'];
const cities = ['Austin', 'Houston', 'Chicago', 'Denver', 'Seattle'];
const statuses = ['Active', 'Inactive'];

const sampleData: SampleRow[] = Array.from({ length: 25 }, (_, i) => ({
  id: `row-${i + 1}`,
  name: `Contact ${i + 1}`,
  email: `contact${i + 1}@example.com`,
  role: roles[i % roles.length] ?? 'Vendor',
  city: cities[i % cities.length] ?? 'Austin',
  status: statuses[i % statuses.length] ?? 'Active',
}));

const columnDefs: ColDef[] = [
  { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
  { field: 'email', headerName: 'Email', width: 220 },
  { field: 'role', headerName: 'Role', width: 120 },
  { field: 'city', headerName: 'City', width: 120 },
  { field: 'status', headerName: 'Status', width: 100 },
];

const meta: Meta<typeof DataGrid> = {
  title: 'Components/Canary/Molecules/DataGrid',
  component: DataGrid,
  parameters: { layout: 'padded' },
  args: {
    editable: true,
    enableRowSelection: true,
  },
  argTypes: {
    // --- Behavior (toggles) ---
    editable: {
      control: 'boolean',
      description: 'Enable inline cell editing.',
      table: { category: 'Behavior' },
    },
    enableRowSelection: {
      control: 'boolean',
      description: 'Show row-selection checkboxes.',
      table: { category: 'Behavior' },
    },
    loading: {
      control: 'boolean',
      description: 'Show the loading overlay.',
      table: { category: 'Behavior' },
    },
    // --- Layout (numbers / toggles) ---
    height: {
      control: { type: 'number', min: 200, max: 900, step: 50 },
      description: 'Fixed grid height in px (ignored when autoHeight).',
      table: { category: 'Layout' },
    },
    autoHeight: {
      control: 'boolean',
      description: 'Grow to fit content; disables vertical scroll.',
      table: { category: 'Layout' },
    },
    pageSize: {
      control: { type: 'number', min: 0, max: 100, step: 5 },
      description: 'Rows per page (0 / empty = no pagination).',
      table: { category: 'Layout' },
    },
    // --- Editing capabilities (number / dropdown / toggle) ---
    undoRedoLimit: {
      control: { type: 'range', min: 0, max: 20, step: 1 },
      description: 'Cell undo/redo stack size (0 = off).',
      table: { category: 'Editing' },
    },
    clipboardPaste: {
      control: 'select',
      options: ['range', 'single', 'off'],
      description: 'Paste policy.',
      table: { category: 'Editing' },
    },
    cellSelection: {
      control: 'boolean',
      description: 'Range selection (true). The fill handle needs an object config, set in code.',
      table: { category: 'Editing' },
    },
    // --- Text ---
    emptyMessage: {
      control: 'text',
      description: 'Empty-state message.',
      table: { category: 'Behavior' },
    },
    // --- Data / wiring / callbacks: not control-editable ---
    rowData: { control: false, table: { category: 'Data' } },
    columnDefs: { control: false, table: { category: 'Data' } },
    defaultColDef: { control: false, table: { category: 'Data' } },
    dataTypeDefinitions: { control: false, table: { category: 'Data' } },
    columnTypes: { control: false, table: { category: 'Data' } },
    actionsColumn: { control: false, table: { category: 'Data' } },
    searchConfig: { control: false, table: { category: 'Data' } },
    toolbar: { control: false, table: { category: 'Slots' } },
    emptyContent: { control: false, table: { category: 'Slots' } },
    className: { control: false, table: { category: 'Slots' } },
    getRowClass: { control: false, table: { category: 'Callbacks' } },
    getNewRowId: { control: false, table: { category: 'Callbacks' } },
    gridRef: { control: false, table: { category: 'Callbacks' } },
    onRowClick: { control: false, table: { category: 'Callbacks' } },
    onSelectionChange: { control: false, table: { category: 'Callbacks' } },
    onCellValueChanged: { control: false, table: { category: 'Callbacks' } },
    onCellEditingStopped: { control: false, table: { category: 'Callbacks' } },
    onPasteEnd: { control: false, table: { category: 'Callbacks' } },
    onFillEnd: { control: false, table: { category: 'Callbacks' } },
    onCutEnd: { control: false, table: { category: 'Callbacks' } },
    onRowsAdded: { control: false, table: { category: 'Callbacks' } },
    onRowsRemoved: { control: false, table: { category: 'Callbacks' } },
  },
};

export default meta;
type Story = StoryObj<typeof DataGrid>;

/** Default grid with data. */
export const Default: Story = {
  args: {
    rowData: sampleData,
    columnDefs,
    height: 500,
    editable: true,
    enableRowSelection: true,
  },
};

/** With search and selection. */
export const WithSearch: Story = {
  args: {
    rowData: sampleData,
    columnDefs,
    height: 500,
    enableRowSelection: true,
    searchConfig: {
      fields: ['name', 'email', 'city'],
      placeholder: 'Search contacts…',
    },
  },
};

/** Empty state. */
export const Empty: Story = {
  args: {
    rowData: [],
    columnDefs,
    height: 400,
    emptyMessage: 'No contacts yet',
  },
};

/** Loading state. */
export const Loading: Story = {
  args: {
    rowData: [],
    columnDefs,
    height: 400,
    loading: true,
  },
};

/**
 * Playground — interactive add-row mechanics. The toolbar "Add row" button calls
 * `ref.addRow(seed, { startEditingField })`, which inserts a row in-memory and
 * opens its Name editor; `onRowsAdded` keeps React `rowData` in sync (the same
 * pattern `ConnectedDataGrid` uses). Persistence is a container concern, so a
 * row added here lives only in the browser.
 */
export const Playground: StoryObj<typeof DataGrid> = {
  args: {
    editable: true,
    enableRowSelection: true,
    loading: false,
    height: 500,
    autoHeight: false,
    undoRedoLimit: 10,
    clipboardPaste: 'range',
    cellSelection: true,
  },
  render: (args) => {
    const gridRef = useRef<DataGridRef>(null);
    const [rows, setRows] = useState<Record<string, unknown>[]>(() => sampleData.slice(0, 8));

    const handleAddRow = () =>
      gridRef.current?.addRow(
        { name: '', email: '', role: 'Vendor', city: 'Austin', status: 'Active' },
        { startEditingField: 'name' },
      );

    return (
      <DataGrid
        {...args}
        ref={gridRef}
        rowData={rows}
        columnDefs={columnDefs}
        onRowsAdded={({ rows: added }) => setRows((prev) => [...added, ...prev])}
        toolbar={
          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            + Add row
          </button>
        }
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const addButton = await canvas.findByRole('button', { name: /add row/i });
    await userEvent.click(addButton);
    // A fresh editable row appears at the top — its Name editor opens on add.
    await waitFor(() => expect(canvas.getAllByRole('row').length).toBeGreaterThan(8));
  },
};

// ---------------------------------------------------------------------------
// MultiSelect cell editor story
// ---------------------------------------------------------------------------

interface SupplierRow {
  [key: string]: unknown;
  id: string;
  name: string;
  city: string;
  roles: string[];
  orderMethods: string[];
}

const allRoles = ['Vendor', 'Customer', 'Carrier', 'Operator'];
const allMethods = ['Email', 'EDI', 'Portal', 'Phone', 'Fax'];

const supplierData: SupplierRow[] = Array.from({ length: 15 }, (_, i) => ({
  id: `sup-${i + 1}`,
  name: `Supplier ${i + 1}`,
  city: cities[i % cities.length] ?? 'Austin',
  roles: allRoles.slice(0, (i % 3) + 1),
  orderMethods: allMethods.slice(0, (i % 4) + 1),
}));

/** Grid with multiselect cell editors on Roles and Order Methods columns. */
export const WithMultiSelectEditor: StoryObj = {
  parameters: {
    msw: { handlers: [roleLookupHandler] },
  },
  render: () => {
    const RoleCellEditor = useMemo(
      () =>
        createMultiSelectCellEditor({
          lookup: lookupRoles,
          placeholder: 'Select roles...',
        }),
      [],
    );

    const OrderMethodCellEditor = useMemo(
      () =>
        createMultiSelectCellEditor({
          lookup: async (search) => {
            const filtered = search
              ? allMethods.filter((m) => m.toLowerCase().includes(search.toLowerCase()))
              : allMethods;
            return filtered.map((m) => ({ label: m, value: m }));
          },
          placeholder: 'Select methods...',

          defaultOne: false,
        }),
      [],
    );

    const badgeRenderer = (params: { value?: string[] }) => {
      const items = params.value ?? [];
      return (
        <div className="flex gap-1 items-center h-full">
          {items.map((item) => (
            <span
              key={item}
              className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium"
            >
              {item}
            </span>
          ))}
        </div>
      );
    };

    const supplierColDefs: ColDef<SupplierRow>[] = useMemo(
      () => [
        { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
        { field: 'city', headerName: 'City', width: 120 },
        {
          field: 'roles',
          headerName: 'Roles',
          flex: 1,
          minWidth: 180,
          editable: true,
          cellEditor: RoleCellEditor,
          cellEditorPopup: true,
          cellRenderer: badgeRenderer,
        },
        {
          field: 'orderMethods',
          headerName: 'Order Methods',
          flex: 1,
          minWidth: 200,
          editable: true,
          cellEditor: OrderMethodCellEditor,
          cellEditorPopup: true,
          cellRenderer: badgeRenderer,
        },
      ],
      [RoleCellEditor, OrderMethodCellEditor],
    );

    return (
      <DataGrid
        rowData={supplierData}
        columnDefs={supplierColDefs}
        height={500}
        editable
        searchConfig={{
          fields: ['name', 'city'],
          placeholder: 'Search suppliers…',
        }}
      />
    );
  },
};

// ---------------------------------------------------------------------------
// Token cell data types — renderer + editor + value round trip
// ---------------------------------------------------------------------------

const TOKEN_ROLE_OPTIONS = ['Vendor', 'Customer', 'Carrier', 'Operator', 'Other'];
const TOKEN_ORDER_METHODS = ['Online', 'Purchase order', 'Email', 'Phone', 'In store', 'RFQ'];

interface TokenRow {
  [key: string]: unknown;
  id: string;
  name: string;
  roles: string[];
  orderMethod: string;
}

const tokenRows: TokenRow[] = Array.from({ length: 12 }, (_, i) => ({
  id: `sup-${i + 1}`,
  name: `Supplier ${i + 1}`,
  // First row gets every role to show read-mode clipping + edit-mode wrap/grow.
  roles: i === 0 ? [...TOKEN_ROLE_OPTIONS] : TOKEN_ROLE_OPTIONS.slice(0, (i % 3) + 1),
  orderMethod: TOKEN_ORDER_METHODS[i % TOKEN_ORDER_METHODS.length] ?? 'Online',
}));

/**
 * Token columns via `createTokenDataType` — Role (multi-select) + Order Method
 * (single-select). Try it: double-click to edit, copy a cell (Ctrl/Cmd+C) and
 * paste into a range, or drag the fill handle to extend a value down. The
 * value-to-string round trip drives copy/paste, bulk paste, and fill-down; the
 * keyCreator/formatter drive set filter and CSV export.
 */
function TokenGridDemo() {
  const { columnTypes, dataTypeDefinitions, columnDefs } = useMemo(() => {
    const roles = createTokenDataType({
      multiple: true,
      editor: { lookup: TOKEN_ROLE_OPTIONS, placeholder: 'Select roles…', defaultOne: true },
      variant: 'secondary',
    });
    const orderMethod = createTokenDataType({
      multiple: false,
      editor: {
        lookup: TOKEN_ORDER_METHODS,
        placeholder: 'Order method…',
        maxResults: TOKEN_ORDER_METHODS.length,
        clearOnFocus: true,
      },
      variant: 'outline',
    });
    return {
      columnTypes: {
        rolesColType: roles.columnType,
        orderMethodColType: orderMethod.columnType,
      },
      dataTypeDefinitions: {
        roles: { ...roles.dataType, columnTypes: 'rolesColType' },
        orderMethod: { ...orderMethod.dataType, columnTypes: 'orderMethodColType' },
      },
      columnDefs: [
        { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
        { field: 'roles', headerName: 'Role', width: 240, editable: true, cellDataType: 'roles' },
        {
          field: 'orderMethod',
          headerName: 'Order Method',
          width: 200,
          editable: true,
          cellDataType: 'orderMethod',
        },
      ] as ColDef<TokenRow>[],
    };
  }, []);

  return (
    <DataGrid<TokenRow>
      rowData={tokenRows}
      columnDefs={columnDefs}
      columnTypes={columnTypes}
      dataTypeDefinitions={dataTypeDefinitions}
      cellSelection={{ handle: { mode: 'fill' } }}
      undoRedoLimit={20}
      height={500}
      editable
    />
  );
}

export const WithTokenCellDataTypes: StoryObj = {
  render: () => <TokenGridDemo />,
};

/**
 * Interaction test: open the Role multiselect editor, add an option, and confirm
 * the cell value commits. Runs in a real browser via the Storybook test-runner
 * (AG Grid does not render in jsdom). The value round trip behind copy/paste,
 * bulk paste, fill-down, and paste validation is covered by `token-data-type.test.tsx`.
 */
export const TokenMultiSelectEditing: StoryObj = {
  name: 'Token MultiSelect Editing (interaction)',
  render: () => <TokenGridDemo />,
  play: async ({ canvasElement }) => {
    // Supplier 4's Role cell starts as ["Vendor"]; "Operator" is never pre-selected.
    const roleCell = (): HTMLElement => {
      const el = canvasElement.querySelector('[row-id="sup-4"] [col-id="roles"]');
      if (!el) throw new Error('Role cell for sup-4 not found');
      return el as HTMLElement;
    };

    await userEvent.dblClick(roleCell());

    // The dropdown is portaled to <body>; "Operator" appears only there.
    const operator = await screen.findByText('Operator', {}, { timeout: 5000 });
    await userEvent.click(operator);

    // defaultOne commits + closes on pick — the cell should now include Operator.
    await waitFor(() => expect(within(roleCell()).getByText('Operator')).toBeInTheDocument(), {
      timeout: 5000,
    });
  },
};
