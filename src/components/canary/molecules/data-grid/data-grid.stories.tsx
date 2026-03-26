import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { useRef, useState } from 'react';
import { DataGrid, type DataGridRef, GridImage } from './data-grid';
import type { ColDef } from 'ag-grid-community';
import { TextCellDisplay, createTextCellEditor } from '@/components/canary/atoms/grid/text';
import { NumberCellDisplay, createNumberCellEditor } from '@/components/canary/atoms/grid/number';
import {
  BooleanCellDisplay,
  createBooleanCellEditor,
} from '@/components/canary/atoms/grid/boolean';
import { DateCellDisplay, createDateCellEditor } from '@/components/canary/atoms/grid/date';
import { SelectCellDisplay, createSelectCellEditor } from '@/components/canary/atoms/grid/select';
import { MemoCellDisplay, createMemoCellEditor } from '@/components/canary/atoms/grid/memo';
import { ColorCellDisplay, createColorCellEditor } from '@/components/canary/atoms/grid/color';

/** Typed column defs cast to the unparameterized form required by Storybook meta args. */
type AnyColDef = ColDef<Record<string, unknown>>;

// ============================================================================
// Sample data types for the basic stories
// ============================================================================

interface SampleDataRow extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

const sampleData: SampleDataRow[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'User', status: 'Active' },
  {
    id: '3',
    name: 'Carol Williams',
    email: 'carol@example.com',
    role: 'Editor',
    status: 'Inactive',
  },
  { id: '4', name: 'David Brown', email: 'david@example.com', role: 'User', status: 'Active' },
  { id: '5', name: 'Eve Davis', email: 'eve@example.com', role: 'Admin', status: 'Active' },
];

const columnDefs: ColDef<SampleDataRow>[] = [
  { field: 'id', headerName: 'ID', width: 80 },
  { field: 'name', headerName: 'Name', width: 200 },
  { field: 'email', headerName: 'Email', width: 250 },
  { field: 'role', headerName: 'Role', width: 120 },
  { field: 'status', headerName: 'Status', width: 120 },
];

// ============================================================================
// All-cell-types demo data
// ============================================================================

type StatusEnum = 'active' | 'inactive' | 'pending';
type ColorEnum = 'RED' | 'GREEN' | 'BLUE' | 'YELLOW' | 'ORANGE';

interface AllTypesRow extends Record<string, unknown> {
  id: string;
  textField: string;
  numberField: number;
  booleanField: boolean;
  dateField: string;
  statusField: StatusEnum;
  memoField: string;
  colorField: ColorEnum;
}

const statusOptions: Record<StatusEnum, string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
};

const allTypesData: AllTypesRow[] = [
  {
    id: '1',
    textField: 'Widget Alpha',
    numberField: 42.5,
    booleanField: true,
    dateField: '2025-03-15',
    statusField: 'active',
    memoField: 'This is a short note.',
    colorField: 'RED',
  },
  {
    id: '2',
    textField: 'Gadget Beta',
    numberField: 7,
    booleanField: false,
    dateField: '2024-11-01',
    statusField: 'inactive',
    memoField:
      'This note is intentionally long to demonstrate the truncation behavior of the MemoCellDisplay component. It should be truncated with an ellipsis when the text exceeds the configured maxLength.',
    colorField: 'GREEN',
  },
  {
    id: '3',
    textField: 'Component Gamma',
    numberField: 1234,
    booleanField: true,
    dateField: '2026-01-20',
    statusField: 'pending',
    memoField: 'Awaiting review.',
    colorField: 'BLUE',
  },
  {
    id: '4',
    textField: 'Device Delta',
    numberField: 0.99,
    booleanField: false,
    dateField: '2025-07-04',
    statusField: 'active',
    memoField: '',
    colorField: 'YELLOW',
  },
  {
    id: '5',
    textField: 'Part Epsilon',
    numberField: 9999,
    booleanField: true,
    dateField: '2023-06-30',
    statusField: 'active',
    memoField: 'Critical part — handle with care.',
    colorField: 'ORANGE',
  },
];

