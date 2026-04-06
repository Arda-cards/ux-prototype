/**
 * REF::BA::0003::0002 — Create Supplier: Validation Errors (Canary)
 *
 * Canary variant using the page shell with grid + create drawer.
 * The page has an "Add Supplier" button that opens a create drawer
 * with a Name input and a Save button. Save is disabled when Name is empty.
 *
 * Stories: EmptyNameBlocked, NetworkError, DuplicateNameError
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
  Plus,
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
  displayName: 'CreateValidationGrid',
  persistenceKeyPrefix: 'canary-create-validation-grid',
  columnDefs: supplierColDefs,
  defaultColDef: { resizable: true, sortable: true, filter: false },
  getEntityId: (s) => s.id,
});

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

function CreateValidationCanaryPage({ simulateError }: { simulateError?: 'network' | 'duplicate' }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSaveDisabled = !newName.trim();

  const handleSave = () => {
    if (!isSaveDisabled) {
      if (simulateError === 'network') {
        setErrorMessage('Internal server error. Please try again later.');
        return;
      }
      if (simulateError === 'duplicate') {
        setErrorMessage('A supplier with this name already exists.');
        return;
      }
      console.log('Saving new supplier:', newName);
      setDrawerOpen(false);
      setNewName('');
      setErrorMessage(null);
    }
  };

  const createFields: FieldDef[] = [
    { key: 'name', label: 'Name', value: newName },
  ];

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
                  Create a new supplier. Name is required.
                </p>
              </div>
              <Button size="sm" onClick={() => setDrawerOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add Supplier
              </Button>
            </div>
            <div style={{ height: 360 }}>
              <SupplierGrid
                data={supplierMockData}
                activeTab="create-validation"
              />
            </div>
          </main>

          {/* Create drawer */}
          <ItemDetails
            open={drawerOpen}
            onOpenChange={(open) => {
              if (!open) {
                setDrawerOpen(false);
                setNewName('');
                setErrorMessage(null);
              }
            }}
            title="New Supplier"
            fields={createFields}
            tabs={[{ key: 'create', label: 'Create' }]}
            actions={[]}
          >
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label htmlFor="create-name" style={{ fontSize: 14, fontWeight: 500 }}>
                  Name
                </label>
                <input
                  id="create-name"
                  aria-label="Name"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
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
              <Button
                onClick={handleSave}
                disabled={isSaveDisabled}
                aria-label="Save"
              >
                Save
              </Button>
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

