import { useState, useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ColDef } from 'ag-grid-community';
import { Star } from 'lucide-react';

import { MultiSelectTypeaheadInput } from './multiselect-typeahead-input';
import { TooltipProvider } from '@/components/canary/primitives/tooltip';
import { createMultiSelectCellEditor } from './multiselect-cell-editor';
import { DataGrid } from '../data-grid/data-grid';
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
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
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

/** Overflow — many selected, tokens that don't fit show "+N more". */
export const Overflow: StoryObj = {
  render: () => (
    <MultiSelectDemo
      lookup={lookupRoles}
      initialValue={['Vendor', 'Customer', 'Carrier', 'Operator', 'Distributor']}
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

/**
 * Create values not in the lookup — type a role that has no match (e.g.
 * "Wholesaler") and the dropdown offers an "Add" row; Enter also creates.
 */
export const AllowCreate: StoryObj = {
  render: () => (
    <MultiSelectDemo
      lookup={lookupRoles}
      allowCreate
      defaultOne={false}
      placeholder="Select or add roles..."
    />
  ),
};

/**
 * Per-token hover action — an email recipient field where hovering a token
 * reveals a star that promotes that address to the vendor's default (the
 * current default hides its action via `isVisible`).
 */
export const TokenAction: StoryObj = {
  render: function TokenActionStory() {
    const emails = [
      'pepper@starkindustries.com',
      'orders@starkindustries.com',
      'happy@starkindustries.com',
    ];
    const [value, setValue] = useState(emails.slice(0, 2));
    const [defaultEmail, setDefaultEmail] = useState(emails[0]);

    return (
      <div className="w-96 p-8">
        <MultiSelectTypeaheadInput
          value={value}
          onValueChange={setValue}
          lookup={emails}
          allowCreate
          defaultOne={false}
          placeholder="Add email..."
          aria-label="To address"
          tokenAction={{
            label: (v) => `Set ${v} as the default`,
            icon: <Star className="h-3 w-3" aria-hidden="true" />,
            onAction: setDefaultEmail,
            isVisible: (v) => v !== defaultEmail,
          }}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Default: <code>{defaultEmail}</code> — hover any other token to promote it.
        </p>
      </div>
    );
  },
};

/**
 * `bare` + `editOnDoubleClick` + `optionAction` — a chromeless labelled
 * recipient row (the email-composer To field): no input border, tokens always
 * wrap inline, double-clicking a token puts it back into the input for
 * editing, the hover star promotes an address to the default, and each
 * dropdown row reveals an × on hover that forgets a stale address.
 */
export const BareRecipientRow: StoryObj = {
  render: function BareRecipientRowStory() {
    const [emails, setEmails] = useState([
      'pepper@starkindustries.com',
      'orders@starkindustries.com',
      'happy@starkindustries.com',
    ]);
    const [value, setValue] = useState(emails.slice(0, 2));
    const [defaultEmail, setDefaultEmail] = useState(emails[0]);

    return (
      <div className="w-96 p-8">
        <div className="flex items-start gap-2 text-sm">
          <span className="shrink-0 pt-1 font-medium text-foreground">To:</span>
          <MultiSelectTypeaheadInput
            className="flex-1 min-w-0"
            value={value}
            onValueChange={setValue}
            lookup={emails}
            allowCreate
            defaultOne={false}
            bare
            editOnDoubleClick
            placeholder="Add email..."
            aria-label="To address"
            tokenAction={{
              label: (v) => `Set ${v} as the default`,
              icon: <Star className="h-3 w-3" aria-hidden="true" />,
              onAction: setDefaultEmail,
              isVisible: (v) => v !== defaultEmail,
            }}
            optionAction={{
              label: (v) => `Forget ${v}`,
              onAction: (v) => setEmails((prev) => prev.filter((e) => e !== v)),
              isVisible: (v) => v !== defaultEmail,
            }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Default: <code>{defaultEmail}</code> — double-click a token to edit it; hover a dropdown
          row to forget an address.
        </p>
      </div>
    );
  },
};

interface SupplierRow {
  [key: string]: unknown;
  name: string;
  city: string;
  roles: string[];
}

/** Cell editor in the canary DataGrid — double-click the Roles column to edit. */
export const InGrid: StoryObj = {
  render: () => {
    const RoleCellEditor = useMemo(
      () =>
        createMultiSelectCellEditor({
          lookup: lookupRoles,
          placeholder: 'Select roles...',
        }),
      [],
    );

    const [rowData] = useState<SupplierRow[]>([
      { name: 'Apex Medical', city: 'Denver', roles: ['Vendor'] },
      { name: 'BioTech Supplies', city: 'Boston', roles: ['Vendor', 'Carrier'] },
      { name: 'Delta Pharma', city: 'Atlanta', roles: ['Vendor', 'Customer', 'Carrier'] },
    ]);

    const columnDefs = useMemo<ColDef<SupplierRow>[]>(
      () => [
        { field: 'name', headerName: 'Name', flex: 2 },
        { field: 'city', headerName: 'City', width: 120 },
        {
          field: 'roles',
          headerName: 'Roles',
          flex: 2,
          editable: true,
          cellEditor: RoleCellEditor,
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
        <DataGrid<SupplierRow> rowData={rowData} columnDefs={columnDefs} height={220} editable />
      </div>
    );
  },
};
