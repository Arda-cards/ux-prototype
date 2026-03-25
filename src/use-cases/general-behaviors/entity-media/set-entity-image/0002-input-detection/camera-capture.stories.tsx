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
import { fn, expect, within, waitFor } from 'storybook/test';

import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import { ITEM_IMAGE_CONFIG } from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageInput } from '@/types/canary/utilities/image-field-config';

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

interface CameraCapturePageProps {
  acceptedFormats: typeof ITEM_IMAGE_CONFIG.acceptedFormats;
  onInput: (input: ImageInput) => void;
  onDismiss: () => void;
}

function CameraCapturePage(args: CameraCapturePageProps) {
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

      <ImageDropZone {...args} />

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
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof CameraCapturePage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0002 Input Detection/Camera Capture',
  component: CameraCapturePage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'On mobile, the OS file picker exposes a camera option. ' +
          'The captured photo arrives as a `File` — identical routing to a file pick. ' +
          'A full camera viewfinder UI is deferred.',
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
type Story = StoryObj<typeof CameraCapturePage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Default view — drop zone with implementation notes about camera routing.
 * Manual test: open on a mobile device and tap "Upload from computer" to
 * access the native camera option.
 */
export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    await step('Drop zone renders with upload button', async () => {
      const canvas = within(canvasElement);
      await waitFor(() => {
        expect(canvas.getByRole('button', { name: /upload from computer/i })).toBeVisible();
      });
    });

    await step('Implementation note panel is visible', async () => {
      const canvas = within(canvasElement);
      expect(canvas.getByText(/implementation note/i)).toBeVisible();
    });
  },
};
