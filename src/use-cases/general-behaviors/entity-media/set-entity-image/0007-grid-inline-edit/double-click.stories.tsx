/**
 * GEN-MEDIA-0001::0007.FS — Grid Inline Edit
 * Scene: Double Click
 *
 * Renders a grid with an editable image column. Double-clicking an image cell
 * opens the ImageUploadDialog modal. On confirm, the grid row updates to the
 * new image URL.
 */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, fn, screen } from 'storybook/test';
import type { ColDef } from 'ag-grid-community';

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import {
  MOCK_ITEMS,
  ITEM_IMAGE_CONFIG,
  MOCK_FILE_JPEG,
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
  displayName: 'Grid Inline Edit (Double Click)',
  persistenceKeyPrefix: 'gen-media-0001-0007-double-click',
  columnDefs,
  defaultColDef: { sortable: true, resizable: true },
  getEntityId: (item) => item.id,
  autoHeight: true,
});

// ---------------------------------------------------------------------------
// Live component wrapper
// ---------------------------------------------------------------------------

interface DoubleClickPageProps {
  onRowPublish: (rowId: string, changes: Record<string, unknown>) => Promise<void>;
}

function DoubleClickLive({ onRowPublish }: DoubleClickPageProps) {
  const [rows, setRows] = useState<MockItem[]>(MOCK_ITEMS.slice(0, 3));

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-semibold tracking-tight mb-1">
        GEN-MEDIA-0001 &#8212; Grid Inline Edit: Double Click
      </h1>
      <p className="text-sm text-muted-foreground mb-4">
        Double-click an image cell to open the Image Upload dialog. Confirm an upload to update the
        grid row.
      </p>
      <InlineEditGrid
        data={rows}
        enableCellEditing
        onRowPublish={async (rowId, changes) => {
          await onRowPublish(rowId, changes as Record<string, unknown>);
          setRows((prev) =>
            prev.map((r) => (r.id === rowId ? { ...r, ...(changes as Partial<MockItem>) } : r)),
          );
        }}
      />
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

function DoubleClickSceneRenderer({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    case 0:
      return (
        <ScenePanel
          title="Grid renders with image cells"
          description="The grid is visible with 3 rows. Each row has an image cell showing a thumbnail (or placeholder) in the first column. The Name, SKU, and Unit Cost columns are also visible."
        />
      );
    case 1:
      return (
        <ScenePanel
          title="Double-click on first image cell"
          description="The user double-clicks the image cell in the first row. AG Grid detects the double-click and triggers the cell editor, which is the ImageCellEditor."
        />
      );
    case 2:
      return (
        <ScenePanel
          title="ImageUploadDialog opens"
          description="The ImageUploadDialog appears in EmptyImage mode showing the ImageDropZone. The user can drag-and-drop a file, paste from clipboard, or enter a URL."
        />
      );
    case 3:
      return (
        <ScenePanel
          title="File uploaded and copyright acknowledged"
          description="The user has picked a JPEG file. The dialog shows the crop editor (ProvidedImage state) and the copyright acknowledgment checkbox. The user checks the box, enabling the Confirm button."
        />
      );
    case 4:
      return (
        <ScenePanel
          title="Confirm clicked"
          description="The user clicks Confirm. The image is uploaded and the dialog closes. onRowPublish is called with the new imageUrl for the first row."
        />
      );
    case 5:
    default:
      return (
        <ScenePanel
          title="Row updated with new image"
          description="The dialog is closed. The first row in the grid now shows the newly uploaded image in the image cell. The row data has been updated via onRowPublish."
        />
      );
  }
}

/* ================================================================
   SCENES + WORKFLOW FACTORY
   ================================================================ */

const doubleClickScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 6 \u2014 Grid Visible',
    description:
      'The grid renders with 3 rows. Each row has an image thumbnail in the first column. The grid is in view-only mode until a cell is double-clicked.',
    interaction: 'Double-click the image cell in the first row to start editing.',
  },
  {
    title: 'Scene 2 of 6 \u2014 Double-Click Image Cell',
    description:
      'The user double-clicks the image cell. AG Grid detects the gesture and activates the ImageCellEditor, which mounts the ImageUploadDialog.',
    interaction: 'Wait for the dialog to open.',
  },
  {
    title: 'Scene 3 of 6 \u2014 Dialog Opens',
    description:
      'The ImageUploadDialog is now visible in EmptyImage state. The user can select a file via drag-and-drop, file picker, clipboard paste, or URL entry.',
    interaction: 'Upload a JPEG file to stage it for the image slot.',
  },
  {
    title: 'Scene 4 of 6 \u2014 File Staged, Copyright Acknowledged',
    description:
      'The file has been uploaded. The dialog shows the crop editor and the copyright acknowledgment checkbox. Checking the box enables the Confirm button.',
    interaction: 'Check the copyright box, then click Confirm.',
  },
  {
    title: 'Scene 5 of 6 \u2014 Confirm Clicked',
    description:
      'The user clicks Confirm. The image is processed and uploaded. The dialog begins to close.',
    interaction: 'Wait for the dialog to close and the grid to update.',
  },
  {
    title: 'Scene 6 of 6 \u2014 Row Updated',
    description:
      'The dialog has closed. The first row now shows the newly uploaded image in the image cell. The onRowPublish callback was called with the new imageUrl.',
    interaction: 'The workflow is complete. Double-click again to change the image.',
  },
];

