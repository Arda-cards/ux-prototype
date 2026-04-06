/**
 * GEN-MEDIA-0001::0002.FS — Input Detection and Routing
 * Scene: File Pick
 *
 * Demonstrates file selection via the "Upload from computer" button.
 * The drop zone emits `{ type: 'file', file }` when a valid file is chosen.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { useState } from 'react';

import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import { ITEM_IMAGE_CONFIG } from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageInput } from '@/types/canary/utilities/image-field-config';

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

function FilePickPage(args: {
  acceptedFormats: typeof ITEM_IMAGE_CONFIG.acceptedFormats;
  onInput: (input: ImageInput) => void;
}) {
  const [lastInput, setLastInput] = useState<ImageInput | null>(null);

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-xl font-semibold tracking-tight mb-1">
        GEN-MEDIA-0001 — Input Detection: File Pick
      </h1>
      <p className="text-sm text-muted-foreground mb-4">
        Click <strong>Upload from computer</strong> to open the native file picker and select an
        image. The drop zone validates the MIME type and emits a classified input event.
      </p>

      <ImageDropZone
        {...args}
        onInput={(input) => {
          setLastInput(input);
          args.onInput(input);
        }}
      />

      {lastInput && (
        <div className="mt-4 rounded-lg border border-border p-4">
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
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof FilePickPage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0002 Input Detection/File Pick',
  component: FilePickPage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Click "Upload from computer" to open the OS file picker. ' +
          'Only files matching the accepted MIME types are routed as `{ type: "file" }`. ' +
          'Invalid MIME types produce `{ type: "error" }`.',
      },
    },
  },
  argTypes: {
    acceptedFormats: {
      control: { type: 'check' },
      options: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
      description: 'Accepted MIME types for file uploads.',
    },
  },
  args: {
    acceptedFormats: ITEM_IMAGE_CONFIG.acceptedFormats,
    onInput: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof FilePickPage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Default idle state — click "Upload from computer" to trigger the file picker. */
export const Default: Story = {};

/** Playground — use Controls to toggle which MIME types are accepted. */
export const Playground: Story = {
  args: {
    acceptedFormats: ITEM_IMAGE_CONFIG.acceptedFormats,
  },
};
