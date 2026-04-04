/**
 * REF::BA::0001 — Pagination (Canary Variant)
 *
 * Tests client-side pagination with the canary entity-data-grid factory.
 * Uses 25 generated suppliers with a page size of 10 to produce 3 pages.
 *
 * Maps to: BA::0001::0006
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
// Mock data — 25 suppliers for pagination
// ---------------------------------------------------------------------------

const paginatedMockData: SupplierEntity[] = Array.from({ length: 25 }, (_, i) => ({
  id: `sup-${String(i + 1).padStart(3, '0')}`,
  name: `Supplier ${String.fromCharCode(65 + i)}${i + 1}`,
  contact: i % 3 === 0 ? `Contact ${i + 1}` : undefined,
  email: `supplier${i + 1}@example.com`,
  city: ['Denver', 'Boston', 'Chicago', 'Atlanta', 'San Jose'][i % 5],
  state: ['CO', 'MA', 'IL', 'GA', 'CA'][i % 5],
  roles: i % 2 === 0 ? ['VENDOR'] : ['CARRIER'],
}));

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
// Canary entity-data-grid for suppliers (client-side pagination)
// ---------------------------------------------------------------------------

const { Component: SupplierGrid } = createEntityDataGrid<SupplierEntity>({
  displayName: 'SupplierPaginationGrid',
  persistenceKeyPrefix: 'canary-supplier-pagination-grid',
  columnDefs: supplierColDefs,
  defaultColDef: { resizable: true, sortable: true, filter: false },
  getEntityId: (s) => s.id,
  paginationMode: 'client',
  pageSize: 10,
  enableDragToScroll: true,
});

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

function PaginationCanaryPage() {
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
                  Browse paginated supplier list (10 per page).
                </p>
              </div>
              <Button size="sm" onClick={() => console.log('Add Supplier')}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add Supplier
              </Button>
            </div>
            <div style={{ height: 540 }}>
              <SupplierGrid
                data={paginatedMockData}
                activeTab="pagination"
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

const meta: Meta<typeof PaginationCanaryPage> = {
  title:
    'Use Cases/Reference/Business Affiliates/BA-0001 Browse and Search/Pagination (Canary)',
  component: PaginationCanaryPage,
  tags: ['skip-ci'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof PaginationCanaryPage>;

/**
 * Default — verify page 1 renders, navigate to page 2, then page 3,
 * verifying data changes between pages.
 */
export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Page 1 renders with first supplier', async () => {
      await canvas.findByText(
        'Supplier A1',
        { selector: '[role="gridcell"]' },
        { timeout: 10000 },
      );
    });

    await storyStepDelay();

    await step('Navigate to page 2', async () => {
      const nextButton = canvas.getByRole('button', { name: 'Next page' });
      expect(nextButton).toBeEnabled();
      await userEvent.click(nextButton);

      await waitFor(
        () => {
          expect(
            canvas.getByText('Supplier K11', { selector: '[role="gridcell"]' }),
          ).toBeVisible();
        },
        { timeout: 10000 },
      );
    });

    await storyStepDelay();

    await step('Navigate to page 3', async () => {
      const nextButton = canvas.getByRole('button', { name: 'Next page' });
      await userEvent.click(nextButton);

      await waitFor(
        () => {
          expect(
            canvas.getByText('Supplier U21', { selector: '[role="gridcell"]' }),
          ).toBeVisible();
        },
        { timeout: 10000 },
      );
    });

    await storyStepDelay();
  },
};
