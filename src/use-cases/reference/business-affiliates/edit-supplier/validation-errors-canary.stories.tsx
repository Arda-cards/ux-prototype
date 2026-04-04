/**
 * REF::BA::0004::0002 — Edit Supplier: Validation Errors (Canary)
 *
 * Canary variant using the page shell with grid + detail drawer.
 * Click a row to open view drawer, click Edit to enter edit mode (show inputs),
 * clear Name, verify Save disabled, type new name, verify Save enabled.
 *
 * State machine: view -> edit -> save
 *
 * Stories: ClearRequiredField, CancelDiscards, NetworkError
 */
import { useState } from 'react';
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
import { ItemDetails } from '@/components/canary/organisms/item-details/item-details';
import type { FieldDef } from '@/components/canary/molecules/field-list/field-list';
import { storyStepDelay } from '../_shared/story-step-delay';

// ---------------------------------------------------------------------------
// Supplier entity type
// ---------------------------------------------------------------------------

interface SupplierEntity {
  id: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  taxId?: string;
  website?: string;
  notes?: string;
  roles: string[];
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const supplierMockData: SupplierEntity[] = [
  { id: 'sup-001', name: 'Apex Medical Distributors', contact: 'Dr. Maria Santos', email: 'msantos@apexmedical.com', phone: '(555) 123-4567', city: 'Denver', state: 'CO', taxId: '11-2233445', website: 'https://apexmedical.com', notes: 'Preferred vendor for surgical instruments and disposables.', roles: ['VENDOR'] },
  { id: 'sup-002', name: 'BioTech Supplies Inc.', contact: 'James Lee', email: 'jlee@biotechsupplies.com', phone: '(555) 234-5678', city: 'Boston', state: 'MA', roles: ['VENDOR', 'CARRIER'] },
  { id: 'sup-003', name: 'Cardinal Health', contact: 'Susan Williams', email: 'swilliams@cardinalhealth.com', phone: '(555) 345-6789', city: 'Dublin', state: 'OH', taxId: '55-6677889', website: 'https://cardinalhealth.com', roles: ['VENDOR'] },
  { id: 'sup-004', name: 'ColdChain Direct', city: 'Chicago', state: 'IL', roles: ['CARRIER'] },
  { id: 'sup-005', name: 'Delta Pharma Group', contact: 'Robert Chen', email: 'rchen@deltapharma.com', phone: '(555) 456-7890', city: 'Atlanta', state: 'GA', roles: ['VENDOR', 'CUSTOMER'] },
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

const { Component: SupplierGrid } = createEntityDataGrid<SupplierEntity>({
  displayName: 'EditValidationGrid',
  persistenceKeyPrefix: 'canary-edit-validation-grid',
  columnDefs: supplierColDefs,
  defaultColDef: { resizable: true, sortable: true, filter: false },
  getEntityId: (s) => s.id,
});

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

function EditValidationCanaryPage({ simulateError }: { simulateError?: 'network' }) {
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierEntity | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const drawerOpen = selectedSupplier !== null;

  const isSaveDisabled = !editName.trim();

  const handleRowClick = (supplier: SupplierEntity) => {
    setSelectedSupplier(supplier);
    setIsEditing(false);
    setEditName(supplier.name);
    setErrorMessage(null);
  };

  const handleEdit = () => {
    if (selectedSupplier) {
      setIsEditing(true);
      setEditName(selectedSupplier.name);
      setErrorMessage(null);
    }
  };

  const handleSave = () => {
    if (!isSaveDisabled && selectedSupplier) {
      if (simulateError === 'network') {
        setErrorMessage('Internal server error. Please try again later.');
        return;
      }
      console.log('Saving updated supplier:', editName);
      setSelectedSupplier({ ...selectedSupplier, name: editName });
      setIsEditing(false);
      setErrorMessage(null);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (selectedSupplier) {
      setEditName(selectedSupplier.name);
    }
    setErrorMessage(null);
  };

  const handleClose = () => {
    setSelectedSupplier(null);
    setIsEditing(false);
    setErrorMessage(null);
  };

  const viewFields: FieldDef[] = selectedSupplier
    ? [
        { key: 'name', label: 'Name', value: selectedSupplier.name },
        { key: 'contact', label: 'Contact', value: selectedSupplier.contact ?? '\u2014' },
        { key: 'email', label: 'Email', value: selectedSupplier.email ?? '\u2014' },
        { key: 'phone', label: 'Phone', value: selectedSupplier.phone ?? '\u2014' },
        { key: 'city', label: 'City', value: selectedSupplier.city ?? '\u2014' },
        { key: 'state', label: 'State', value: selectedSupplier.state ?? '\u2014' },
      ]
    : [];

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
                  Click a row to view details. Edit to modify.
                </p>
              </div>
            </div>
            <div style={{ height: 360 }}>
              <SupplierGrid
                data={supplierMockData}
                activeTab="edit-validation"
                onRowClick={handleRowClick}
              />
            </div>
          </main>

          {/* View / Edit drawer */}
          <ItemDetails
            open={drawerOpen}
            onOpenChange={(open) => {
              if (!open) handleClose();
            }}
            title={selectedSupplier?.name ?? ''}
            fields={isEditing ? [] : viewFields}
            tabs={[{ key: 'details', label: 'Details' }]}
            actions={
              isEditing
                ? []
                : [
                    {
                      key: 'edit',
                      label: 'Edit',
                      icon: SquarePen,
                      onAction: handleEdit,
                    },
                  ]
            }
          >
            {isEditing && (
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label htmlFor="edit-name" style={{ fontSize: 14, fontWeight: 500 }}>
                    Name
                  </label>
                  <input
                    id="edit-name"
                    aria-label="Name"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter supplier name"
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: 6,
                      fontSize: 14,
                      width: '100%',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    onClick={handleSave}
                    disabled={isSaveDisabled}
                    aria-label="Save"
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    aria-label="Cancel"
                  >
                    Cancel
                  </Button>
                </div>
                {errorMessage && (
                  <div
                    role="alert"
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: 6,
                      color: '#dc2626',
                      fontSize: 14,
                    }}
                  >
                    {errorMessage}
                  </div>
                )}
              </div>
            )}
          </ItemDetails>
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

const meta: Meta<typeof EditValidationCanaryPage> = {
  title:
    'Use Cases/Reference/Business Affiliates/BA-0004 Edit Supplier/Validation Errors (Canary)',
  component: EditValidationCanaryPage,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof EditValidationCanaryPage>;

// ---------------------------------------------------------------------------
// ClearRequiredField
// ---------------------------------------------------------------------------

/**
 * Opens Apex Medical Distributors, enters edit mode, clears the Name field,
 * verifies Save is disabled, then types a new name and verifies Save re-enables.
 */
export const ClearRequiredField: Story = {
  name: 'Clear Required Field',
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Wait for grid to render', async () => {
      await canvas.findByText(
        'Apex Medical Distributors',
        { selector: '[role="gridcell"]' },
        { timeout: 10000 },
      );
    });

    await storyStepDelay();

    await step('Click Apex Medical row to open drawer', async () => {
      const row = canvas.getByText('Apex Medical Distributors', {
        selector: '[role="gridcell"]',
      });
      await userEvent.click(row);
    });

    await storyStepDelay();

    await step('Verify drawer opens', async () => {
      const dialogs = screen.getAllByRole('dialog');
      expect(dialogs.length).toBeGreaterThan(0);
      const drawer = dialogs[dialogs.length - 1]!;
      await waitFor(() => expect(drawer).toBeVisible(), { timeout: 10000 });
    });

    await step('Click Edit action button', async () => {
      const dialogs = screen.getAllByRole('dialog');
      const drawer = within(dialogs[dialogs.length - 1]!);
      const editButton = drawer.getByRole('button', { name: /edit/i });
      await userEvent.click(editButton);
    });

    await storyStepDelay();

    await step('Verify edit mode (name input appears)', async () => {
      const dialogs = screen.getAllByRole('dialog');
      const drawer = within(dialogs[dialogs.length - 1]!);
      await waitFor(() => {
        expect(drawer.getByLabelText(/name/i)).toBeVisible();
      }, { timeout: 10000 });
    });

    await step('Clear name input and verify Save is disabled', async () => {
      const dialogs = screen.getAllByRole('dialog');
      const drawer = within(dialogs[dialogs.length - 1]!);
      const nameInput = drawer.getByLabelText(/name/i);
      await userEvent.clear(nameInput);

      await waitFor(() => {
        const saveButton = drawer.getByRole('button', { name: /save/i });
        expect(saveButton).toBeDisabled();
      }, { timeout: 10000 });
    });

    await storyStepDelay();

    await step('Type new name and verify Save becomes enabled', async () => {
      const dialogs = screen.getAllByRole('dialog');
      const drawer = within(dialogs[dialogs.length - 1]!);
      const nameInput = drawer.getByLabelText(/name/i);
      await userEvent.type(nameInput, 'Updated Supplier Name');

      await waitFor(() => {
        const saveButton = drawer.getByRole('button', { name: /save/i });
        expect(saveButton).toBeEnabled();
      }, { timeout: 10000 });
    });

    await storyStepDelay();
  },
};

