import { useState, useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule, type ColDef } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

import { MultiSelectTypeaheadInput } from './multiselect-typeahead-input';
import { createMultiSelectCellEditor } from './multiselect-cell-editor';
import { lookupRoles } from '@/components/canary/__mocks__/role-lookup';
import { roleLookupHandler } from '@/components/canary/__mocks__/handlers/role-lookup';

// ---------------------------------------------------------------------------
// Wrapper
// ---------------------------------------------------------------------------

function MultiSelectDemo({
  initialValue = [],
  ...props
}: Omit<React.ComponentProps<typeof MultiSelectTypeaheadInput>, 'value' | 'onValueChange'> & {
  initialValue?: string[];
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="w-80 p-8">
      <MultiSelectTypeaheadInput value={value} onValueChange={setValue} {...props} />
      <p className="mt-2 text-xs text-muted-foreground">
        Value: <code>{value.length > 0 ? value.join(', ') : '(empty)'}</code>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: 'Components/Canary/Molecules/TypeaheadInput/MultiSelect',
  parameters: {
    msw: { handlers: [roleLookupHandler] },
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Default empty multiselect. Click to open, select multiple roles. */
export const Default: StoryObj = {
  render: () => <MultiSelectDemo lookup={lookupRoles} placeholder="Select roles..." />,
};

/** Pre-populated with two roles. */
export const PrePopulated: StoryObj = {
  render: () => (
    <MultiSelectDemo
      lookup={lookupRoles}
      initialValue={['Vendor', 'Carrier']}
      placeholder="Select roles..."
    />
  ),
};

/** Overflow — four selected, maxVisible=2 shows "+2 more". */
export const Overflow: StoryObj = {
  render: () => (
    <MultiSelectDemo
      lookup={lookupRoles}
      initialValue={['Vendor', 'Customer', 'Carrier', 'Operator']}
      maxVisible={2}
      placeholder="Select roles..."
    />
  ),
};

/** maxVisible=3 for wider containers. */
export const MaxVisibleThree: StoryObj = {
  render: () => (
    <MultiSelectDemo
      lookup={lookupRoles}
      initialValue={['Vendor', 'Customer', 'Carrier', 'Operator', 'Distributor']}
      maxVisible={3}
      placeholder="Select roles..."
    />
  ),
};

/** Disabled state. */
export const Disabled: StoryObj = {
  render: () => (
    <MultiSelectDemo
      lookup={lookupRoles}
      initialValue={['Vendor', 'Carrier']}
      disabled
      placeholder="Select roles..."
    />
  ),
};

/** Cell editor in an AG Grid — double-click the Roles column to edit. */
export const InGrid: StoryObj = {
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

    const [rowData] = useState([
      { name: 'Apex Medical', city: 'Denver', roles: ['Vendor'] },
      { name: 'BioTech Supplies', city: 'Boston', roles: ['Vendor', 'Carrier'] },
      { name: 'Delta Pharma', city: 'Atlanta', roles: ['Vendor', 'Customer', 'Carrier'] },
    ]);

    const columnDefs = useMemo<ColDef[]>(
      () => [
        { field: 'name', headerName: 'Name', flex: 2 },
        { field: 'city', headerName: 'City', width: 120 },
        {
          field: 'roles',
          headerName: 'Roles',
          flex: 2,
          editable: true,
          cellEditor: RoleCellEditor,
          cellEditorPopup: true,
          cellRenderer: (params: { value?: string[] }) => {
            const roles = params.value ?? [];
            return (
              <div className="flex gap-1 items-center h-full">
                {roles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium"
                  >
                    {role}
                  </span>
                ))}
              </div>
            );
          },
        },
      ],
      [RoleCellEditor],
    );

    return (
      <div className="p-8">
        <p className="text-sm text-muted-foreground mb-4">
          Double-click the <strong>Roles</strong> column to open the multiselect cell editor.
        </p>
        <div className="ag-theme-quartz w-[600px] h-[220px]">
          <AgGridReact rowData={rowData} columnDefs={columnDefs} />
        </div>
      </div>
    );
  },
};

/** Cell editor mode — no border, transparent bg, for use inside AG Grid cells. */
export const CellEditorMode: StoryObj = {
  render: () => (
    <div className="p-8">
      <p className="text-sm text-muted-foreground mb-4">
        Cell editor mode: no border, transparent background. Dropdown is portaled.
      </p>
      <div className="w-80 overflow-hidden border border-border rounded-md p-2">
        <MultiSelectDemo
          lookup={lookupRoles}
          initialValue={['Vendor']}
          cellEditorMode
          placeholder="Select roles..."
        />
      </div>
    </div>
  ),
};
