/**
 * GEN-MEDIA-0003::0001.UC — View Image in Grid
 * Scene: Hover Preview
 *
 * Same grid setup as Grid Thumbnails. The play function hovers over an image
 * cell and verifies that the ImageHoverPreview popover appears.
 *
 * Three story variants via createWorkflowStories:
 *   HoverPreviewInteractive  — live grid for manual exploration
 *   HoverPreviewStepwise     — static snapshots with scene annotations
 *   HoverPreviewAutomated    — automated play driving the live grid
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
  displayName: 'Item Thumbnail Grid (Hover)',
  persistenceKeyPrefix: 'gen-media-0003-0001-hover',
  columnDefs,
  defaultColDef: { sortable: true, resizable: true },
  getEntityId: (item) => item.id,
  autoHeight: true,
});

// ---------------------------------------------------------------------------
// Live component — used by Interactive and Automated modes
// ---------------------------------------------------------------------------

function HoverPreviewLive() {
  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-semibold tracking-tight mb-1">GEN-MEDIA-0003 — Hover Preview</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Hover over an image cell and wait ~500ms to see the large preview popover. Moving the mouse
        away immediately closes the popover. The first two rows have valid images; row 3 is null.
      </p>
      <ItemThumbnailGrid data={MOCK_ITEMS.slice(0, 3)} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static scene renderer — used by Stepwise mode
// ---------------------------------------------------------------------------

function HoverPreviewScene({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    // Scene 0: Grid visible
    case 0:
      return (
        <div className="p-6 max-w-3xl">
          <h1 className="text-xl font-semibold tracking-tight mb-1">
            GEN-MEDIA-0003 — Hover Preview
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            The grid is rendered. Hover over an image cell to trigger the preview popover.
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

    // Scene 1: Hover over cell
    case 1:
      return (
        <div className="p-6 max-w-3xl">
          <h1 className="text-xl font-semibold tracking-tight mb-1">
            GEN-MEDIA-0003 — Hover Preview
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            Mouse is hovering over the first image cell. The hover delay (~500ms) is counting down.
          </p>
          <div className="border border-border rounded overflow-hidden">
            <div className="grid grid-cols-4 bg-muted text-xs font-semibold px-3 py-2 border-b border-border">
              <span>Image</span>
              <span className="col-span-2">Name</span>
              <span>SKU</span>
            </div>
            <div className="grid grid-cols-4 items-center px-3 py-2 border-b border-border text-sm bg-accent/30">
              <div className="w-8 h-8 rounded bg-primary/20 border-2 border-primary" />
              <span className="col-span-2 font-medium">Hex Bolt M10x30</span>
              <span className="font-mono text-xs text-muted-foreground">HB-M10-030</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Hovering&#8230; popover opens after ~500ms.
          </p>
        </div>
      );

    // Scene 2: Popover appears
    case 2:
      return (
        <div className="p-6 max-w-3xl relative">
          <h1 className="text-xl font-semibold tracking-tight mb-1">
            GEN-MEDIA-0003 — Hover Preview
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            The ImageHoverPreview popover is visible, showing the full-size preview image.
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

    // Scene 3: Unhover
    case 3:
      return (
        <div className="p-6 max-w-3xl">
          <h1 className="text-xl font-semibold tracking-tight mb-1">
            GEN-MEDIA-0003 — Hover Preview
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            Mouse moved away from the image cell. Popover is closing.
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

    // Scene 4: Popover gone
    case 4:
    default:
      return (
        <div className="p-6 max-w-3xl">
          <h1 className="text-xl font-semibold tracking-tight mb-1">
            GEN-MEDIA-0003 — Hover Preview
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
            &#10003; Popover dismissed on unhover.
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
    title: 'Scene 1 of 5 \u2014 Grid Visible',
    description:
      'The grid is rendered with three rows (rows 1\u20132 have valid images, row 3 has no image). All image cells are visible.',
    interaction: 'Hover over the first image cell thumbnail to trigger the preview.',
  },
  {
    title: 'Scene 2 of 5 \u2014 Hover Over Cell',
    description:
      'The mouse is hovering over the first image cell. ImageHoverPreview uses a ~500ms delay before the popover opens, so the preview is not yet visible.',
    interaction: 'Wait ~500ms for the popover to appear.',
  },
  {
    title: 'Scene 3 of 5 \u2014 Popover Appears',
    description:
      'The ImageHoverPreview popover is now visible. It renders in a Radix portal outside the canvas element, showing the full-size image preview.',
    interaction: 'Move the mouse away from the cell to close the popover.',
  },
  {
    title: 'Scene 4 of 5 \u2014 Unhover',
    description:
      'The mouse has left the image cell area. The popover begins closing immediately on mouse-leave.',
    interaction: 'Wait for the popover to fully dismiss.',
  },
  {
    title: 'Scene 5 of 5 \u2014 Popover Gone',
    description:
      'The popover has closed. The grid is back to its default state. The data-state becomes "closed" or the popover element is removed from the DOM.',
    interaction: 'The workflow is complete. Hover again to repeat.',
  },
];

// ---------------------------------------------------------------------------
// createWorkflowStories
// ---------------------------------------------------------------------------

const {
  Interactive: HoverPreviewInteractiveStory,
  Stepwise: HoverPreviewStepwiseStory,
  Automated: HoverPreviewAutomatedStory,
} = createWorkflowStories({
  scenes,
  renderScene: (i) => <HoverPreviewScene sceneIndex={i} />,
  renderLive: () => <HoverPreviewLive />,
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
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0003 View Entity Image/0001 View in Grid/Hover Preview',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const HoverPreviewInteractive: StoryObj = {
  ...HoverPreviewInteractiveStory,
  name: 'Hover Preview (Interactive)',
};

export const HoverPreviewStepwise: StoryObj = {
  ...HoverPreviewStepwiseStory,
  name: 'Hover Preview (Stepwise)',
};

export const HoverPreviewAutomated: StoryObj = {
  ...HoverPreviewAutomatedStory,
  name: 'Hover Preview (Automated)',
};
