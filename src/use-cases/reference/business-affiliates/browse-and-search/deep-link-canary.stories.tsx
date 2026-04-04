/**
 * REF::BA::0001 — Deep Link (Canary Variant)
 *
 * Uses createEntityDataGrid with onRowClick to open a canary ItemDetails
 * detail panel. Accepts an initialAffiliateId arg to auto-open the drawer
 * for a specific supplier on mount.
 *
 * Maps to: BA::0001::0007
 */
import { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, waitFor } from 'storybook/test';
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
// Helper: supplier -> field list
// ---------------------------------------------------------------------------

function supplierToFields(supplier: SupplierEntity): FieldDef[] {
  const fields: FieldDef[] = [{ key: 'id', label: 'ID', value: supplier.id }];
  if (supplier.roles.length > 0)
    fields.push({ key: 'roles', label: 'Roles', value: supplier.roles.join(', ') });
  if (supplier.contact) fields.push({ key: 'contact', label: 'Contact', value: supplier.contact });
  if (supplier.email) fields.push({ key: 'email', label: 'Email', value: supplier.email });
  if (supplier.city || supplier.state)
    fields.push({ key: 'location', label: 'Location', value: [supplier.city, supplier.state].filter(Boolean).join(', ') });
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
  displayName: 'SupplierDeepLinkGrid',
  persistenceKeyPrefix: 'canary-supplier-deep-link-grid',
  columnDefs: supplierColDefs,
  defaultColDef: { resizable: true, sortable: true, filter: false },
  getEntityId: (s) => s.id,
  enableDragToScroll: true,
});

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

function DeepLinkCanaryPage({ initialAffiliateId }: { initialAffiliateId?: string }) {
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierEntity | null>(null);

  // Auto-open detail panel for the initial affiliate on mount
  useEffect(() => {
    if (initialAffiliateId) {
      const match = supplierMockData.find((s) => s.id === initialAffiliateId);
      if (match) {
        setSelectedSupplier(match);
      }
    }
  }, [initialAffiliateId]);

  const actions = [
    {
      key: 'edit',
      label: 'Edit',
      icon: SquarePen,
      onAction: () => console.log('Edit:', selectedSupplier?.name),
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: Trash2,
      onAction: () => console.log('Delete:', selectedSupplier?.name),
    },
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
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Suppliers</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Click any row to view supplier details, or deep-link via URL.
              </p>
            </div>
            <div style={{ height: 400 }}>
              <SupplierGrid
                data={supplierMockData}
                activeTab="deep-link"
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

const meta: Meta<typeof DeepLinkCanaryPage> = {
  title:
    'Use Cases/Reference/Business Affiliates/BA-0001 Browse and Search/Deep Link (Canary)',
  component: DeepLinkCanaryPage,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DeepLinkCanaryPage>;

/**
 * Default — deep-links to "Apex Medical Distributors" (sup-001). Verifies
 * the grid renders, the detail panel auto-opens, and the panel shows the
 * supplier name.
 */
export const Default: Story = {
  args: {
    initialAffiliateId: 'sup-001',
  },
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

    await step('Detail panel auto-opens for deep-linked supplier', async () => {
      await waitFor(
        () => {
          const dialog = canvas.getByRole('dialog');
          expect(dialog).toBeVisible();
        },
        { timeout: 10000 },
      );
    });

    await storyStepDelay();

    await step('Detail panel shows supplier name', async () => {
      const dialog = canvas.getByRole('dialog');
      const drawerScope = within(dialog);
      expect(
        drawerScope.getByText('Apex Medical Distributors'),
      ).toBeVisible();
    });

    await storyStepDelay();
  },
};
