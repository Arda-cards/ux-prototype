/**
 * GEN-MEDIA-0001::0002.FS — Input Detection and Routing
 * Scene: Drag and Drop
 *
 * Shows idle state, drag-over highlight (static mock), and the drop-accepted
 * result. Real drag events are handled by react-dropzone and cannot be fully
 * automated with userEvent — the play function documents the manual test path.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, expect, within, waitFor } from 'storybook/test';
import { useState } from 'react';

import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import { ITEM_IMAGE_CONFIG } from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageInput } from '@/types/canary/utilities/image-field-config';

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

interface DragAndDropPageProps {
  acceptedFormats: typeof ITEM_IMAGE_CONFIG.acceptedFormats;
  onInput: (input: ImageInput) => void;
  onDismiss: () => void;
}

function DragAndDropPage(args: DragAndDropPageProps) {
  const [lastInput, setLastInput] = useState<ImageInput | null>(null);

  return (
    <div className="p-6 max-w-lg space-y-4">
      <h1 className="text-xl font-semibold tracking-tight mb-1">
        GEN-MEDIA-0001 — Input Detection: Drag and Drop
      </h1>
      <p className="text-sm text-muted-foreground">
        Drag an image file from the desktop or file manager and drop it onto the dashed area. The
        border highlights in <code>border-primary</code> while the file is held over the zone.
      </p>

      <ImageDropZone
        {...args}
        onInput={(input) => {
          setLastInput(input);
          args.onInput(input);
        }}
      />

      {lastInput && (
        <div className="rounded-lg border border-border p-4">
          <h2 className="text-sm font-semibold mb-1">Emitted input</h2>
          <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">
            {JSON.stringify(
              lastInput.type === 'file'
                ? {
                    type: lastInput.type,
                    fileName: lastInput.file.name,
                    mimeType: lastInput.file.type,
                  }
                : lastInput,
              null,
              2,
            )}
          </pre>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Drag-over static preview component
// ---------------------------------------------------------------------------

function DragOverPreviewPage(args: DragAndDropPageProps) {
  return (
    <div className="p-6 max-w-lg space-y-4">
      <h1 className="text-xl font-semibold tracking-tight mb-1">
        GEN-MEDIA-0001 — Drag-Over Highlight (Static)
      </h1>
      <p className="text-sm text-muted-foreground">
        Static rendering of the drag-over visual state: <code>border-primary bg-accent</code>. The
        real highlight is driven by react-dropzone's <code>isDragActive</code> flag.
      </p>

      <div
        data-slot="image-drop-zone"
        className="border-2 border-dashed border-primary bg-accent rounded-lg p-6"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">Drop your image here</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Live component (idle state) shown below for comparison:
      </p>

      <ImageDropZone {...args} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof DragAndDropPage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0002 Input Detection/Drag and Drop',
  component: DragAndDropPage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Drag an image onto the dashed drop zone. The border transitions to ' +
          '`border-primary` + `bg-accent` while dragging. On drop, the file ' +
          'MIME type is validated and `onInput` is called with `{ type: "file" }`.',
      },
    },
  },
  args: {
    acceptedFormats: ITEM_IMAGE_CONFIG.acceptedFormats,
    onInput: fn(),
    onDismiss: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof DragAndDropPage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Idle state — the drop zone renders with a dashed border, waiting for a drag.
 * Manual test: drag an image file from your OS file manager and drop it here.
 */
export const IdleState: Story = {
  play: async ({ canvasElement, step }) => {
    await step('Drop zone renders in idle state', async () => {
      await waitFor(() => {
        const zone = canvasElement.querySelector('[data-slot="image-drop-zone"]');
        expect(zone).not.toBeNull();
      });
    });

    await step('Upload button is visible', async () => {
      const canvas = within(canvasElement);
      expect(canvas.getByRole('button', { name: /upload from computer/i })).toBeVisible();
    });
  },
};

/**
 * Drag-over highlight — static preview showing `border-primary bg-accent` classes.
 * react-dropzone's `isDragActive` flag drives the real transition at runtime.
 */
export const DragOverHighlight: Story = {
  render: (args) => <DragOverPreviewPage {...args} />,
};
