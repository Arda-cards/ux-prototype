import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataGrid } from './data-grid';
import type { ColDef } from 'ag-grid-community';

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
