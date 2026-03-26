/**
 * GEN-MEDIA-0001::0007.FS — Grid Inline Edit
 * Scene: Enter Key
 *
 * Renders a grid with an editable image column. Clicking to select a cell then
 * pressing Enter triggers the ImageUploadDialog modal.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, fn, screen } from 'storybook/test';
import type { ColDef } from 'ag-grid-community';

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import {
  MOCK_ITEMS,
  ITEM_IMAGE_CONFIG,
  type MockItem,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import { ImageCellDisplay } from '@/components/canary/atoms/grid/image/image-cell-display';
import { createImageCellEditor } from '@/components/canary/atoms/grid/image/image-cell-editor';
import { createEntityDataGrid } from '@/components/canary/organisms/shared/entity-data-grid/create-entity-data-grid';

// ---------------------------------------------------------------------------
// Story-local column definitions — image column is editable
// ---------------------------------------------------------------------------

const columnDefs: ColDef<MockItem>[] = [
  {
    field: 'imageUrl',
    headerName: 'Image',
    cellRenderer: ImageCellDisplay,
    cellRendererParams: { config: ITEM_IMAGE_CONFIG },
    cellEditor: createImageCellEditor(ITEM_IMAGE_CONFIG),
    editable: true,
    width: 60,
    sortable: false,
    resizable: false,
  },
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'sku', headerName: 'SKU', width: 100 },
  { field: 'unitCost', headerName: 'Unit Cost', width: 110 },
];

// ---------------------------------------------------------------------------
// Grid factory
// ---------------------------------------------------------------------------

const { Component: InlineEditGrid } = createEntityDataGrid<MockItem>({
  displayName: 'Grid Inline Edit (Enter Key)',
  persistenceKeyPrefix: 'gen-media-0001-0007-enter-key',
  columnDefs,
  defaultColDef: { sortable: true, resizable: true },
  getEntityId: (item) => item.id,
  autoHeight: true,
});

// ---------------------------------------------------------------------------
// Live component wrapper
// ---------------------------------------------------------------------------

interface EnterKeyPageProps {
  onRowPublish: (rowId: string, changes: Record<string, unknown>) => Promise<void>;
}

function EnterKeyLive({ onRowPublish }: EnterKeyPageProps) {
  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-semibold tracking-tight mb-1">
        GEN-MEDIA-0001 &#8212; Grid Inline Edit: Enter Key
      </h1>
      <p className="text-sm text-muted-foreground mb-4">
        Click an image cell to select it, then press Enter to open the Image Upload dialog. Tab
        between cells to navigate; Enter triggers editing on the focused image cell.
      </p>
      <InlineEditGrid data={MOCK_ITEMS.slice(0, 3)} enableCellEditing onRowPublish={onRowPublish} />
    </div>
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

function EnterKeySceneRenderer({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    case 0:
      return (
        <ScenePanel
          title="Grid renders with image cells"
          description="The grid is visible with 3 rows. Each row has an image cell in the first column. The grid awaits a click to select a cell."
        />
      );
    case 1:
      return (
        <ScenePanel
          title="Click image cell to select it"
          description="The user single-clicks the first image cell. AG Grid highlights the cell as selected (focused) without entering edit mode."
        />
      );
    case 2:
      return (
        <ScenePanel
          title="Press Enter to open dialog"
          description="With the image cell focused, the user presses Enter. AG Grid activates the cell editor, which is the ImageCellEditor, and the ImageUploadDialog appears."
        />
      );
    case 3:
    default:
      return (
        <ScenePanel
          title="Dialog opens, then Cancel is clicked"
          description="The ImageUploadDialog is visible in EmptyImage state. The user clicks Cancel to dismiss the dialog without making changes. The grid remains unchanged."
        />
      );
  }
}

/* ================================================================
   SCENES + WORKFLOW FACTORY
   ================================================================ */

const enterKeyScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 4 \u2014 Grid Visible',
    description:
      'The grid renders with 3 rows and an editable image column. No cell is selected yet.',
    interaction: 'Click the image cell in the first row to select it.',
  },
  {
    title: 'Scene 2 of 4 \u2014 Cell Selected',
    description:
      'The first image cell is selected (focused). AG Grid shows the cell focus border. The dialog has not opened yet.',
    interaction: 'Press the Enter key to trigger the cell editor.',
  },
  {
    title: 'Scene 3 of 4 \u2014 Enter Pressed, Dialog Opens',
    description:
      'Pressing Enter activates the ImageCellEditor, which mounts the ImageUploadDialog in EmptyImage state.',
    interaction: 'Observe the dialog is open. Click Cancel to dismiss.',
  },
  {
    title: 'Scene 4 of 4 \u2014 Cancel Clicked',
    description:
      'The user clicks Cancel. The dialog closes without any changes. The grid row remains unchanged and no onRowPublish event fires.',
    interaction: 'The workflow is complete. Click the cell and press Enter again to repeat.',
  },
];

const onRowPublishFn = fn();

const {
  Interactive: EnterKeyInteractive,
  Stepwise: EnterKeyStepwise,
  Automated: EnterKeyAutomated,
} = createWorkflowStories({
  scenes: enterKeyScenes,
  renderScene: (i) => <EnterKeySceneRenderer sceneIndex={i} />,
  renderLive: () => <EnterKeyLive onRowPublish={onRowPublishFn} />,
  delayMs: 2000,
  maxWidth: 800,
  play: async ({ goToScene, delay }) => {
    goToScene(0);

    // Scene 1: Wait for grid to render
    await waitFor(
      () => {
        const cells = document.querySelectorAll('[data-slot="image-cell-display"]');
        expect(cells.length).toBeGreaterThan(0);
      },
      { timeout: 10000 },
    );
    await delay();

    // Scene 2: Click first image cell to select it
    goToScene(1);
    const firstCell = document.querySelector(
      '[data-slot="image-cell-display"]',
    ) as HTMLElement | null;
    if (!firstCell) throw new Error('No image cell found');
    const agCell = firstCell.closest('.ag-cell') as HTMLElement | null;
    if (agCell) {
      await userEvent.click(agCell);
    } else {
      await userEvent.click(firstCell);
    }
    await delay();

    // Scene 3: Press Enter to start editing
    goToScene(2);
    await userEvent.keyboard('{Enter}');

    await waitFor(
      () => {
        expect(screen.getByRole('dialog')).toBeVisible();
      },
      { timeout: 5000 },
    );
    await delay();

    // Scene 4: Cancel dialog
    goToScene(3);
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    await delay();
  },
});

/* ================================================================
   META + EXPORTS
   ================================================================ */

const meta: Meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0007 Grid Inline Edit/Enter Key',
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onRowPublish: fn(),
  },
};

export default meta;

export const EnterKeyInteractiveStory: StoryObj = {
  ...EnterKeyInteractive,
  name: 'Enter Key (Interactive)',
};

export const EnterKeyStepwiseStory: StoryObj = {
  ...EnterKeyStepwise,
  name: 'Enter Key (Stepwise)',
};

export const EnterKeyAutomatedStory: StoryObj = {
  ...EnterKeyAutomated,

  name: 'Enter Key (Automated)',
};
