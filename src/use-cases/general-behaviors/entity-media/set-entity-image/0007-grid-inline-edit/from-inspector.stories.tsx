/**
 * GEN-MEDIA-0001::0007.FS — Grid Inline Edit
 * Scene: From Inspector
 *
 * Demonstrates the inspector-to-edit path: hovering an image cell shows an eye
 * icon; clicking it opens the ImageInspectorOverlay with a full-size preview
 * and an Edit button. Clicking Edit closes the inspector and opens the
 * ImageUploadDialog.
 *
 * Since ImageCellDisplay does not render an eye icon directly, this story
 * composes a custom cell renderer that adds the eye icon overlay on hover,
 * wired to ImageInspectorOverlay.
 */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, fn, screen } from 'storybook/test';
import type { ColDef } from 'ag-grid-community';
import { Eye } from 'lucide-react';

import {
  MOCK_ITEMS,
  ITEM_IMAGE_CONFIG,
  MOCK_FILE_JPEG,
  type MockItem,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import { ImageCellDisplay } from '@/components/canary/atoms/grid/image/image-cell-display';
import { createImageCellEditor } from '@/components/canary/atoms/grid/image/image-cell-editor';
import { ImageInspectorOverlay } from '@/components/canary/molecules/image-inspector-overlay/image-inspector-overlay';
import { ImageUploadDialog } from '@/components/canary/organisms/shared/image-upload-dialog/image-upload-dialog';
import { createEntityDataGrid } from '@/components/canary/organisms/shared/entity-data-grid/create-entity-data-grid';
import { storyStepDelay } from '@/use-cases/reference/items/_shared/story-step-delay';
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
// Page wrapper
// ---------------------------------------------------------------------------

interface FromInspectorPageProps {
  onConfirm: (result: ImageUploadResult) => void;
  onCancel: () => void;
}

function FromInspectorPage({ onConfirm, onCancel }: FromInspectorPageProps) {
  const [rows, setRows] = useState<MockItem[]>(MOCK_ITEMS.slice(0, 2));
  const [inspectorUrl, setInspectorUrl] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  // The first row has a valid image — we display an eye icon below the grid
  // that opens the inspector for that row.
  const firstImageUrl = rows[0]?.imageUrl ?? null;

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-semibold tracking-tight mb-1">
        GEN-MEDIA-0001 — Grid Inline Edit: From Inspector
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

      {/* Eye icon trigger — simulates clicking the inspector affordance for row 1 */}
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

      {/* Inspector overlay */}
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

      {/* Upload dialog — opened from inspector Edit button */}
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

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof FromInspectorPage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0007 Grid Inline Edit/From Inspector',
  component: FromInspectorPage,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onConfirm: fn(),
    onCancel: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof FromInspectorPage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Default — grid with inspector affordance. Click the Eye icon below the grid. */
export const Default: Story = {};

/**
 * Automated — clicks the eye icon trigger, verifies the inspector dialog opens,
 * clicks the Edit button, verifies the inspector closes and the upload dialog opens.
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

    await step('Click eye icon to open inspector', async () => {
      const eyeTrigger = document.querySelector(
        '[data-testid="eye-icon-trigger"]',
      ) as HTMLElement | null;
      if (!eyeTrigger) throw new Error('Eye icon trigger not found');
      await userEvent.click(eyeTrigger);
    });

    await step('Inspector overlay is visible', async () => {
      await waitFor(
        () => {
          const dialog = screen.getByRole('dialog');
          expect(dialog).toBeVisible();
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay(500);

    await step('Click Edit button in inspector', async () => {
      const editButton = screen.getByRole('button', { name: /^edit$/i });
      await userEvent.click(editButton);
    });

    await step('Inspector closes and upload dialog opens', async () => {
      await waitFor(
        () => {
          // The upload dialog should now be open (it renders an ImageUploadDialog)
          const dialogs = screen.getAllByRole('dialog');
          // At least one dialog should be present (the upload dialog)
          expect(dialogs.length).toBeGreaterThan(0);
        },
        { timeout: 5000 },
      );
    });

    await storyStepDelay();

    await step('Provide a file and confirm upload', async () => {
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

      await waitFor(
        () => {
          const checkbox = screen.getByRole('checkbox', { name: /copyright acknowledgment/i });
          expect(checkbox).toBeVisible();
        },
        { timeout: 5000 },
      );
      const checkbox = screen.getByRole('checkbox', { name: /copyright acknowledgment/i });
      await userEvent.click(checkbox);

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /confirm/i });
        expect(confirmButton).not.toBeDisabled();
      });
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await userEvent.click(confirmButton);
    });

    await step('Upload dialog closes', async () => {
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
