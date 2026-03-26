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
  displayName: 'Grid Inline Edit (Cancel)',
  persistenceKeyPrefix: 'gen-media-0001-0007-cancel',
  columnDefs,
  defaultColDef: { sortable: true, resizable: true },
  getEntityId: (item) => item.id,
  autoHeight: true,
});

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

interface CancelPageProps {
  onRowPublish: (rowId: string, changes: Record<string, unknown>) => Promise<void>;
}

function CancelPage({ onRowPublish }: CancelPageProps) {
  const [rows, setRows] = useState<MockItem[]>(MOCK_ITEMS.slice(0, 3));
  const [publishCount, setPublishCount] = useState(0);

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-semibold tracking-tight mb-1">
        GEN-MEDIA-0001 — Grid Inline Edit: Cancel
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
          onRowPublish was called {publishCount} time{publishCount > 1 ? 's' : ''} — unexpected on
          cancel path!
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof CancelPage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0007 Grid Inline Edit/Cancel',
  component: CancelPage,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onRowPublish: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof CancelPage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Default — grid with editable image column. Double-click a cell then click Cancel. */
export const Default: Story = {};

/**
 * Automated — double-clicks the first image cell, verifies the dialog opens,
 * clicks Cancel, verifies the dialog closes, and confirms onRowPublish was
 * NOT called (the row is unchanged).
 */
export const Automated: Story = {
  play: async ({ args, step }) => {
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

    await step('Double-click first image cell to open dialog', async () => {
      const firstCell = document.querySelector(
        '[data-slot="image-cell-display"]',
      ) as HTMLElement | null;
      if (!firstCell) throw new Error('No image cell found');
      await userEvent.dblClick(firstCell);
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

    await storyStepDelay(500);

    await step('Click Cancel to dismiss the dialog', async () => {
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);
    });

    await step('Dialog closes after cancel', async () => {
      await waitFor(
        () => {
          const dialog = screen.queryByRole('dialog');
          expect(dialog).toBeNull();
        },
        { timeout: 5000 },
      );
    });

    await step('onRowPublish was NOT called — row is unchanged', async () => {
      expect(args.onRowPublish).not.toHaveBeenCalled();
    });

    await storyStepDelay();

    await step('Grid still shows original image cells', async () => {
      const cells = document.querySelectorAll('[data-slot="image-cell-display"]');
      expect(cells.length).toBeGreaterThan(0);
    });
  },
};
