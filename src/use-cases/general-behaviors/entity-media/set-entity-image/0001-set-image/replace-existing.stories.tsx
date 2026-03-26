/**
 * GEN-MEDIA-0001::0001.UC — Set Image via Unified Input Surface
 * Scene: Replace Existing Image
 *
 * When an item already has an image, the upload dialog enters the EditExisting state
 * first, allowing the user to crop the current image or choose to upload a replacement.
 * Once a new file is provided, the ProvidedImage state shows a side-by-side comparison
 * (ImageComparisonLayout) on desktop, or a tabbed layout on mobile.
 *
 * Two variants:
 *   Desktop  — 1280×800 viewport, side-by-side comparison
 *   Mobile   — 390×844 viewport, tabbed comparison
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, expect, screen, userEvent, waitFor } from 'storybook/test';
import { useState } from 'react';

import { ImageUploadDialog } from '@/components/canary/organisms/shared/image-upload-dialog/image-upload-dialog';
import {
  ITEM_IMAGE_CONFIG,
  MOCK_ITEM_IMAGE,
  MOCK_FILE_JPEG,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageUploadResult } from '@/types/canary/utilities/image-field-config';

/* ================================================================
   WRAPPER
   ================================================================ */

interface ReplaceImagePageProps {
  onConfirm: (result: ImageUploadResult) => void;
  onCancel: () => void;
}

function ReplaceImagePage({ onConfirm, onCancel }: ReplaceImagePageProps) {
  const [open, setOpen] = useState(false);
  const [lastResult, setLastResult] = useState<ImageUploadResult | null>(null);

  const handleConfirm = (result: ImageUploadResult) => {
    onConfirm(result);
    setLastResult(result);
    setOpen(false);
  };

  const handleCancel = () => {
    onCancel();
    setOpen(false);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="text-center max-w-md">
        <h1 className="text-xl font-semibold tracking-tight mb-1">
          GEN-MEDIA-0001 \u2014 Replace Existing Image
        </h1>
        <p className="text-sm text-muted-foreground">
          The item already has a product image. Opening the dialog shows the existing image for
          editing or replacement. Providing a new file activates the comparison layout.
        </p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Current image
        </span>
        <img
          src={MOCK_ITEM_IMAGE}
          alt="Current product image"
          className="w-24 h-24 object-cover rounded-lg border border-border"
        />
      </div>

      <button
        type="button"
        data-testid="open-dialog-btn"
        onClick={() => {
          setLastResult(null);
          setOpen(true);
        }}
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Replace Image
      </button>

      {lastResult && (
        <div className="rounded-lg border border-border p-4 text-sm max-w-sm w-full">
          <p className="font-semibold mb-2 text-green-700 dark:text-green-400">
            Image replaced successfully
          </p>
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all">
            {JSON.stringify(lastResult, null, 2)}
          </pre>
        </div>
      )}

      <ImageUploadDialog
        config={ITEM_IMAGE_CONFIG}
        existingImageUrl={MOCK_ITEM_IMAGE}
        open={open}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}

/* ================================================================
   META
   ================================================================ */

const meta: Meta<ReplaceImagePageProps> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0001 Set Image/Replace Existing',
  component: ReplaceImagePage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'When `existingImageUrl` is set, the dialog opens in EditExisting state. ' +
          'If the user clicks "Upload New Image", the dialog transitions to EmptyImage. ' +
          'Once a file is provided, the ProvidedImage state renders ImageComparisonLayout ' +
          'showing old (left) and new (right) side-by-side on desktop, or as tabs on mobile.',
      },
    },
  },
  args: {
    onConfirm: fn(),
    onCancel: fn(),
  },
};

export default meta;
type Story = StoryObj<ReplaceImagePageProps>;

/* ================================================================
   PLAY HELPER
   ================================================================ */

async function playReplaceFlow() {
  // Open the dialog
  const openBtn = await waitFor(() => {
    const el = document.querySelector<HTMLButtonElement>('[data-testid="open-dialog-btn"]');
    if (!el) throw new Error('Open button not found');
    return el;
  });
  await userEvent.click(openBtn);

  // Dialog should open in EditExisting state — title reads "Edit Product Image"
  await waitFor(() => {
    expect(screen.getByRole('dialog')).toBeVisible();
  });
  await waitFor(() => {
    expect(screen.getByText(/edit product image/i)).toBeVisible();
  });

  // Click "Upload New Image" to switch to EmptyImage / file-pick flow
  const uploadNewBtn = await waitFor(() =>
    screen.getByRole('button', { name: /upload new image/i }),
  );
  await userEvent.click(uploadNewBtn);

  // EmptyImage drop zone is now showing
  await waitFor(() => {
    expect(screen.getByText(/drag and drop an image/i)).toBeVisible();
  });

  // Upload a new file
  const fileInput = await waitFor(() => {
    const el = document.querySelector<HTMLInputElement>('input[type="file"]');
    if (!el) throw new Error('File input not found');
    return el;
  });
  await userEvent.upload(fileInput, MOCK_FILE_JPEG);

  // ProvidedImage state — comparison layout is visible
  await waitFor(() => {
    // ImageComparisonLayout renders both "Current" and "New" labels
    expect(screen.getByText(/current/i)).toBeVisible();
  });

  // Acknowledge copyright
  const copyrightCheckbox = await waitFor(() =>
    screen.getByRole('checkbox', { name: /copyright acknowledgment/i }),
  );
  await userEvent.click(copyrightCheckbox);

  // Confirm the upload
  const confirmBtn = await waitFor(() => {
    const btn = screen.getByRole('button', { name: /^confirm$/i });
    expect(btn).not.toBeDisabled();
    return btn;
  });
  await userEvent.click(confirmBtn);

  // Wait for upload to complete and dialog to close
  await waitFor(
    () => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    },
    { timeout: 4000 },
  );
}

/* ================================================================
   STORIES
   ================================================================ */

/**
 * Desktop — 1280x800 viewport shows the side-by-side ImageComparisonLayout.
 * The existing image appears on the left; the newly staged image on the right.
 */
export const Desktop: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
      viewports: {
        desktop: { name: 'Desktop 1280', styles: { width: '1280px', height: '800px' } },
      },
    },
  },
  play: async () => {
    await playReplaceFlow();
  },
};

/**
 * Mobile — 390x844 viewport (iPhone 14 Pro) shows the tabbed comparison layout.
 * The user switches between "Current" and "New" tabs to compare images.
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
      viewports: {
        mobile: { name: 'Mobile 390', styles: { width: '390px', height: '844px' } },
      },
    },
  },
  play: async () => {
    await playReplaceFlow();
  },
};