/** Column definitions exercising all 7 canary cell atom Display and Editor components. */
const allTypesColumnDefs: ColDef<AllTypesRow>[] = [
  {
    field: 'id',
    headerName: 'ID',
    width: 70,
    editable: false,
  },
  {
    field: 'textField',
    headerName: 'Text',
    width: 160,
    cellRenderer: (params: { value?: string }) => (
      <TextCellDisplay
        {...(params.value !== undefined ? { value: params.value } : {})}
        maxLength={20}
      />
    ),
    cellEditor: createTextCellEditor({ placeholder: 'Enter text…', maxLength: 50 }),
    editable: true,
  },
  {
    field: 'numberField',
    headerName: 'Number',
    width: 110,
    cellRenderer: (params: { value?: number }) => (
      <NumberCellDisplay
        {...(params.value !== undefined ? { value: params.value } : {})}
        precision={2}
      />
    ),
    cellEditor: createNumberCellEditor({ precision: 2, min: 0 }),
    editable: true,
  },
  {
    field: 'booleanField',
    headerName: 'Boolean',
    width: 110,
    cellRenderer: (params: { value?: boolean }) => (
      <BooleanCellDisplay {...(params.value !== undefined ? { value: params.value } : {})} />
    ),
    cellEditor: createBooleanCellEditor({ displayFormat: 'yes-no' }),
    editable: true,
  },
  {
    field: 'dateField',
    headerName: 'Date',
    width: 120,
    cellRenderer: (params: { value?: string }) => (
      <DateCellDisplay {...(params.value !== undefined ? { value: params.value } : {})} />
    ),
    cellEditor: createDateCellEditor(),
    editable: true,
  },
  {
    field: 'statusField',
    headerName: 'Status (Enum)',
    width: 140,
    cellRenderer: (params: { value?: StatusEnum }) => (
      <SelectCellDisplay
        {...(params.value !== undefined ? { value: params.value } : {})}
        options={statusOptions}
      />
    ),
    cellEditor: createSelectCellEditor({ options: statusOptions }),
    cellEditorPopup: true,
    editable: true,
  },
  {
    field: 'memoField',
    headerName: 'Memo',
    width: 180,
    cellRenderer: (params: { value?: string }) => (
      <MemoCellDisplay
        {...(params.value !== undefined ? { value: params.value } : {})}
        maxLength={40}
      />
    ),
    cellEditor: createMemoCellEditor({ placeholder: 'Add a note…' }),
    editable: true,
  },
  {
    field: 'colorField',
    headerName: 'Color',
    width: 120,
    cellRenderer: (params: { value?: string }) => (
      <ColorCellDisplay {...(params.value !== undefined ? { value: params.value } : {})} />
    ),
    cellEditor: createColorCellEditor(),
    editable: true,
  },
];

// ============================================================================
// Meta
// ============================================================================

