import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { useRef, useState } from 'react';
import { ArdaDataGrid, ArdaDataGridRef, GridImage } from './data-grid';
import type { ColDef } from 'ag-grid-community';

interface SampleDataRow {
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

const meta: Meta<typeof ArdaDataGrid> = {
  title: 'Components/Molecules/DataGrid',
  component: ArdaDataGrid,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'ArdaDataGrid is a wrapper around AG Grid with built-in state persistence, loading states, and pagination support.',
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
type Story = StoryObj<typeof ArdaDataGrid>;

/**
 * Default grid with basic configuration
 */
export const Default: Story = {
  args: {
    columnDefs,
    rowData: sampleData,
    height: 400,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Alice Johnson')).toBeInTheDocument();
  },
};

/**
 * Grid with typed data showing all features
 */
export const WithData: Story = {
  render: () => {
    const [selectedRows, setSelectedRows] = useState<SampleDataRow[]>([]);

    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-600">Selected: {selectedRows.length} row(s)</div>
        <ArdaDataGrid<SampleDataRow>
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
 * Grid showing loading state
 */
export const Loading: Story = {
  args: {
    columnDefs,
    rowData: [],
    loading: true,
    height: 400,
  },
};

/**
 * Grid showing empty state
 */
export const Empty: Story = {
  args: {
    columnDefs,
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
 * Grid with error state
 */
export const Error: Story = {
  args: {
    columnDefs,
    rowData: [],
    error: 'Failed to load data from server',
    height: 400,
  },
};

/**
 * Grid with pagination controls
 */
export const WithPagination: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 3;

    // Simulate paginated data
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
      <ArdaDataGrid<SampleDataRow>
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
 * Grid with row selection
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
        <ArdaDataGrid<SampleDataRow>
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
 * Grid with cell editing enabled
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

    const handleCellValueChanged = (event: any) => {
      const { data, oldValue, newValue, column } = event;
      setLastEdit(
        `Changed ${column.getColId()} for ${data.name} from "${oldValue}" to "${newValue}"`,
      );

      // Update data
      setData((prev) =>
        prev.map((row) => (row.id === data.id ? { ...row, [column.getColId()]: newValue } : row)),
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
        <ArdaDataGrid<SampleDataRow>
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
 * Grid with row click handler
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
        <ArdaDataGrid<SampleDataRow>
          columnDefs={columnDefs}
          rowData={sampleData}
          height={400}
          onRowClicked={(event) => setClickedRow(event.data)}
        />
      </div>
    );
  },
};

/**
 * Grid with column persistence
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
        <ArdaDataGrid<SampleDataRow>
          key={key}
          columnDefs={columnDefs}
          rowData={sampleData}
          height={400}
          persistenceKey="storybook-grid-state"
        />
      </div>
    );
  },
};

/**
 * Grid with ref API usage
 */
export const WithRefAPI: Story = {
  render: () => {
    const gridRef = useRef<ArdaDataGridRef<SampleDataRow>>(null);

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
        <ArdaDataGrid<SampleDataRow>
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
      { id: '6', name: 'Frank Miller', email: 'frank@example.com', role: 'User', status: 'Active' },
      { id: '7', name: 'Grace Lee', email: 'grace@example.com', role: 'Editor', status: 'Active' },
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
        <ArdaDataGrid<SampleDataRow>
          columnDefs={editableColumnDefs}
          rowData={paginatedData}
          height={400}
          enableRowSelection
          enableMultiRowSelection
          enableCellEditing
          persistenceKey="storybook-interactive-demo"
          onSelectionChanged={setSelectedRows}
          onCellValueChanged={(event) => {
            const { data: rowData, oldValue, newValue, column } = event;
            setLastEdit(
              `Changed ${column.getColId()} for ${rowData.name} from "${oldValue}" to "${newValue}"`,
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
 * Grid with image column using GridImage component
 */
export const WithImages: Story = {
  render: () => {
    interface ImageDataRow {
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
        cellRenderer: (params: any) => <GridImage value={params.value} />,
      },
      { field: 'name', headerName: 'Name', width: 200 },
      { field: 'description', headerName: 'Description', width: 250 },
    ];

    return (
      <ArdaDataGrid<ImageDataRow> columnDefs={imageColumnDefs} rowData={imageData} height={400} />
    );
  },
};
