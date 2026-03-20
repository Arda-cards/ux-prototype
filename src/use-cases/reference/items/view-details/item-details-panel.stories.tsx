/**
 * REF::ITM::0002 — View Item Details
 *
 * Composition story: click a row in the ItemGrid to open the
 * ItemDetails drawer. Demonstrates the details tab with field list
 * and the cards tab preview.
 *
 * Maps to: REF::ITM::0002 — View Item Details
 */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, userEvent, waitFor, screen } from 'storybook/test';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Building2,
  Settings,
  ShieldCheck,
  LogOut,
  SquarePen,
  Printer,
  Tag,
  ScanLine,
  Copy,
  Trash2,
} from 'lucide-react';

import { SidebarInset, SidebarTrigger } from '@/components/canary/primitives/sidebar';
import { Sidebar } from '@/components/canary/organisms/sidebar/sidebar';
import { SidebarHeader } from '@/components/canary/molecules/sidebar/sidebar-header';
import { SidebarNav } from '@/components/canary/molecules/sidebar/sidebar-nav';
import { SidebarNavItem } from '@/components/canary/molecules/sidebar/sidebar-nav-item';
import { SidebarUserMenu } from '@/components/canary/molecules/sidebar/sidebar-user-menu';
import { AppHeader } from '@/components/canary/organisms/app-header/app-header';
import { ItemGrid } from '@/components/canary/organisms/item-grid/item-grid';
import { ItemDetails } from '@/components/canary/organisms/item-details/item-details';
import type { Item } from '@/types/extras';
import type { FieldDef } from '@/components/canary/molecules/field-list/field-list';
import { itemMockData } from '../_shared/mock-data';
import { storyStepDelay } from '../_shared/story-step-delay';

// ---------------------------------------------------------------------------
// Helper: item → fields
// ---------------------------------------------------------------------------

function itemToFields(item: Item): FieldDef[] {
  const fields: FieldDef[] = [{ key: 'name', label: 'Name', value: item.name }];
  if (item.internalSKU) fields.push({ key: 'sku', label: 'SKU', value: item.internalSKU });
  if (item.generalLedgerCode)
    fields.push({ key: 'gl', label: 'GL Code', value: item.generalLedgerCode });
  if (item.classification) {
    fields.push({ key: 'classType', label: 'Type', value: item.classification.type });
    if (item.classification.subType)
      fields.push({ key: 'subType', label: 'Sub-type', value: item.classification.subType });
  }
  if (item.primarySupply) {
    if (item.primarySupply.supplier)
      fields.push({ key: 'supplier', label: 'Supplier', value: item.primarySupply.supplier });
    if (item.primarySupply.unitCost)
      fields.push({
        key: 'unitCost',
        label: 'Unit Cost',
        value: `$${item.primarySupply.unitCost.value.toFixed(2)}`,
      });
    if (item.primarySupply.orderCost)
      fields.push({
        key: 'orderCost',
        label: 'Order Cost',
        value: `$${item.primarySupply.orderCost.value.toFixed(2)}`,
      });
  }
  if (item.notes) fields.push({ key: 'notes', label: 'Notes', value: item.notes });
  return fields;
}

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

