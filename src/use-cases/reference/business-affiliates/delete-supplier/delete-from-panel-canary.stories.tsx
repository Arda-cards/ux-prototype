/**
 * BA::0005::0002 — Delete from Detail Panel (Canary Variant)
 *
 * Self-contained canary page: click a row to open ItemDetails drawer,
 * click Delete action, confirm dialog, supplier removed from local state.
 *
 * Maps to: BA::0005::0002 — Delete from Detail Panel
 */
import { useState, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, userEvent, waitFor, screen } from 'storybook/test';
import type { ColDef } from 'ag-grid-community';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Building2,
  Settings,
  ShieldCheck,
  LogOut,
  SquarePen,
  Trash2,
} from 'lucide-react';

import { SidebarInset, SidebarTrigger } from '@/components/canary/primitives/sidebar';
import { Sidebar } from '@/components/canary/organisms/sidebar/sidebar';
import { SidebarHeader } from '@/components/canary/molecules/sidebar/sidebar-header';
import { SidebarNav } from '@/components/canary/molecules/sidebar/sidebar-nav';
import { SidebarNavItem } from '@/components/canary/molecules/sidebar/sidebar-nav-item';
import { SidebarUserMenu } from '@/components/canary/molecules/sidebar/sidebar-user-menu';
import { AppHeader } from '@/components/canary/organisms/app-header/app-header';
import { ItemDetails } from '@/components/canary/organisms/item-details/item-details';
import type { FieldDef } from '@/components/canary/molecules/field-list/field-list';
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
// Helper: supplier to field list
// ---------------------------------------------------------------------------

function supplierToFields(supplier: SupplierEntity): FieldDef[] {
  const fields: FieldDef[] = [{ key: 'id', label: 'ID', value: supplier.id }];
  if (supplier.roles.length > 0)
    fields.push({ key: 'roles', label: 'Roles', value: supplier.roles.join(', ') });
  if (supplier.contact) fields.push({ key: 'contact', label: 'Contact', value: supplier.contact });
  if (supplier.email) fields.push({ key: 'email', label: 'Email', value: supplier.email });
  if (supplier.city || supplier.state)
    fields.push({
      key: 'location',
      label: 'Location',
      value: [supplier.city, supplier.state].filter(Boolean).join(', '),
    });
  return fields;
}

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

