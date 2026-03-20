import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, userEvent, waitFor } from 'storybook/test';
import { useState, useRef, useCallback } from 'react';
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
  Tag,
  Check,
  Save,
} from 'lucide-react';

import { SidebarInset, SidebarTrigger } from '@/components/canary/primitives/sidebar';
import { Button } from '@/components/canary/atoms/button';
import { OverflowToolbar } from '../../molecules/overflow-toolbar/overflow-toolbar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/canary/primitives/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/canary/primitives/sheet';
import type { Item } from '@/types/extras';

import { Sidebar } from '../sidebar/sidebar';
import { SidebarHeader } from '../../molecules/sidebar/sidebar-header';
import { SidebarNav } from '../../molecules/sidebar/sidebar-nav';
import { SidebarNavItem } from '../../molecules/sidebar/sidebar-nav-item';
import { SidebarUserMenu } from '../../molecules/sidebar/sidebar-user-menu';

import { ItemGrid, type ItemGridHandle } from './item-grid';
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

// --- Actions column helper ---

function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Eye;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
      title={label}
      className="flex cursor-pointer items-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <Icon size={16} />
    </button>
  );
}

function makeActionsRenderer(onView?: (item: Item) => void) {
  return (params: { data?: Item }) => {
    if (!params.data) return null;
    const item = params.data;
    return (
      <div className="flex h-full items-center gap-1">
        {onView && <ActionButton icon={Eye} label="View" onClick={() => onView(item)} />}
        <ActionButton
          icon={ShoppingCart}
          label="Order"
          onClick={() => console.log('Order:', item.name)}
        />
        <ActionButton
          icon={Printer}
          label="Print"
          onClick={() => console.log('Print:', item.name)}
        />
      </div>
    );
  };
}

const actionsColumn = {
  actionCount: 3,
  cellRenderer: makeActionsRenderer((item) => console.log('View:', item.name)),
};

/**
 * Interactive Controls playground — use the Controls panel to toggle
 * `loading`, `error`, and `enableRowSelection`. Items and lookups are
 * pre-populated with fixture data.
 */
export const Playground: Story = {
  render: () => (
    <ItemGrid
      items={itemGridFixtures}
      lookups={mockLookups}
      enableRowSelection
      actionsColumn={actionsColumn}
    />
  ),
};

