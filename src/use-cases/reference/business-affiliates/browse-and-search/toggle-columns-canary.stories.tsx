/**
 * REF::BA::0001 — Toggle Columns (Canary Variant)
 *
 * Tests column visibility toggle via a self-contained View dropdown with
 * checkboxes and Save/Cancel semantics. Uses the canary entity-data-grid
 * columnVisibility prop to show/hide columns.
 *
 * Maps to: BA::0001::0003
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

const COLUMN_FIELDS = ['name', 'contact', 'email', 'city', 'state', 'roles'] as const;

const COLUMN_LABELS: Record<string, string> = {
  name: 'Name',
  contact: 'Contact',
  email: 'Email',
  city: 'City',
  state: 'State',
  roles: 'Roles',
};

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
  displayName: 'SupplierToggleColsGrid',
  persistenceKeyPrefix: 'canary-supplier-toggle-cols-grid',
  columnDefs: supplierColDefs,
  defaultColDef: { resizable: true, sortable: true, filter: false },
  getEntityId: (s) => s.id,
  enableDragToScroll: true,
});

// ---------------------------------------------------------------------------
// Column visibility dropdown
// ---------------------------------------------------------------------------

function ColumnVisibilityDropdown({
  visibility,
  onSave,
}: {
  visibility: Record<string, boolean>;
  onSave: (next: Record<string, boolean>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, boolean>>(visibility);

  const handleOpen = () => {
    setDraft({ ...visibility });
    setOpen(true);
  };

  const handleSave = () => {
    onSave(draft);
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleShowAll = () => {
    const next: Record<string, boolean> = {};
    for (const f of COLUMN_FIELDS) next[f] = true;
    setDraft(next);
  };

  const handleHideAll = () => {
    const next: Record<string, boolean> = {};
    for (const f of COLUMN_FIELDS) next[f] = f === 'name'; // always keep Name
    setDraft(next);
  };

  return (
    <div className="relative">
      <Button
        size="sm"
        variant="outline"
        onClick={handleOpen}
        aria-label="Toggle column visibility"
      >
        View
      </Button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-md border bg-popover p-3 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={handleShowAll}
              className="text-xs text-primary hover:underline"
            >
              Show All
            </button>
            <button
              onClick={handleHideAll}
              className="text-xs text-primary hover:underline"
            >
              Hide All
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            {COLUMN_FIELDS.map((field) => (
              <label key={field} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft[field] !== false}
                  disabled={field === 'name'}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, [field]: e.target.checked }))
                  }
                />
                {COLUMN_LABELS[field]}
              </label>
            ))}
          </div>
          <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t">
            <Button size="sm" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

function ToggleColumnsCanaryPage() {
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    const vis: Record<string, boolean> = {};
    for (const f of COLUMN_FIELDS) vis[f] = true;
    return vis;
  });

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
                  Toggle column visibility using the View dropdown.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ColumnVisibilityDropdown
                  visibility={columnVisibility}
                  onSave={setColumnVisibility}
                />
                <Button size="sm" onClick={() => console.log('Add Supplier')}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Supplier
                </Button>
              </div>
            </div>
            <div style={{ height: 480 }}>
              <SupplierGrid
                data={supplierMockData}
                activeTab="toggle-columns"
                columnVisibility={columnVisibility}
              />
            </div>
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
// Helper: query AG Grid column header by colId
// ---------------------------------------------------------------------------

function getColumnHeader(el: HTMLElement, colId: string): HTMLElement | null {
  return el.querySelector<HTMLElement>(`.ag-header-cell[col-id="${colId}"]`);
}

// ---------------------------------------------------------------------------
// Story meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof ToggleColumnsCanaryPage> = {
  title:
    'Use Cases/Reference/Business Affiliates/BA-0001 Browse and Search/Toggle Columns (Canary)',
  component: ToggleColumnsCanaryPage,
  tags: ['skip-ci'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ToggleColumnsCanaryPage>;

/**
 * Default — open View dropdown, uncheck "Email", save, verify "Email" column
 * is hidden and other columns remain visible.
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

    await step('All column headers are visible', async () => {
      await waitFor(() => {
        expect(getColumnHeader(canvasElement, 'name')).toBeTruthy();
        expect(getColumnHeader(canvasElement, 'contact')).toBeTruthy();
        expect(getColumnHeader(canvasElement, 'email')).toBeTruthy();
        expect(getColumnHeader(canvasElement, 'city')).toBeTruthy();
        expect(getColumnHeader(canvasElement, 'state')).toBeTruthy();
        expect(getColumnHeader(canvasElement, 'roles')).toBeTruthy();
      }, { timeout: 10000 });
    });

    await storyStepDelay();

    await step('Open View dropdown and uncheck Email', async () => {
      const viewButton = canvas.getByRole('button', {
        name: /toggle column visibility/i,
      });
      await userEvent.click(viewButton);

      await waitFor(() => {
        expect(canvas.getByLabelText('Email')).toBeInTheDocument();
      }, { timeout: 5000 });

      const emailCheckbox = canvas.getByLabelText('Email');
      await userEvent.click(emailCheckbox);
      expect(emailCheckbox).not.toBeChecked();
    });

    await storyStepDelay();

    await step('Save and verify Email column is hidden', async () => {
      const saveButton = canvas.getByRole('button', { name: 'Save' });
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(getColumnHeader(canvasElement, 'email')).toBeFalsy();
      }, { timeout: 10000 });

      // Other columns remain
      expect(getColumnHeader(canvasElement, 'name')).toBeTruthy();
      expect(getColumnHeader(canvasElement, 'contact')).toBeTruthy();
      expect(getColumnHeader(canvasElement, 'city')).toBeTruthy();
      expect(getColumnHeader(canvasElement, 'state')).toBeTruthy();
      expect(getColumnHeader(canvasElement, 'roles')).toBeTruthy();
    });

    await storyStepDelay();
  },
};

/**
 * HideAll — open View dropdown, click "Hide All", save, and verify only
 * the Name column remains visible.
 */
export const HideAll: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Apex Medical Distributors', { selector: '[role="gridcell"]' }, { timeout: 10000 });
    await storyStepDelay();

    // Open View dropdown
    const viewButton = canvas.getByRole('button', { name: /toggle column visibility/i });
    await userEvent.click(viewButton);

    // Click "Hide All"
    await waitFor(() => {
      expect(canvas.getByRole('button', { name: 'Hide All' })).toBeVisible();
    }, { timeout: 10000 });
    await userEvent.click(canvas.getByRole('button', { name: 'Hide All' }));

    await storyStepDelay();

    // Save
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));

    // Verify only Name column remains
    await waitFor(() => {
      expect(getColumnHeader(canvasElement, 'name')).toBeTruthy();
      expect(getColumnHeader(canvasElement, 'contact')).toBeFalsy();
      expect(getColumnHeader(canvasElement, 'email')).toBeFalsy();
      expect(getColumnHeader(canvasElement, 'city')).toBeFalsy();
      expect(getColumnHeader(canvasElement, 'state')).toBeFalsy();
    }, { timeout: 10000 });
  },
};
