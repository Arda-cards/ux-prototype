import type { Meta, StoryObj } from '@storybook/react';
import { AgGridReact } from 'ag-grid-react';
import { useCallback, useMemo, useRef, useState } from 'react';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import { TypeaheadOption } from '@/components/atoms/typeahead/typeahead';
import { ArdaTypeaheadCellEditor, createTypeaheadCellEditor } from './typeahead-cell-editor';

const meta = {
  title: 'Components/Atoms/TypeaheadCellEditor',
  component: ArdaTypeaheadCellEditor,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ArdaTypeaheadCellEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

const userOptions: TypeaheadOption[] = [
  { value: 'user-1', label: 'Alice Anderson', meta: 'Engineering' },
  { value: 'user-2', label: 'Bob Brown', meta: 'Product' },
  { value: 'user-3', label: 'Charlie Chen', meta: 'Design' },
  { value: 'user-4', label: 'Diana Davis', meta: 'Engineering' },
  { value: 'user-5', label: 'Eve Evans', meta: 'Marketing' },
  { value: 'user-6', label: 'Frank Foster', meta: 'Sales' },
  { value: 'user-7', label: 'Grace Green', meta: 'Engineering' },
  { value: 'user-8', label: 'Henry Hill', meta: 'Product' },
];

const customerOptions: TypeaheadOption[] = [
  { value: 'cust-1', label: 'Acme Corp', meta: 'Enterprise' },
  { value: 'cust-2', label: 'TechStart Inc', meta: 'Startup' },
  { value: 'cust-3', label: 'Global Systems', meta: 'Enterprise' },
  { value: 'cust-4', label: 'Digital Solutions', meta: 'SMB' },
  { value: 'cust-5', label: 'Innovation Labs', meta: 'Startup' },
];

interface TaskRowData {
  id: number;
  title: string;
  assignee: string;
  reviewer: string;
}

interface OrderRowData {
  id: number;
  orderNumber: string;
  customer: string;
}

function TypeaheadCellEditorGrid() {
  const gridRef = useRef<AgGridReact>(null);
  const [rowData] = useState<TaskRowData[]>([
    { id: 1, title: 'Implement login', assignee: 'user-1', reviewer: 'user-2' },
    { id: 2, title: 'Design dashboard', assignee: 'user-3', reviewer: 'user-4' },
    { id: 3, title: 'Write documentation', assignee: 'user-5', reviewer: 'user-6' },
    { id: 4, title: 'Review pull request', assignee: 'user-7', reviewer: 'user-8' },
  ]);

  const columnDefs = useMemo(
    () => [
      { field: 'id', headerName: 'ID', width: 80, editable: false },
      { field: 'title', headerName: 'Title', flex: 1, editable: false },
      {
        field: 'assignee',
        headerName: 'Assignee',
        width: 200,
        editable: true,
        cellEditor: createTypeaheadCellEditor({
          dataSource: userOptions,
          placeholder: 'Search assignee...',
        }),
        valueFormatter: (params: any) => {
          const user = userOptions.find((u) => u.value === params.value);
          return user ? user.label : params.value;
        },
      },
      {
        field: 'reviewer',
        headerName: 'Reviewer',
        width: 200,
        editable: true,
        cellEditor: createTypeaheadCellEditor({
          dataSource: userOptions,
          placeholder: 'Search reviewer...',
        }),
        valueFormatter: (params: any) => {
          const user = userOptions.find((u) => u.value === params.value);
          return user ? user.label : params.value;
        },
      },
    ],
    [],
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
    }),
    [],
  );

  const onCellValueChanged = useCallback((event: any) => {
    console.log('Cell value changed:', {
      field: event.colDef.field,
      oldValue: event.oldValue,
      newValue: event.newValue,
    });
  }, []);

  return (
    <div className="ag-theme-quartz" style={{ height: 300, width: '100%' }}>
      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        onCellValueChanged={onCellValueChanged}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Default Typeahead Cell Editor</h3>
        <p className="text-sm text-gray-600 mb-4">
          Click any cell in the Assignee or Reviewer columns to edit. Type to filter options. The
          editor shows metadata next to each option.
        </p>
      </div>
      <TypeaheadCellEditorGrid />
    </div>
  ),
};