// ---------------------------------------------------------------------------
// CancelDiscards
// ---------------------------------------------------------------------------

/**
 * Opens Apex Medical Distributors, enters edit mode, modifies the name,
 * clicks Cancel, and verifies the drawer returns to view mode with the
 * original name displayed.
 */
export const CancelDiscards: Story = {
  name: 'Cancel Discards',
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Wait for grid to render', async () => {
      await canvas.findByText(
        'Apex Medical Distributors',
        { selector: '[role="gridcell"]' },
        { timeout: 10000 },
      );
    });

    await storyStepDelay();

    await step('Click Apex Medical row to open drawer', async () => {
      const row = canvas.getByText('Apex Medical Distributors', {
        selector: '[role="gridcell"]',
      });
      await userEvent.click(row);
    });

    await storyStepDelay();

    await step('Verify drawer opens', async () => {
      const dialogs = screen.getAllByRole('dialog');
      expect(dialogs.length).toBeGreaterThan(0);
      const drawer = dialogs[dialogs.length - 1]!;
      await waitFor(() => expect(drawer).toBeVisible(), { timeout: 10000 });
    });

    await step('Click Edit action button', async () => {
      const dialogs = screen.getAllByRole('dialog');
      const drawer = within(dialogs[dialogs.length - 1]!);
      const editButton = drawer.getByRole('button', { name: /edit/i });
      await userEvent.click(editButton);
    });

    await storyStepDelay();

    await step('Verify edit mode and modify name', async () => {
      const dialogs = screen.getAllByRole('dialog');
      const drawer = within(dialogs[dialogs.length - 1]!);
      const nameInput = drawer.getByLabelText(/name/i);
      await waitFor(() => expect(nameInput).toBeVisible(), { timeout: 10000 });
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Modified Supplier Name');
    });

    await storyStepDelay();

    await step('Click Cancel', async () => {
      const dialogs = screen.getAllByRole('dialog');
      const drawer = within(dialogs[dialogs.length - 1]!);
      const cancelButton = drawer.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);
    });

    await storyStepDelay();

    await step('Verify drawer returns to view mode with original name', async () => {
      const dialogs = screen.getAllByRole('dialog');
      const drawer = within(dialogs[dialogs.length - 1]!);

      // Edit mode inputs should be gone — Edit button should reappear
      await waitFor(() => {
        expect(drawer.getByRole('button', { name: /edit/i })).toBeVisible();
      }, { timeout: 10000 });

      // Original name should be displayed in view fields
      expect(drawer.getByText('Apex Medical Distributors')).toBeVisible();
    });

    await storyStepDelay();
  },
};

