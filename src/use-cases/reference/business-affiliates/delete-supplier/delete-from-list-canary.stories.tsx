/**
 * BA::0005::0001 — Delete from List (Canary Variant)
 *
 * Self-contained canary page with grid supporting row selection (checkboxes).
 * When rows are selected, a "Delete Selected" button appears. Clicking it
 * opens an inline confirm dialog. Confirming removes the row from local state.
 *
 * Maps to: BA::0005::0001 — Delete from List
 */
import { useState, useCallback } from 'react';
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
];

// ---------------------------------------------------------------------------
// Entity data grid with selection
// ---------------------------------------------------------------------------

const { Component: SupplierGrid } = createEntityDataGrid<SupplierEntity>({
  displayName: 'DeleteListSupplierGrid',
  persistenceKeyPrefix: 'canary-delete-list-grid',
  columnDefs: supplierColDefs,
  defaultColDef: { resizable: true, sortable: true, filter: false },
  getEntityId: (s) => s.id,
  enableRowSelection: true,
});

// ---------------------------------------------------------------------------
// Confirm dialog (inline — no external dependency)
// ---------------------------------------------------------------------------

function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div role="alertdialog" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-gray-600 mt-2">{message}</p>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onCancel} className="px-4 py-2 text-sm border rounded">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm bg-red-600 text-white rounded">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

function DeleteFromListCanaryPage() {
  const [suppliers, setSuppliers] = useState<SupplierEntity[]>(supplierMockData);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSelectionChange = useCallback((rows: SupplierEntity[]) => {
    setSelectedIds(rows.map((r) => r.id));
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    setSuppliers((prev) => prev.filter((s) => !selectedIds.includes(s.id)));
    setSelectedIds([]);
    setConfirmOpen(false);
  }, [selectedIds]);

  return (
    <Sidebar
      defaultOpen
      content={
        <SidebarInset>
          <AppHeader leading={<SidebarTrigger className="self-center" />} showSearch={false} />
          <main className="flex flex-1 flex-col gap-4 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Suppliers</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Select rows and delete suppliers from the list.
                </p>
              </div>
              {selectedIds.length > 0 && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setConfirmOpen(true)}
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Delete Selected ({selectedIds.length})
                </Button>
              )}
            </div>
            <div style={{ height: 480 }}>
              <SupplierGrid
                data={suppliers}
                activeTab="delete-list"
                onSelectionChange={handleSelectionChange}
              />
            </div>

            <ConfirmDialog
              open={confirmOpen}
              title={selectedIds.length === 1 ? 'Delete Supplier' : 'Delete Suppliers'}
              message={
                selectedIds.length === 1
                  ? 'Are you sure you want to delete this supplier? This action cannot be undone.'
                  : `Are you sure you want to delete ${selectedIds.length} suppliers? This action cannot be undone.`
              }
              onConfirm={handleDeleteConfirm}
              onCancel={() => setConfirmOpen(false)}
            />
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

const meta: Meta<typeof DeleteFromListCanaryPage> = {
  title:
    'Use Cases/Reference/Business Affiliates/BA-0005 Delete Supplier/Delete from List (Canary)',
  component: DeleteFromListCanaryPage,
  tags: ['skip-ci'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DeleteFromListCanaryPage>;

/**
 * Select a row, click "Delete Selected", confirm deletion, verify row removed.
 */
export const SingleDelete: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Wait for grid to render
    const firstRow = await canvas.findByText(
      'Apex Medical Distributors',
      { selector: '[role="gridcell"]' },
      { timeout: 10000 },
    );
    expect(firstRow).toBeVisible();
    await storyStepDelay();

    // 2. Click checkbox on first data row (index 0 is header select-all)
    const checkboxes = canvas.getAllByRole('checkbox');
    await userEvent.click(checkboxes[1]);
    await storyStepDelay();

    // 3. Verify "Delete Selected" button is visible
    const deleteButton = await canvas.findByRole('button', { name: /delete selected/i });
    expect(deleteButton).toBeVisible();
    await storyStepDelay();

    // 4. Click "Delete Selected"
    await userEvent.click(deleteButton);

    // 5. Verify confirm dialog opens
    const dialog = await canvas.findByRole('alertdialog', {}, { timeout: 10000 });
    await waitFor(() => {
      expect(dialog).toBeVisible();
    }, { timeout: 10000 });
    expect(within(dialog).getByText('Delete Supplier')).toBeVisible();
    await storyStepDelay();

    // 6. Click "Delete" confirm button
    const confirmButton = within(dialog).getByRole('button', { name: /delete/i });
    await userEvent.click(confirmButton);

    // 7. Verify dialog closes
    await waitFor(() => {
      expect(canvas.queryByRole('alertdialog')).not.toBeInTheDocument();
    }, { timeout: 10000 });
    await storyStepDelay();

    // 8. Verify row removed from grid
    await waitFor(() => {
      expect(canvas.queryByText('Apex Medical Distributors')).not.toBeInTheDocument();
    }, { timeout: 10000 });
  },
};

/**
 * Select 3 rows, click "Delete Selected", confirm bulk deletion, verify rows removed.
 */
export const BulkDelete: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Apex Medical Distributors', { selector: '[role="gridcell"]' }, { timeout: 10000 });
    await storyStepDelay();

    // Select 3 rows
    const checkboxes = canvas.getAllByRole('checkbox');
    await userEvent.click(checkboxes[1]); // row 1
    await userEvent.click(checkboxes[2]); // row 2
    await userEvent.click(checkboxes[3]); // row 3
    await storyStepDelay();

    // Click "Delete Selected"
    const deleteButton = canvas.getByRole('button', { name: /delete selected/i });
    await userEvent.click(deleteButton);

    // Verify confirm dialog
    const dialog = await canvas.findByRole('alertdialog', {}, { timeout: 10000 });
    expect(dialog).toBeVisible();
    await storyStepDelay();

    // Click "Delete" confirm
    const confirmButton = within(dialog).getByRole('button', { name: /delete/i });
    await userEvent.click(confirmButton);

    // Verify dialog closes
    await waitFor(() => {
      expect(canvas.queryByRole('alertdialog')).not.toBeInTheDocument();
    }, { timeout: 10000 });

    // Verify rows removed — Apex Medical should be gone
    await waitFor(() => {
      expect(canvas.queryByText('Apex Medical Distributors')).not.toBeInTheDocument();
    }, { timeout: 10000 });
  },
};

/**
 * Select a row, click "Delete Selected", verify dialog, cancel, verify row still present.
 */
export const CancelDelete: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Apex Medical Distributors', { selector: '[role="gridcell"]' }, { timeout: 10000 });
    await storyStepDelay();

    // Select row 1
    const checkboxes = canvas.getAllByRole('checkbox');
    await userEvent.click(checkboxes[1]);
    await storyStepDelay();

    // Click "Delete Selected"
    const deleteButton = canvas.getByRole('button', { name: /delete selected/i });
    await userEvent.click(deleteButton);

    // Verify confirm dialog
    const dialog = await canvas.findByRole('alertdialog', {}, { timeout: 10000 });
    expect(dialog).toBeVisible();
    await storyStepDelay();

    // Click "Cancel"
    const cancelButton = within(dialog).getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    // Verify dialog closes
    await waitFor(() => {
      expect(canvas.queryByRole('alertdialog')).not.toBeInTheDocument();
    }, { timeout: 10000 });

    // Verify row still present
    expect(canvas.getByText('Apex Medical Distributors', { selector: '[role="gridcell"]' })).toBeVisible();
  },
};
