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

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
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
  const patchedItems = itemMockData.map((item, idx) =>
    idx === 0 ? { ...item, imageUrl: MOCK_ITEM_IMAGE } : item,
  );

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [removeLog, setRemoveLog] = useState<string[]>([]);

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
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

/* ================================================================
   STATIC SCENE RENDERER — used by Stepwise mode
   ================================================================ */

function ScenePanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="border border-border rounded-lg p-6 bg-background max-w-2xl w-full">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function RemoveItemImageSceneRenderer({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    case 0:
      return (
        <ScenePanel
          title="Grid visible with item data"
          description="The full app shell renders with the Items grid. The first row (Nitrile Exam Gloves) has a product image. Click the row to open the details drawer."
        />
      );
    case 1:
      return (
        <ScenePanel
          title="Row clicked — details drawer opens"
          description="Clicking the first row opens the ItemDetails drawer for that item. The drawer shows item details fields and tabs at the top."
        />
      );
    case 2:
      return (
        <ScenePanel
          title="Image tab selected"
          description="The user clicks the 'Image' tab in the drawer. The Image tab content renders with the ImageFormField showing the current product image thumbnail."
        />
      );
    case 3:
      return (
        <ScenePanel
          title="Hover image — trash icon visible"
          description="The user hovers over the image area. The action overlay becomes visible revealing the Remove image (trash) icon."
        />
      );
    case 4:
      return (
        <ScenePanel
          title="Trash clicked — confirmation dialog"
          description="Clicking the trash icon opens an AlertDialog asking 'Remove image?' with Cancel and Remove buttons."
        />
      );
    case 5:
    default:
      return (
        <ScenePanel
          title="Confirmed — placeholder appears"
          description="The user clicked Remove. The AlertDialog has closed. The ImageFormField now shows the placeholder state (No image set) in the Image tab."
        />
      );
  }
}

/* ================================================================
   SCENES + WORKFLOW FACTORY
   ================================================================ */

const removeItemImageScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 6 \u2014 Grid Visible',
    description:
      'The full app shell renders with the Items grid. The first row has a product image. The grid is in view mode.',
    interaction: 'Click the first row (Nitrile Exam Gloves) to open the item details drawer.',
  },
  {
    title: 'Scene 2 of 6 \u2014 Details Drawer Opens',
    description:
      'Clicking the row opens the ItemDetails drawer. The drawer shows the item name, fields, and tab navigation. The default tab is "Item details".',
    interaction: 'Click the "Image" tab in the drawer.',
  },
  {
    title: 'Scene 3 of 6 \u2014 Image Tab',
    description:
      'The Image tab content renders with the ImageFormField showing the current product image thumbnail.',
    interaction: 'Hover over the image thumbnail to reveal the action overlay.',
  },
  {
    title: 'Scene 4 of 6 \u2014 Hover Reveals Action Icons',
    description:
      'Hovering over the image reveals the action overlay. The Remove image (trash) icon becomes visible.',
    interaction: 'Click the trash icon to open the removal confirmation dialog.',
  },
  {
    title: 'Scene 5 of 6 \u2014 Confirmation Dialog',
    description:
      'An AlertDialog opens asking "Remove image?" with Cancel and Remove buttons. Clicking Remove will permanently remove the image from the item.',
    interaction: 'Click "Remove" to confirm.',
  },
  {
    title: 'Scene 6 of 6 \u2014 Image Removed',
    description:
      'The AlertDialog has closed. The ImageFormField now shows the placeholder state — "No image set". A remove log entry appears in the page.',
    interaction: 'The workflow is complete. The product image has been removed from the item.',
  },
];

const {
  Interactive: RemoveImageInteractive,
  Stepwise: RemoveImageStepwise,
  Automated: RemoveImageAutomated,
} = createWorkflowStories({
  scenes: removeItemImageScenes,
  renderScene: (i) => <RemoveItemImageSceneRenderer sceneIndex={i} />,
  renderLive: () => <RemoveImagePage />,
  delayMs: 2000,
  play: async ({ canvas, goToScene, delay }) => {
    goToScene(0);

    // Scene 1: Wait for grid to render
    const firstItem = await canvas.findByText(
      'Nitrile Exam Gloves (Medium)',
      { selector: '[role="gridcell"]' },
      { timeout: 10000 },
    );
    expect(firstItem).toBeVisible();
    await storyStepDelay();
    await delay();

    // Scene 2: Click first row to open item details drawer
    goToScene(1);
    await userEvent.click(firstItem);

    await waitFor(
      () => {
        expect(screen.getByRole('dialog')).toBeVisible();
      },
      { timeout: 10000 },
    );
    await storyStepDelay();
    await delay();

    // Scene 3: Click the Image tab
    goToScene(2);
    const drawer = within(screen.getByRole('dialog'));
    const imageTab = drawer.getByRole('tab', { name: /image/i });
    await userEvent.click(imageTab);

    await waitFor(
      () => {
        const imageTabContent = drawer.queryByTestId('image-tab-content');
        expect(imageTabContent).not.toBeNull();
        expect(imageTabContent).toBeVisible();
      },
      { timeout: 5000 },
    );
    await storyStepDelay();
    await delay();

    // Scene 4: Hover image to reveal action overlay
    goToScene(3);
    const imageArea = drawer.getByRole('button', { name: /edit product image/i });
    await userEvent.hover(imageArea);
    await storyStepDelay(800);
    await delay();

    // Scene 5: Click the Remove image (trash) button
    goToScene(4);
    const removeButton = screen.getByRole('button', { name: /remove image/i });
    await userEvent.click(removeButton);

    await waitFor(
      () => {
        const alertDialog = screen.queryByRole('alertdialog');
        expect(alertDialog).not.toBeNull();
        expect(alertDialog).toBeVisible();
      },
      { timeout: 5000 },
    );
    await storyStepDelay();
    await delay();

    // Scene 6: Confirm image removal
    goToScene(5);
    const alertDialog = screen.getByRole('alertdialog');
    const confirmButton = within(alertDialog).getByRole('button', { name: /remove/i });
    await userEvent.click(confirmButton);

    await waitFor(
      () => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    await storyStepDelay();

    // Verify placeholder appears
    const updatedDrawer = within(screen.getByRole('dialog'));
    await waitFor(
      () => {
        const placeholder = updatedDrawer.queryByTestId('image-placeholder-text');
        expect(placeholder).not.toBeNull();
        expect(placeholder).toBeVisible();
      },
      { timeout: 5000 },
    );

    // Verify remove log entry appears
    await waitFor(
      () => {
        const logEl = canvas.queryByTestId('remove-log');
        expect(logEl).not.toBeNull();
      },
      { timeout: 5000 },
    );
    await delay();
  },
});

/* ================================================================
   META + EXPORTS
   ================================================================ */

const meta: Meta = {
  title:
    'Use Cases/Reference/Items/ITM-0004 Edit Item/0006 Change or Remove Image/Remove Item Image',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export const RemoveItemImageInteractiveStory: StoryObj = {
  ...RemoveImageInteractive,
  name: 'Remove Item Image (Interactive)',
};

export const RemoveItemImageStepwiseStory: StoryObj = {
  ...RemoveImageStepwise,
  name: 'Remove Item Image (Stepwise)',
};

export const RemoveItemImageAutomatedStory: StoryObj = {
  ...RemoveImageAutomated,
  tags: ['skip-ci'],
  name: 'Remove Item Image (Automated)',
};