function ItemsDetailPage() {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const actions = [
    {
      key: 'edit',
      label: 'Edit',
      icon: SquarePen,
      onAction: () => console.log('Edit:', selectedItem?.name),
    },
    {
      key: 'queue',
      label: 'Queue',
      icon: ShoppingCart,
      onAction: () => console.log('Queue:', selectedItem?.name),
    },
    {
      key: 'print',
      label: 'Print',
      icon: Printer,
      onAction: () => console.log('Print:', selectedItem?.name),
    },
  ];

  const overflowActions = [
    {
      key: 'label',
      label: 'Label',
      icon: Tag,
      onAction: () => console.log('Label:', selectedItem?.name),
    },
    {
      key: 'scan',
      label: 'Scan',
      icon: ScanLine,
      onAction: () => console.log('Scan:', selectedItem?.name),
    },
    {
      key: 'duplicate',
      label: 'Duplicate',
      icon: Copy,
      onAction: () => console.log('Duplicate:', selectedItem?.name),
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: Trash2,
      onAction: () => console.log('Delete:', selectedItem?.name),
      destructive: true,
    },
  ];

  return (
    <Sidebar
      defaultOpen
      content={
        <SidebarInset>
          <AppHeader leading={<SidebarTrigger className="self-center" />} showSearch={false} />
          <main className="flex flex-1 flex-col gap-4 p-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Items</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Click any row to view item details.
              </p>
            </div>
            <ItemGrid items={itemMockData} autoHeight onItemClick={setSelectedItem} />
          </main>

          {/* Item details drawer */}
          <ItemDetails
            open={!!selectedItem}
            onOpenChange={(open) => {
              if (!open) setSelectedItem(null);
            }}
            title={selectedItem?.name ?? ''}
            fields={selectedItem ? itemToFields(selectedItem) : []}
            actions={actions}
            overflowActions={overflowActions}
            cardCount={3}
            renderCard={(index) => (
              <div className="flex h-full w-full flex-col justify-between rounded-lg border bg-background p-4 shadow-sm">
                <p className="text-sm font-medium">{selectedItem?.name}</p>
                <span className="text-xs text-muted-foreground font-mono">Card {index} of 3</span>
              </div>
            )}
          />
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
          { key: 'logout', label: 'Log out', icon: LogOut, onClick: () => {}, destructive: true },
        ]}
      />
    </Sidebar>
  );
}

// ---------------------------------------------------------------------------
// Story meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof ItemsDetailPage> = {
  title: 'Use Cases/Reference/Items/ITM-0002 View Details/Item Details Panel',
  component: ItemsDetailPage,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ItemsDetailPage>;

/**
 * Default — click a grid row to open the item details drawer.
 * Play function: click a row, verify drawer opens, check field values,
 * switch to cards tab.
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

    await step('Click first row to open item details drawer', async () => {
      const firstItem = canvas.getByText('Nitrile Exam Gloves (Medium)', {
        selector: '[role="gridcell"]',
      });
      await userEvent.click(firstItem);
    });

    await step('Drawer opens and shows item title', async () => {
      // Drawer renders via Radix portal outside canvasElement — use screen
      await waitFor(
        () => {
          expect(screen.getByRole('dialog')).toBeVisible();
        },
        { timeout: 10000 },
      );
    });

    await storyStepDelay();

    await step('Details tab shows key fields', async () => {
      // Scope queries to the portal dialog
      const drawer = within(screen.getByRole('dialog'));
      expect(drawer.getByText('GLV-NIT-M-100')).toBeVisible();
      expect(drawer.getByText('Medline Industries')).toBeVisible();
    });

    await storyStepDelay();

    await step('Switch to Cards tab', async () => {
      // Tab is inside the portal — scope to dialog
      const drawer = within(screen.getByRole('dialog'));
      const cardsTab = drawer.getByRole('tab', { name: /cards/i });
      await userEvent.click(cardsTab);
    });

    await storyStepDelay();
  },
};

/**
 * CloseDrawer — open drawer then close it via the X button.
 */
export const CloseDrawer: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Open the item details drawer', async () => {
      const firstItem = await canvas.findByText(
        'Nitrile Exam Gloves (Medium)',
        { selector: '[role="gridcell"]' },
        { timeout: 10000 },
      );
      await userEvent.click(firstItem);
      // Drawer renders via Radix portal outside canvasElement — use screen
      await waitFor(
        () => {
          expect(screen.getByRole('dialog')).toBeVisible();
        },
        { timeout: 10000 },
      );
    });

    await storyStepDelay();

    await step('Close the drawer via the X button', async () => {
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

    await step('Grid is still visible after drawer closes', async () => {
      expect(canvas.getByText('Nitrile Exam Gloves (Medium)')).toBeVisible();
    });
  },
};