const meta: Meta<typeof DataGrid> = {
  title: 'Components/Canary/Molecules/DataGrid',
  component: DataGrid,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'DataGrid is an AG Grid wrapper with built-in column persistence, SortMenuHeader, loading states, and pagination support. Uses all 7 canary cell atom types.',
      },
    },
  },
  argTypes: {
    height: {
      control: 'number',
      description: 'Grid container height in pixels.',
      table: { category: 'Static' },
    },
    loading: {
      control: 'boolean',
      description: 'Whether to display the loading overlay.',
      table: { category: 'Runtime' },
    },
    error: {
      control: 'text',
      description: 'Error message to display instead of the grid.',
      table: { category: 'Runtime' },
    },
    enableRowSelection: {
      control: 'boolean',
      description: 'Enable row selection via checkboxes.',
      table: { category: 'Static' },
    },
    enableMultiRowSelection: {
      control: 'boolean',
      description: 'Allow selecting multiple rows.',
      table: { category: 'Static' },
    },
    enableCellEditing: {
      control: 'boolean',
      description: 'Enable inline cell editing.',
      table: { category: 'Runtime' },
    },
    persistenceKey: {
      control: 'text',
      description: 'Key for persisting column state to localStorage.',
      table: { category: 'Static' },
    },
    onSelectionChanged: {
      action: 'selectionChanged',
      description: 'Called when row selection changes.',
      table: { category: 'Events' },
    },
    onCellValueChanged: {
      action: 'cellValueChanged',
      description: 'Called when a cell value is edited.',
      table: { category: 'Events' },
    },
    onRowClicked: {
      action: 'rowClicked',
      description: 'Called when a row is clicked.',
      table: { category: 'Events' },
    },
  },
  args: {
    onSelectionChanged: fn(),
    onCellValueChanged: fn(),
    onRowClicked: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof DataGrid>;
export const Default: Story = {
  args: {
    columnDefs: columnDefs as unknown as AnyColDef[],
    rowData: sampleData as Record<string, unknown>[],
    height: 400,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cells = await canvas.findAllByText('Alice Johnson');
    await expect(cells.length).toBeGreaterThan(0);
  },
};

/**
 * All 7 canary cell atom types — Display and Editor — in a single grid.
 * Each column uses the appropriate CellDisplay as cellRenderer and the
 * corresponding factory-created editor as cellEditor.
 * Double-click any editable cell to invoke its editor.
 */
export const AllCellTypes: Story = {
  render: () => {
    const [data, setData] = useState<AllTypesRow[]>(allTypesData);

    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">All 7 Canary Cell Atom Types</h3>
          <p className="text-sm text-blue-700">
            Double-click any cell to edit it. Each column uses the canary Display + Editor atoms:
            Text, Number, Boolean, Date, Enum, Memo, and Color.
          </p>
        </div>
        <DataGrid<AllTypesRow>
          columnDefs={allTypesColumnDefs}
          rowData={data}
          height={400}
          enableRowSelection
          enableMultiRowSelection
          enableCellEditing
          onCellValueChanged={(event) => {
            const { data: rowData, column, newValue } = event;
            setData((prev) =>
              prev.map((row) =>
                row.id === rowData.id ? { ...row, [column.getColId()]: newValue } : row,
              ),
            );
          }}
        />
      </div>
    );
  },
};

/**
 * Grid with typed data showing selection feature.
 */
export const WithData: Story = {
  render: () => {
    const [selectedRows, setSelectedRows] = useState<SampleDataRow[]>([]);

    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600">Selected: {selectedRows.length} row(s)</div>
        <DataGrid<SampleDataRow>
          columnDefs={columnDefs}
          rowData={sampleData}
          height={400}
          enableRowSelection
          enableMultiRowSelection
          onSelectionChanged={setSelectedRows}
        />
      </div>
    );
  },
};

/**
 * Grid showing loading state.
 */
export const Loading: Story = {
  args: {
    columnDefs: columnDefs as unknown as AnyColDef[],
    rowData: [],
    loading: true,
    height: 400,
  },
};

/**
 * Grid showing empty state.
 */
export const Empty: Story = {
  args: {
    columnDefs: columnDefs as unknown as AnyColDef[],
    rowData: [],
    height: 400,
    emptyStateComponent: (
      <div className="text-center py-8">
        <p className="text-gray-500 text-lg">No data available</p>
        <p className="text-gray-400 text-sm mt-2">Try adding some records</p>
      </div>
    ),
  },
};

/**
 * Grid with error state.
 */
export const ErrorState: Story = {
  name: 'Error',
  args: {
    columnDefs: columnDefs as unknown as AnyColDef[],
    rowData: [],
    error: 'Failed to load data from server',
    height: 400,
  },
};