// ---------------------------------------------------------------------------
// NetworkError
// ---------------------------------------------------------------------------

/**
 * Opens Apex Medical Distributors, enters edit mode, modifies the name,
 * clicks Save with a simulated network error, and verifies the error
 * message is shown while the drawer stays in edit mode with data preserved.
 */
export const NetworkError: Story = {
  name: 'Network Error',
  render: () => <EditValidationCanaryPage simulateError="network" />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Wait for grid to render', async () => {
      await canvas.findByText(
        'Apex Medical Distributors',
        { selector: '[role="gridcell"]' },
        { timeout: 10000 },
      );
    });

    await storyStepDelay();

    await step('Click Apex Medical row to open drawer', async () => {
      const row = canvas.getByText('Apex Medical Distributors', {
        selector: '[role="gridcell"]',
      });
      await userEvent.click(row);
    });

    await storyStepDelay();

    await step('Verify drawer opens', async () => {
      const dialogs = screen.getAllByRole('dialog');
      expect(dialogs.length).toBeGreaterThan(0);
      const drawer = dialogs[dialogs.length - 1]!;
      await waitFor(() => expect(drawer).toBeVisible(), { timeout: 10000 });
    });

    await step('Click Edit action button', async () => {
      const dialogs = screen.getAllByRole('dialog');
      const drawer = within(dialogs[dialogs.length - 1]!);
      const editButton = drawer.getByRole('button', { name: /edit/i });
      await userEvent.click(editButton);
    });

    await storyStepDelay();

    await step('Modify the name', async () => {
      const dialogs = screen.getAllByRole('dialog');
      const drawer = within(dialogs[dialogs.length - 1]!);
      const nameInput = drawer.getByLabelText(/name/i);
      await waitFor(() => expect(nameInput).toBeVisible(), { timeout: 10000 });
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Updated Supplier Name');
    });

    await storyStepDelay();

    await step('Click Save and verify network error appears', async () => {
      const dialogs = screen.getAllByRole('dialog');
      const drawer = within(dialogs[dialogs.length - 1]!);
      const saveButton = drawer.getByRole('button', { name: /save/i });
      await userEvent.click(saveButton);

      await waitFor(() => {
        const alert = drawer.getByRole('alert');
        expect(alert).toHaveTextContent('Internal server error');
      }, { timeout: 10000 });
    });

    await step('Verify drawer stays in edit mode with data preserved', async () => {
      const dialogs = screen.getAllByRole('dialog');
      const drawer = within(dialogs[dialogs.length - 1]!);
      const nameInput = drawer.getByLabelText(/name/i);
      expect(nameInput).toHaveValue('Updated Supplier Name');
    });

    await storyStepDelay();
  },
};
