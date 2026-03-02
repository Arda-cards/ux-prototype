import React, { useState, useEffect, useCallback } from 'react';
import { Building2 } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { SidebarProvider, SidebarInset } from '@frontend/components/ui/sidebar';
import { BusinessAffiliatesSidebar } from '../components/business-affiliates-sidebar';
import { ArdaGrid } from '@frontend/components/table';
import { Button } from '@frontend/components/ui/button';
import type { ArdaApiResponse, ArdaQueryResponse } from '@frontend/types/arda-api';
import { ArdaSupplierDrawer } from '@/extras/components/organisms/reference/business-affiliates/supplier-drawer/supplier-drawer';
import type { BusinessAffiliate } from '@/extras/types/reference/business-affiliates/business-affiliate';
import type { BusinessAffiliateWithRoles } from '../types';
import { suppliersColumnDefs, suppliersDefaultColDef } from '../column-defs';
import { ImportSuppliersModal } from './import-suppliers-modal';

/** Convert our use-case type to the drawer's expected BusinessAffiliate shape. */
function toDrawerAffiliate(row: BusinessAffiliateWithRoles): BusinessAffiliate {
  const nameParts = row.contact?.name?.split(' ') ?? [];

  const legal: BusinessAffiliate['legal'] = row.legal
    ? {
        name: row.legal.name,
        legalName: row.legal.name,
        ...(row.legal.taxId != null ? { taxId: row.legal.taxId } : {}),
      }
    : undefined;

  const contact: BusinessAffiliate['contact'] = row.contact
    ? {
        ...(nameParts[0] ? { firstName: nameParts[0] } : {}),
        ...(nameParts.length > 1 ? { lastName: nameParts.slice(1).join(' ') } : {}),
        ...(row.contact.email != null ? { email: row.contact.email } : {}),
        ...(row.contact.phone != null ? { phone: row.contact.phone } : {}),
      }
    : undefined;

  const mainAddress: BusinessAffiliate['mainAddress'] = row.mainAddress
    ? {
        ...(row.mainAddress.addressLine1 != null ? { addressLine1: row.mainAddress.addressLine1 } : {}),
        ...(row.mainAddress.addressLine2 != null ? { addressLine2: row.mainAddress.addressLine2 } : {}),
        ...(row.mainAddress.city != null ? { city: row.mainAddress.city } : {}),
        ...(row.mainAddress.state != null ? { state: row.mainAddress.state } : {}),
        ...(row.mainAddress.postalCode != null ? { postalCode: row.mainAddress.postalCode } : {}),
        ...(row.mainAddress.country?.symbol != null ? { country: row.mainAddress.country.symbol } : {}),
      }
    : undefined;

  return {
    eId: row.eId,
    name: row.name,
    ...(legal != null ? { legal } : {}),
    ...(contact != null ? { contact } : {}),
    ...(mainAddress != null ? { mainAddress } : {}),
    roles: row.roles.map((role) => ({ role })),
  };
}

