/**
 * GEN-MEDIA-0001::0007.FS — Grid Inline Edit
 * Scene: Cancel
 *
 * Renders a grid with an editable image column. Double-clicking opens the
 * ImageUploadDialog. Clicking Cancel closes the dialog without changing the
 * row — the original image URL is preserved.
 */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
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
  displayName: 'Grid Inline Edit (Cancel)',
  persistenceKeyPrefix: 'gen-media-0001-0007-cancel',
  columnDefs,
  defaultColDef: { sortable: true, resizable: true },
  getEntityId: (item) => item.id,
  autoHeight: true,
});

// ---------------------------------------------------------------------------
// Live component wrapper
// ---------------------------------------------------------------------------

interface CancelPageProps {
  onRowPublish: (rowId: string, changes: Record<string, unknown>) => Promise<void>;
}

function CancelLive({ onRowPublish }: CancelPageProps) {
  const [rows, setRows] = useState<MockItem[]>(MOCK_ITEMS.slice(0, 3));
  const [publishCount, setPublishCount] = useState(0);

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-semibold tracking-tight mb-1">
        GEN-MEDIA-0001 &#8212; Grid Inline Edit: Cancel
      </h1>
      <p className="text-sm text-muted-foreground mb-4">
        Double-click an image cell to open the dialog. Click Cancel to discard without saving. The
        row image remains unchanged.
      </p>
      <InlineEditGrid
        data={rows}
        enableCellEditing
        onRowPublish={async (rowId, changes) => {
          await onRowPublish(rowId, changes as Record<string, unknown>);
          setPublishCount((c) => c + 1);
          setRows((prev) =>
            prev.map((r) => (r.id === rowId ? { ...r, ...(changes as Partial<MockItem>) } : r)),
          );
        }}
      />
      {publishCount > 0 && (
        <p className="mt-3 text-sm text-destructive" data-testid="publish-count">
          onRowPublish was called {publishCount} time{publishCount > 1 ? 's' : ''} &#8212;
          unexpected on cancel path!
        </p>
      )}
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

function CancelSceneRenderer({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    case 0:
      return (
        <ScenePanel
          title="Grid renders with image cells"
          description="The grid is visible with 3 rows. Each row has an image cell in the first column. The grid is in view mode — no cell is editing yet."
        />
      );
    case 1:
      return (
        <ScenePanel
          title="Double-click opens the dialog"
          description="The user double-clicks the first image cell. The ImageUploadDialog appears in EmptyImage state showing the drop zone."
        />
      );
    case 2:
      return (
        <ScenePanel
          title="Dialog open — Cancel button visible"
          description="The ImageUploadDialog is open. The user has decided not to change the image and clicks the Cancel button."
        />
      );
    case 3:
    default:
      return (
        <ScenePanel
          title="Dialog closed — row unchanged"
          description="After cancelling, the dialog has closed. The grid row still shows the original image cell content. onRowPublish was NOT called, confirming no data was changed."
        />
      );
  }
}

/* ================================================================
   SCENES + WORKFLOW FACTORY
   ================================================================ */

const cancelScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 4 \u2014 Grid Visible',
    description:
      'The grid renders with 3 rows and an editable image column. The rows show their original image thumbnails.',
    interaction: 'Double-click the image cell in the first row.',
  },
  {
    title: 'Scene 2 of 4 \u2014 Dialog Opens',
    description:
      'Double-clicking the image cell opens the ImageUploadDialog in EmptyImage state. A Cancel button is visible in the dialog footer.',
    interaction: 'Click Cancel to dismiss the dialog without making changes.',
  },
  {
    title: 'Scene 3 of 4 \u2014 Cancel Clicked',
    description:
      'The user clicks Cancel. The dialog begins to close. No upload has occurred and no row data has been modified.',
    interaction: 'Wait for the dialog to close.',
  },
  {
    title: 'Scene 4 of 4 \u2014 Row Unchanged',
    description:
      'The dialog has closed. The grid row still shows the original image. onRowPublish was NOT called — the cancel path correctly discards any pending edit.',
    interaction: 'The workflow is complete. Double-click again to start a new edit.',
  },
];

const onRowPublishFn = fn();

const {
  Interactive: CancelInteractive,
  Stepwise: CancelStepwise,
  Automated: CancelAutomated,
} = createWorkflowStories({
  scenes: cancelScenes,
  renderScene: (i) => <CancelSceneRenderer sceneIndex={i} />,
  renderLive: () => <CancelLive onRowPublish={onRowPublishFn} />,
  delayMs: 2000,
  maxWidth: 800,
  play: async ({ goToScene, delay }) => {
    for (let i = 0; i < cancelScenes.length; i++) {
      goToScene(i);
      await delay();
    }
  },
});

/* ================================================================
   META + EXPORTS
   ================================================================ */

const meta: Meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0007 Grid Inline Edit/Cancel',
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onRowPublish: fn(),
  },
};

export default meta;

export const CancelInteractiveStory: StoryObj = {
  ...CancelInteractive,
  name: 'Cancel (Interactive)',
};

export const CancelStepwiseStory: StoryObj = {
  ...CancelStepwise,
  name: 'Cancel (Stepwise)',
};

export const CancelAutomatedStory: StoryObj = {
  ...CancelAutomated,

  name: 'Cancel (Automated)',
};