/**
 * Grid with pagination controls.
 */
export const WithPagination: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 3;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = sampleData.slice(startIndex, endIndex);

    const paginationData = {
      currentPage,
      currentPageSize: pageSize,
      totalItems: sampleData.length,
      hasNextPage: endIndex < sampleData.length,
      hasPreviousPage: currentPage > 1,
    };

    return (
      <DataGrid<SampleDataRow>
        columnDefs={columnDefs}
        rowData={paginatedData}
        height={400}
        paginationData={paginationData}
        onNextPage={() => setCurrentPage((p) => p + 1)}
        onPreviousPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
        onFirstPage={() => setCurrentPage(1)}
      />
    );
  },
};

/**
 * Grid with row selection.
 */
export const WithSelection: Story = {
  render: () => {
    const [selectedRows, setSelectedRows] = useState<SampleDataRow[]>([]);

    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Selected Rows</h3>
          {selectedRows.length === 0 ? (
            <p className="text-blue-700 text-sm">No rows selected</p>
          ) : (
            <ul className="text-sm text-blue-700 space-y-1">
              {selectedRows.map((row) => (
                <li key={row.id}>
                  {row.name} - {row.email}
                </li>
              ))}
            </ul>
          )}
        </div>
        <DataGrid<SampleDataRow>
          columnDefs={columnDefs}
          rowData={sampleData}
          height={400}
          enableRowSelection
          enableMultiRowSelection
          onSelectionChanged={setSelectedRows}
        />
      </div>
    );
  },
};

/**
 * Grid with cell editing enabled.
 */
export const WithCellEditing: Story = {
  render: () => {
    const [data, setData] = useState<SampleDataRow[]>(sampleData);
    const [lastEdit, setLastEdit] = useState<string>('');

    const editableColumnDefs: ColDef<SampleDataRow>[] = [
      { field: 'id', headerName: 'ID', width: 80, editable: false },
      { field: 'name', headerName: 'Name', width: 200, editable: true },
      { field: 'email', headerName: 'Email', width: 250, editable: true },
      { field: 'role', headerName: 'Role', width: 120, editable: true },
      { field: 'status', headerName: 'Status', width: 120, editable: false },
    ];

    const handleCellValueChanged = (event: {
      data: SampleDataRow;
      oldValue: unknown;
      newValue: unknown;
      column: { getColId: () => string };
    }) => {
      const { data: rowData, oldValue, newValue, column } = event;
      setLastEdit(
        `Changed ${column.getColId()} for ${rowData.name} from "${String(oldValue)}" to "${String(newValue)}"`,
      );

      setData((prev) =>
        prev.map((row) =>
          row.id === rowData.id ? { ...row, [column.getColId()]: newValue } : row,
        ),
      );
    };

    return (
      <div className="space-y-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-semibold text-orange-900 mb-2">
            Double-click cells to edit (Name, Email, Role are editable)
          </h3>
          {lastEdit && <p className="text-sm text-orange-700 mt-2">Last edit: {lastEdit}</p>}
        </div>
        <DataGrid<SampleDataRow>
          columnDefs={editableColumnDefs}
          rowData={data}
          height={400}
          enableCellEditing
          onCellValueChanged={handleCellValueChanged}
        />
      </div>
    );
  },
};

/**
 * Grid with row click handler.
 */
export const WithRowClick: Story = {
  render: () => {
    const [clickedRow, setClickedRow] = useState<SampleDataRow | null>(null);

    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">Last Clicked Row</h3>
          {clickedRow ? (
            <p className="text-sm text-green-700">
              {clickedRow.name} - {clickedRow.email}
            </p>
          ) : (
            <p className="text-sm text-green-700">Click a row to see details</p>
          )}
        </div>
        <DataGrid<SampleDataRow>
          columnDefs={columnDefs}
          rowData={sampleData}
          height={400}
          onRowClicked={(event) => setClickedRow(event.data ?? null)}
        />
      </div>
    );
  },
};