const meta: Meta<typeof CreateValidationCanaryPage> = {
  title:
    'Use Cases/Reference/Business Affiliates/BA-0003 Create Supplier/Validation Errors (Canary)',
  component: CreateValidationCanaryPage,
  tags: ['skip-ci'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof CreateValidationCanaryPage>;

// ---------------------------------------------------------------------------
// EmptyNameBlocked
// ---------------------------------------------------------------------------

/**
 * Verifies that the Save button is disabled when the Name field is empty,
 * and becomes enabled once a name is typed.
 */
export const EmptyNameBlocked: Story = {
  name: 'Empty Name Blocked',
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

    await step('Click Add Supplier to open create drawer', async () => {
      const addButton = canvas.getByRole('button', { name: /add supplier/i });
      await userEvent.click(addButton);
    });

    await storyStepDelay();

    await step('Verify drawer opens', async () => {
      const dialogs = screen.getAllByRole('dialog');
      expect(dialogs.length).toBeGreaterThan(0);
      const drawer = dialogs[dialogs.length - 1]!;
      await waitFor(() => expect(drawer).toBeVisible(), { timeout: 10000 });
    });

    await step('Verify Save is disabled when Name is empty', async () => {
      const dialogs = screen.getAllByRole('dialog');
      const drawer = within(dialogs[dialogs.length - 1]!);
      const saveButton = drawer.getByRole('button', { name: /save/i });
      expect(saveButton).toBeDisabled();
    });

    await storyStepDelay();

    await step('Type a name and verify Save becomes enabled', async () => {
      const dialogs = screen.getAllByRole('dialog');
      const drawer = within(dialogs[dialogs.length - 1]!);
      const nameInput = drawer.getByLabelText(/name/i);
      await userEvent.type(nameInput, 'New Test Supplier');

      await waitFor(() => {
        const saveButton = drawer.getByRole('button', { name: /save/i });
        expect(saveButton).toBeEnabled();
      }, { timeout: 10000 });
    });

    await storyStepDelay();
  },
};

// ---------------------------------------------------------------------------
// NetworkError
// ---------------------------------------------------------------------------

/**
 * Fills in a supplier name and clicks Save. A simulated network error
 * is shown inline and the drawer stays open with form data preserved.
 */
export const NetworkError: Story = {
  name: 'Network Error',
  render: () => <CreateValidationCanaryPage simulateError="network" />,
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

    await step('Click Add Supplier to open create drawer', async () => {
      const addButton = canvas.getByRole('button', { name: /add supplier/i });
      await userEvent.click(addButton);
    });

    await storyStepDelay();

    await step('Verify drawer opens', async () => {
      const dialogs = screen.getAllByRole('dialog');
      expect(dialogs.length).toBeGreaterThan(0);
      const drawer = dialogs[dialogs.length - 1]!;
      await waitFor(() => expect(drawer).toBeVisible(), { timeout: 10000 });
    });

    await step('Type a name', async () => {
      const dialogs = screen.getAllByRole('dialog');
      const drawer = within(dialogs[dialogs.length - 1]!);
      const nameInput = drawer.getByLabelText(/name/i);
      await userEvent.type(nameInput, 'New Test Supplier');
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

    await step('Verify drawer stays open and form data preserved', async () => {
      const dialogs = screen.getAllByRole('dialog');
      const drawer = within(dialogs[dialogs.length - 1]!);
      const nameInput = drawer.getByLabelText(/name/i);
      expect(nameInput).toHaveValue('New Test Supplier');
    });

    await storyStepDelay();
  },
};

// ---------------------------------------------------------------------------
// DuplicateNameError
// ---------------------------------------------------------------------------

/**
 * Fills in a supplier name and clicks Save. A simulated duplicate-name
 * error is shown inline and the drawer stays open with form data preserved.
 */
export const DuplicateNameError: Story = {
  name: 'Duplicate Name Error',
  render: () => <CreateValidationCanaryPage simulateError="duplicate" />,
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

    await step('Click Add Supplier to open create drawer', async () => {
      const addButton = canvas.getByRole('button', { name: /add supplier/i });
      await userEvent.click(addButton);
    });

    await storyStepDelay();

    await step('Verify drawer opens', async () => {
      const dialogs = screen.getAllByRole('dialog');
      expect(dialogs.length).toBeGreaterThan(0);
      const drawer = dialogs[dialogs.length - 1]!;
      await waitFor(() => expect(drawer).toBeVisible(), { timeout: 10000 });
    });

    await step('Type an existing supplier name', async () => {
      const dialogs = screen.getAllByRole('dialog');
      const drawer = within(dialogs[dialogs.length - 1]!);
      const nameInput = drawer.getByLabelText(/name/i);
      await userEvent.type(nameInput, 'Apex Medical Distributors');
    });

    await storyStepDelay();

    await step('Click Save and verify duplicate error appears', async () => {
      const dialogs = screen.getAllByRole('dialog');
      const drawer = within(dialogs[dialogs.length - 1]!);
      const saveButton = drawer.getByRole('button', { name: /save/i });
      await userEvent.click(saveButton);

      await waitFor(() => {
        const alert = drawer.getByRole('alert');
        expect(alert).toHaveTextContent('A supplier with this name already exists');
      }, { timeout: 10000 });
    });

    await step('Verify drawer stays open and form data preserved', async () => {
      const dialogs = screen.getAllByRole('dialog');
      const drawer = within(dialogs[dialogs.length - 1]!);
      const nameInput = drawer.getByLabelText(/name/i);
      expect(nameInput).toHaveValue('Apex Medical Distributors');
    });

    await storyStepDelay();
  },
};
