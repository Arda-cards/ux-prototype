import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, userEvent } from 'storybook/test';
import { useState, useRef, useCallback, createElement } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Building2,
  Settings,
  ShieldCheck,
  LogOut,
  Download,
  Eye,
  Printer,
  Plus,
  ChevronDown,
  SlidersHorizontal,
  CircleCheck,
  Upload,
  Trash2,
  Copy,
  Tag,
} from 'lucide-react';

import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Item } from '@/types/extras';

import { ArdaSidebar } from '../sidebar/sidebar';
import { ArdaSidebarHeader } from '../../molecules/sidebar/sidebar-header';
import { SidebarNav } from '../../molecules/sidebar/sidebar-nav';
import { SidebarNavItem } from '../../molecules/sidebar/sidebar-nav-item';
import { SidebarUserMenu } from '../../molecules/sidebar/sidebar-user-menu';

import { ItemGrid } from './item-grid';
import { itemGridFixtures } from '../../molecules/item-grid/item-grid-fixtures';

const meta = {
  title: 'Components/Canary/Organisms/ItemGrid',
  component: ItemGrid,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Read-only items grid built on ArdaDataGrid + AG Grid Community. ' +
          'Composes curated columns with an inline search toolbar. ' +
          'Designed for extension — consumers can layer editing, pagination, and custom toolbars on top.',
      },
    },
  },
} satisfies Meta<typeof ItemGrid>;

export default meta;
type Story = StoryObj<typeof ItemGrid>;

// --- Mock lookups ---

const mockSuppliers = [
  'Medline Industries',
  'Cardinal Health',
  'Fisher Scientific',
  'VWR International',
  'Eppendorf',
  '3M Healthcare',
  'Stericycle',
  'Welch Allyn',
  'BD Medical',
  'Johnson & Johnson',
  'Baxter International',
  'Corning Life Sciences',
];

const mockClassifications = [
  'PPE – Gloves',
  'PPE – Masks',
  'Chemicals – Disinfectants',
  'Lab Supplies – Consumables',
  'Lab Supplies – Microscopy',
  'Sterilization',
  'Safety – Waste Management',
  'Safety – Sharps',
  'Diagnostics – Temperature',
  'Wound Care – Dressings',
  'IV Therapy – Solutions',
];

const mockLookups = {
  supplier: async (search: string) => {
    await new Promise((r) => setTimeout(r, 150));
    return mockSuppliers
      .filter((s) => s.toLowerCase().includes(search.toLowerCase()))
      .map((s) => ({ label: s, value: s }));
  },
  classificationType: async (search: string) => {
    await new Promise((r) => setTimeout(r, 150));
    return mockClassifications
      .filter((c) => c.toLowerCase().includes(search.toLowerCase()))
      .map((c) => ({ label: c, value: c }));
  },
};

// --- Actions column for stories ---

const actionsColumn = {
  width: 110,
  cellRenderer: (params: { data?: (typeof itemGridFixtures)[0] }) => {
    if (!params.data) return null;
    const item = params.data;
    return createElement(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          height: '100%',
        },
      },
      createElement(
        'button',
        {
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            console.log('View:', item.name);
          },
          title: 'View details',
          'aria-label': `View ${item.name}`,
          style: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 6,
            borderRadius: 4,
            display: 'flex',
            color: 'var(--foreground)',
          },
        },
        createElement(Eye, { size: 16 }),
      ),
      createElement(
        'button',
        {
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            console.log('Add to cart:', item.name);
          },
          title: 'Add to order queue',
          'aria-label': `Add ${item.name} to order queue`,
          style: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 6,
            borderRadius: 4,
            display: 'flex',
            color: 'var(--foreground)',
          },
        },
        createElement(ShoppingCart, { size: 16 }),
      ),
      createElement(
        'button',
        {
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            console.log('Print card:', item.name);
          },
          title: 'Print card',
          'aria-label': `Print card for ${item.name}`,
          style: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 6,
            borderRadius: 4,
            display: 'flex',
            color: 'var(--foreground)',
          },
        },
        createElement(Printer, { size: 16 }),
      ),
    );
  },
};