/**
 * Grid with column persistence.
 */
export const WithPersistence: Story = {
  render: () => {
    const [key, setKey] = useState(0);

    return (
      <div className="space-y-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 mb-2">Column State Persistence</h3>
          <p className="text-sm text-purple-700 mb-3">
            Try resizing, reordering, or sorting columns. Then click the button below to remount the
            grid and see the state restored.
          </p>
          <button
            onClick={() => setKey((k) => k + 1)}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Remount Grid
          </button>
        </div>
        <DataGrid<SampleDataRow>
          key={key}
          columnDefs={columnDefs}
          rowData={sampleData}
          height={400}
          persistenceKey="canary-storybook-grid-state"
        />
      </div>
    );
  },
};

/**
 * Grid with ref API usage.
 */
export const WithRefAPI: Story = {
  render: () => {
    const gridRef = useRef<DataGridRef<SampleDataRow>>(null);

    const handleExportCsv = () => {
      gridRef.current?.exportDataAsCsv();
    };

    const handleGetApi = () => {
      const api = gridRef.current?.getGridApi();
      if (api) {
        alert(`Grid has ${api.getDisplayedRowCount()} rows`);
      }
    };

    return (
      <div className="space-y-4">
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h3 className="font-semibold text-indigo-900 mb-3">Ref API Demo</h3>
          <div className="flex gap-2">
            <button
              onClick={handleExportCsv}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Export CSV
            </button>
            <button
              onClick={handleGetApi}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Get Row Count
            </button>
          </div>
        </div>
        <DataGrid<SampleDataRow>
          ref={gridRef}
          columnDefs={columnDefs}
          rowData={sampleData}
          height={400}
        />
      </div>
    );
  },
};

/**
 * Interactive story combining all key capabilities: row selection,
 * cell editing, pagination, and column persistence.
 */
export const Interactive: Story = {
  render: () => {
    const allData: SampleDataRow[] = [
      ...sampleData,
      {
        id: '6',
        name: 'Frank Miller',
        email: 'frank@example.com',
        role: 'User',
        status: 'Active',
      },
      {
        id: '7',
        name: 'Grace Lee',
        email: 'grace@example.com',
        role: 'Editor',
        status: 'Active',
      },
      {
        id: '8',
        name: 'Henry Wilson',
        email: 'henry@example.com',
        role: 'Admin',
        status: 'Inactive',
      },
    ];

    const pageSize = 4;
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState<SampleDataRow[]>(allData);
    const [selectedRows, setSelectedRows] = useState<SampleDataRow[]>([]);
    const [lastEdit, setLastEdit] = useState<string>('');

    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = data.slice(startIndex, startIndex + pageSize);

    const paginationData = {
      currentPage,
      currentPageSize: pageSize,
      totalItems: data.length,
      hasNextPage: startIndex + pageSize < data.length,
      hasPreviousPage: currentPage > 1,
    };

    const editableColumnDefs: ColDef<SampleDataRow>[] = [
      { field: 'id', headerName: 'ID', width: 80, editable: false },
      { field: 'name', headerName: 'Name', width: 200, editable: true },
      { field: 'email', headerName: 'Email', width: 250, editable: true },
      { field: 'role', headerName: 'Role', width: 120, editable: true },
      { field: 'status', headerName: 'Status', width: 120, editable: false },
    ];

    return (
      <div className="space-y-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Interactive Demo</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>Click rows or checkboxes to select (multi-select enabled)</li>
            <li>Double-click cells to edit (Name, Email, Role)</li>
            <li>Drag column headers to reorder</li>
            <li>Resize columns by dragging header edges</li>
            <li>Use pagination controls to navigate pages</li>
            <li>Column state persists across page changes</li>
          </ul>
          {selectedRows.length > 0 && (
            <p className="text-sm text-gray-700 mt-2">Selected: {selectedRows.length} row(s)</p>
          )}
          {lastEdit && <p className="text-sm text-orange-600 mt-2">Last edit: {lastEdit}</p>}
        </div>
        <DataGrid<SampleDataRow>
          columnDefs={editableColumnDefs}
          rowData={paginatedData}
          height={400}
          enableRowSelection
          enableMultiRowSelection
          enableCellEditing
          persistenceKey="canary-storybook-interactive-demo"
          onSelectionChanged={setSelectedRows}
          onCellValueChanged={(event) => {
            const { data: rowData, oldValue, newValue, column } = event;
            setLastEdit(
              `Changed ${column.getColId()} for ${rowData.name} from "${String(oldValue)}" to "${String(newValue)}"`,
            );
            setData((prev) =>
              prev.map((row) =>
                row.id === rowData.id ? { ...row, [column.getColId()]: newValue } : row,
              ),
            );
          }}
          paginationData={paginationData}
          onFirstPage={() => setCurrentPage(1)}
          onPreviousPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
          onNextPage={() => setCurrentPage((p) => p + 1)}
        />
      </div>
    );
  },
};

