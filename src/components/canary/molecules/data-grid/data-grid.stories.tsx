import { useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataGrid } from './data-grid';
import type { ColDef } from 'ag-grid-community';
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
          maxVisible: 2,
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
          maxVisible: 2,
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
