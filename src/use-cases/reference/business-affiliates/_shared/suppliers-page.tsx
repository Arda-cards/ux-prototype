/**
 * Suppliers list-view page component.
 *
 * Renders the full app shell (sidebar + main pane) with an AG Grid
 * table showing business affiliates. Includes search, pagination,
 * column visibility, and a placeholder detail drawer.
 *
 * The real detail drawer is deferred to the View Details story (BA::0002::0001).
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Building2, X, ChevronLeft, ChevronRight, Columns3, Plus } from 'lucide-react';
import '@/styles/vendored/globals.css';
import { SidebarProvider, SidebarInset } from '@frontend/components/ui/sidebar';
import { ArdaGrid } from '@frontend/components/table';
import { Button } from '@frontend/components/ui/button';
import type { ArdaApiResponse, ArdaQueryResponse } from '@frontend/types/arda-api';
import type { BusinessAffiliateWithRoles, BusinessRoleType } from './types';
import { suppliersColumnDefs, suppliersDefaultColDef } from './column-defs';
import { BusinessAffiliatesSidebar } from './suppliers-sidebar';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SuppliersPageProps {
  /** Pre-select and open placeholder drawer for this affiliate (deep-link support). */
  initialAffiliateId?: string;
  /** Override page size for pagination stories (default: 10). */
  pageSize?: number;
  /** Optional render prop for toolbar actions (used by Delete story wrapper). */
  toolbarActions?: (selectedIds: Set<string>) => React.ReactNode;
}

// ---------------------------------------------------------------------------
// Role badge colors (shared with column-defs but used in drawer too)
// ---------------------------------------------------------------------------

