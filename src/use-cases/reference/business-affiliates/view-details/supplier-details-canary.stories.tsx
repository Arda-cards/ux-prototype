/**
 * REF::BA::0002 — View Business Affiliate Details (Canary Variant)
 *
 * Click a row in the canary supplier grid to open a detail panel
 * built from canary ArdaItemDetails and ArdaFieldList.
 *
 * Maps to: REF::BA::0002 — View Business Affiliate Details
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
  Trash2,
} from 'lucide-react';

import { SidebarInset, SidebarTrigger } from '@/components/canary/primitives/sidebar';
import { ArdaSidebar } from '@/components/canary/organisms/sidebar/sidebar';
import { ArdaSidebarHeader } from '@/components/canary/molecules/sidebar/sidebar-header';
import { SidebarNav } from '@/components/canary/molecules/sidebar/sidebar-nav';
import { SidebarNavItem } from '@/components/canary/molecules/sidebar/sidebar-nav-item';
import { SidebarUserMenu } from '@/components/canary/molecules/sidebar/sidebar-user-menu';
import { ArdaAppHeader } from '@/components/canary/organisms/app-header/app-header';
import { ArdaItemDetails } from '@/components/canary/organisms/item-details/item-details';
import type { FieldDef } from '@/components/canary/molecules/field-list/field-list';
import { createEntityDataGrid } from '@/components/canary/organisms/shared/entity-data-grid/create-entity-data-grid';
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
  {
    id: 'sup-001',
    name: 'Apex Medical Distributors',
    contact: 'Dr. Maria Santos',
    email: 'msantos@apexmedical.com',
    phone: '(555) 123-4567',
    city: 'Denver',
    state: 'CO',
    taxId: '11-2233445',
    website: 'https://apexmedical.com',
    notes: 'Preferred vendor for surgical instruments and disposables.',
    roles: ['VENDOR'],
  },
  {
    id: 'sup-002',
    name: 'BioTech Supplies Inc.',
    contact: 'James Lee',
    email: 'jlee@biotechsupplies.com',
    phone: '(555) 234-5678',
    city: 'Boston',
    state: 'MA',
    roles: ['VENDOR', 'CARRIER'],
  },
  {
    id: 'sup-003',
    name: 'Cardinal Health',
    contact: 'Susan Williams',
    email: 'swilliams@cardinalhealth.com',
    phone: '(555) 345-6789',
    city: 'Dublin',
    state: 'OH',
    taxId: '55-6677889',
    website: 'https://cardinalhealth.com',
    roles: ['VENDOR'],
  },
  {
    id: 'sup-004',
    name: 'ColdChain Direct',
    city: 'Chicago',
    state: 'IL',
    roles: ['CARRIER'],
  },
  {
    id: 'sup-005',
    name: 'Delta Pharma Group',
    contact: 'Robert Chen',
    email: 'rchen@deltapharma.com',
    phone: '(555) 456-7890',
    city: 'Atlanta',
    state: 'GA',
    roles: ['VENDOR', 'CUSTOMER'],
  },
];

// ---------------------------------------------------------------------------
// Helper: supplier → field list
// ---------------------------------------------------------------------------

function supplierToFields(supplier: SupplierEntity): FieldDef[] {
  const fields: FieldDef[] = [{ key: 'id', label: 'ID', value: supplier.id }];
  if (supplier.roles.length > 0)
    fields.push({ key: 'roles', label: 'Roles', value: supplier.roles.join(', ') });
  if (supplier.contact) fields.push({ key: 'contact', label: 'Contact', value: supplier.contact });
  if (supplier.email) fields.push({ key: 'email', label: 'Email', value: supplier.email });
  if (supplier.phone) fields.push({ key: 'phone', label: 'Phone', value: supplier.phone });
  if (supplier.city || supplier.state)
    fields.push({
      key: 'location',
      label: 'Location',
      value: [supplier.city, supplier.state].filter(Boolean).join(', '),
    });
  if (supplier.taxId) fields.push({ key: 'taxId', label: 'Tax ID', value: supplier.taxId });
  if (supplier.website)
    fields.push({ key: 'website', label: 'Website', value: supplier.website });
  if (supplier.notes) fields.push({ key: 'notes', label: 'Notes', value: supplier.notes });
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
  displayName: 'SupplierDetailGrid',
  persistenceKeyPrefix: 'canary-supplier-detail-grid',
  columnDefs: supplierColDefs,
  defaultColDef: { resizable: true, sortable: true, filter: false },
  getEntityId: (s) => s.id,
});

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

function SupplierDetailsCanaryPage() {
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierEntity | null>(null);

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
    <ArdaSidebar
      defaultOpen
      content={
        <SidebarInset>
          <ArdaAppHeader
            leading={<SidebarTrigger className="self-center" />}
            showSearch={false}
          />
          <main className="flex flex-1 flex-col gap-4 p-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Suppliers</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Click any row to view supplier details.
              </p>
            </div>
            <div style={{ height: 360 }}>
              <SupplierGrid
                data={supplierMockData}
                activeTab="supplier-details"
                onRowClick={setSelectedSupplier}
              />
            </div>
          </main>

          {/* Supplier detail drawer */}
          <ArdaItemDetails
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
      <ArdaSidebarHeader teamName="Arda Cards" />
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
    </ArdaSidebar>
  );
}

// ---------------------------------------------------------------------------
// Story meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof SupplierDetailsCanaryPage> = {
  title:
    'Use Cases/Reference/Business Affiliates/BA-0002 View Details/Supplier Details (Canary)',
  component: SupplierDetailsCanaryPage,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SupplierDetailsCanaryPage>;

/**
 * Default — click a supplier row to view its details in the canary detail panel.
 * Play function: click row, verify drawer opens, check field values,
 * close the drawer.
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

    await step('Click first row to open detail drawer', async () => {
      const firstRow = canvas.getByText('Apex Medical Distributors', {
        selector: '[role="gridcell"]',
      });
      await userEvent.click(firstRow);
      // Drawer renders via Radix portal outside canvasElement — use screen
      await waitFor(
        () => {
          expect(screen.getByRole('dialog')).toBeVisible();
        },
        { timeout: 10000 },
      );
    });

    await storyStepDelay();

    await step('Drawer shows supplier name and key fields', async () => {
      // Scope queries to the portal dialog so we don't match grid cells
      const drawer = within(screen.getByRole('dialog'));
      expect(drawer.getByText('Apex Medical Distributors')).toBeVisible();
      expect(drawer.getByText('Dr. Maria Santos')).toBeVisible();
      expect(drawer.getByText('msantos@apexmedical.com')).toBeVisible();
    });

    await storyStepDelay();

    await step('Close the drawer', async () => {
      // Close button is inside the portal — scope to dialog
      const drawer = within(screen.getByRole('dialog'));
      const closeButton = drawer.getByRole('button', { name: /close/i });
      await userEvent.click(closeButton);
      await waitFor(
        () => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        },
        { timeout: 10000 },
      );
    });

    await storyStepDelay();
  },
};
