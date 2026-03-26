/**
 * REF::ITM::0004::0006.UC — Remove Item Image
 *
 * 100% canary story: full-app composition with Sidebar + AppHeader + ItemGrid +
 * ItemDetails drawer. The detail panel includes an "Image" tab that renders
 * ImageFormField for the selected item. Hovering the image reveals the action
 * overlay; clicking the trash icon opens a confirmation AlertDialog; confirming
 * removes the image (calls onChange(null)).
 *
 * Maps to: REF::ITM::0004 Edit Item / 0006 Change or Remove Image
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
  ImageIcon,
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
import { ImageFormField } from '@/components/canary/molecules/form/image/image-form-field';
import { ITEM_IMAGE_CONFIG, MOCK_ITEM_IMAGE } from '@/components/canary/__mocks__/image-story-data';
import type { Item } from '@/types/extras';
import type { FieldDef } from '@/components/canary/molecules/field-list/field-list';
import { itemMockData } from '../../_shared/mock-data';
import { storyStepDelay } from '../../_shared/story-step-delay';

// ---------------------------------------------------------------------------
// Helpers
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
  if (item.primarySupply?.supplier)
    fields.push({ key: 'supplier', label: 'Supplier', value: item.primarySupply.supplier });
  if (item.notes) fields.push({ key: 'notes', label: 'Notes', value: item.notes });
  return fields;
}

// Custom tabs for ItemDetails — adds "Image" tab
const ITEM_DETAIL_TABS = [
  { key: 'details', label: 'Item details' },
  { key: 'cards', label: 'Cards' },
  { key: 'image', label: 'Image', icon: ImageIcon },
];

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

function RemoveImagePage() {
  // Patch items so item 0 has a known image for the removal demo
  const patchedItems = itemMockData.map((item, idx) =>
    idx === 0 ? { ...item, imageUrl: MOCK_ITEM_IMAGE } : item,
  );

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [removeLog, setRemoveLog] = useState<string[]>([]);

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
    // Use the patched imageUrl for item 0
    const patched = patchedItems.find((p) => p.entityId === item.entityId);
    setImageUrl(patched?.imageUrl ?? null);
  };

  const handleImageChange = (url: string | null) => {
    setImageUrl(url);
    if (url === null && selectedItem) {
      setRemoveLog((prev) => [...prev, `Image removed from "${selectedItem.name}"`]);
    }
  };

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
                Click a row to open the detail panel. Switch to the Image tab to manage the item
                image. Hover the image and click the trash icon to remove it.
              </p>
            </div>
            <ItemGrid items={patchedItems} autoHeight onItemClick={handleItemClick} />
            {removeLog.length > 0 && (
              <div className="rounded-lg border bg-muted/30 p-3" data-testid="remove-log">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Remove Log
                </p>
                <div className="space-y-1 max-h-24 overflow-auto">
                  {removeLog.map((entry, i) => (
                    <p key={i} className="text-xs font-mono text-muted-foreground">
                      {entry}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* Item details drawer with Image tab */}
          <ItemDetails
            open={!!selectedItem}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedItem(null);
                setImageUrl(null);
              }
            }}
            title={selectedItem?.name ?? ''}
            fields={selectedItem ? itemToFields(selectedItem) : []}
            tabs={ITEM_DETAIL_TABS}
            actions={actions}
            overflowActions={overflowActions}
            cardCount={3}
            renderCard={(index) => (
              <div className="flex h-full w-full flex-col justify-between rounded-lg border bg-background p-4 shadow-sm">
                <p className="text-sm font-medium">{selectedItem?.name}</p>
                <span className="text-xs text-muted-foreground font-mono">Card {index} of 3</span>
              </div>
            )}
            renderCardsTab={() => (
              <div
                className="flex flex-col items-center gap-4 py-6 px-4"
                data-testid="image-tab-content"
              >
                <p className="text-sm font-medium text-muted-foreground self-start">
                  Product image
                </p>
                {imageUrl === null && (
                  <p className="text-sm text-muted-foreground" data-testid="image-placeholder-text">
                    No image set
                  </p>
                )}
                <ImageFormField
                  config={ITEM_IMAGE_CONFIG}
                  imageUrl={imageUrl}
                  onChange={handleImageChange}
                />
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

const meta: Meta<typeof RemoveImagePage> = {
  title:
    'Use Cases/Reference/Items/ITM-0004 Edit Item/0006 Change or Remove Image/Remove Item Image',
  component: RemoveImagePage,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof RemoveImagePage>;

/**
 * Default — click a row, open the detail panel, switch to the Image tab,
 * hover the ImageFormField, click the trash icon, confirm removal in the
 * AlertDialog, verify the placeholder appears.
 *
 * Play function steps:
 *   1. Wait for grid to render.
 *   2. Click first row (patched with MOCK_ITEM_IMAGE) — details drawer opens.
 *   3. Click the "Image" tab in the drawer.
 *   4. Hover the image area to reveal action overlay.
 *   5. Click the trash (Remove image) button.
 *   6. AlertDialog appears — click "Remove" to confirm.
 *   7. AlertDialog closes; "No image set" placeholder appears.
 *   8. Remove log entry appears in the page.
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

    await step('Details drawer opens', async () => {
      // ItemDetails uses Radix Drawer which renders via portal — use screen
      await waitFor(
        () => {
          expect(screen.getByRole('dialog')).toBeVisible();
        },
        { timeout: 10000 },
      );
    });

    await storyStepDelay();

    await step('Click the Image tab in the drawer', async () => {
      const drawer = within(screen.getByRole('dialog'));
      const imageTab = drawer.getByRole('tab', { name: /image/i });
      await userEvent.click(imageTab);
    });

    await step('Image tab content renders with ImageFormField', async () => {
      const drawer = within(screen.getByRole('dialog'));
      await waitFor(
        () => {
          const imageTabContent = drawer.queryByTestId('image-tab-content');
          expect(imageTabContent).not.toBeNull();
          expect(imageTabContent).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();

    await step('Hover image to reveal action overlay', async () => {
      const drawer = within(screen.getByRole('dialog'));
      const imageArea = drawer.getByRole('button', { name: /edit product image/i });
      await userEvent.hover(imageArea);
    });

    await storyStepDelay(800);

    await step('Click the Remove image (trash) button', async () => {
      // After hovering the group, the trash button becomes visible via CSS group-hover
      const removeButton = screen.getByRole('button', { name: /remove image/i });
      await userEvent.click(removeButton);
    });

    await step('AlertDialog opens with removal confirmation', async () => {
      await waitFor(
        () => {
          const alertDialog = screen.queryByRole('alertdialog');
          expect(alertDialog).not.toBeNull();
          expect(alertDialog).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();

    await step('Confirm image removal', async () => {
      const alertDialog = screen.getByRole('alertdialog');
      const confirmButton = within(alertDialog).getByRole('button', { name: /remove/i });
      await userEvent.click(confirmButton);
    });

    await step('AlertDialog closes after confirmation', async () => {
      await waitFor(
        () => {
          expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();

    await step('Placeholder text appears — image removed', async () => {
      const drawer = within(screen.getByRole('dialog'));
      await waitFor(
        () => {
          const placeholder = drawer.queryByTestId('image-placeholder-text');
          expect(placeholder).not.toBeNull();
          expect(placeholder).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();

    await step('Remove log entry appears in page', async () => {
      await waitFor(
        () => {
          const logEl = canvas.queryByTestId('remove-log');
          expect(logEl).not.toBeNull();
        },
        { timeout: 5000 },
      );
    });
  },
};
