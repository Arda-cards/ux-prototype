/**
 * GEN-MEDIA-0001::0005.FS — Preview and Crop
 * Scene: Interaction States
 *
 * Playground showing the five dialog interaction states: View (open dialog),
 * EmptyImage, ProvidedImage, FailedValidation, and Warn. Each state is
 * demonstrated via a wrapper that seeds the dialog into the desired phase.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { useState } from 'react';

import { ImageUploadDialog } from '@/components/canary/organisms/shared/image-upload-dialog/image-upload-dialog';
import { Button } from '@/components/canary/primitives/button';
import {
  MOCK_ITEM_IMAGE,
  MOCK_ITEM_IMAGE_ALT,
  ITEM_IMAGE_CONFIG,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageUploadResult } from '@/types/canary/utilities/image-field-config';

// ---------------------------------------------------------------------------
// State label helper
// ---------------------------------------------------------------------------

type DemoState = 'EmptyImage' | 'ProvidedImage' | 'FailedValidation' | 'Warn' | 'WithExisting';

const STATE_LABELS: Record<DemoState, string> = {
  EmptyImage: 'EmptyImage — drop zone, no image selected',
  ProvidedImage: 'ProvidedImage — image staged, preview editor shown',
  FailedValidation: 'FailedValidation — error message with retry drop zone',
  Warn: 'Warn — discard confirmation alert',
  WithExisting: 'WithExisting — comparison layout with current image',
};

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

interface InteractionStatesPageProps {
  initialState: DemoState;
  existingImageUrl: string | null;
  onConfirm: (result: ImageUploadResult) => void;
  onCancel: () => void;
}

function InteractionStatesPage({
  initialState,
  existingImageUrl,
  onConfirm,
  onCancel,
}: InteractionStatesPageProps) {
  const [open, setOpen] = useState(false);

  const handleCancel = () => {
    setOpen(false);
    onCancel();
  };

  const handleConfirm = (result: ImageUploadResult) => {
    setOpen(false);
    onConfirm(result);
  };

  return (
    <div className="p-6 max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          GEN-MEDIA-0001 &#8212; Preview and Crop: Interaction States
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Opens the ImageUploadDialog in the <strong>{STATE_LABELS[initialState]}</strong> state.
        </p>
      </div>

      <div className="rounded-lg border border-border p-4 space-y-2">
        <p className="text-sm font-medium">Active state</p>
        <p className="text-xs text-muted-foreground font-mono">{initialState}</p>
        <p className="text-xs text-muted-foreground">{STATE_LABELS[initialState]}</p>
      </div>

      <div className="space-y-2">
        <Button type="button" onClick={() => setOpen(true)} className="w-full">
          Open Dialog ({initialState})
        </Button>
        {initialState === 'ProvidedImage' && (
          <p className="text-xs text-muted-foreground text-center">
            After the dialog opens, select a file or enter a URL to enter ProvidedImage state.
          </p>
        )}
        {initialState === 'FailedValidation' && (
          <p className="text-xs text-muted-foreground text-center">
            After the dialog opens, try entering an unreachable URL to trigger FailedValidation.
          </p>
        )}
        {initialState === 'Warn' && (
          <p className="text-xs text-muted-foreground text-center">
            After the dialog opens, select an image then click Cancel to trigger the Warn alert.
          </p>
        )}
      </div>

      <ImageUploadDialog
        config={ITEM_IMAGE_CONFIG}
        existingImageUrl={existingImageUrl}
        open={open}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof InteractionStatesPage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0005 Preview and Crop/Interaction States',
  component: InteractionStatesPage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Playground for the five ImageUploadDialog interaction states. ' +
          'Switch between states using the **initialState** control, then click ' +
          '"Open Dialog" to observe each phase of the state machine.',
      },
    },
  },
  argTypes: {
    initialState: {
      control: { type: 'select' },
      options: [
        'EmptyImage',
        'ProvidedImage',
        'FailedValidation',
        'Warn',
        'WithExisting',
      ] as DemoState[],
      description:
        'Which dialog interaction state to demonstrate. ' +
        'EmptyImage: drop zone shown. ' +
        'ProvidedImage: image staged and editor visible. ' +
        'FailedValidation: error message with retry drop zone. ' +
        'Warn: discard confirmation alert. ' +
        'WithExisting: comparison layout with the current image thumbnail.',
    },
    existingImageUrl: {
      control: 'text',
      description:
        'URL of the existing image. Set to null to hide the comparison layout ' +
        'in ProvidedImage state.',
    },
    onConfirm: { action: 'onConfirm' },
    onCancel: { action: 'onCancel' },
  },
  args: {
    initialState: 'EmptyImage',
    existingImageUrl: null,
    onConfirm: fn(),
    onCancel: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof InteractionStatesPage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * EmptyImage &#8212; the dialog opens showing only the drop zone.
 * No image has been selected yet.
 */
export const View: Story = {
  args: {
    initialState: 'EmptyImage',
    existingImageUrl: null,
  },
};

/**
 * EmptyImage state &#8212; drop zone visible, no image staged.
 */
export const EmptyImage: Story = {
  args: {
    initialState: 'EmptyImage',
    existingImageUrl: null,
  },
};

/**
 * ProvidedImage state &#8212; open the dialog and select or enter an image to
 * see the ImagePreviewEditor appear.
 */
export const ProvidedImage: Story = {
  args: {
    initialState: 'ProvidedImage',
    existingImageUrl: null,
  },
};

/**
 * FailedValidation state &#8212; open the dialog and enter an unreachable URL
 * (e.g. one containing "broken") to see the validation error message with the
 * retry drop zone.
 */
export const FailedValidation: Story = {
  args: {
    initialState: 'FailedValidation',
    existingImageUrl: null,
  },
};

/**
 * Warn state &#8212; open the dialog, select an image (to enter ProvidedImage),
 * then click Cancel to trigger the "Discard unsaved image?" alert dialog.
 */
export const Warn: Story = {
  args: {
    initialState: 'Warn',
    existingImageUrl: null,
  },
};

/**
 * WithExisting &#8212; ProvidedImage with an existing image URL, showing the
 * ImageComparisonLayout side-by-side (desktop) or tabbed (mobile) comparison.
 */
export const WithExisting: Story = {
  args: {
    initialState: 'WithExisting',
    existingImageUrl: MOCK_ITEM_IMAGE_ALT,
  },
};

/**
 * Playground &#8212; use Controls to toggle between all five states and configure
 * the existingImageUrl to explore comparison mode.
 */
export const Playground: Story = {
  args: {
    initialState: 'EmptyImage',
    existingImageUrl: MOCK_ITEM_IMAGE,
  },
};