/** Default grid — editable, selection, typeahead lookups, all features on. */
export const Default: Story = {
  render: () => {
    const [_dirty, setDirty] = useState(false);

    return (
      <ItemGrid
        items={itemGridFixtures}
        editable
        enableRowSelection
        lookups={mockLookups}
        actionsColumn={actionsColumn}
        onDirtyChange={setDirty}
        onPublishRow={async (rowId, changes) => {
          console.log(`Publishing row ${rowId}:`, changes);
          await new Promise((r) => setTimeout(r, 500));
        }}
        onItemClick={(item) => console.log('Open detail:', item.name)}
      />
    );
  },
};

/** Empty state — no items, with guiding message. */
export const Empty: Story = {
  args: {
    items: [],
    emptyMessage: 'No items yet. Add your first item to get started.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('0 items')).toBeInTheDocument();
  },
};

/** Loading state overlay. */
export const Loading: Story = {
  args: {
    items: itemGridFixtures,
    loading: true,
  },
};

/** Row selection enabled with callback. */
export const WithSelection: Story = {
  render: () => {
    const [selected, setSelected] = useState<typeof itemGridFixtures>([]);
    return (
      <div>
        <ItemGrid items={itemGridFixtures} enableRowSelection onSelectionChange={setSelected} />
        {selected.length > 0 && (
          <p className="mt-2 text-sm text-muted-foreground">{selected.length} selected</p>
        )}
      </div>
    );
  },
};

/** Search filtering — type to filter by name or SKU. */
export const WithSearch: Story = {
  args: {
    items: itemGridFixtures,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Search items…');
    await userEvent.type(input, 'glove');
    await expect(canvas.getByText('1 item')).toBeInTheDocument();
  },
};

/** Inline editing with draft lifecycle — edit cells, changes publish on row blur. */
export const Editable: Story = {
  render: () => {
    const [dirty, setDirty] = useState(false);

    return (
      <div>
        <ItemGrid
          items={itemGridFixtures}
          editable
          lookups={mockLookups}
          onDirtyChange={setDirty}
          onPublishRow={async (rowId, changes) => {
            console.log(`Publishing row ${rowId}:`, changes);
            await new Promise((r) => setTimeout(r, 500));
          }}
        />
        {dirty && <p className="mt-2 text-sm text-orange-600">Unsaved changes</p>}
      </div>
    );
  },
};

/** Paginated grid — 5 items per page. */
export const Paginated: Story = {
  args: {
    items: itemGridFixtures,
    pageSize: 5,
  },
};

/**
 * Full page composition — sidebar + grid + detail sheet.
 * Shows how arda-frontend would layer on top of the clean organism.
 * Row click or View action opens a detail panel. Add to Cart and Print log to console.
 */
