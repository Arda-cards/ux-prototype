/**
 * GEN-MEDIA-0001::0002.FS — Input Detection and Routing
 * Scene: Drag and Drop
 *
 * Shows idle state, drag-over highlight (static mock), and the drop-accepted
 * result. Real drag events are handled by react-dropzone and cannot be fully
 * automated with userEvent — the play function documents the manual test path.
 */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import { ITEM_IMAGE_CONFIG } from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageInput } from '@/types/canary/utilities/image-field-config';

// ---------------------------------------------------------------------------
// Live component — used by Interactive and Automated modes
// ---------------------------------------------------------------------------

function DragAndDropLive() {
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
        acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
        onInput={(input) => {
          setLastInput(input);
        }}
        onDismiss={() => {}}
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
// Static scene renderer — used by Stepwise mode
// ---------------------------------------------------------------------------

function DragAndDropScene({ sceneIndex }: { sceneIndex: number }) {
  const noop = () => {};

  switch (sceneIndex) {
    // Scene 1: Drop zone idle — dashed border, no drag
    case 0:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — Input Detection: Drag and Drop
          </h1>
          <p className="text-sm text-muted-foreground">
            The drop zone is idle with a dashed border. Drag an image file from your OS file manager
            onto this area.
          </p>
          <ImageDropZone
            acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
            onInput={noop}
            onDismiss={noop}
          />
        </div>
      );

    // Scene 2: Drag over — border-primary bg-accent highlight
    case 1:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — Input Detection: Drag and Drop
          </h1>
          <p className="text-sm text-muted-foreground">
            While the file is held over the zone, react-dropzone sets <code>isDragActive=true</code>
            . The border transitions to <code>border-primary bg-accent</code>.
          </p>
          <div
            data-slot="image-drop-zone"
            className="border-2 border-dashed border-primary bg-accent rounded-lg p-6"
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="text-sm text-muted-foreground">Drop your image here</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground italic">
            Static preview of the drag-active state — live component uses react-dropzone
          </p>
        </div>
      );

    // Scene 3: File dropped — MIME type validated
    case 2:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — Input Detection: Drag and Drop
          </h1>
          <p className="text-sm text-muted-foreground">
            The file is dropped. react-dropzone validates the MIME type against{' '}
            <code>acceptedFormats</code>. A valid image file calls <code>onInput</code> with{' '}
            <code>{'{ type: "file", file: File }'}</code>.
          </p>
          <div className="rounded-lg border border-border p-4">
            <h2 className="text-sm font-semibold mb-1">Drop event</h2>
            <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
              {JSON.stringify({ event: 'drop', filesReceived: 1, mimeType: 'image/jpeg' }, null, 2)}
            </pre>
          </div>
        </div>
      );

    // Scene 4: Accepted — emitted input
    case 3:
    default:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — Input Detection: Drag and Drop
          </h1>
          <p className="text-sm text-muted-foreground">
            The MIME type passes validation. The emitted input routes identically to a
            camera-captured or file-picked image — the crop editor opens with the dropped file.
          </p>
          <div className="rounded-lg border border-border p-4">
            <h2 className="text-sm font-semibold mb-1">Emitted input</h2>
            <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
              {JSON.stringify(
                { type: 'file', fileName: 'photo.jpg', mimeType: 'image/jpeg' },
                null,
                2,
              )}
            </pre>
          </div>
        </div>
      );
  }
}

// ---------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------

const dragAndDropScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 4 \u2014 Drop Zone Idle',
    description:
      'The ImageDropZone renders with a dashed border, ready for a file to be dragged in. The "Upload from computer" button is also available as an alternative.',
    interaction: 'Drag an image file from your OS file manager over the dashed area.',
  },
  {
    title: 'Scene 2 of 4 \u2014 Drag Over (Highlight)',
    description:
      "While the file hovers over the drop zone, react-dropzone sets isDragActive=true. The zone's border transitions to border-primary and the background fills with bg-accent to signal a valid drop target.",
    interaction: 'Release the file to drop it onto the zone.',
  },
  {
    title: 'Scene 3 of 4 \u2014 File Dropped',
    description:
      'The drop event fires. react-dropzone validates the MIME type against the acceptedFormats list (image/jpeg, image/png, image/webp). A valid image file proceeds; an invalid type would show an inline error.',
    interaction: 'The file MIME type is being validated.',
  },
  {
    title: 'Scene 4 of 4 \u2014 Accepted',
    description:
      'The file passes MIME validation. onInput is called with { type: "file", file: File }. This routes identically to a camera-captured or file-picked image — the upstream handler opens the crop editor.',
    interaction: 'The workflow is complete. The crop editor opens with the dropped image.',
  },
];

// ---------------------------------------------------------------------------
// createWorkflowStories
// ---------------------------------------------------------------------------

const {
  Interactive: DragDropInteractiveStory,
  Stepwise: DragDropStepwiseStory,
  Automated: DragDropAutomatedStory,
} = createWorkflowStories({
  scenes: dragAndDropScenes,
  renderScene: (i) => <DragAndDropScene sceneIndex={i} />,
  renderLive: () => <DragAndDropLive />,
  delayMs: 2000,
  play: async ({ canvas, goToScene, delay }) => {
    goToScene(0);
    await delay();

    // Verify idle state — upload button is present
    await waitFor(() => {
      expect(canvas.getByRole('button', { name: /upload from computer/i })).toBeVisible();
    });
    goToScene(1);
    await delay();

    // Note: real drag events cannot be automated — we document the visual state
    goToScene(2);
    await delay();

    goToScene(3);
    await delay();
  },
});

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0002 Input Detection/Drag and Drop',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const DragAndDropInteractive: StoryObj = {
  ...DragDropInteractiveStory,
  name: 'Drag and Drop (Interactive)',
};

export const DragAndDropStepwise: StoryObj = {
  ...DragDropStepwiseStory,
  name: 'Drag and Drop (Stepwise)',
};

export const DragAndDropAutomated: StoryObj = {
  ...DragDropAutomatedStory,
  name: 'Drag and Drop (Automated)',
};
