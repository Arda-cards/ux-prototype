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

import {
  MOCK_ITEMS,
  ITEM_IMAGE_CONFIG,
  type MockItem,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import { ImageCellDisplay } from '@/components/canary/atoms/grid/image/image-cell-display';
import { createImageCellEditor } from '@/components/canary/atoms/grid/image/image-cell-editor';
import { createEntityDataGrid } from '@/components/canary/organisms/shared/entity-data-grid/create-entity-data-grid';
import { storyStepDelay } from '@/use-cases/reference/items/_shared/story-step-delay';

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
// Page wrapper
// ---------------------------------------------------------------------------

interface EnterKeyPageProps {
  onRowPublish: (rowId: string, changes: Record<string, unknown>) => Promise<void>;
}

function EnterKeyPage({ onRowPublish }: EnterKeyPageProps) {
  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-semibold tracking-tight mb-1">
        GEN-MEDIA-0001 — Grid Inline Edit: Enter Key
      </h1>
      <p className="text-sm text-muted-foreground mb-4">
        Click an image cell to select it, then press Enter to open the Image Upload dialog. Tab
        between cells to navigate; Enter triggers editing on the focused image cell.
      </p>
      <InlineEditGrid data={MOCK_ITEMS.slice(0, 3)} enableCellEditing onRowPublish={onRowPublish} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof EnterKeyPage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0007 Grid Inline Edit/Enter Key',
  component: EnterKeyPage,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onRowPublish: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof EnterKeyPage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Default — grid with editable image column. Click an image cell then press Enter. */
export const Default: Story = {};

/**
 * Automated — clicks the first image cell to select it, presses Enter to start
 * editing, then verifies the ImageUploadDialog opens.
 */
export const Automated: Story = {
  play: async ({ step }) => {
    await step('Grid renders image cells', async () => {
      await waitFor(
        () => {
          const cells = document.querySelectorAll('[data-slot="image-cell-display"]');
          expect(cells.length).toBeGreaterThan(0);
        },
        { timeout: 10000 },
      );
    });

    await storyStepDelay(500);

    await step('Click first image cell to select it', async () => {
      const firstCell = document.querySelector(
        '[data-slot="image-cell-display"]',
      ) as HTMLElement | null;
      if (!firstCell) throw new Error('No image cell found');
      // Click the AG Grid cell wrapper (parent of the renderer)
      const agCell = firstCell.closest('.ag-cell') as HTMLElement | null;
      if (agCell) {
        await userEvent.click(agCell);
      } else {
        await userEvent.click(firstCell);
      }
    });

    await storyStepDelay(300);

    await step('Press Enter to start editing', async () => {
      await userEvent.keyboard('{Enter}');
    });

    await step('ImageUploadDialog opens', async () => {
      await waitFor(
        () => {
          const dialog = screen.getByRole('dialog');
          expect(dialog).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();

    await step('Cancel dialog to clean up', async () => {
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeNull();
      });
    });
  },
};
