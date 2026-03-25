/**
 * GEN-MEDIA-0003::0001.UC — View Image in Grid
 * Scene: Hover Preview
 *
 * Same grid setup as Grid Thumbnails. The play function hovers over an image
 * cell and verifies that the ImageHoverPreview popover appears.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, userEvent, waitFor } from 'storybook/test';
import type { ColDef } from 'ag-grid-community';

import {
  MOCK_ITEMS,
  ITEM_IMAGE_CONFIG,
  type MockItem,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import { ImageCellDisplay } from '@/components/canary/atoms/grid/image/image-cell-display';
import { createEntityDataGrid } from '@/components/canary/organisms/shared/entity-data-grid/create-entity-data-grid';
import { storyStepDelay } from '@/use-cases/reference/items/_shared/story-step-delay';

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
// Page wrapper
// ---------------------------------------------------------------------------

function HoverPreviewPage() {
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
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof HoverPreviewPage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0003 View Entity Image/0001 View in Grid/Hover Preview',
  component: HoverPreviewPage,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof HoverPreviewPage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Grid renders image cells', async () => {
      await waitFor(
        () => {
          const cells = canvasElement.querySelectorAll('[data-slot="image-cell-display"]');
          expect(cells.length).toBeGreaterThan(0);
        },
        { timeout: 10000 },
      );
    });

    await storyStepDelay(500);

    await step('Hover over first image cell to trigger preview popover', async () => {
      const firstCell = canvasElement.querySelector('[data-slot="image-cell-display"]');
      if (!firstCell) throw new Error('No image cell found');

      // Hover over the cell — ImageHoverPreview uses a delay before showing
      await userEvent.hover(firstCell as HTMLElement);
    });

    // Wait for hover delay (ImageHoverPreview opens after ~500ms)
    await storyStepDelay(800);

    await step('ImageHoverPreview popover is visible', async () => {
      await waitFor(
        () => {
          // PopoverContent renders with data-slot="popover-content" (Radix portal, outside canvasElement)
          const popoverContent = document.querySelector('[data-slot="popover-content"]');
          expect(popoverContent).not.toBeNull();
          expect(popoverContent).toBeVisible();
        },
        { timeout: 3000 },
      );
    });

    await storyStepDelay();

    await step('Moving mouse away closes the popover', async () => {
      const triggerCell = canvasElement.querySelector(
        '[data-slot="image-hover-preview"]',
      ) as HTMLElement | null;
      if (triggerCell) {
        await userEvent.unhover(triggerCell);
      }
      await waitFor(
        () => {
          const popoverContent = document.querySelector('[data-slot="popover-content"]');
          // Popover should be closed (null or hidden via data-state="closed")
          const isClosed =
            popoverContent === null || popoverContent.getAttribute('data-state') === 'closed';
          expect(isClosed).toBe(true);
        },
        { timeout: 2000 },
      );
    });

    await storyStepDelay();

    await step('Heading is visible', async () => {
      expect(
        canvas.getByRole('heading', { name: 'GEN-MEDIA-0003 \u2014 Hover Preview' }),
      ).toBeVisible();
    });
  },
};
