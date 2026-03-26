/**
 * GEN-MEDIA-0003::0001.UC — View Image in Grid
 * Scene: Grid Thumbnails
 *
 * Renders a small AG Grid with ImageCellDisplay showing mixed image states:
 * loaded, null/placeholder, and broken URL with error badge.
 *
 * Three story variants via createWorkflowStories:
 *   GridThumbnailsInteractive  — live grid for manual exploration
 *   GridThumbnailsStepwise     — static snapshots with scene annotations
 *   GridThumbnailsAutomated    — automated play driving the live grid
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
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
  displayName: 'Item Thumbnail Grid',
  persistenceKeyPrefix: 'gen-media-0003-0001-thumbnails',
  columnDefs,
  defaultColDef: { sortable: true, resizable: true },
  getEntityId: (item) => item.id,
  autoHeight: true,
});

// ---------------------------------------------------------------------------
// Live component — used by Interactive and Automated modes
// ---------------------------------------------------------------------------

function GridThumbnailsLive() {
  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-semibold tracking-tight mb-1">
        GEN-MEDIA-0003 — View Image in Grid
      </h1>
      <p className="text-sm text-muted-foreground mb-4">
        Each row in the grid shows a 32&#215;32 image thumbnail. Row 1 and 2 show loaded images; row
        3 shows a null placeholder (no image set); row 4 shows a broken URL with an error badge.
      </p>
      <ItemThumbnailGrid data={MOCK_ITEMS} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static scene renderer — used by Stepwise mode
// ---------------------------------------------------------------------------

function GridThumbnailsScene({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    // Scene 0: Grid loading
    case 0:
      return (
        <div className="p-6 max-w-3xl">
          <h1 className="text-xl font-semibold tracking-tight mb-1">
            GEN-MEDIA-0003 — View Image in Grid
          </h1>
          <p className="text-sm text-muted-foreground mb-4">Grid is loading…</p>
          <div className="border border-border rounded bg-muted/30 h-40 flex items-center justify-center">
            <span className="text-sm text-muted-foreground">Loading grid rows&#8230;</span>
          </div>
        </div>
      );

    // Scene 1: Thumbnails visible (mixed states)
    case 1:
      return (
        <div className="p-6 max-w-3xl">
          <h1 className="text-xl font-semibold tracking-tight mb-1">
            GEN-MEDIA-0003 — View Image in Grid
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            Each row shows a 32&#215;32 image thumbnail in mixed states.
          </p>
          <div className="border border-border rounded overflow-hidden">
            <div className="grid grid-cols-4 bg-muted text-xs font-semibold px-3 py-2 border-b border-border">
              <span>Image</span>
              <span className="col-span-2">Name</span>
              <span>SKU</span>
            </div>
            {[
              { label: 'Hex Bolt M10x30', sku: 'HB-M10-030', state: 'Loaded image' },
              { label: 'Flat Washer 3/8"', sku: 'FW-0375', state: 'Loaded image' },
              { label: 'Spring Pin 4x20', sku: 'SP-4020', state: 'No image (placeholder)' },
              { label: 'Tee Nut 1/4-20', sku: 'TN-0420', state: 'Error badge (broken URL)' },
            ].map((row) => (
              <div
                key={row.sku}
                className="grid grid-cols-4 items-center px-3 py-2 border-b border-border last:border-0 text-sm"
              >
                <div className="w-8 h-8 rounded bg-muted border border-border flex items-center justify-center text-xs text-muted-foreground">
                  {row.state === 'Loaded image'
                    ? '&#128247;'
                    : row.state === 'Error badge (broken URL)'
                      ? '&#9888;'
                      : '&#9645;'}
                </div>
                <span className="col-span-2">{row.label}</span>
                <span className="font-mono text-xs">{row.sku}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Row 1&#8211;2: loaded images &#8226; Row 3: no image placeholder &#8226; Row 4: error
            badge
          </p>
        </div>
      );

    // Scene 2: Done — all cells verified
    case 2:
    default:
      return (
        <div className="p-6 max-w-3xl">
          <h1 className="text-xl font-semibold tracking-tight mb-1">
            GEN-MEDIA-0003 — View Image in Grid
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            All 4 image cells are visible and correct. Item names render in the Name column.
          </p>
          <div className="border border-border rounded p-4 bg-muted/20 text-sm text-muted-foreground">
            &#10003; 4 image cells rendered &#8226; &#10003; All item names visible &#8226; &#10003;
            Mixed image states correct
          </div>
        </div>
      );
  }
}

// ---------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------

const scenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 3 \u2014 Grid Loading',
    description:
      'The AG Grid mounts and begins rendering rows. Image cells use ImageCellDisplay — each shows a skeleton shimmer until the image resolves or the state is determined.',
    interaction: 'Wait for the grid to finish rendering all rows.',
  },
  {
    title: 'Scene 2 of 3 \u2014 Thumbnails Visible (Mixed States)',
    description:
      'All four rows are rendered. Rows 1\u20132 show loaded thumbnail images; row 3 shows the initials placeholder (no image set); row 4 shows an error badge because the URL is broken.',
    interaction: 'Observe the four different image cell states in the grid.',
  },
  {
    title: 'Scene 3 of 3 \u2014 Done',
    description:
      'All image cells are confirmed visible and all item names render correctly in the Name column. The grid is fully interactive: sortable, resizable, and scrollable.',
    interaction: 'The workflow is complete. Interact with the grid to sort or resize columns.',
  },
];

// ---------------------------------------------------------------------------
// createWorkflowStories
// ---------------------------------------------------------------------------

const {
  Interactive: GridThumbnailsInteractiveStory,
  Stepwise: GridThumbnailsStepwiseStory,
  Automated: GridThumbnailsAutomatedStory,
} = createWorkflowStories({
  scenes,
  renderScene: (i) => <GridThumbnailsScene sceneIndex={i} />,
  renderLive: () => <GridThumbnailsLive />,
  delayMs: 1500,
  play: async ({ canvas, goToScene, delay }) => {
    goToScene(0);
    await delay();

    // Wait for AG Grid to mount and render cell content
    await waitFor(
      () => {
        const cells = canvas.baseElement.querySelectorAll('[data-slot="image-cell-display"]');
        expect(cells.length).toBeGreaterThan(0);
      },
      { timeout: 10000 },
    );

    goToScene(1);
    await delay();

    // Verify all 4 image cells are visible
    const cells = canvas.baseElement.querySelectorAll('[data-slot="image-cell-display"]');
    expect(cells.length).toBe(4);
    for (const cell of Array.from(cells)) {
      expect(cell).toBeVisible();
    }

    goToScene(2);
    await delay();
  },
});

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0003 View Entity Image/0001 View in Grid/Grid Thumbnails',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const GridThumbnailsInteractive: StoryObj = {
  ...GridThumbnailsInteractiveStory,
  name: 'Grid Thumbnails (Interactive)',
};

export const GridThumbnailsStepwise: StoryObj = {
  ...GridThumbnailsStepwiseStory,
  name: 'Grid Thumbnails (Stepwise)',
};

export const GridThumbnailsAutomated: StoryObj = {
  ...GridThumbnailsAutomatedStory,
  name: 'Grid Thumbnails (Automated)',
};
