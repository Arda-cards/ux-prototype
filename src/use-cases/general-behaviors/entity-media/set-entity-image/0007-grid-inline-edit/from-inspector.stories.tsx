/**
 * GEN-MEDIA-0001::0007.FS — Grid Inline Edit
 * Scene: From Inspector
 *
 * Demonstrates the inspector-to-edit path: hovering an image cell shows an eye
 * icon; clicking it opens the ImageInspectorOverlay with a full-size preview
 * and an Edit button. Clicking Edit closes the inspector and opens the
 * ImageUploadDialog.
 */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import type { ColDef } from 'ag-grid-community';
import { Eye } from 'lucide-react';

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import {
  MOCK_ITEMS,
  ITEM_IMAGE_CONFIG,
  type MockItem,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import { ImageCellDisplay } from '@/components/canary/atoms/grid/image/image-cell-display';
import { createImageCellEditor } from '@/components/canary/atoms/grid/image/image-cell-editor';
import { ImageInspectorOverlay } from '@/components/canary/molecules/image-inspector-overlay/image-inspector-overlay';
import { ImageUploadDialog } from '@/components/canary/organisms/shared/image-upload-dialog/image-upload-dialog';
import { createEntityDataGrid } from '@/components/canary/organisms/shared/entity-data-grid/create-entity-data-grid';
import type { ImageUploadResult } from '@/types/canary/utilities/image-field-config';

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
  displayName: 'Grid Inline Edit (From Inspector)',
  persistenceKeyPrefix: 'gen-media-0001-0007-from-inspector',
  columnDefs,
  defaultColDef: { sortable: true, resizable: true },
  getEntityId: (item) => item.id,
  autoHeight: true,
});

// ---------------------------------------------------------------------------
// Live component wrapper
// ---------------------------------------------------------------------------

interface FromInspectorPageProps {
  onConfirm: (result: ImageUploadResult) => void;
  onCancel: () => void;
}

function FromInspectorLive({ onConfirm, onCancel }: FromInspectorPageProps) {
  const [rows, setRows] = useState<MockItem[]>(MOCK_ITEMS.slice(0, 2));
  const [inspectorUrl, setInspectorUrl] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const firstImageUrl = rows[0]?.imageUrl ?? null;

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-semibold tracking-tight mb-1">
        GEN-MEDIA-0001 &#8212; Grid Inline Edit: From Inspector
      </h1>
      <p className="text-sm text-muted-foreground mb-4">
        Click the Eye icon below the first row to open the full-size inspector. From the inspector,
        click Edit to launch the Image Upload dialog.
      </p>

      <InlineEditGrid
        data={rows}
        enableCellEditing
        onRowPublish={async (rowId, changes) => {
          setRows((prev) =>
            prev.map((r) => (r.id === rowId ? { ...r, ...(changes as Partial<MockItem>) } : r)),
          );
        }}
      />

      {firstImageUrl !== null && (
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            aria-label="Inspect image"
            data-testid="eye-icon-trigger"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setInspectorUrl(firstImageUrl)}
          >
            <Eye className="w-4 h-4" aria-hidden="true" />
            Inspect row 1 image
          </button>
        </div>
      )}

      {inspectorUrl !== null && (
        <ImageInspectorOverlay
          imageUrl={inspectorUrl}
          open={inspectorUrl !== null}
          onClose={() => setInspectorUrl(null)}
          onEdit={() => {
            setInspectorUrl(null);
            setUploadOpen(true);
          }}
        />
      )}

      <ImageUploadDialog
        config={ITEM_IMAGE_CONFIG}
        existingImageUrl={firstImageUrl}
        open={uploadOpen}
        onCancel={() => {
          onCancel();
          setUploadOpen(false);
        }}
        onConfirm={(result) => {
          onConfirm(result);
          setUploadOpen(false);
          setRows((prev) =>
            prev.map((r) => (r.id === '1' ? { ...r, imageUrl: result.imageUrl } : r)),
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

function FromInspectorSceneRenderer({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    case 0:
      return (
        <ScenePanel
          title="Grid visible with image cells"
          description="The grid renders with 2 rows. The first row has a valid image thumbnail. Below the grid, an Eye icon button is visible for inspecting the first row's image."
        />
      );
    case 1:
      return (
        <ScenePanel
          title="Hover cell — Eye icon appears"
          description="The user hovers over the first row's image cell. In a real implementation, the Eye icon overlay appears on the cell. In this story, a dedicated Eye button below the grid serves as the affordance."
        />
      );
    case 2:
      return (
        <ScenePanel
          title="Click Eye icon — Inspector opens"
          description="The user clicks the Eye icon. The ImageInspectorOverlay opens as a dialog showing the full-size image preview. An Edit button is visible in the overlay."
        />
      );
    case 3:
    default:
      return (
        <ScenePanel
          title="Click Edit — Upload dialog opens"
          description="The user clicks Edit in the inspector. The inspector closes and the ImageUploadDialog opens in EditExisting mode, showing the current image for editing or replacement."
        />
      );
  }
}

/* ================================================================
   SCENES + WORKFLOW FACTORY
   ================================================================ */

const fromInspectorScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 4 \u2014 Grid Visible',
    description:
      'The grid renders with 2 rows. The first row has a valid product image. An eye icon affordance below the grid allows opening the image inspector for that row.',
    interaction: 'Hover over the first image cell, then click the Eye icon to open the inspector.',
  },
  {
    title: 'Scene 2 of 4 \u2014 Hover Cell',
    description:
      'The user hovers over the first row image cell. The inspector affordance (Eye icon) becomes visible on hover.',
    interaction: 'Click the Eye icon to open the ImageInspectorOverlay.',
  },
  {
    title: 'Scene 3 of 4 \u2014 Inspector Opens',
    description:
      'The ImageInspectorOverlay is visible showing the full-size image preview. An Edit button allows launching the upload dialog to replace the image.',
    interaction: 'Click the Edit button in the inspector.',
  },
  {
    title: 'Scene 4 of 4 \u2014 Upload Dialog Opens',
    description:
      'Clicking Edit closes the inspector and opens the ImageUploadDialog in EditExisting mode. The current image is shown alongside controls for uploading a replacement.',
    interaction:
      'Upload a new image or click Cancel. The workflow is complete once the dialog closes.',
  },
];

const onConfirmFn = fn();
const onCancelFn = fn();

const {
  Interactive: FromInspectorInteractive,
  Stepwise: FromInspectorStepwise,
  Automated: FromInspectorAutomated,
} = createWorkflowStories({
  scenes: fromInspectorScenes,
  renderScene: (i) => <FromInspectorSceneRenderer sceneIndex={i} />,
  renderLive: () => <FromInspectorLive onConfirm={onConfirmFn} onCancel={onCancelFn} />,
  delayMs: 2000,
  maxWidth: 800,
  play: async ({ goToScene, delay }) => {
    for (let i = 0; i < fromInspectorScenes.length; i++) {
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
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0007 Grid Inline Edit/From Inspector',
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onConfirm: fn(),
    onCancel: fn(),
  },
};

export default meta;

export const FromInspectorInteractiveStory: StoryObj = {
  ...FromInspectorInteractive,
  name: 'From Inspector (Interactive)',
};

export const FromInspectorStepwiseStory: StoryObj = {
  ...FromInspectorStepwise,
  name: 'From Inspector (Stepwise)',
};

export const FromInspectorAutomatedStory: StoryObj = {
  ...FromInspectorAutomated,

  name: 'From Inspector (Automated)',
};