export const AsyncDataSource: Story = {
  render: () => {
    // Simulate async data fetching
    const fetchCustomers = async (query: string): Promise<TypeaheadOption[]> => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (query.trim() === '') {
        return customerOptions;
      }

      return customerOptions.filter((customer) =>
        customer.label.toLowerCase().includes(query.toLowerCase()),
      );
    };

    const [rowData] = useState<OrderRowData[]>([
      { id: 1, orderNumber: 'ORD-001', customer: 'cust-1' },
      { id: 2, orderNumber: 'ORD-002', customer: 'cust-2' },
      { id: 3, orderNumber: 'ORD-003', customer: 'cust-3' },
    ]);

    const columnDefs = useMemo(
      () => [
        { field: 'id', headerName: 'ID', width: 80, editable: false },
        { field: 'orderNumber', headerName: 'Order #', width: 150, editable: false },
        {
          field: 'customer',
          headerName: 'Customer',
          flex: 1,
          editable: true,
          cellEditor: createTypeaheadCellEditor({
            dataSource: fetchCustomers,
            placeholder: 'Search customer...',
          }),
          valueFormatter: (params: any) => {
            const customer = customerOptions.find((c) => c.value === params.value);
            return customer ? customer.label : params.value;
          },
        },
      ],
      [],
    );

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Async Data Source</h3>
          <p className="text-sm text-gray-600 mb-4">
            The customer field uses an async data source with simulated network delay. Type to
            search, and you will see a loading indicator.
          </p>
        </div>
        <div className="ag-theme-quartz" style={{ height: 250, width: '100%' }}>
          <AgGridReact rowData={rowData} columnDefs={columnDefs} />
        </div>
      </div>
    );
  },
};

export const Interactive: Story = {
  render: () => {
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [searchHistory, setSearchHistory] = useState<string[]>([]);

    const [rowData] = useState([
      { id: 1, assignee: 'user-1' },
      { id: 2, assignee: 'user-3' },
      { id: 3, assignee: 'user-5' },
    ]);

    const columnDefs = useMemo(
      () => [
        { field: 'id', headerName: 'ID', width: 100, editable: false },
        {
          field: 'assignee',
          headerName: 'Assignee',
          flex: 1,
          editable: true,
          cellEditor: createTypeaheadCellEditor({
            dataSource: userOptions,
            placeholder: 'Type to search...',
          }),
          valueFormatter: (params: any) => {
            const user = userOptions.find((u) => u.value === params.value);
            return user ? user.label : params.value;
          },
        },
      ],
      [],
    );

    const onCellValueChanged = useCallback((event: any) => {
      const user = userOptions.find((u) => u.value === event.newValue);
      if (user) {
        setSelectedUser(user.label);
        setSearchHistory((prev) => [...prev, user.label]);
      }
    }, []);

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Interactive Demo</h3>
          <p className="text-sm text-gray-600 mb-4">
            Edit cells to see the selection tracked below. Type to filter options in real-time.
          </p>
        </div>
        <div className="ag-theme-quartz" style={{ height: 250, width: '100%' }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            onCellValueChanged={onCellValueChanged}
          />
        </div>
        <div className="space-y-2">
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm font-medium">Last selected user:</p>
            <p className="text-sm text-gray-700 font-mono">{selectedUser || '(none)'}</p>
          </div>
          {searchHistory.length > 0 && (
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm font-medium mb-2">Selection history:</p>
              <ul className="text-sm text-gray-700 space-y-1">
                {searchHistory.slice(-5).map((user, idx) => (
                  <li key={idx} className="font-mono">
                    {user}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  },
};

export const LargeDataset: Story = {
  render: () => {
    // Generate 100 user options
    const largeUserList: TypeaheadOption[] = Array.from({ length: 100 }, (_, i) => ({
      value: `user-${i + 1}`,
      label: `User ${String(i + 1).padStart(3, '0')}`,
      meta: ['Engineering', 'Product', 'Design', 'Marketing', 'Sales'][i % 5],
    }));

    const [rowData] = useState([
      { id: 1, assignee: 'user-25' },
      { id: 2, assignee: 'user-50' },
      { id: 3, assignee: 'user-75' },
    ]);

    const columnDefs = useMemo(
      () => [
        { field: 'id', headerName: 'ID', width: 100, editable: false },
        {
          field: 'assignee',
          headerName: 'Assignee (100 users)',
          flex: 1,
          editable: true,
          cellEditor: createTypeaheadCellEditor({
            dataSource: largeUserList,
            placeholder: 'Search from 100 users...',
          }),
          valueFormatter: (params: any) => {
            const user = largeUserList.find((u) => u.value === params.value);
            return user ? user.label : params.value;
          },
        },
      ],
      [],
    );

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Large Dataset</h3>
          <p className="text-sm text-gray-600 mb-4">
            Typeahead editor with 100 users. Type to filter the list efficiently. The component
            handles large datasets with smooth scrolling.
          </p>
        </div>
        <div className="ag-theme-quartz" style={{ height: 250, width: '100%' }}>
          <AgGridReact rowData={rowData} columnDefs={columnDefs} />
        </div>
      </div>
    );
  },
};