/**
 * Grid with image column using GridImage component.
 */
export const WithImages: Story = {
  render: () => {
    interface ImageDataRow extends Record<string, unknown> {
      id: string;
      name: string;
      image: string;
      description: string;
    }

    const imageData: ImageDataRow[] = [
      {
        id: '1',
        name: 'Product 1',
        image: 'https://via.placeholder.com/40',
        description: 'Sample product',
      },
      {
        id: '2',
        name: 'Product 2',
        image: 'invalid-url',
        description: 'Product with invalid image',
      },
      {
        id: '3',
        name: 'Product 3',
        image: '',
        description: 'Product with no image',
      },
    ];

    const imageColumnDefs: ColDef<ImageDataRow>[] = [
      { field: 'id', headerName: 'ID', width: 80 },
      {
        field: 'image',
        headerName: 'Image',
        width: 100,
        cellRenderer: (params: { value?: string }) => (
          <GridImage {...(params.value !== undefined ? { value: params.value } : {})} />
        ),
      },
      { field: 'name', headerName: 'Name', width: 200 },
      { field: 'description', headerName: 'Description', width: 250 },
    ];

    return <DataGrid<ImageDataRow> columnDefs={imageColumnDefs} rowData={imageData} height={400} />;
  },
};

/**
 * ThemedGrid — demonstrates the themeQuartz visual foundation with Arda design-system tokens.
 *
 * This story shows the canonical Arda grid appearance:
 * - 48px row height, 36px header height
 * - Geist Sans 14px body text, 13px 600-weight headers
 * - 12px cell horizontal padding
 * - Arda orange accent (--primary) for checkboxes and selection
 * - Column border on header resize handles, wrapper border radius 8px
 * - Color tokens from tokens.css (background, foreground, border, secondary)
 *
 * Compare this story against the item-grid in the worktree Storybook to verify
 * the token mapping is consistent.
 */