/** Default grid — editable, selection, typeahead lookups, all features on. */
export const Default: Story = {
  render: () => {
    const [_dirty, setDirty] = useState(false);

    return (
      <ItemGrid
        items={itemGridFixtures}
        autoHeight
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
    await waitFor(
      () => {
        expect(canvas.getByText('0 items')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
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
    // Wait for the search input to be present (grid has rendered)
    const input = await canvas.findByRole('searchbox', {}, { timeout: 10000 });
    await userEvent.type(input, 'glove');
    // entity-data-grid shows "N of M items" when a search is active;
    // wrap in waitFor to allow the 150 ms debounce to flush
    await waitFor(
      () => {
        expect(canvas.getByText('1 of 12 items')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
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

/** Paginated grid — 5 items per page, auto height. */
export const Paginated: Story = {
  args: {
    items: itemGridFixtures,
    autoHeight: true,
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
    const [notesItem, setNotesItem] = useState<Item | null>(null);
    const [activeTab, setActiveTab] = useState('published');
    const gridRef = useRef<ItemGridHandle>(null);

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
        const api = gridRef.current?.getGridApi();
        if (api) {
          api.setColumnsVisible([field], !next.has(field));
        }
        return next;
      });
    }, []);

    const openDetail = (item: Item) => setDetailItem(item);

    const compositionActions = {
      actionCount: 3,
      cellRenderer: makeActionsRenderer(openDetail),
    };

    return (
      <Sidebar
        defaultOpen
        content={
          <SidebarInset>
            <nav className="flex h-11 items-stretch border-b px-2">
              <SidebarTrigger className="self-center" />
              {(['published', 'draft', 'uploaded'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-4 text-sm font-medium transition-colors after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:transition-opacity ${
                    activeTab === tab
                      ? 'text-foreground after:bg-foreground after:opacity-100'
                      : 'text-muted-foreground after:opacity-0 hover:text-foreground'
                  }`}
                >
                  {tab === 'published' ? 'Published' : tab === 'draft' ? 'Drafts' : 'Uploaded'}
                </button>
              ))}
            </nav>

            {/* Grid */}
            <main className="p-6">
              <ItemGrid
                items={itemGridFixtures}
                autoHeight
                editable
                enableRowSelection
                lookups={mockLookups}
                actionsColumn={compositionActions}
                gridRef={gridRef}
                onSelectionChange={setSelected}
                onNotesClick={setNotesItem}
                onPublishRow={async (rowId, changes) => {
                  console.log(`Publishing row ${rowId}:`, changes);
                  await new Promise((r) => setTimeout(r, 500));
                }}
                toolbar={
                  selected.length > 0 ? (
                    <OverflowToolbar>
                      <Button
                        variant="ghost"
                        size="sm"
                        data-overflow-label="Clear selection"
                        onClick={() => {
                          gridRef.current?.getGridApi()?.deselectAll();
                          setSelected([]);
                        }}
                      >
                        Clear
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        data-overflow-label="Print cards"
                        onClick={() => console.log('Print cards for', selected.length, 'items')}
                      >
                        <Printer className="mr-1.5 h-4 w-4" />
                        Print cards
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        data-overflow-label="Add to queue"
                        onClick={() => console.log('Add to queue', selected.length, 'items')}
                      >
                        <ShoppingCart className="mr-1.5 h-4 w-4" />
                        Add to queue
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        data-overflow-label="Export"
                        onClick={() => console.log('Export', selected.length, 'items')}
                      >
                        <Download className="mr-1.5 h-4 w-4" />
                        Export
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        data-overflow-label="Delete"
                        onClick={() => console.log('Delete', selected.length, 'items')}
                      >
                        <Trash2 className="mr-1.5 h-4 w-4" />
                        Delete
                      </Button>
                    </OverflowToolbar>
                  ) : (
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" data-overflow-label="View columns">
                            <SlidersHorizontal className="mr-1.5 h-4 w-4" />
                            View
                            <ChevronDown className="ml-1 h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => {
                              setHiddenColumns(new Set());
                              const api = gridRef.current?.getGridApi();
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
                              className="gap-2"
                            >
                              {!hiddenColumns.has(col.field) ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <span className="h-4 w-4" />
                              )}
                              {col.label}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => console.log('Save view')}>
                            <Save className="h-4 w-4" />
                            Save view
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" data-overflow-label="Actions">
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
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <div className="flex">
                        <Button
                          size="sm"
                          className="rounded-r-none"
                          data-overflow-label="Add item"
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
                    </div>
                  )
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
                          ` \u00b7 ${detailItem.classification.type}${detailItem.classification.subType ? ` \u2013 ${detailItem.classification.subType}` : ''}`}
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
                                : '\u2014'}
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

            {/* Notes sheet */}
            <Sheet open={!!notesItem} onOpenChange={(open) => !open && setNotesItem(null)}>
              <SheetContent className="w-[400px] sm:max-w-[400px]">
                {notesItem && (
                  <>
                    <SheetHeader>
                      <SheetTitle>Notes</SheetTitle>
                      <SheetDescription>{notesItem.name}</SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                      {notesItem.notes ? (
                        <div className="rounded-lg border border-border bg-muted/50 p-4">
                          <p className="text-sm leading-relaxed">{notesItem.notes}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No notes yet.</p>
                      )}
                      <textarea
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-none placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        rows={4}
                        placeholder="Add a note\u2026"
                        defaultValue=""
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          console.log('Save note for:', notesItem.name);
                          setNotesItem(null);
                        }}
                      >
                        Save note
                      </Button>
                    </div>
                  </>
                )}
              </SheetContent>
            </Sheet>
          </SidebarInset>
        }
      >
        <SidebarHeader teamName="Arda Cards" />
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
      </Sidebar>
    );
  },
};
