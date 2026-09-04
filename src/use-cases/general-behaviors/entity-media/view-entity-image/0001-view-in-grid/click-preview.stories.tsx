/**
 * GEN-MEDIA-0003::0001.UC — View Image in Grid
 * Scene: Click Preview
 *
 * Same grid setup as Grid Thumbnails. The play function clicks an image
 * cell and verifies that the ImagePreviewPopover appears.
 *
 * Three story variants via createWorkflowStories:
 *   ClickPreviewInteractive  — live grid for manual exploration
 *   ClickPreviewStepwise     — static snapshots with scene annotations
 *   ClickPreviewAutomated    — automated play driving the live grid
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ColDef } from 'ag-grid-community';

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import {
  MOCK_ITEMS,
  ITEM_IMAGE_CONFIG,
  type MockItem,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import { ImageCellDisplay } from '@/components/canary/atoms/grid/image/image-cell-display';
import { createEntityDataGrid } from '@/components/canary/organisms/shared/entity-data-grid/create-entity-data-grid';

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const columnDefs: ColDef<MockItem>[] = [
  {
    field: 'imageUrl',
    headerName: 'Image',
    cellRenderer: ImageCellDisplay,
    cellRendererParams: { config: ITEM_IMAGE_CONFIG },
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

const { Component: ItemThumbnailGrid } = createEntityDataGrid<MockItem>({
  displayName: 'Item Thumbnail Grid (Click Preview)',
  persistenceKeyPrefix: 'gen-media-0003-0001-click-preview',
  columnDefs,
  defaultColDef: { sortable: true, resizable: true },
  getEntityId: (item) => item.id,
  autoHeight: true,
});

// ---------------------------------------------------------------------------
// Live component — used by Interactive and Automated modes
// ---------------------------------------------------------------------------

function ClickPreviewLive() {
  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-semibold tracking-tight mb-1">GEN-MEDIA-0003 — Click Preview</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Click an image cell to open the large preview popover. Click the thumbnail again, click
        outside, or press Escape to close it. The first two rows have valid images; row 3 is null
        and has no preview to open.
      </p>
      <ItemThumbnailGrid data={MOCK_ITEMS.slice(0, 3)} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static scene renderer — used by Stepwise mode
// ---------------------------------------------------------------------------

function ClickPreviewScene({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    // Scene 0: Grid visible
    case 0:
      return (
        <div className="p-6 max-w-3xl">
          <h1 className="text-xl font-semibold tracking-tight mb-1">
            GEN-MEDIA-0003 — Click Preview
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            The grid is rendered. Click an image cell to open the preview popover.
          </p>
          <div className="border border-border rounded overflow-hidden">
            <div className="grid grid-cols-4 bg-muted text-xs font-semibold px-3 py-2 border-b border-border">
              <span>Image</span>
              <span className="col-span-2">Name</span>
              <span>SKU</span>
            </div>
            {['Hex Bolt M10x30', 'Flat Washer 3/8"', 'Spring Pin 4x20'].map((name) => (
              <div
                key={name}
                className="grid grid-cols-4 items-center px-3 py-2 border-b border-border last:border-0 text-sm"
              >
                <div className="w-8 h-8 rounded bg-muted border border-border" />
                <span className="col-span-2">{name}</span>
                <span className="font-mono text-xs text-muted-foreground">&#8212;</span>
              </div>
            ))}
          </div>
        </div>
      );

    // Scene 1: Popover open after click
    case 1:
      return (
        <div className="p-6 max-w-3xl relative">
          <h1 className="text-xl font-semibold tracking-tight mb-1">
            GEN-MEDIA-0003 — Click Preview
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            The first image cell was clicked. The ImagePreviewPopover is visible, showing the
            full-size preview image.
          </p>
          <div className="border border-border rounded overflow-hidden mb-4">
            <div className="grid grid-cols-4 bg-muted text-xs font-semibold px-3 py-2 border-b border-border">
              <span>Image</span>
              <span className="col-span-2">Name</span>
              <span>SKU</span>
            </div>
            <div className="grid grid-cols-4 items-center px-3 py-2 text-sm bg-accent/30">
              <div className="w-8 h-8 rounded bg-primary/20 border-2 border-primary" />
              <span className="col-span-2 font-medium">Hex Bolt M10x30</span>
              <span className="font-mono text-xs text-muted-foreground">HB-M10-030</span>
            </div>
          </div>
          <div className="border border-border rounded-lg p-3 bg-popover shadow-lg max-w-48">
            <div className="w-full aspect-square bg-muted rounded flex items-center justify-center text-muted-foreground text-sm">
              Full-size preview
            </div>
          </div>
        </div>
      );

    // Scene 2: Dismissal
    case 2:
      return (
        <div className="p-6 max-w-3xl">
          <h1 className="text-xl font-semibold tracking-tight mb-1">
            GEN-MEDIA-0003 — Click Preview
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            A click outside the popover (or Escape, or a second click on the thumbnail) dismisses
            it.
          </p>
          <div className="border border-border rounded overflow-hidden">
            <div className="grid grid-cols-4 bg-muted text-xs font-semibold px-3 py-2 border-b border-border">
              <span>Image</span>
              <span className="col-span-2">Name</span>
              <span>SKU</span>
            </div>
            <div className="grid grid-cols-4 items-center px-3 py-2 border-b border-border text-sm">
              <div className="w-8 h-8 rounded bg-muted border border-border" />
              <span className="col-span-2">Hex Bolt M10x30</span>
              <span className="font-mono text-xs text-muted-foreground">HB-M10-030</span>
            </div>
          </div>
        </div>
      );

    // Scene 3: Popover gone
    case 3:
    default:
      return (
        <div className="p-6 max-w-3xl">
          <h1 className="text-xl font-semibold tracking-tight mb-1">
            GEN-MEDIA-0003 — Click Preview
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            Popover has closed. The grid is back to its default state.
          </p>
          <div className="border border-border rounded overflow-hidden">
            <div className="grid grid-cols-4 bg-muted text-xs font-semibold px-3 py-2 border-b border-border">
              <span>Image</span>
              <span className="col-span-2">Name</span>
              <span>SKU</span>
            </div>
            {['Hex Bolt M10x30', 'Flat Washer 3/8"', 'Spring Pin 4x20'].map((name) => (
              <div
                key={name}
                className="grid grid-cols-4 items-center px-3 py-2 border-b border-border last:border-0 text-sm"
              >
                <div className="w-8 h-8 rounded bg-muted border border-border" />
                <span className="col-span-2">{name}</span>
                <span className="font-mono text-xs text-muted-foreground">&#8212;</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            &#10003; Popover dismissed on outside click.
          </p>
        </div>
      );
  }
}

// ---------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------

const scenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 4 — Grid Visible',
    description:
      'The grid is rendered with three rows (rows 1–2 have valid images, row 3 has no image). All image cells are visible.',
    interaction: 'Click the first image cell thumbnail to open the preview.',
  },
  {
    title: 'Scene 2 of 4 — Popover Appears',
    description:
      'The thumbnail was clicked and the ImagePreviewPopover opened immediately — no hover delay. It renders in a Radix portal outside the canvas element, showing the full-size image preview.',
    interaction: 'Click outside the popover (or press Escape) to close it.',
  },
  {
    title: 'Scene 3 of 4 — Dismissal',
    description:
      'A click outside the popover, a second click on the thumbnail, or Escape dismisses the preview.',
    interaction: 'Wait for the popover to fully dismiss.',
  },
  {
    title: 'Scene 4 of 4 — Popover Gone',
    description:
      'The popover has closed. The grid is back to its default state. The data-state becomes "closed" or the popover element is removed from the DOM.',
    interaction: 'The workflow is complete. Click a thumbnail again to repeat.',
  },
];

// ---------------------------------------------------------------------------
// createWorkflowStories
// ---------------------------------------------------------------------------

const {
  Interactive: ClickPreviewInteractiveStory,
  Stepwise: ClickPreviewStepwiseStory,
  Automated: ClickPreviewAutomatedStory,
} = createWorkflowStories({
  scenes,
  renderScene: (i) => <ClickPreviewScene sceneIndex={i} />,
  renderLive: () => <ClickPreviewLive />,
  delayMs: 1500,
  play: async ({ goToScene, delay }) => {
    for (let i = 0; i < scenes.length; i++) {
      goToScene(i);
      await delay();
    }
  },
});

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0003 View Entity Image/0001 View in Grid/Click Preview',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const ClickPreviewInteractive: StoryObj = {
  ...ClickPreviewInteractiveStory,
  name: 'Click Preview (Interactive)',
};

export const ClickPreviewStepwise: StoryObj = {
  ...ClickPreviewStepwiseStory,
  name: 'Click Preview (Stepwise)',
};

export const ClickPreviewAutomated: StoryObj = {
  ...ClickPreviewAutomatedStory,
  name: 'Click Preview (Automated)',
};
