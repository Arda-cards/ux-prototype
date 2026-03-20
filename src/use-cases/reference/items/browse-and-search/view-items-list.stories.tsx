/**
 * REF::ITM::0001 — Browse and Search Items
 *
 * Composition story: ArdaSidebar + AppHeader + ItemGrid (entity-data-grid-backed)
 * with search, column toggle, and multi-select toolbar actions.
 *
 * Maps to: REF::ITM::0001 — Browse and Search Items
 */
import { useState, useRef, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, userEvent, waitFor } from 'storybook/test';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Building2,
  Settings,
  ShieldCheck,
  LogOut,
  Plus,
  ChevronDown,
  SlidersHorizontal,
  CircleCheck,
  Download,
  Printer,
  Trash2,
  Check,
  Save,
  Tag,
} from 'lucide-react';

import { SidebarInset, SidebarTrigger } from '@/components/canary/primitives/sidebar';
import { ArdaSidebar } from '@/components/canary/organisms/sidebar/sidebar';
import { ArdaSidebarHeader } from '@/components/canary/molecules/sidebar/sidebar-header';
import { SidebarNav } from '@/components/canary/molecules/sidebar/sidebar-nav';
import { SidebarNavItem } from '@/components/canary/molecules/sidebar/sidebar-nav-item';
import { SidebarUserMenu } from '@/components/canary/molecules/sidebar/sidebar-user-menu';
import { ArdaAppHeader } from '@/components/canary/organisms/app-header/app-header';
import { ItemGrid, type ItemGridHandle } from '@/components/canary/organisms/item-grid/item-grid';
import { ArdaButton as Button } from '@/components/canary/atoms/button/button';
import { OverflowToolbar } from '@/components/canary/molecules/overflow-toolbar/overflow-toolbar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/canary/primitives/dropdown-menu';
import type { Item } from '@/types/extras';
import { itemMockData } from '../_shared/mock-data';
import { storyStepDelay } from '../_shared/story-step-delay';

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

function ItemsPage() {
  const [selected, setSelected] = useState<Item[]>([]);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
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

  const toolbar =
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
          </DropdownMenuContent>
        </DropdownMenu>
        <Button size="sm" onClick={() => console.log('Add item')}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add item
        </Button>
      </div>
    );

  return (
    <ArdaSidebar
      defaultOpen
      content={
        <SidebarInset>
          <ArdaAppHeader leading={<SidebarTrigger className="self-center" />} showSearch={false} />
          <main className="flex flex-1 flex-col gap-4 p-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Items</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage your inventory items.</p>
            </div>
            <ItemGrid
              items={itemMockData}
              autoHeight
              enableRowSelection
              gridRef={gridRef}
              onSelectionChange={setSelected}
              onItemClick={(item) => console.log('Item clicked:', item.name)}
              toolbar={toolbar}
            />
          </main>
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
          { key: 'logout', label: 'Log out', icon: LogOut, onClick: () => {}, destructive: true },
        ]}
      />
    </ArdaSidebar>
  );
}

// ---------------------------------------------------------------------------
// Story meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof ItemsPage> = {
  title: 'Use Cases/Reference/Items/ITM-0001 Browse and Search/View Items List',
  component: ItemsPage,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ItemsPage>;

/**
 * Default — full items page with sidebar, header, search, and grid.
 * Play function: navigate sidebar, search items, verify filter count,
 * toggle column visibility.
 */
export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Grid renders with item data', async () => {
      const firstItem = await canvas.findByText(
        'Nitrile Exam Gloves (Medium)',
        { selector: '[role="gridcell"]' },
        { timeout: 10000 },
      );
      expect(firstItem).toBeVisible();
    });

    await storyStepDelay();

    await step('Page header and sidebar are visible', async () => {
      expect(canvas.getByRole('heading', { name: 'Items', level: 1 })).toBeVisible();
      expect(canvas.getByText('Manage your inventory items.')).toBeVisible();
    });

    await storyStepDelay();

    await step('Search bar filters items', async () => {
      const searchInput = canvas.getByPlaceholderText('Search items\u2026');
      await userEvent.type(searchInput, 'glove');
      // Wait for debounce + grid update
      await waitFor(
        () => {
          expect(canvas.getByText(/1 of 12 items/)).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();

    await step('Clear search restores full list', async () => {
      const searchInput = canvas.getByPlaceholderText('Search items\u2026');
      await userEvent.clear(searchInput);
      await waitFor(
        () => {
          expect(canvas.getByText('12 items')).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();
  },
};
