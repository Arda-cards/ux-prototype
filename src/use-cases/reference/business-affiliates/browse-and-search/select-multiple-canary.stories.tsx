/**
 * REF::BA::0001 — Select Multiple (Canary Variant)
 *
 * Tests multi-row selection via checkboxes in the canary entity-data-grid.
 * Verifies the Actions dropdown becomes enabled when rows are selected.
 *
 * Maps to: BA::0001::0005
 */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, userEvent, waitFor } from 'storybook/test';
import type { ColDef } from 'ag-grid-community';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Building2,
  Settings,
  ShieldCheck,
  LogOut,
  Plus,
  ChevronDown,
  Trash2,
} from 'lucide-react';

import { SidebarInset, SidebarTrigger } from '@/components/canary/primitives/sidebar';
import { Sidebar } from '@/components/canary/organisms/sidebar/sidebar';
import { SidebarHeader } from '@/components/canary/molecules/sidebar/sidebar-header';
import { SidebarNav } from '@/components/canary/molecules/sidebar/sidebar-nav';
import { SidebarNavItem } from '@/components/canary/molecules/sidebar/sidebar-nav-item';
import { SidebarUserMenu } from '@/components/canary/molecules/sidebar/sidebar-user-menu';
import { AppHeader } from '@/components/canary/organisms/app-header/app-header';
import { Button } from '@/components/canary/atoms/button/button';
import { createEntityDataGrid } from '@/components/canary/organisms/shared/entity-data-grid/create-entity-data-grid';
import { storyStepDelay } from '../_shared/story-step-delay';

// ---------------------------------------------------------------------------
// Supplier entity type (local — no extras dependency)
// ---------------------------------------------------------------------------

