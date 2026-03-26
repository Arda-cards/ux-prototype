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

import {
  MOCK_ITEMS,
  ITEM_IMAGE_CONFIG,
  MOCK_FILE_JPEG,
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
  displayName: 'Grid Inline Edit (Double Click)',
  persistenceKeyPrefix: 'gen-media-0001-0007-double-click',
  columnDefs,
  defaultColDef: { sortable: true, resizable: true },
  getEntityId: (item) => item.id,
  autoHeight: true,
});

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

interface DoubleClickPageProps {
  onRowPublish: (rowId: string, changes: Record<string, unknown>) => Promise<void>;
}

function DoubleClickPage({ onRowPublish }: DoubleClickPageProps) {
  const [rows, setRows] = useState<MockItem[]>(MOCK_ITEMS.slice(0, 3));

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-semibold tracking-tight mb-1">
        GEN-MEDIA-0001 — Grid Inline Edit: Double Click
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

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof DoubleClickPage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0007 Grid Inline Edit/Double Click',
  component: DoubleClickPage,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onRowPublish: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof DoubleClickPage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Default — grid with editable image column. Double-click an image cell to start. */
export const Default: Story = {};

/**
 * Automated — double-clicks the first image cell, verifies the dialog opens,
 * provides a file, acknowledges copyright, confirms the upload, then verifies
 * the dialog closes.
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

    await step('Provide a JPEG file via the file input', async () => {
      let fileInput: HTMLInputElement | null = null;
      await waitFor(
        () => {
          fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
          if (!fileInput) throw new Error('File input not found');
        },
        { timeout: 5000 },
      );
      if (!fileInput) throw new Error('File input not found after waitFor');
      await userEvent.upload(fileInput, MOCK_FILE_JPEG);
    });

    await step('Copyright acknowledgment checkbox appears', async () => {
      await waitFor(
        () => {
          const checkbox = screen.getByRole('checkbox', { name: /copyright acknowledgment/i });
          expect(checkbox).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await step('Acknowledge copyright', async () => {
      const checkbox = screen.getByRole('checkbox', { name: /copyright acknowledgment/i });
      await userEvent.click(checkbox);
    });

    await step('Click Confirm', async () => {
      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /confirm/i });
        expect(confirmButton).not.toBeDisabled();
      });
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await userEvent.click(confirmButton);
    });

    await step('Dialog closes after confirm', async () => {
      await waitFor(
        () => {
          const dialog = screen.queryByRole('dialog');
          expect(dialog).toBeNull();
        },
        { timeout: 8000 },
      );
    });
  },
};
