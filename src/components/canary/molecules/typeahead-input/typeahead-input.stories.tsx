import { useState, useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule, type ColDef } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

import { TypeaheadInput } from './typeahead-input';
import { createTypeaheadCellEditor } from './typeahead-cell-editor';
import { lookupUnits } from '@/components/canary/__mocks__/unit-lookup';
import { unitLookupHandler } from '@/components/canary/__mocks__/handlers/unit-lookup';

// ---------------------------------------------------------------------------
// Wrapper
// ---------------------------------------------------------------------------

function TypeaheadDemo({
  initialValue = '',
  ...props
}: Omit<React.ComponentProps<typeof TypeaheadInput>, 'value' | 'onValueChange'> & {
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="w-64 p-8">
      <TypeaheadInput value={value} onValueChange={setValue} {...props} />
      <p className="mt-2 text-xs text-muted-foreground">
        Value: <code>{value || '(empty)'}</code>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: 'Components/Canary/Molecules/TypeaheadInput',
  parameters: {
    msw: { handlers: [unitLookupHandler] },
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const Default: StoryObj = {
  render: () => <TypeaheadDemo lookup={lookupUnits} placeholder="Select unit..." />,
};

export const AllowCreate: StoryObj = {
  render: () => (
    <TypeaheadDemo lookup={lookupUnits} allowCreate placeholder="Type or create unit..." />
  ),
};

export const PrePopulated: StoryObj = {
  render: () => (
    <TypeaheadDemo lookup={lookupUnits} initialValue="each" placeholder="Select unit..." />
  ),
};

export const Disabled: StoryObj = {
  render: () => (
    <TypeaheadDemo lookup={lookupUnits} initialValue="kg" disabled placeholder="Select unit..." />
  ),
};

/** Cell editor mode — blur accepts typed value, dropdown portaled via Popover. */
export const CellEditorMode: StoryObj = {
  render: () => (
    <div className="p-8">
      <p className="text-sm text-muted-foreground mb-4">
        Cell editor mode: blur accepts typed value instead of reverting. Dropdown is portaled.
      </p>
      <div className="w-64 overflow-hidden border border-border rounded-md p-2">
        <TypeaheadDemo
          lookup={lookupUnits}
          allowCreate
          cellEditorMode
          placeholder="Search units (cell editor)..."
        />
      </div>
    </div>
  ),
};

/** Cell editor in an AG Grid — double-click the Unit column to edit. */
export const InGrid: StoryObj = {
  render: () => {
    const UnitCellEditor = useMemo(
      () =>
        createTypeaheadCellEditor({
          lookup: lookupUnits,
          allowCreate: true,
          placeholder: 'Search units...',
        }),
      [],
    );

    const [rowData] = useState([
      { item: 'Hex Bolt M10x30', qty: 100, unit: 'each' },
      { item: 'Flat Washer 3/8"', qty: 500, unit: 'box' },
      { item: 'Spring Pin 4x20', qty: 50, unit: '' },
    ]);

    const columnDefs = useMemo<ColDef[]>(
      () => [
        { field: 'item', headerName: 'Item', flex: 2 },
        { field: 'qty', headerName: 'Qty', width: 80 },
        {
          field: 'unit',
          headerName: 'Unit',
          flex: 1,
          editable: true,
          cellEditor: UnitCellEditor,
        },
      ],
      [UnitCellEditor],
    );

    return (
      <div className="p-8">
        <p className="text-sm text-muted-foreground mb-4">
          Double-click the <strong>Unit</strong> column to open the typeahead cell editor.
        </p>
        <div className="ag-theme-quartz w-[500px] h-[200px]">
          <AgGridReact rowData={rowData} columnDefs={columnDefs} />
        </div>
      </div>
    );
  },
};