const onRowPublishFn = fn();

const {
  Interactive: DoubleClickInteractive,
  Stepwise: DoubleClickStepwise,
  Automated: DoubleClickAutomated,
} = createWorkflowStories({
  scenes: doubleClickScenes,
  renderScene: (i) => <DoubleClickSceneRenderer sceneIndex={i} />,
  renderLive: () => <DoubleClickLive onRowPublish={onRowPublishFn} />,
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

    // Scene 2: Double-click first image cell
    goToScene(1);
    const firstCell = document.querySelector(
      '[data-slot="image-cell-display"]',
    ) as HTMLElement | null;
    if (!firstCell) throw new Error('No image cell found');
    await userEvent.dblClick(firstCell);

    // Scene 3: Dialog opens
    await waitFor(
      () => {
        expect(screen.getByRole('dialog')).toBeVisible();
      },
      { timeout: 5000 },
    );
    goToScene(2);
    await delay();

    // Scene 4: Upload file and acknowledge copyright
    const fileInput = await waitFor(() => {
      const el = document.querySelector<HTMLInputElement>('input[type="file"]');
      if (!el) throw new Error('File input not found');
      return el;
    });
    await userEvent.upload(fileInput, MOCK_FILE_JPEG);

    await waitFor(
      () => {
        expect(screen.getByRole('checkbox', { name: /copyright acknowledgment/i })).toBeVisible();
      },
      { timeout: 5000 },
    );
    const checkbox = screen.getByRole('checkbox', { name: /copyright acknowledgment/i });
    await userEvent.click(checkbox);
    goToScene(3);
    await delay();

    // Scene 5: Confirm
    goToScene(4);
    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      expect(confirmButton).not.toBeDisabled();
    });
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await userEvent.click(confirmButton);

    // Scene 6: Dialog closes, row updated
    await waitFor(
      () => {
        expect(screen.queryByRole('dialog')).toBeNull();
      },
      { timeout: 8000 },
    );
    goToScene(5);
    await delay();
  },
});

/* ================================================================
   META + EXPORTS
   ================================================================ */

const meta: Meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0007 Grid Inline Edit/Double Click',
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onRowPublish: fn(),
  },
};

export default meta;

export const DoubleClickInteractiveStory: StoryObj = {
  ...DoubleClickInteractive,
  name: 'Double Click (Interactive)',
};

export const DoubleClickStepwiseStory: StoryObj = {
  ...DoubleClickStepwise,
  name: 'Double Click (Stepwise)',
};

export const DoubleClickAutomatedStory: StoryObj = {
  ...DoubleClickAutomated,
  name: 'Double Click (Automated)',
};