export const Composition: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const [selected, setSelected] = useState<typeof itemGridFixtures>([]);
    const [detailItem, setDetailItem] = useState<Item | null>(null);
    const [activeTab, setActiveTab] = useState('published');
    const gridRef = useRef<AgGridReact<Item>>(null);

    const toggleableColumns = [
      { field: 'imageUrl', label: 'Image' },
      { field: 'internalSKU', label: 'SKU' },
      { field: 'generalLedgerCode', label: 'GL Code' },
      { field: 'classification.type', label: 'Classification' },
      { field: 'primarySupply.supplier', label: 'Supplier' },
      { field: 'primarySupply.orderMechanism', label: 'Order Method' },
      { field: 'primarySupply.unitCost', label: 'Unit Cost' },
      { field: 'primarySupply.orderCost', label: 'Order Cost' },
      { field: 'taxable', label: 'Taxable' },
      { field: 'notes', label: 'Notes' },
    ];

    const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());

    const toggleColumn = useCallback((field: string) => {
      setHiddenColumns((prev) => {
        const next = new Set(prev);
        if (next.has(field)) next.delete(field);
        else next.add(field);
        const api = gridRef.current?.api;
        if (api) {
          api.setColumnsVisible([field], !next.has(field));
        }
        return next;
      });
    }, []);

    const openDetail = (item: Item) => setDetailItem(item);

    const compositionActions = {
      width: 110,
      cellRenderer: (params: { data?: Item }) => {
        if (!params.data) return null;
        const item = params.data;
        return createElement(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: 4, height: '100%' } },
          createElement(
            'button',
            {
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                openDetail(item);
              },
              title: 'View details',
              'aria-label': `View ${item.name}`,
              style: {
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 6,
                borderRadius: 4,
                display: 'flex',
                color: 'var(--foreground)',
              },
            },
            createElement(Eye, { size: 16 }),
          ),
          createElement(
            'button',
            {
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                console.log('Add to cart:', item.name);
              },
              title: 'Add to order queue',
              'aria-label': `Add ${item.name} to order queue`,
              style: {
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 6,
                borderRadius: 4,
                display: 'flex',
                color: 'var(--foreground)',
              },
            },
            createElement(ShoppingCart, { size: 16 }),
          ),
          createElement(
            'button',
            {
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                console.log('Print card:', item.name);
              },
              title: 'Print card',
              'aria-label': `Print card for ${item.name}`,
              style: {
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 6,
                borderRadius: 4,
                display: 'flex',
                color: 'var(--foreground)',
              },
            },
            createElement(Printer, { size: 16 }),
          ),
        );
      },
    };

    return (
      <ArdaSidebar
        defaultOpen
        content={
          <SidebarInset>
            {/* Page header */}
            <header className="flex h-14 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <h1 className="text-lg font-semibold">Items</h1>
              {selected.length > 0 && (
                <span className="ml-auto text-sm text-muted-foreground">
                  {selected.length} selected
                </span>
              )}
            </header>

            {/* Tabs */}
            <div className="border-b px-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="h-10 bg-transparent p-0">
                  <TabsTrigger
                    value="published"
                    className="rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    Published Items
                  </TabsTrigger>
                  <TabsTrigger
                    value="draft"
                    className="rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    Draft Items
                  </TabsTrigger>
                  <TabsTrigger
                    value="uploaded"
                    className="rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    Recently Uploaded
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Grid */}
            <main className="p-4">
              <ItemGrid
                items={itemGridFixtures}
                height="calc(100vh - 11rem)"
                editable
                enableRowSelection
                lookups={mockLookups}
                actionsColumn={compositionActions}
                gridRef={gridRef}
                onSelectionChange={setSelected}
                onPublishRow={async (rowId, changes) => {
                  console.log(`Publishing row ${rowId}:`, changes);
                  await new Promise((r) => setTimeout(r, 500));
                }}
                toolbar={
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <SlidersHorizontal className="mr-1.5 h-4 w-4" />
                          View
                          <ChevronDown className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => {
                            setHiddenColumns(new Set());
                            const api = gridRef.current?.api;
                            if (api)
                              api.setColumnsVisible(
                                toggleableColumns.map((c) => c.field),
                                true,
                              );
                          }}
                        >
                          Show all
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {toggleableColumns.map((col) => (
                          <DropdownMenuItem
                            key={col.field}
                            onClick={(e) => {
                              e.preventDefault();
                              toggleColumn(col.field);
                            }}
                          >
                            <span className="mr-2 w-4 text-center">
                              {!hiddenColumns.has(col.field) ? '✓' : ''}
                            </span>
                            {col.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <CircleCheck className="mr-1.5 h-4 w-4" />
                          Actions
                          <ChevronDown className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => console.log('Print cards')}>
                          <Printer className="mr-2 h-4 w-4" />
                          Print cards
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => console.log('Print labels')}>
                          <Tag className="mr-2 h-4 w-4" />
                          Print labels
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => console.log('Export')}>
                          <Download className="mr-2 h-4 w-4" />
                          Export CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => console.log('Duplicate')}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate selected
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => console.log('Delete')}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete selected
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="flex">
                      <Button
                        size="sm"
                        className="rounded-r-none"
                        onClick={() => console.log('Add item')}
                      >
                        <Plus className="mr-1.5 h-4 w-4" />
                        Add item
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            className="rounded-l-none border-l border-primary-foreground/20 px-2"
                            aria-label="More add options"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => console.log('Import CSV')}>
                            <Upload className="mr-2 h-4 w-4" />
                            Import CSV
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => console.log('Bulk add')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Bulk add
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </>
                }
              />
            </main>

            {/* Detail sheet — opens on row click or View action */}
            <Sheet open={!!detailItem} onOpenChange={(open) => !open && setDetailItem(null)}>
              <SheetContent className="w-[440px] sm:max-w-[440px]">
                {detailItem && (
                  <>
                    <SheetHeader>
                      <SheetTitle>{detailItem.name}</SheetTitle>
                      <SheetDescription>
                        {detailItem.internalSKU || 'No SKU'}
                        {detailItem.classification &&
                          ` · ${detailItem.classification.type}${detailItem.classification.subType ? ` – ${detailItem.classification.subType}` : ''}`}
                      </SheetDescription>
                    </SheetHeader>

                    <div className="mt-6 space-y-4">
                      {/* Supplier info */}
                      {detailItem.primarySupply && (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Supplier
                          </p>
                          <p className="text-sm">{detailItem.primarySupply.supplier}</p>
                          {detailItem.primarySupply.orderMechanism && (
                            <p className="text-xs text-muted-foreground">
                              {detailItem.primarySupply.orderMechanism
                                .replace(/_/g, ' ')
                                .replace(/\b\w/g, (c) => c.toUpperCase())}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Costs */}
                      {detailItem.primarySupply && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Unit Cost
                            </p>
                            <p className="text-lg font-semibold tabular-nums">
                              {detailItem.primarySupply.unitCost
                                ? `$${detailItem.primarySupply.unitCost.value.toFixed(2)}`
                                : '—'}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Order Cost
                            </p>
                            <p className="text-lg font-semibold tabular-nums">
                              ${detailItem.primarySupply.orderCost.value.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {detailItem.notes && (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Notes
                          </p>
                          <p className="text-sm text-muted-foreground">{detailItem.notes}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t">
                        <Button size="sm" onClick={() => console.log('Edit:', detailItem.name)}>
                          Edit item
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => console.log('Print card:', detailItem.name)}
                        >
                          <Printer className="mr-1.5 h-4 w-4" />
                          Print card
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => console.log('Add to cart:', detailItem.name)}
                        >
                          <ShoppingCart className="mr-1.5 h-4 w-4" />
                          Add to queue
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </SheetContent>
            </Sheet>
          </SidebarInset>
        }
      >
        <ArdaSidebarHeader teamName="Arda Cards" />
        <SidebarNav>
          <SidebarNavItem icon={LayoutDashboard} label="Dashboard" />
          <SidebarNavItem icon={Package} label="Items" active />
          <SidebarNavItem icon={ShoppingCart} label="Order Queue" badge={3} />
          <SidebarNavItem icon={Building2} label="Suppliers" />
        </SidebarNav>
        <SidebarUserMenu
          user={{ name: 'Uriel Eisen', email: 'uriel@arda.cards', role: 'Account Admin' }}
          actions={[
            { key: 'admin', label: 'Admin', icon: ShieldCheck, onClick: () => {} },
            { key: 'settings', label: 'Settings', icon: Settings, onClick: () => {} },
            {
              key: 'logout',
              label: 'Log out',
              icon: LogOut,
              onClick: () => {},
              destructive: true,
            },
          ]}
        />
      </ArdaSidebar>
    );
  },
};