const { Component: SupplierGrid } = createEntityDataGrid<SupplierEntity>({
  displayName: 'DeletePanelSupplierGrid',
  persistenceKeyPrefix: 'canary-delete-panel-grid',
  columnDefs: supplierColDefs,
  defaultColDef: { resizable: true, sortable: true, filter: false },
  getEntityId: (s) => s.id,
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

function DeleteFromPanelCanaryPage() {
  const [suppliers, setSuppliers] = useState<SupplierEntity[]>(supplierMockData);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierEntity | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = useCallback(() => {
    if (!selectedSupplier) return;
    setSuppliers((prev) => prev.filter((s) => s.id !== selectedSupplier.id));
    setSelectedSupplier(null);
    setConfirmOpen(false);
  }, [selectedSupplier]);

  const actions = selectedSupplier
    ? [
        {
          key: 'edit',
          label: 'Edit',
          icon: SquarePen,
          onAction: () => console.log('Edit:', selectedSupplier.name),
        },
        {
          key: 'delete',
          label: 'Delete',
          icon: Trash2,
          onAction: () => setConfirmOpen(true),
        },
      ]
    : [];

  return (
    <Sidebar
      defaultOpen
      content={
        <SidebarInset>
          <AppHeader leading={<SidebarTrigger className="self-center" />} showSearch={false} />
          <main className="flex flex-1 flex-col gap-4 p-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Suppliers</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Click a row to view details. Delete from the detail panel.
              </p>
            </div>
            <div style={{ height: 480 }}>
              <SupplierGrid
                data={suppliers}
                activeTab="delete-panel"
                onRowClick={setSelectedSupplier}
              />
            </div>
          </main>

          {/* Supplier detail drawer */}
          <ItemDetails
            open={!!selectedSupplier}
            onOpenChange={(open) => { if (!open) setSelectedSupplier(null); }}
            title={selectedSupplier?.name ?? ''}
            fields={selectedSupplier ? supplierToFields(selectedSupplier) : []}
            actions={actions}
            tabs={[{ key: 'details', label: 'Details' }]}
          />

          <ConfirmDialog
            open={confirmOpen}
            title="Delete Supplier"
            message={`Are you sure you want to delete ${selectedSupplier?.name ?? 'this supplier'}? This action cannot be undone.`}
            onConfirm={handleDelete}
            onCancel={() => setConfirmOpen(false)}
          />
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

const meta: Meta<typeof DeleteFromPanelCanaryPage> = {
  title:
    'Use Cases/Reference/Business Affiliates/BA-0005 Delete Supplier/Delete from Panel (Canary)',
  component: DeleteFromPanelCanaryPage,
  tags: ['skip-ci'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DeleteFromPanelCanaryPage>;

/**
 * Click a row, open detail drawer, click Delete, confirm, verify supplier removed.
 */
export const ConfirmDelete: Story = {
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

    // 2. Click the first row to open the drawer
    await userEvent.click(firstRow);

    // 3. Verify drawer opens — Radix Sheet may portal outside canvas, use screen
    await waitFor(
      () => {
        const dialogs = screen.getAllByRole('dialog');
        expect(dialogs.length).toBeGreaterThan(0);
      },
      { timeout: 10000 },
    );
    const dialogs = screen.getAllByRole('dialog');
    const drawer = within(dialogs[dialogs.length - 1]);
    await storyStepDelay();

    // 4. Click Delete button in the drawer
    const deleteButton = drawer.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);

    // 5. Verify confirm dialog opens
    const alertDialog = await canvas.findByRole('alertdialog', {}, { timeout: 10000 });
    await waitFor(() => {
      expect(alertDialog).toBeVisible();
    }, { timeout: 10000 });
    expect(within(alertDialog).getByText('Delete Supplier')).toBeVisible();
    await storyStepDelay();

    // 6. Click "Delete" confirm button
    const confirmButton = within(alertDialog).getByRole('button', { name: /delete/i });
    await userEvent.click(confirmButton);

    // 7. Verify dialog closes
    await waitFor(() => {
      expect(canvas.queryByRole('alertdialog')).not.toBeInTheDocument();
    }, { timeout: 10000 });
    await storyStepDelay();

    // 8. Verify supplier removed from grid
    await waitFor(() => {
      expect(canvas.queryByText('Apex Medical Distributors')).not.toBeInTheDocument();
    }, { timeout: 10000 });
  },
};

/**
 * Click a row, open detail drawer, click Delete, cancel, verify dialog closes and drawer stays open.
 */
export const CancelDelete: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Apex Medical Distributors', { selector: '[role="gridcell"]' }, { timeout: 10000 });
    await storyStepDelay();

    // Click row to open drawer
    const firstRow = canvas.getByText('Apex Medical Distributors', { selector: '[role="gridcell"]' });
    await userEvent.click(firstRow);

    // Verify drawer opens (ItemDetails renders via portal — use screen)
    await waitFor(
      () => {
        const dialogs = screen.getAllByRole('dialog');
        expect(dialogs.length).toBeGreaterThan(0);
      },
      { timeout: 10000 },
    );
    await storyStepDelay();

    // Click Delete action in drawer
    const dialogs = screen.getAllByRole('dialog');
    const drawer = within(dialogs[dialogs.length - 1]);
    const deleteButton = drawer.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);

    // Verify confirm dialog
    const confirmDialog = await canvas.findByRole('alertdialog', {}, { timeout: 10000 });
    expect(confirmDialog).toBeVisible();
    await storyStepDelay();

    // Click Cancel
    const cancelButton = within(confirmDialog).getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    // Verify dialog closes
    await waitFor(() => {
      expect(canvas.queryByRole('alertdialog')).not.toBeInTheDocument();
    }, { timeout: 10000 });

    // Verify drawer still open
    await waitFor(() => {
      const remainingDialogs = screen.getAllByRole('dialog');
      expect(remainingDialogs.length).toBeGreaterThan(0);
    }, { timeout: 10000 });
  },
};