/** Empty state shown when no suppliers are returned. */
function SuppliersEmptyState({
  onAddSupplier,
  onImportSuppliers,
}: {
  onAddSupplier: () => void;
  onImportSuppliers: () => void;
}) {
  return (
    <div
      className="w-full flex flex-col items-center box-border px-6 py-6 sm:px-10 md:px-24 lg:px-32"
      style={{
        border: '1px dashed #E5E5E5',
        borderRadius: '20px',
        gap: '24px',
        pointerEvents: 'auto',
        position: 'relative',
        zIndex: 1,
        backgroundColor: '#FFFFFF',
      }}
    >
      <div className="flex flex-col items-center gap-2 w-full">
        <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center p-2 relative">
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <img
              src="/images/Puddle1.svg"
              alt=""
              className="w-full h-full object-contain"
            />
          </div>
          <Building2 className="w-[42px] h-[42px] sm:w-[52px] sm:h-[52px] text-[#0A0A0A] absolute left-[calc(50%-21px)] sm:left-[calc(50%-26px)] top-[20%] z-10" />
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-[#0A0A0A] leading-7 text-center">
          No suppliers&hellip; yet
        </h2>
        <p className="text-xs sm:text-sm text-[#737373] leading-5 text-center">
          Let&apos;s add some!
        </p>
      </div>
      <div
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center w-full"
        style={{ gap: '12px' }}
      >
        <Button
          className="h-9 bg-[#FC5A29] text-[#FAFAFA] hover:bg-[#FC5A29] font-geist shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-lg px-4 py-2 text-sm sm:text-base w-full sm:w-auto"
          onClick={onAddSupplier}
        >
          Add supplier
        </Button>
        <button
          className="h-9 bg-white border border-[#E5E5E5] text-[#0A0A0A] hover:bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-lg px-4 py-2 text-xs sm:text-sm leading-5 font-geist flex items-center justify-center box-border w-full sm:w-auto"
          onClick={onImportSuppliers}
        >
          <span className="leading-5">Import suppliers...</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Suppliers list view page component.
 *
 * Renders the full app shell (sidebar + main pane) with an AG Grid
 * table showing business affiliates that have the VENDOR role.
 * Clicking a row opens the supplier detail drawer on the right.
 */
function SuppliersPage() {
  const [rowData, setRowData] = useState<BusinessAffiliateWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'view' | 'add'>('view');
  const [selectedAffiliate, setSelectedAffiliate] = useState<BusinessAffiliate | undefined>();
  const [importModalOpen, setImportModalOpen] = useState(false);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/arda/business-affiliate/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filter: { role: 'VENDOR' },
          paginate: { index: 0, size: 50 },
        }),
      });
      const json = (await response.json()) as ArdaApiResponse<ArdaQueryResponse<BusinessAffiliateWithRoles>>;
      if (json.ok) {
        setRowData(json.data.results.map((r) => r.payload));
      } else {
        setError(json.error ?? 'Failed to fetch suppliers');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleRowClick = useCallback((rowData: BusinessAffiliateWithRoles) => {
    setSelectedAffiliate(toDrawerAffiliate(rowData));
    setDrawerMode('view');
    setDrawerOpen(true);
  }, []);

  const handleAddSupplier = useCallback(() => {
    setSelectedAffiliate(undefined);
    setDrawerMode('add');
    setDrawerOpen(true);
  }, []);

  const handleImportSuppliers = useCallback(() => {
    setImportModalOpen(true);
  }, []);

  return (
    <SidebarProvider>
      <BusinessAffiliatesSidebar />
      <SidebarInset>
        <div className="flex min-h-svh flex-col">
          {/* Page header */}
          <div className="w-full px-10 pt-4 mt-2 md:px-8 md:pt-6">
            <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Business affiliates with a Vendor role.
            </p>
          </div>

          {/* Grid or empty state */}
          <div className="flex-1 px-10 py-4 md:px-8">
            {!loading && !error && rowData.length === 0 ? (
              <SuppliersEmptyState
                onAddSupplier={handleAddSupplier}
                onImportSuppliers={handleImportSuppliers}
              />
            ) : (
              <ArdaGrid<BusinessAffiliateWithRoles>
                rowData={rowData}
                columnDefs={suppliersColumnDefs}
                defaultColDef={suppliersDefaultColDef}
                loading={loading}
                error={error}
                enableCellEditing
                onRowClicked={handleRowClick}
                gridOptions={{
                  rowHeight: 48,
                  headerHeight: 40,
                  getRowId: (params: { data: BusinessAffiliateWithRoles }) => params.data.eId,
                }}
              />
            )}
          </div>
        </div>
      </SidebarInset>

      {/* Supplier detail drawer — slides in from the right */}
      <ArdaSupplierDrawer
        open={drawerOpen}
        mode={drawerMode}
        {...(selectedAffiliate != null ? { affiliate: selectedAffiliate } : {})}
        onClose={() => setDrawerOpen(false)}
      />

      <ImportSuppliersModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
      />
    </SidebarProvider>
  );
}

/**
 * Variant that auto-opens the drawer for the first supplier once data loads.
 */
