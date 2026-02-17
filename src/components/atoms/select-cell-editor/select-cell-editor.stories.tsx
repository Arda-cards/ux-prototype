import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { AgGridReact } from 'ag-grid-react';
import { useCallback, useMemo, useRef, useState } from 'react';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import { ArdaSelectCellEditor, createSelectCellEditor } from './select-cell-editor';

const meta = {
  title: 'Components/Atoms/Grid/SelectCellEditor',
  component: ArdaSelectCellEditor,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'AG Grid cell editor that renders a native `<select>` dropdown. Used via the `createSelectCellEditor` factory in column definitions.',
      },
    },
  },
  argTypes: {
    options: {
      description: 'Array of options to display in the select dropdown.',
      table: { category: 'Static' },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when no value is selected.',
      table: { category: 'Static' },
    },
    value: {
      control: 'text',
      description: 'Initial value passed by AG Grid.',
      table: { category: 'Runtime' },
    },
    stopEditing: {
      action: 'stopEditing',
      description: 'Callback invoked when editing stops.',
      table: { category: 'Events' },
    },
    stopEditingOnCancel: {
      action: 'stopEditingOnCancel',
      description: 'Callback invoked when editing is cancelled.',
      table: { category: 'Events' },
    },
  },
} satisfies Meta<typeof ArdaSelectCellEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const categoryOptions = [
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'improvement', label: 'Improvement' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'security', label: 'Security' },
  { value: 'performance', label: 'Performance' },
];

interface RowData {
  id: number;
  title: string;
  status: string;
  priority: string;
  category: string;
}

function SelectCellEditorGrid({ withPlaceholder = false }: { withPlaceholder?: boolean }) {
  const gridRef = useRef<AgGridReact>(null);
  const [rowData] = useState<RowData[]>([
    { id: 1, title: 'Fix login bug', status: 'active', priority: 'high', category: 'bug' },
    { id: 2, title: 'Add dark mode', status: 'pending', priority: 'medium', category: 'feature' },
    { id: 3, title: 'Update docs', status: 'inactive', priority: 'low', category: 'documentation' },
    {
      id: 4,
      title: 'Optimize queries',
      status: 'active',
      priority: 'critical',
      category: 'performance',
    },
  ]);

  const columnDefs = useMemo(
    () => [
      { field: 'id', headerName: 'ID', width: 80, editable: false },
      { field: 'title', headerName: 'Title', flex: 1, editable: false },
      {
        field: 'status',
        headerName: 'Status',
        width: 150,
        editable: true,
        cellEditor: createSelectCellEditor(
          statusOptions,
          withPlaceholder ? 'Select status...' : undefined,
        ),
      },
      {
        field: 'priority',
        headerName: 'Priority',
        width: 150,
        editable: true,
        cellEditor: createSelectCellEditor(
          priorityOptions,
          withPlaceholder ? 'Select priority...' : undefined,
        ),
      },
      {
        field: 'category',
        headerName: 'Category',
        width: 180,
        editable: true,
        cellEditor: createSelectCellEditor(
          categoryOptions,
          withPlaceholder ? 'Select category...' : undefined,
        ),
      },
    ],
    [withPlaceholder],
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
        <h3 className="text-lg font-semibold mb-2">Default Select Cell Editor</h3>
        <p className="text-sm text-gray-600 mb-4">
          Click any cell in the Status, Priority, or Category columns to edit. The select dropdown
          will open automatically.
        </p>
      </div>
      <SelectCellEditorGrid />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Default Select Cell Editor')).toBeInTheDocument();
  },
};

export const WithPlaceholder: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">With Placeholder</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select editors with placeholder text for empty values.
        </p>
      </div>
      <SelectCellEditorGrid withPlaceholder />
    </div>
  ),
};

export const WithManyOptions: Story = {
  render: () => {
    const manyOptions = Array.from({ length: 20 }, (_, i) => ({
      value: `option-${i + 1}`,
      label: `Option ${i + 1}`,
    }));

    const [rowData] = useState([
      { id: 1, selection: 'option-5' },
      { id: 2, selection: 'option-12' },
      { id: 3, selection: 'option-18' },
    ]);

    const columnDefs = useMemo(
      () => [
        { field: 'id', headerName: 'ID', width: 100, editable: false },
        {
          field: 'selection',
          headerName: 'Selection (20 options)',
          flex: 1,
          editable: true,
          cellEditor: createSelectCellEditor(manyOptions, 'Choose an option...'),
        },
      ],
      [],
    );

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">With Many Options</h3>
          <p className="text-sm text-gray-600 mb-4">
            Select editor with 20 options to demonstrate scrolling behavior.
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
    const [selectedValue, setSelectedValue] = useState<string>('active');
    const [editHistory, setEditHistory] = useState<Array<{ from: string; to: string }>>([]);

    const [rowData] = useState([
      { id: 1, status: 'active' },
      { id: 2, status: 'pending' },
      { id: 3, status: 'inactive' },
    ]);

    const columnDefs = useMemo(
      () => [
        { field: 'id', headerName: 'ID', width: 100, editable: false },
        {
          field: 'status',
          headerName: 'Status',
          flex: 1,
          editable: true,
          cellEditor: createSelectCellEditor(statusOptions),
        },
      ],
      [],
    );

    const onCellValueChanged = useCallback((event: any) => {
      setSelectedValue(event.newValue);
      setEditHistory((prev) => [...prev, { from: event.oldValue, to: event.newValue }]);
    }, []);

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Interactive Demo</h3>
          <p className="text-sm text-gray-600 mb-4">
            Edit cells to see the value changes tracked below.
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
            <p className="text-sm font-medium">Last selected value:</p>
            <p className="text-sm text-gray-700 font-mono">{selectedValue}</p>
          </div>
          {editHistory.length > 0 && (
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm font-medium mb-2">Edit history:</p>
              <ul className="text-sm text-gray-700 space-y-1">
                {editHistory.slice(-5).map((edit, idx) => (
                  <li key={idx} className="font-mono">
                    {edit.from} → {edit.to}
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