const roleBadgeColors: Record<BusinessRoleType, string> = {
  VENDOR: 'bg-blue-100 text-blue-800',
  CUSTOMER: 'bg-green-100 text-green-800',
  CARRIER: 'bg-amber-100 text-amber-800',
  OPERATOR: 'bg-purple-100 text-purple-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function SuppliersEmptyState({ onAddSupplier }: { onAddSupplier: () => void }) {
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
            <img src="/vendored/images/Puddle1.svg" alt="" className="w-full h-full object-contain" />
          </div>
          <Building2 className="w-[42px] h-[42px] sm:w-[52px] sm:h-[52px] text-[#0A0A0A] absolute left-[calc(50%-21px)] sm:left-[calc(50%-26px)] top-[20%] z-10" />
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-[#0A0A0A] leading-7 text-center">
          No suppliers yet
        </h2>
        <p className="text-xs sm:text-sm text-[#737373] leading-5 text-center">
          Add your first supplier to start building your affiliate registry.
        </p>
      </div>
      <div className="flex items-center justify-center w-full" style={{ gap: '12px' }}>
        <Button
          className="h-9 bg-[#FC5A29] text-[#FAFAFA] hover:bg-[#FC5A29] font-geist shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-lg px-4 py-2 text-sm sm:text-base"
          onClick={onAddSupplier}
        >
          Add Supplier
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Placeholder Drawer
// ---------------------------------------------------------------------------

function PlaceholderDrawer({
  affiliate,
  onClose,
}: {
  affiliate: BusinessAffiliateWithRoles;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed top-0 right-0 h-full w-[400px] bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col"
      data-testid="placeholder-drawer"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold truncate">{affiliate.name}</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-100"
          aria-label="Close drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <div>
          <p className="text-xs text-muted-foreground">Entity ID</p>
          <p className="text-sm font-mono">{affiliate.eId}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">Roles</p>
          <div className="flex gap-1 flex-wrap">
            {affiliate.roles.map((role) => (
              <span
                key={role}
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${roleBadgeColors[role]}`}
              >
                {role.charAt(0) + role.slice(1).toLowerCase()}
              </span>
            ))}
          </div>
        </div>

        {affiliate.contact && (
          <div>
            <p className="text-xs text-muted-foreground">Contact</p>
            <p className="text-sm">{affiliate.contact.name}</p>
            {affiliate.contact.email && (
              <p className="text-sm text-muted-foreground">{affiliate.contact.email}</p>
            )}
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-xs text-muted-foreground text-center italic">
            Full details panel — see View Details story (BA::0002::0001)
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Column Visibility Dropdown
// ---------------------------------------------------------------------------

function ColumnVisibilityDropdown({
  columns,
  visibleColumns,
  onToggle,
}: {
  columns: { id: string; name: string }[];
  visibleColumns: Set<string>;
  onToggle: (colId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-1"
        onClick={() => setOpen(!open)}
        aria-label="Toggle column visibility"
      >
        <Columns3 className="w-4 h-4" />
        View
      </Button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-40 py-1">
          {columns.map((col) => (
            <label
              key={col.id}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                checked={visibleColumns.has(col.id)}
                onChange={() => onToggle(col.id)}
                className="rounded"
              />
              {col.name}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Suppliers Page
// ---------------------------------------------------------------------------

const TOGGLEABLE_COLUMNS = [
  { id: 'name', name: 'Name' },
  { id: 'contact', name: 'Contact' },
  { id: 'phone', name: 'Phone' },
  { id: 'city', name: 'City' },
  { id: 'state', name: 'State' },
  { id: 'roles', name: 'Roles' },
];

export function SuppliersPage({
  initialAffiliateId,
  pageSize = 10,
  toolbarActions,
}: SuppliersPageProps) {
  const [rowData, setRowData] = useState<BusinessAffiliateWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<
    BusinessAffiliateWithRoles | undefined
  >();
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [paginationInfo, setPaginationInfo] = useState({
    thisPage: '0',
    nextPage: '0',
    previousPage: '0',
  });
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(TOGGLEABLE_COLUMNS.map((c) => c.id)),
  );

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(0); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch suppliers
  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        paginate: { index: currentPage, size: pageSize },
      };
      if (debouncedSearch) {
        body.filter = { name: debouncedSearch };
      }

      const response = await fetch('/api/arda/business-affiliate/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = (await response.json()) as ArdaApiResponse<
        ArdaQueryResponse<BusinessAffiliateWithRoles>
      >;
      if (json.ok) {
        setRowData(json.data.results.map((r) => r.payload));
        setPaginationInfo({
          thisPage: json.data.thisPage,
          nextPage: json.data.nextPage,
          previousPage: json.data.previousPage,
        });
      } else {
        setError(json.error ?? 'Failed to fetch suppliers');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, pageSize]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Deep-link: auto-open drawer for initial affiliate
  useEffect(() => {
    if (initialAffiliateId && rowData.length > 0 && !drawerOpen) {
      const found = rowData.find((r) => r.eId === initialAffiliateId);
      if (found) {
        setSelectedAffiliate(found);
        setDrawerOpen(true);
      }
    }
  }, [initialAffiliateId, rowData, drawerOpen]);

  const handleRowClick = useCallback((data: BusinessAffiliateWithRoles) => {
    setSelectedAffiliate(data);
    setDrawerOpen(true);
  }, []);

  const handleSelectionChanged = useCallback((selectedRows: BusinessAffiliateWithRoles[]) => {
    setSelectedRowIds(new Set(selectedRows.map((r) => r.eId)));
  }, []);

  const handleToggleColumn = useCallback((colId: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(colId)) {
        next.delete(colId);
      } else {
        next.add(colId);
      }
      return next;
    });
  }, []);

  // Filter column defs based on visibility
  const filteredColumnDefs = suppliersColumnDefs.filter((col) => {
    const colId = col.colId ?? col.field;
    if (colId === 'select') return true; // Always show checkbox column
    return colId ? visibleColumns.has(colId) : true;
  });

  const canGoPrev = paginationInfo.previousPage !== paginationInfo.thisPage;
  const canGoNext = paginationInfo.nextPage !== paginationInfo.thisPage;

  return (
    <SidebarProvider>
      <BusinessAffiliatesSidebar />
      <SidebarInset className="overflow-hidden">
        <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
          {/* Page header */}
          <div className="w-full px-10 pt-4 mt-2 md:px-8 md:pt-6">
            <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Business affiliates with a Vendor role.
            </p>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between px-10 py-3 md:px-8 gap-3">
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 w-full max-w-sm rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gray-300"
                aria-label="Search suppliers"
              />
              {toolbarActions?.(selectedRowIds)}
            </div>
            <div className="flex items-center gap-2">
              <ColumnVisibilityDropdown
                columns={TOGGLEABLE_COLUMNS}
                visibleColumns={visibleColumns}
                onToggle={handleToggleColumn}
              />
              <Button size="sm" className="h-9 gap-1" aria-label="Add Supplier">
                <Plus className="w-4 h-4" />
                Add Supplier
              </Button>
            </div>
          </div>

          {/* Grid or empty/error state */}
          <div className="flex-1 px-10 py-2 md:px-8 min-h-0">
            {!loading && !error && rowData.length === 0 ? (
              <SuppliersEmptyState onAddSupplier={() => {}} />
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                  <p className="text-sm text-red-600" data-testid="error-message">
                    {error}
                  </p>
                </div>
              </div>
            ) : (
              <ArdaGrid<BusinessAffiliateWithRoles>
                rowData={rowData}
                columnDefs={filteredColumnDefs}
                defaultColDef={suppliersDefaultColDef}
                loading={loading}
                enableCellEditing
                enableRowSelection
                enableMultiRowSelection
                onRowClicked={handleRowClick}
                onSelectionChanged={handleSelectionChanged}
                gridOptions={{
                  rowHeight: 48,
                  headerHeight: 40,
                  getRowId: (params: { data: BusinessAffiliateWithRoles }) => params.data.eId,
                }}
              />
            )}
          </div>

          {/* Pagination */}
          {!error && rowData.length > 0 && (
            <div className="flex items-center justify-between px-10 py-3 md:px-8 border-t border-gray-200">
              <p className="text-sm text-muted-foreground">
                Page {Number(paginationInfo.thisPage) + 1}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canGoPrev}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canGoNext}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  aria-label="Next page"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>

      {/* Placeholder detail drawer */}
      {drawerOpen && selectedAffiliate && (
        <PlaceholderDrawer
          affiliate={selectedAffiliate}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </SidebarProvider>
  );
}
