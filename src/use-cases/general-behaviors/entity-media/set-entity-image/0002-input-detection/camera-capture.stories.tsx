/**
 * GEN-MEDIA-0001::0002.FS — Input Detection and Routing
 * Scene: Camera Capture
 *
 * Shows the "Take photo" affordance. On mobile browsers the file picker can
 * open the camera directly via `<input accept="image/*" capture="environment">`.
 * Detailed camera UX (viewfinder, flash, orientation) is deferred to a
 * separate mobile-specific story set.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import { ITEM_IMAGE_CONFIG } from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';

// ---------------------------------------------------------------------------
// Live component — used by Interactive and Automated modes
// ---------------------------------------------------------------------------

function CameraCaptureLive() {
  return (
    <div className="p-6 max-w-lg space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">
        GEN-MEDIA-0001 — Input Detection: Camera Capture
      </h1>
      <p className="text-sm text-muted-foreground">
        On mobile browsers, <strong>Upload from computer</strong> opens the native file picker which
        includes a <em>Take Photo</em> option. When the user captures a photo it is delivered as a{' '}
        <code>File</code> with MIME type <code>image/jpeg</code> — the same routing path as a
        file-picked image.
      </p>

      <ImageDropZone
        acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
        onInput={() => {}}
        onDismiss={() => {}}
      />

      <div className="rounded-lg border border-dashed border-border p-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Implementation note
        </p>
        <p className="text-xs text-muted-foreground">
          Camera access is provided by the OS file picker on mobile — no additional JavaScript
          camera API is required for basic capture. A dedicated camera viewfinder (using{' '}
          <code>getUserMedia</code>) is deferred and tracked separately.
        </p>
        <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1 mt-1">
          <li>iOS Safari: file picker offers &ldquo;Take Photo or Video&rdquo;</li>
          <li>Android Chrome: file picker offers &ldquo;Camera&rdquo;</li>
          <li>Desktop: file picker shows filesystem only</li>
        </ul>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static scene renderer — used by Stepwise mode
// ---------------------------------------------------------------------------

function CameraCaptureScene({ sceneIndex }: { sceneIndex: number }) {
  const noop = () => {};

  switch (sceneIndex) {
    // Scene 1: Drop zone idle — waiting for user interaction
    case 0:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — Input Detection: Camera Capture
          </h1>
          <p className="text-sm text-muted-foreground">
            The drop zone is idle. On mobile, tapping &ldquo;Upload from computer&rdquo; will open
            the native file picker.
          </p>
          <ImageDropZone
            acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
            onInput={noop}
            onDismiss={noop}
          />
        </div>
      );

    // Scene 2: Camera affordance highlighted — "Upload from computer" button focused
    case 1:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — Input Detection: Camera Capture
          </h1>
          <p className="text-sm text-muted-foreground">
            The user taps <strong>Upload from computer</strong>. On iOS/Android, the OS presents a
            native picker with a &ldquo;Take Photo&rdquo; option alongside the filesystem browser.
          </p>
          <ImageDropZone
            acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
            onInput={noop}
            onDismiss={noop}
          />
          <div className="rounded-lg border border-primary bg-accent/30 p-3">
            <p className="text-xs font-semibold text-primary">
              Mobile OS file picker opens with camera option
            </p>
          </div>
        </div>
      );

    // Scene 3: Route to upload — captured photo delivered as File
    case 2:
    default:
      return (
        <div className="p-6 max-w-lg space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 — Input Detection: Camera Capture
          </h1>
          <p className="text-sm text-muted-foreground">
            The captured photo arrives as a <code>File</code> with MIME type <code>image/jpeg</code>
            . This routes identically to a file-picked image — the upstream handler receives{' '}
            <code>{'{ type: "file", file: File }'}</code>.
          </p>
          <div className="rounded-lg border border-border p-4">
            <h2 className="text-sm font-semibold mb-1">Routed input</h2>
            <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
              {JSON.stringify(
                { type: 'file', fileName: 'photo.jpg', mimeType: 'image/jpeg' },
                null,
                2,
              )}
            </pre>
          </div>
          <div className="rounded-lg border border-dashed border-border p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Implementation note
            </p>
            <p className="text-xs text-muted-foreground">
              Camera access is provided by the OS file picker — no <code>getUserMedia</code>{' '}
              required for basic capture. A dedicated camera viewfinder is deferred.
            </p>
          </div>
        </div>
      );
  }
}

// ---------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------

const cameraCaptureScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 3 \u2014 Drop Zone Idle',
    description:
      'The ImageDropZone renders in its idle state. On desktop, "Upload from computer" opens the OS filesystem picker. On mobile, the same button triggers a native picker that also offers camera capture.',
    interaction: 'On a mobile device, tap "Upload from computer" to open the native file picker.',
  },
  {
    title: 'Scene 2 of 3 \u2014 Camera Affordance',
    description:
      'The OS presents a native file picker with a "Take Photo or Video" option (iOS) or "Camera" option (Android). The user selects the camera and captures a photo.',
    interaction: 'Select the camera option and capture a photo.',
  },
  {
    title: 'Scene 3 of 3 \u2014 Routed to Upload',
    description:
      'The captured photo is delivered to the app as a File object with MIME type image/jpeg. This is identical to the file-pick routing path — no special camera handling is needed in the drop zone.',
    interaction: 'The workflow is complete. The file routes to the crop editor.',
  },
];

// ---------------------------------------------------------------------------
// createWorkflowStories
// ---------------------------------------------------------------------------

const {
  Interactive: CameraInteractive,
  Stepwise: CameraStepwise,
  Automated: CameraAutomated,
} = createWorkflowStories({
  scenes: cameraCaptureScenes,
  renderScene: (i) => <CameraCaptureScene sceneIndex={i} />,
  renderLive: () => <CameraCaptureLive />,
  delayMs: 2000,
  play: async ({ canvas, goToScene, delay }) => {
    goToScene(0);
    await delay();

    // Verify the upload button is visible
    await waitFor(() => {
      expect(canvas.getByRole('button', { name: /upload from computer/i })).toBeVisible();
    });
    goToScene(1);
    await delay();

    // Scene 3: document the implementation note panel
    await waitFor(() => {
      expect(canvas.getByText(/implementation note/i)).toBeVisible();
    });
    goToScene(2);
    await delay();
  },
});

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0002 Input Detection/Camera Capture',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const CameraCaptureInteractive: StoryObj = {
  ...CameraInteractive,
  name: 'Camera Capture (Interactive)',
};

export const CameraCaptureStepwise: StoryObj = {
  ...CameraStepwise,
  name: 'Camera Capture (Stepwise)',
};

export const CameraCaptureAutomated: StoryObj = {
  ...CameraAutomated,

  name: 'Camera Capture (Automated)',
};