export const ThemedGrid: Story = {
  render: () => {
    interface ThemedRow extends Record<string, unknown> {
      id: string;
      partNumber: string;
      description: string;
      category: string;
      unitCost: number;
      quantity: number;
      active: boolean;
      lastUpdated: string;
    }

    const themedData: ThemedRow[] = [
      {
        id: '1',
        partNumber: 'SKU-0001',
        description: 'M6 x 12mm Hex Cap Screw (Grade 8)',
        category: 'Fasteners',
        unitCost: 0.18,
        quantity: 500,
        active: true,
        lastUpdated: '2026-01-15',
      },
      {
        id: '2',
        partNumber: 'SKU-0002',
        description: '1/4-20 Tee Nut (Zinc)',
        category: 'Fasteners',
        unitCost: 0.42,
        quantity: 200,
        active: true,
        lastUpdated: '2026-02-03',
      },
      {
        id: '3',
        partNumber: 'SKU-0003',
        description: 'HDPE Sheet 12" x 24" x 0.25"',
        category: 'Raw Material',
        unitCost: 14.5,
        quantity: 12,
        active: false,
        lastUpdated: '2025-11-20',
      },
      {
        id: '4',
        partNumber: 'SKU-0004',
        description: 'Nema 17 Stepper Motor 1.8°',
        category: 'Electronics',
        unitCost: 12.95,
        quantity: 8,
        active: true,
        lastUpdated: '2026-03-01',
      },
      {
        id: '5',
        partNumber: 'SKU-0005',
        description: 'T-Slot Aluminum Extrusion 2020 — 1m',
        category: 'Structural',
        unitCost: 6.75,
        quantity: 30,
        active: true,
        lastUpdated: '2026-01-28',
      },
      {
        id: '6',
        partNumber: 'SKU-0006',
        description: 'PLA Filament 1.75mm — 1kg Spool',
        category: 'Consumables',
        unitCost: 22.0,
        quantity: 5,
        active: false,
        lastUpdated: '2025-12-10',
      },
    ];

    const themedColumnDefs: ColDef<ThemedRow>[] = [
      { field: 'partNumber', headerName: 'Part #', width: 110 },
      { field: 'description', headerName: 'Description', flex: 1, minWidth: 200 },
      { field: 'category', headerName: 'Category', width: 130 },
      {
        field: 'unitCost',
        headerName: 'Unit Cost',
        width: 110,
        cellRenderer: (params: { value?: number }) =>
          params.value !== null && params.value !== undefined ? `$${params.value.toFixed(2)}` : '—',
      },
      { field: 'quantity', headerName: 'Qty', width: 80 },
      {
        field: 'active',
        headerName: 'Active',
        width: 90,
        cellRenderer: (params: { value?: boolean }) => (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              fontWeight: 600,
              color: params.value ? 'var(--primary)' : 'var(--muted-foreground)',
            }}
          >
            {params.value ? 'Yes' : 'No'}
          </span>
        ),
      },
      { field: 'lastUpdated', headerName: 'Updated', width: 110 },
    ];

    return (
      <div className="space-y-4">
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--secondary)',
            fontSize: 13,
            color: 'var(--muted-foreground)',
          }}
        >
          <strong style={{ color: 'var(--foreground)', fontWeight: 600 }}>
            themeQuartz Visual Foundation
          </strong>{' '}
          — 48px rows, 36px header, Geist Sans 14px/13px, 12px padding, Arda orange tokens.
        </div>
        <DataGrid<ThemedRow>
          columnDefs={themedColumnDefs}
          rowData={themedData}
          height={400}
          enableRowSelection
          enableMultiRowSelection
        />
      </div>
    );
  },
};

/**
 * Interactive Controls playground — use the Controls panel to toggle
 * `loading`, `error`, `enableRowSelection`, `enableCellEditing`, and `height`.
 * Column definitions and row data are fixed in this story.
 */
export const Playground: Story = {
  argTypes: {
    height: { control: 'number', description: 'Grid height in pixels' },
    loading: { control: 'boolean', description: 'Show loading overlay' },
    enableRowSelection: { control: 'boolean', description: 'Enable row selection' },
    enableMultiRowSelection: { control: 'boolean', description: 'Enable multi-row selection' },
    enableCellEditing: { control: 'boolean', description: 'Enable inline cell editing' },
    columnDefs: { table: { disable: true } },
    rowData: { table: { disable: true } },
  },
  args: {
    columnDefs: columnDefs as unknown as AnyColDef[],
    rowData: sampleData as Record<string, unknown>[],
    height: 400,
    loading: false,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableCellEditing: false,
  },
};

// ============================================================================
// Stories
// ============================================================================

/**
 * Default grid with basic configuration.
 */
