/**
 * GEN-MEDIA-0003::0001.UC — View Image in Grid
 * Scene: Grid Thumbnails
 *
 * Renders a small AG Grid with ImageCellDisplay showing mixed image states:
 * loaded, null/placeholder, and broken URL with error badge.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, waitFor } from 'storybook/test';
import type { ColDef } from 'ag-grid-community';

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
// Page wrapper
// ---------------------------------------------------------------------------

function GridThumbnailsPage() {
  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-semibold tracking-tight mb-1">
        GEN-MEDIA-0003 — View Image in Grid
      </h1>
      <p className="text-sm text-muted-foreground mb-4">
        Each row in the grid shows a 32&times;32 image thumbnail. Row 1 and 2 show loaded images;
        row 3 shows a null placeholder (no image set); row 4 shows a broken URL with an error badge.
      </p>
      <ItemThumbnailGrid data={MOCK_ITEMS} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof GridThumbnailsPage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0003 View Entity Image/0001 View in Grid/Grid Thumbnails',
  component: GridThumbnailsPage,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof GridThumbnailsPage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Grid renders with item rows', async () => {
      // Wait for AG Grid to mount and render cell content
      await waitFor(
        () => {
          const cells = canvasElement.querySelectorAll('[data-slot="image-cell-display"]');
          expect(cells.length).toBeGreaterThan(0);
        },
        { timeout: 10000 },
      );
    });

    await step('All image cells are visible in the grid', async () => {
      const cells = canvasElement.querySelectorAll('[data-slot="image-cell-display"]');
      // MOCK_ITEMS has 4 rows, so there should be 4 image cells
      expect(cells.length).toBe(4);
      for (const cell of Array.from(cells)) {
        expect(cell).toBeVisible();
      }
    });

    await step('Item names are rendered in name column', async () => {
      await waitFor(
        () => {
          expect(canvas.getByText('Hex Bolt M10x30')).toBeVisible();
        },
        { timeout: 5000 },
      );
      expect(canvas.getByText('Flat Washer 3/8"')).toBeVisible();
      expect(canvas.getByText('Spring Pin 4x20')).toBeVisible();
      expect(canvas.getByText('Tee Nut 1/4-20')).toBeVisible();
    });
  },
};
