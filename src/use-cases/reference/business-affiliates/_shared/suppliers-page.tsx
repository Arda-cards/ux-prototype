/**
 * Suppliers list-view page component.
 *
 * Renders the full app shell (sidebar + main pane) with an AG Grid
 * table showing business affiliates. Includes search, pagination,
 * column visibility, and the SupplierDrawer detail panel.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Building2, ChevronLeft, ChevronRight, Columns3, Plus } from 'lucide-react';
import '@/styles/vendored/globals.css';
import { SidebarProvider, SidebarInset } from '@frontend/components/ui/sidebar';
import { ArdaGrid } from '@frontend/components/table';
import { Button } from '@frontend/components/ui/button';
import type { ArdaApiResponse, ArdaQueryResponse } from '@frontend/types/arda-api';
import type { BusinessAffiliateWithRoles } from './types';
import { suppliersColumnDefs, suppliersDefaultColDef } from './column-defs';
import { BusinessAffiliatesSidebar } from './suppliers-sidebar';
import { SupplierDrawer } from './supplier-drawer';

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
  /**
   * Override column visibility from outside. When provided:
   * - The built-in ColumnVisibilityDropdown is hidden.
   * - Column filtering uses this set instead of internal state.
   * Used by the Toggle Column Visibility story wrapper.
   */
  columnVisibilityOverride?: Set<string>;
  /**
   * Called when the user clicks the "+ Add Supplier" button (toolbar or empty state CTA).
   * When provided, the button is wired to this callback.
   * When omitted, the button renders but does nothing (backward-compatible).
   */
  onAddSupplier?: () => void;
  /**
   * Override row click behavior from outside.
   * When provided, this callback is called instead of the internal drawer open logic.
   * Used by the Edit story wrapper (EditableSuppliersPage) to intercept row clicks
   * and manage its own drawer with full edit mode support.
   */
  onRowClick?: (affiliate: BusinessAffiliateWithRoles) => void;
  /**
   * Callback when Delete is clicked in the drawer (view mode).
   * When provided, the drawer's Delete button triggers this callback with the affiliate.
   * When omitted, the drawer renders with an inert Delete button (no-op).
   * Used by the Delete-from-Panel story wrapper (PanelDeletableSuppliersPage).
   */
  onDrawerDelete?: (affiliate: BusinessAffiliateWithRoles) => void;
}

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
  columnVisibilityOverride,
  onAddSupplier,
  onRowClick,
  onDrawerDelete,
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

  // Debounce search input — only reset to page 0 when searchTerm actively changes,
  // not on the initial mount (which would conflict with programmatic page navigation).
  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      setDebouncedSearch(searchTerm);
      return;
    }
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

  // Deep-link: auto-open drawer for initial affiliate (one-shot)
  const hasAutoOpened = useRef(false);
  useEffect(() => {
    if (initialAffiliateId && rowData.length > 0 && !hasAutoOpened.current) {
      const found = rowData.find((r) => r.eId === initialAffiliateId);
      if (found) {
        setSelectedAffiliate(found);
        setDrawerOpen(true);
        hasAutoOpened.current = true;
      }
    }
  }, [initialAffiliateId, rowData]);

  const handleRowClick = useCallback((data: BusinessAffiliateWithRoles) => {
    if (onRowClick) {
      // Delegate to external handler (e.g., EditableSuppliersPage manages its own drawer)
      onRowClick(data);
    } else {
      setSelectedAffiliate(data);
      setDrawerOpen(true);
    }
  }, [onRowClick]);

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

  // When an external override is provided, use it; otherwise use internal state.
  const effectiveVisibleColumns = columnVisibilityOverride ?? visibleColumns;

  // Filter column defs based on visibility
  const filteredColumnDefs = suppliersColumnDefs.filter((col) => {
    const colId = col.colId ?? col.field;
    if (colId === 'select') return true; // Always show checkbox column
    return colId ? effectiveVisibleColumns.has(colId) : true;
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
              {columnVisibilityOverride === undefined && (
                <ColumnVisibilityDropdown
                  columns={TOGGLEABLE_COLUMNS}
                  visibleColumns={visibleColumns}
                  onToggle={handleToggleColumn}
                />
              )}
              <Button size="sm" className="h-9 gap-1" aria-label="Add Supplier" onClick={onAddSupplier}>
                <Plus className="w-4 h-4" />
                Add Supplier
              </Button>
            </div>
          </div>

          {/* Grid or empty/error state */}
          <div className="flex-1 px-10 py-2 md:px-8 min-h-0">
            {!loading && !error && rowData.length === 0 ? (
              <SuppliersEmptyState onAddSupplier={onAddSupplier ?? (() => {})} />
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

      {/* Supplier detail drawer — only rendered when row click is handled internally.
          When onRowClick prop is provided, the parent manages its own drawer. */}
      {!onRowClick && drawerOpen && selectedAffiliate && (
        <SupplierDrawer
          open={drawerOpen}
          mode="view"
          affiliate={selectedAffiliate}
          onClose={() => setDrawerOpen(false)}
          onEdit={() => {
            // Placeholder: future stories wire this to edit mode transition
          }}
          onDelete={onDrawerDelete ? () => onDrawerDelete(selectedAffiliate!) : undefined}
        />
      )}
    </SidebarProvider>
  );
}
