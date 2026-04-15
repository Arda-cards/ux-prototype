import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { useState } from 'react';

import { ImageUploadDialog } from './image-upload-dialog';
import { ImageDisplay } from '@/components/canary/molecules/image-display/image-display';
import {
  ITEM_IMAGE_CONFIG,
  MOCK_ITEM_IMAGE,
  mockUpload,
  mockReachabilityCheck,
} from '@/components/canary/__mocks__/image-story-data';
import type { ImageUploadResult } from '@/types/canary/utilities/image-field-config';
import { ImageUploadProvider, type ImageUploader } from '@/types/canary/utilities/image-uploader';

/** Story-scope mock uploader — composes the existing mock file upload + a
 *  simulated URL-upload round-trip + the reachability stub. */
const mockImageUploader: ImageUploader = {
  uploadFile: mockUpload,
  uploadFromUrl: async (url: string) => {
    await new Promise((r) => setTimeout(r, 1500));
    return `https://picsum.photos/seed/arda-from-url-${url.length}/400/400`;
  },
  checkReachability: mockReachabilityCheck,
};

const meta: Meta<typeof ImageUploadDialog> = {
  title: 'Components/Canary/Organisms/Shared/ImageUploadDialog',
  component: ImageUploadDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'State-machine orchestrator for the full image upload flow. ' +
          'Manages EmptyImage, ProvidedImage, FailedValidation, Uploading, and Warn states.',
      },
    },
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether the dialog is open.',
      table: { category: 'Runtime' },
    },
    existingImageUrl: {
      control: 'text',
      description: 'URL of the existing image. When set, shows comparison layout.',
      table: { category: 'Runtime' },
    },
    onConfirm: {
      action: 'onConfirm',
      description: 'Called with ImageUploadResult when upload completes.',
      table: { category: 'Runtime' },
    },
    onCancel: {
      action: 'onCancel',
      description: 'Called when the user cancels the dialog.',
      table: { category: 'Runtime' },
    },
  },
  args: {
    config: ITEM_IMAGE_CONFIG,
    onConfirm: fn(),
    onCancel: fn(),
  },
  decorators: [
    // Provide the mock uploader via Context (4.11.7+). Previously stories
    // passed `onUpload` / `onCheckReachability` as per-component callbacks;
    // the new API consumes the uploader from the surrounding provider.
    (Story) => (
      <ImageUploadProvider value={mockImageUploader}>
        <Story />
      </ImageUploadProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ImageUploadDialog>;
export const EmptyImageState: Story = {
  args: {
    open: true,
    existingImageUrl: null,
  },
};

/**
 * ProvidedImage state &#8212; an image has been staged via URL.
 * Shows ImagePreviewEditor with crop controls and CopyrightAcknowledgment.
 */
export const ProvidedImageState: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <div>
        <button onClick={() => setOpen(true)} className="mb-4 px-3 py-1.5 rounded border text-sm">
          Reopen dialog
        </button>
        <ImageUploadDialog
          {...args}
          open={open}
          onCancel={() => {
            args.onCancel();
            setOpen(false);
          }}
          onConfirm={(result: ImageUploadResult) => {
            args.onConfirm(result);
            setOpen(false);
          }}
        />
      </div>
    );
  },
  args: {
    open: true,
    existingImageUrl: null,
  },
};

/**
 * ComparisonMode &#8212; an existing image URL is set alongside a newly staged image.
 * Shows ImageComparisonLayout with side-by-side (desktop) or tabbed (mobile) panels.
 */
export const ComparisonMode: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <div>
        <button onClick={() => setOpen(true)} className="mb-4 px-3 py-1.5 rounded border text-sm">
          Reopen dialog
        </button>
        <ImageUploadDialog
          {...args}
          open={open}
          onCancel={() => {
            args.onCancel();
            setOpen(false);
          }}
          onConfirm={(result: ImageUploadResult) => {
            args.onConfirm(result);
            setOpen(false);
          }}
        />
      </div>
    );
  },
  args: {
    open: true,
    existingImageUrl: MOCK_ITEM_IMAGE,
  },
};

/**
 * ValidationError &#8212; inline error message displayed above a fresh ImageDropZone.
 * Trigger by dropping an invalid file or submitting a non-https:// URL.
 */
export const ValidationError: Story = {
  args: {
    open: true,
    existingImageUrl: null,
  },
};

/**
 * CopyrightGate &#8212; image provided but Confirm is disabled until the copyright checkbox is checked.
 * Toggle the checkbox to enable / disable the Confirm button.
 */
export const CopyrightGate: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <div>
        <button onClick={() => setOpen(true)} className="mb-4 px-3 py-1.5 rounded border text-sm">
          Reopen dialog
        </button>
        <p className="text-sm text-muted-foreground mb-2">
          Drop a file to see the copyright gate — Confirm stays disabled until the checkbox is
          checked.
        </p>
        <ImageUploadDialog
          {...args}
          open={open}
          onCancel={() => {
            args.onCancel();
            setOpen(false);
          }}
          onConfirm={(result: ImageUploadResult) => {
            args.onConfirm(result);
            setOpen(false);
          }}
        />
      </div>
    );
  },
  args: {
    open: true,
    existingImageUrl: null,
  },
};

