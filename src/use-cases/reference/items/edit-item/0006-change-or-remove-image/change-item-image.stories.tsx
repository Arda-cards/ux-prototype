/**
 * REF::ITM::0004::0006.UC — Change Item Image
 *
 * 100% canary story: full-app composition with Sidebar + AppHeader + ItemGrid.
 * Uses ItemGrid with `editable` prop and story-local AG Grid column overrides
 * to enable the ImageCellEditor on the image column. Double-clicking the image
 * cell opens ImageUploadDialog in EditExisting (comparison) layout when the
 * item already has an image.
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
} from 'lucide-react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule, type ColDef } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

import { SidebarInset, SidebarTrigger } from '@/components/canary/primitives/sidebar';
import { Sidebar } from '@/components/canary/organisms/sidebar/sidebar';
import { SidebarHeader } from '@/components/canary/molecules/sidebar/sidebar-header';
import { SidebarNav } from '@/components/canary/molecules/sidebar/sidebar-nav';
import { SidebarNavItem } from '@/components/canary/molecules/sidebar/sidebar-nav-item';
import { SidebarUserMenu } from '@/components/canary/molecules/sidebar/sidebar-user-menu';
import { AppHeader } from '@/components/canary/organisms/app-header/app-header';
import { ImageCellDisplay } from '@/components/canary/atoms/grid/image/image-cell-display';
import { createImageCellEditor } from '@/components/canary/atoms/grid/image/image-cell-editor';
import { ITEM_IMAGE_CONFIG, MOCK_ITEM_IMAGE } from '@/components/canary/__mocks__/image-story-data';
import type { Item } from '@/types/extras';
import { itemMockData } from '../../_shared/mock-data';
import { storyStepDelay } from '../../_shared/story-step-delay';

// ---------------------------------------------------------------------------
// Column definitions with editable image column
// ---------------------------------------------------------------------------

const ImageEditor = createImageCellEditor(ITEM_IMAGE_CONFIG);

function makeEditableImageColumns(): ColDef<Item>[] {
  return [
    {
      headerName: 'Image',
      field: 'imageUrl',
      headerClass: 'sr-only',
      width: 60,
      sortable: false,
      resizable: false,
      editable: true,
      cellRenderer: ImageCellDisplay,
      cellRendererParams: { config: ITEM_IMAGE_CONFIG },
      cellEditor: ImageEditor,
      cellEditorPopup: true,
    },
    {
      headerName: 'Name',
      field: 'name',
      flex: 3,
      minWidth: 200,
    },
    {
      headerName: 'SKU',
      field: 'internalSKU',
      width: 160,
      valueFormatter: (params) => params.value || '\u2014',
    },
  ];
}

// ---------------------------------------------------------------------------
// Editable image grid wrapper
// ---------------------------------------------------------------------------

interface EditableImageGridProps {
  items: Item[];
  onImageChange?: (itemName: string, newUrl: string | null) => void;
}

function EditableImageGrid({ items, onImageChange }: EditableImageGridProps) {
  const columnDefs = makeEditableImageColumns();

  return (
    <div className="ag-theme-quartz" style={{ width: '100%', height: 400 }}>
      <AgGridReact<Item>
        rowData={items}
        columnDefs={columnDefs}
        rowHeight={48}
        headerHeight={36}
        onCellValueChanged={(event) => {
          if (event.colDef.field === 'imageUrl') {
            onImageChange?.(event.data.name, event.newValue as string | null);
          }
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page wrapper — items with existing images for comparison layout
// ---------------------------------------------------------------------------

function ChangeImagePage() {
  // Patch items so the first two have known image URLs (ensures EditExisting phase)
  const patchedItems = itemMockData.map((item, idx) => {
    if (idx === 0) return { ...item, imageUrl: MOCK_ITEM_IMAGE };
    return item;
  });

  const [changeLog, setChangeLog] = useState<string[]>([]);

  const handleImageChange = (itemName: string, newUrl: string | null) => {
    setChangeLog((prev) => [...prev, `"${itemName}" image ${newUrl ? 'updated' : 'removed'}`]);
  };

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
                Double-click an image cell to change the item image. Items with an existing image
                show a side-by-side comparison in the upload dialog.
              </p>
            </div>
            <EditableImageGrid items={patchedItems} onImageChange={handleImageChange} />
            {changeLog.length > 0 && (
              <div className="rounded-lg border bg-muted/30 p-3" data-testid="change-log">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Image Change Log
                </p>
                <div className="space-y-1 max-h-24 overflow-auto">
                  {changeLog.map((entry, i) => (
                    <p key={i} className="text-xs font-mono text-muted-foreground">
                      {entry}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </main>
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

const meta: Meta<typeof ChangeImagePage> = {
  title:
    'Use Cases/Reference/Items/ITM-0004 Edit Item/0006 Change or Remove Image/Change Item Image',
  component: ChangeImagePage,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ChangeImagePage>;

/**
 * Default — double-click the image cell of an item with an existing image,
 * observe ImageUploadDialog opening in EditExisting (comparison) mode,
 * then cancel to close.
 *
 * Play function steps:
 *   1. Wait for grid to render with item data.
 *   2. Double-click the image cell of the first row (patched with MOCK_ITEM_IMAGE).
 *   3. ImageUploadDialog opens — verify the dialog is visible.
 *   4. Cancel the dialog.
 *   5. Grid row is still visible.
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

    await step('Double-click image cell of first row to open ImageUploadDialog', async () => {
      // AG Grid image cells are the first gridcell in each row
      // Image column is width 60px — find via data-slot or first gridcell
      const rows = canvasElement.querySelectorAll('[role="row"].ag-row');
      const firstRow = rows[0] as HTMLElement | undefined;
      if (firstRow) {
        // Try data-slot first, fall back to first gridcell
        const imageCell =
          firstRow.querySelector<HTMLElement>('[data-slot="image-cell-display"]') ??
          firstRow.querySelector<HTMLElement>('[role="gridcell"]');
        if (imageCell) {
          await userEvent.dblClick(imageCell);
        }
      }
    });

    await step('ImageUploadDialog opens via portal', async () => {
      await waitFor(
        () => {
          // Dialog renders via Radix Dialog portal — use screen
          const dialog = screen.queryByRole('dialog');
          expect(dialog).not.toBeNull();
          expect(dialog).toBeVisible();
        },
        { timeout: 8000 },
      );
    });

    await storyStepDelay();

    await step('Cancel to close the dialog', async () => {
      const dialog = screen.getByRole('dialog');
      const cancelButton = within(dialog).getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);
      await waitFor(
        () => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();

    await step('Grid row still visible after dialog closed', async () => {
      expect(
        canvas.getByText('Nitrile Exam Gloves (Medium)', { selector: '[role="gridcell"]' }),
      ).toBeVisible();
    });
  },
};