function SuppliersPageWithDrawer() {
  const [rowData, setRowData] = useState<BusinessAffiliateWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'view' | 'add'>('view');
  const [selectedAffiliate, setSelectedAffiliate] = useState<BusinessAffiliate | undefined>();
  const [importModalOpen, setImportModalOpen] = useState(false);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/arda/business-affiliate/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filter: { role: 'VENDOR' },
          paginate: { index: 0, size: 50 },
        }),
      });
      const json = (await response.json()) as ArdaApiResponse<ArdaQueryResponse<BusinessAffiliateWithRoles>>;
      if (json.ok) {
        const suppliers = json.data.results.map((r: { payload: BusinessAffiliateWithRoles }) => r.payload);
        setRowData(suppliers);
        if (suppliers.length > 0) {
          setSelectedAffiliate(toDrawerAffiliate(suppliers[0]));
          setDrawerOpen(true);
        }
      } else {
        setError(json.error ?? 'Failed to fetch suppliers');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleRowClick = useCallback((rowData: BusinessAffiliateWithRoles) => {
    setSelectedAffiliate(toDrawerAffiliate(rowData));
    setDrawerMode('view');
    setDrawerOpen(true);
  }, []);

  const handleAddSupplier = useCallback(() => {
    setSelectedAffiliate(undefined);
    setDrawerMode('add');
    setDrawerOpen(true);
  }, []);

  const handleImportSuppliers = useCallback(() => {
    setImportModalOpen(true);
  }, []);

  return (
    <SidebarProvider>
      <BusinessAffiliatesSidebar />
      <SidebarInset>
        <div className="flex min-h-svh flex-col">
          <div className="w-full px-10 pt-4 mt-2 md:px-8 md:pt-6">
            <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Business affiliates with a Vendor role.
            </p>
          </div>
          <div className="flex-1 px-10 py-4 md:px-8">
            {!loading && !error && rowData.length === 0 ? (
              <SuppliersEmptyState
                onAddSupplier={handleAddSupplier}
                onImportSuppliers={handleImportSuppliers}
              />
            ) : (
              <ArdaGrid<BusinessAffiliateWithRoles>
                rowData={rowData}
                columnDefs={suppliersColumnDefs}
                defaultColDef={suppliersDefaultColDef}
                loading={loading}
                error={error}
                enableCellEditing
                onRowClicked={handleRowClick}
                gridOptions={{
                  rowHeight: 48,
                  headerHeight: 40,
                  getRowId: (params: { data: BusinessAffiliateWithRoles }) => params.data.eId,
                }}
              />
            )}
          </div>
        </div>
      </SidebarInset>

      <ArdaSupplierDrawer
        open={drawerOpen}
        mode={drawerMode}
        {...(selectedAffiliate != null ? { affiliate: selectedAffiliate } : {})}
        onClose={() => setDrawerOpen(false)}
      />

      <ImportSuppliersModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
      />
    </SidebarProvider>
  );
}

const meta: Meta<typeof SuppliersPage> = {
  title: 'Use Cases/Reference/Business Affiliates/Pages/Suppliers List View',
  component: SuppliersPage,
  parameters: {
    layout: 'fullscreen',
    fullAppProviders: true,
  },
  args: {
    pathname: '/suppliers',
  },
};

export default meta;
type Story = StoryObj<typeof SuppliersPage>;

/**
 * Default Suppliers List View — sidebar with Suppliers active,
 * main pane shows an AG Grid of business affiliates with VENDOR role.
 */
export const Default: Story = {};

/**
 * Drawer pre-opened — shows the detail drawer for the first supplier,
 * useful for reviewing the drawer layout without clicking a row.
 */
export const WithDrawerOpen: Story = {
  render: () => <SuppliersPageWithDrawer />,
};

/**
 * Empty state — no suppliers returned from the API.
 */
export const EmptyState: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('/api/arda/business-affiliate/query', () =>
          HttpResponse.json({
            ok: true,
            status: 200,
            data: {
              thisPage: '0',
              nextPage: '0',
              previousPage: '0',
              results: [],
            },
          }),
        ),
      ],
    },
  },
};