interface SupplierEntity {
  id: string;
  name: string;
  contact?: string;
  email?: string;
  city?: string;
  state?: string;
  roles: string[];
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const supplierMockData: SupplierEntity[] = [
  { id: 'sup-001', name: 'Apex Medical Distributors', contact: 'Dr. Maria Santos', email: 'msantos@apexmedical.com', city: 'Denver', state: 'CO', roles: ['VENDOR'] },
  { id: 'sup-002', name: 'BioTech Supplies Inc.', contact: 'James Lee', email: 'jlee@biotechsupplies.com', city: 'Boston', state: 'MA', roles: ['VENDOR', 'CARRIER'] },
  { id: 'sup-003', name: 'Cardinal Health', contact: 'Susan Williams', email: 'swilliams@cardinalhealth.com', city: 'Dublin', state: 'OH', roles: ['VENDOR'] },
  { id: 'sup-004', name: 'CleanRoom Solutions', email: 'info@cleanroomsolutions.com', city: 'San Jose', state: 'CA', roles: ['VENDOR'] },
  { id: 'sup-005', name: 'ColdChain Direct', city: 'Chicago', state: 'IL', roles: ['CARRIER'] },
  { id: 'sup-006', name: 'Delta Pharma Group', contact: 'Robert Chen', email: 'rchen@deltapharma.com', city: 'Atlanta', state: 'GA', roles: ['VENDOR', 'CUSTOMER'] },
  { id: 'sup-007', name: 'Eppendorf AG', contact: 'Anna Schmidt', email: 'aschmidt@eppendorf.com', city: 'Hamburg', state: '', roles: ['VENDOR'] },
  { id: 'sup-008', name: 'Fisher Scientific', contact: 'Tom Nguyen', email: 'tnguyen@fishersci.com', city: 'Pittsburgh', state: 'PA', roles: ['VENDOR'] },
];

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const supplierColDefs: ColDef<SupplierEntity>[] = [
  { field: 'name', headerName: 'Name', width: 260, sortable: true },
  { field: 'contact', headerName: 'Contact', width: 180, sortable: true },
  { field: 'email', headerName: 'Email', width: 220, sortable: true },
  { field: 'city', headerName: 'City', width: 140, sortable: true },
  { field: 'state', headerName: 'State', width: 80, sortable: true },
  {
    field: 'roles',
    headerName: 'Roles',
    width: 160,
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
];

// ---------------------------------------------------------------------------
// Canary entity-data-grid for suppliers
// ---------------------------------------------------------------------------

const { Component: SupplierGrid } = createEntityDataGrid<SupplierEntity>({
  displayName: 'SupplierSelectGrid',
  persistenceKeyPrefix: 'canary-supplier-select-grid',
  columnDefs: supplierColDefs,
  defaultColDef: { resizable: true, sortable: true, filter: false },
  getEntityId: (s) => s.id,
  enableDragToScroll: true,
});

// ---------------------------------------------------------------------------
// Actions dropdown (self-contained)
// ---------------------------------------------------------------------------

function ActionsDropdown({
  selectedCount,
  onDelete,
}: {
  selectedCount: number;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const disabled = selectedCount === 0;

  return (
    <div className="relative">
      <Button
        size="sm"
        variant="outline"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        aria-label="Actions"
      >
        Actions
        <ChevronDown className="ml-1 h-4 w-4" />
      </Button>
      {open && !disabled && (
        <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-md border bg-popover p-1 shadow-md">
          <button
            role="menuitem"
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-accent"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

function SelectMultipleCanaryPage() {
  const [selectedSuppliers, setSelectedSuppliers] = useState<SupplierEntity[]>([]);

  return (
    <Sidebar
      defaultOpen
      content={
        <SidebarInset>
          <AppHeader
            leading={<SidebarTrigger className="self-center" />}
            showSearch={false}
          />
          <main className="flex flex-1 flex-col gap-4 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Suppliers</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Select multiple suppliers using the row checkboxes.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ActionsDropdown
                  selectedCount={selectedSuppliers.length}
                  onDelete={() =>
                    console.log(
                      'Delete:',
                      selectedSuppliers.map((s) => s.name),
                    )
                  }
                />
                <Button size="sm" onClick={() => console.log('Add Supplier')}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Supplier
                </Button>
              </div>
            </div>
            <style>{`.arda-hide-auto-selection [col-id*="SelectionColumn"],
              .arda-hide-auto-selection [col-id*="SelectionColumn"] * {
                display: revert !important;
                visibility: visible !important;
                width: auto !important;
                min-width: auto !important;
                max-width: none !important;
              }`}</style>
            <div style={{ height: 480 }}>
              <SupplierGrid
                data={supplierMockData}
                activeTab="select-multiple"
                onSelectionChange={setSelectedSuppliers}
              />
            </div>
            {selectedSuppliers.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedSuppliers.length} supplier{selectedSuppliers.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </main>
        </SidebarInset>
      }
    >
      <SidebarHeader teamName="Arda Cards" />
      <SidebarNav>
        <SidebarNavItem icon={LayoutDashboard} label="Dashboard" />
        <SidebarNavItem icon={Package} label="Items" />
        <SidebarNavItem icon={ShoppingCart} label="Order Queue" />
        <SidebarNavItem icon={Building2} label="Suppliers" active />
      </SidebarNav>
      <SidebarUserMenu
        user={{ name: 'Uriel Eisen', email: 'uriel@arda.cards', role: 'Account Admin' }}
        actions={[
          { key: 'admin', label: 'Admin', icon: ShieldCheck, onClick: () => {} },
          { key: 'settings', label: 'Settings', icon: Settings, onClick: () => {} },
          { key: 'logout', label: 'Log out', icon: LogOut, onClick: () => {}, destructive: true },
        ]}
      />
    </Sidebar>
  );
}

// ---------------------------------------------------------------------------
// Story meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof SelectMultipleCanaryPage> = {
  title:
    'Use Cases/Reference/Business Affiliates/BA-0001 Browse and Search/Select Multiple (Canary)',
  component: SelectMultipleCanaryPage,
  tags: ['skip-ci'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SelectMultipleCanaryPage>;

/**
 * Default — verify Actions button is disabled when no rows selected, select
 * rows 1 and 3, verify Actions becomes enabled and both rows are checked.
 */
export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Supplier grid renders with data', async () => {
      await canvas.findByText(
        'Apex Medical Distributors',
        { selector: '[role="gridcell"]' },
        { timeout: 10000 },
      );
    });

    await storyStepDelay();

    await step('Actions button is disabled (no selection)', async () => {
      const actionsButton = canvas.getByRole('button', { name: 'Actions' });
      expect(actionsButton).toBeDisabled();
    });

    await storyStepDelay();

    await step('Click checkbox on row 1', async () => {
      const checkboxes = canvas.getAllByRole('checkbox');
      // checkboxes[0] = header select-all, checkboxes[1] = row 1
      await userEvent.click(checkboxes[1]);

      await waitFor(() => {
        expect(checkboxes[1]).toBeChecked();
      }, { timeout: 10000 });
    });

    await step('Actions button is enabled after selection', async () => {
      await waitFor(() => {
        const actionsButton = canvas.getByRole('button', { name: 'Actions' });
        expect(actionsButton).toBeEnabled();
      }, { timeout: 10000 });
    });

    await storyStepDelay();

    await step('Click checkbox on row 3', async () => {
      const checkboxes = canvas.getAllByRole('checkbox');
      // checkboxes[3] = row 3
      await userEvent.click(checkboxes[3]);

      await waitFor(() => {
        expect(checkboxes[1]).toBeChecked();
        expect(checkboxes[3]).toBeChecked();
      }, { timeout: 10000 });
    });

    await storyStepDelay();
  },
};

/**
 * SelectAll — click the header checkbox to select all rows, verify all are
 * checked, then click again to deselect and verify all are unchecked.
 */
export const SelectAll: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Apex Medical Distributors', { selector: '[role="gridcell"]' }, { timeout: 10000 });
    await storyStepDelay();

    // Click header checkbox (select all)
    const checkboxes = canvas.getAllByRole('checkbox');
    const headerCheckbox = checkboxes[0];
    await userEvent.click(headerCheckbox);

    // Verify all data row checkboxes are checked
    await waitFor(() => {
      const allCheckboxes = canvas.getAllByRole('checkbox');
      for (let i = 1; i < allCheckboxes.length; i++) {
        expect(allCheckboxes[i]).toBeChecked();
      }
    }, { timeout: 10000 });

    await storyStepDelay();

    // Click header checkbox again (deselect all)
    const freshCheckboxes = canvas.getAllByRole('checkbox');
    await userEvent.click(freshCheckboxes[0]);

    // Verify all unchecked
    await waitFor(() => {
      const allCheckboxes = canvas.getAllByRole('checkbox');
      for (let i = 1; i < allCheckboxes.length; i++) {
        expect(allCheckboxes[i]).not.toBeChecked();
      }
    }, { timeout: 10000 });
  },
};
