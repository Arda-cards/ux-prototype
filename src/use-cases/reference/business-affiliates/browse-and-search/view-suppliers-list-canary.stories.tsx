/**
 * REF::BA::0001 — Browse and Search Business Affiliates (Canary Variant)
 *
 * Demonstrates the canary entity-data-grid factory for a non-item entity.
 * Uses Sidebar + AppHeader + createEntityDataGrid for suppliers,
 * proving the factory is generic and not item-domain-specific.
 *
 * Maps to: REF::BA::0001 — Browse and Search Business Affiliates
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
  {
    id: 'sup-001',
    name: 'Apex Medical Distributors',
    contact: 'Dr. Maria Santos',
    email: 'msantos@apexmedical.com',
    city: 'Denver',
    state: 'CO',
    roles: ['VENDOR'],
  },
  {
    id: 'sup-002',
    name: 'BioTech Supplies Inc.',
    contact: 'James Lee',
    email: 'jlee@biotechsupplies.com',
    city: 'Boston',
    state: 'MA',
    roles: ['VENDOR', 'CARRIER'],
  },
  {
    id: 'sup-003',
    name: 'Cardinal Health',
    contact: 'Susan Williams',
    email: 'swilliams@cardinalhealth.com',
    city: 'Dublin',
    state: 'OH',
    roles: ['VENDOR'],
  },
  {
    id: 'sup-004',
    name: 'CleanRoom Solutions',
    email: 'info@cleanroomsolutions.com',
    city: 'San Jose',
    state: 'CA',
    roles: ['VENDOR'],
  },
  {
    id: 'sup-005',
    name: 'ColdChain Direct',
    city: 'Chicago',
    state: 'IL',
    roles: ['CARRIER'],
  },
  {
    id: 'sup-006',
    name: 'Delta Pharma Group',
    contact: 'Robert Chen',
    email: 'rchen@deltapharma.com',
    city: 'Atlanta',
    state: 'GA',
    roles: ['VENDOR', 'CUSTOMER'],
  },
  {
    id: 'sup-007',
    name: 'Eppendorf AG',
    contact: 'Anna Schmidt',
    email: 'aschmidt@eppendorf.com',
    city: 'Hamburg',
    state: '',
    roles: ['VENDOR'],
  },
  {
    id: 'sup-008',
    name: 'Fisher Scientific',
    contact: 'Tom Nguyen',
    email: 'tnguyen@fishersci.com',
    city: 'Pittsburgh',
    state: 'PA',
    roles: ['VENDOR'],
  },
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
  displayName: 'SupplierGrid',
  persistenceKeyPrefix: 'canary-supplier-grid',
  columnDefs: supplierColDefs,
  defaultColDef: { resizable: true, sortable: true, filter: false },
  getEntityId: (s) => s.id,
  searchConfig: {
    fields: ['name', 'contact', 'email', 'city'],
    placeholder: 'Search suppliers\u2026',
  },
  enableDragToScroll: true,
});

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

function SuppliersCanaryPage({ data = supplierMockData }: { data?: SupplierEntity[] }) {
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierEntity | null>(null);

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
                  Business affiliates with a Vendor role.
                </p>
              </div>
              <Button size="sm" onClick={() => console.log('Add Supplier')}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add Supplier
              </Button>
            </div>
            <div style={{ height: 480 }}>
              <SupplierGrid
                data={data}
                activeTab="suppliers"
                onRowClick={setSelectedSupplier}
              />
            </div>
            {selectedSupplier && (
              <p className="text-sm text-muted-foreground">
                Selected: <strong>{selectedSupplier.name}</strong>
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

const meta: Meta<typeof SuppliersCanaryPage> = {
  title:
    'Use Cases/Reference/Business Affiliates/BA-0001 Browse and Search/View Suppliers List (Canary)',
  component: SuppliersCanaryPage,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SuppliersCanaryPage>;

/**
 * Default — supplier list rendered with the canary entity-data-grid factory.
 * Demonstrates that createEntityDataGrid is generic (not items-specific).
 * Play function: verify grid renders, search by name, verify filtered count.
 */
export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Supplier grid renders with data', async () => {
      const firstRow = await canvas.findByText(
        'Apex Medical Distributors',
        { selector: '[role="gridcell"]' },
        { timeout: 10000 },
      );
      expect(firstRow).toBeVisible();
    });

    await storyStepDelay();

    await step('Page header is visible', async () => {
      expect(canvas.getByRole('heading', { name: 'Suppliers', level: 1 })).toBeVisible();
      expect(canvas.getByText('Business affiliates with a Vendor role.')).toBeVisible();
    });

    await storyStepDelay();

    await step('Search filters supplier rows', async () => {
      const searchInput = canvas.getByRole('searchbox');
      await userEvent.type(searchInput, 'cardinal');
      await waitFor(
        () => {
          expect(canvas.getByText(/1 of 8 items/)).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();

    await step('Clear search restores all suppliers', async () => {
      const searchInput = canvas.getByRole('searchbox');
      await userEvent.clear(searchInput);
      await waitFor(
        () => {
          expect(canvas.getByText('8 items')).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();

    await step('Click a row triggers onRowClick', async () => {
      const row = canvas.getByText('Cardinal Health', { selector: '[role="gridcell"]' });
      await userEvent.click(row);
      // Use findByText (async retry) for the selection label; the text is split across nodes
      // so match on the <strong> child text content directly for CI reliability
      await canvas.findByText('Cardinal Health', { selector: 'strong' }, { timeout: 10000 });
    });

    await storyStepDelay();
  },
};

/**
 * EmptyState — render the supplier grid with no data, verify "0 items" appears.
 */
export const EmptyState: Story = {
  render: () => <SuppliersCanaryPage data={[]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The createEntityDataGrid shows "0 items" for an empty grid
    await waitFor(
      () => {
        expect(canvas.getByText('0 items')).toBeVisible();
      },
      { timeout: 10000 },
    );
  },
};

/**
 * LoadingState — render with empty data, verify page header renders but no
 * data rows are present.
 */
export const LoadingState: Story = {
  render: () => <SuppliersCanaryPage data={[]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(
      () => {
        expect(canvas.getByRole('heading', { name: 'Suppliers', level: 1 })).toBeVisible();
      },
      { timeout: 10000 },
    );
    expect(canvas.queryByText('Apex Medical Distributors')).not.toBeInTheDocument();
  },
};

/**
 * ErrorState — render with empty data, verify the page structure renders
 * without any supplier rows.
 */
export const ErrorState: Story = {
  render: () => <SuppliersCanaryPage data={[]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(
      () => {
        expect(canvas.getByRole('heading', { name: 'Suppliers', level: 1 })).toBeVisible();
      },
      { timeout: 10000 },
    );
    expect(canvas.queryByText('Apex Medical Distributors')).not.toBeInTheDocument();
  },
};
