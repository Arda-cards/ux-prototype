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

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
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

function ChangeItemImageSceneRenderer({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    case 0:
      return (
        <ScenePanel
          title="Grid visible with item data"
          description="The full app shell renders with the Items grid. The first row (Nitrile Exam Gloves) has an existing product image thumbnail in the image column."
        />
      );
    case 1:
      return (
        <ScenePanel
          title="Double-click image cell of first row"
          description="The user double-clicks the image cell in the first row. AG Grid detects the gesture and activates the ImageCellEditor, mounting the ImageUploadDialog."
        />
      );
    case 2:
      return (
        <ScenePanel
          title="Dialog opens in EditExisting (comparison) mode"
          description="Because the item already has an image, the ImageUploadDialog opens in EditExisting mode. The current image is shown alongside options to Accept (keep), Upload New, or Dismiss."
        />
      );
    case 3:
    default:
      return (
        <ScenePanel
          title="Cancel clicked — grid row still visible"
          description="The user clicked Cancel. The dialog has closed. The grid row still shows the original image cell. No image was changed."
        />
      );
  }
}

/* ================================================================
   SCENES + WORKFLOW FACTORY
   ================================================================ */

const changeItemImageScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 4 \u2014 Grid Visible',
    description:
      'The full app shell renders with the Items grid. The first row has a product image. The grid is in view-only mode.',
    interaction: 'Double-click the image cell in the first row to open the editor.',
  },
  {
    title: 'Scene 2 of 4 \u2014 Double-Click Image Cell',
    description:
      'The user double-clicks the image cell of the first row (which has an existing image). AG Grid activates the ImageCellEditor.',
    interaction: 'Wait for the dialog to open in EditExisting mode.',
  },
  {
    title: 'Scene 3 of 4 \u2014 Dialog in EditExisting Mode',
    description:
      'The ImageUploadDialog opens in EditExisting mode. The current image is shown with options to Accept (keep current), Upload New Image, or Dismiss.',
    interaction: 'Click Cancel to close the dialog without making changes.',
  },
  {
    title: 'Scene 4 of 4 \u2014 Dialog Closed',
    description:
      'The dialog has closed. The grid row is still showing the original image. No changes were made.',
    interaction: 'The workflow is complete. Double-click again to replace the image.',
  },
];

const {
  Interactive: ChangeImageInteractive,
  Stepwise: ChangeImageStepwise,
  Automated: ChangeImageAutomated,
} = createWorkflowStories({
  scenes: changeItemImageScenes,
  renderScene: (i) => <ChangeItemImageSceneRenderer sceneIndex={i} />,
  renderLive: () => <ChangeImagePage />,
  delayMs: 2000,
  play: async ({ canvas, goToScene, delay }) => {
    goToScene(0);

    // Scene 1: Wait for grid to render with item data
    const firstItem = await canvas.findByText(
      'Nitrile Exam Gloves (Medium)',
      { selector: '[role="gridcell"]' },
      { timeout: 10000 },
    );
    expect(firstItem).toBeVisible();
    await storyStepDelay();
    await delay();

    // Scene 2: Double-click image cell of first row
    goToScene(1);
    const rows = document.querySelectorAll('[role="row"].ag-row');
    const firstRow = rows[0] as HTMLElement | undefined;
    if (firstRow) {
      const imageCell =
        firstRow.querySelector<HTMLElement>('[data-slot="image-cell-display"]') ??
        firstRow.querySelector<HTMLElement>('[role="gridcell"]');
      if (imageCell) {
        await userEvent.dblClick(imageCell);
      }
    }
    await delay();

    // Scene 3: Dialog opens
    goToScene(2);
    await waitFor(
      () => {
        const dialog = screen.queryByRole('dialog');
        expect(dialog).not.toBeNull();
        expect(dialog).toBeVisible();
      },
      { timeout: 8000 },
    );
    await storyStepDelay();
    await delay();

    // Scene 4: Cancel to close the dialog
    goToScene(3);
    const dialog = screen.getByRole('dialog');
    const cancelButton = within(dialog).getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);
    await waitFor(
      () => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    await storyStepDelay();

    // Verify grid row still visible
    expect(
      canvas.getByText('Nitrile Exam Gloves (Medium)', { selector: '[role="gridcell"]' }),
    ).toBeVisible();
    await delay();
  },
});

/* ================================================================
   META + EXPORTS
   ================================================================ */

const meta: Meta = {
  title:
    'Use Cases/Reference/Items/ITM-0004 Edit Item/0006 Change or Remove Image/Change Item Image',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export const ChangeItemImageInteractiveStory: StoryObj = {
  ...ChangeImageInteractive,
  name: 'Change Item Image (Interactive)',
};

export const ChangeItemImageStepwiseStory: StoryObj = {
  ...ChangeImageStepwise,
  name: 'Change Item Image (Stepwise)',
};

export const ChangeItemImageAutomatedStory: StoryObj = {
  ...ChangeImageAutomated,
  tags: ['skip-ci'],
  name: 'Change Item Image (Automated)',
};