/**
 * UploadProgress &#8212; simulates the Uploading state with an animated progress bar.
 * The dialog shows a progress bar and a disabled "Uploading&#8230;" button.
 */
export const UploadProgress: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <div>
        <button onClick={() => setOpen(true)} className="mb-4 px-3 py-1.5 rounded border text-sm">
          Reopen dialog
        </button>
        <p className="text-sm text-muted-foreground mb-2">
          Drop a file, check copyright, then click Confirm to see the upload progress bar.
        </p>
        <ImageUploadDialog
          {...args}
          open={open}
          onCancel={() => {
            args.onCancel();
            setOpen(false);
          }}
          onConfirm={(result: ImageUploadResult) => {
            args.onConfirm(result);
            setOpen(false);
          }}
        />
      </div>
    );
  },
  args: {
    open: true,
    existingImageUrl: null,
  },
};

/**
 * WarnOnDiscard &#8212; stage an image, then click Cancel to trigger the AlertDialog guard.
 * "Discard" permanently removes the staged image; "Go Back" returns to the editor.
 */
export const WarnOnDiscard: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <div>
        <button onClick={() => setOpen(true)} className="mb-4 px-3 py-1.5 rounded border text-sm">
          Reopen dialog
        </button>
        <p className="text-sm text-muted-foreground mb-2">
          Drop a file, then click Cancel to see the discard confirmation dialog.
        </p>
        <ImageUploadDialog
          {...args}
          open={open}
          onCancel={() => {
            args.onCancel();
            setOpen(false);
          }}
          onConfirm={(result: ImageUploadResult) => {
            args.onConfirm(result);
            setOpen(false);
          }}
        />
      </div>
    );
  },
  args: {
    open: true,
    existingImageUrl: null,
  },
};

/**
 * FullHappyPath &#8212; interactive end-to-end flow.
 * Open &#8594; drop file &#8594; preview &#8594; copyright &#8594; confirm &#8594; progress &#8594; close.
 */
export const FullHappyPath: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);
    const [lastResult, setLastResult] = useState<ImageUploadResult | null>(null);

    return (
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => {
            setLastResult(null);
            setOpen(true);
          }}
          className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm"
        >
          Open Upload Dialog
        </button>

        {lastResult && (
          <div className="rounded-lg border border-border p-4 text-sm max-w-sm w-full">
            <p className="font-semibold mb-2">Upload complete!</p>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all">
              {JSON.stringify(lastResult, null, 2)}
            </pre>
          </div>
        )}

        <ImageUploadDialog
          {...args}
          open={open}
          onCancel={() => {
            args.onCancel();
            setOpen(false);
          }}
          onConfirm={(result: ImageUploadResult) => {
            args.onConfirm(result);
            setLastResult(result);
            setOpen(false);
          }}
        />
      </div>
    );
  },
  args: {
    existingImageUrl: null,
  },
};

/**
 * Interactive Controls playground.
 * Toggle open, existingImageUrl, and config via the Controls panel.
 * Actions log onConfirm and onCancel.
 */
export const Playground: Story = {
  args: {
    open: true,
    existingImageUrl: null,
    config: ITEM_IMAGE_CONFIG,
  },
};

/**
 * FullFlow &#8212; end-to-end baked-in flow using ImageDisplay.
 *
 * ImageDisplay with `onImageChange` + `config` handles the entire edit lifecycle
 * internally: double-click the thumbnail to open ImageUploadDialog, confirm to
 * update the thumbnail. No external state management required from the parent.
 *
 * This story demonstrates that ImageUploadDialog is correctly wired inside
 * ImageDisplay and that `onUpload` / `onCheckReachability` propagate correctly.
 */
export const FullFlow: Story = {
  render: (args) => {
    const [imageUrl, setImageUrl] = useState<string | null>(MOCK_ITEM_IMAGE);
    return (
      <div className="flex flex-col items-center gap-6 p-8">
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Double-click the thumbnail (or press Enter when focused) to open the upload dialog.
          Confirm to update the displayed image.
        </p>
        <div className="w-32 h-32">
          <ImageDisplay
            imageUrl={imageUrl}
            entityTypeDisplayName={ITEM_IMAGE_CONFIG.entityTypeDisplayName}
            propertyDisplayName={ITEM_IMAGE_CONFIG.propertyDisplayName}
            config={ITEM_IMAGE_CONFIG}
            onImageChange={(result) => {
              args.onConfirm(result);
              setImageUrl(result.imageUrl);
            }}
          />
        </div>
        {imageUrl !== null && (
          <p className="text-xs text-muted-foreground break-all max-w-xs text-center">
            Current URL: {imageUrl}
          </p>
        )}
        <button className="text-xs text-destructive underline" onClick={() => setImageUrl(null)}>
          Clear image
        </button>
      </div>
    );
  },
  args: {
    existingImageUrl: MOCK_ITEM_IMAGE,
  },
};
