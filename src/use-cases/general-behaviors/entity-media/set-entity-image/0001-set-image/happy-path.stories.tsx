/**
 * GEN-MEDIA-0001::0001.UC — Set Image via Unified Input Surface
 * Scene: Happy Path
 *
 * End-to-end demonstration of the full image upload flow:
 * File pick → preview → copyright acknowledgment → confirm → upload complete.
 *
 * Generates three story variants:
 *   Interactive  — live wizard with guide panel
 *   Stepwise     — step-by-step scene viewer (read-only)
 *   Automated    — programmatic play() exercising the full flow
 */
import type { Meta } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor } from 'storybook/test';
import { useState } from 'react';

import {
  createUseCaseStories,
  UseCaseShell,
  SummaryCard,
  SummaryRow,
  SuccessScreen,
  useWizard,
  type GuideEntry,
  type Scene,
  type WizardProps,
} from '@/use-cases/framework';
import { ImageUploadDialog } from '@/components/canary/organisms/shared/image-upload-dialog/image-upload-dialog';
import {
  ITEM_IMAGE_CONFIG,
  MOCK_ITEM_IMAGE,
  MOCK_FILE_JPEG,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageUploadResult } from '@/types/canary/utilities/image-field-config';

/* ================================================================
   DATA
   ================================================================ */

interface ImageFormData {
  imageUrl: string;
}

const INITIAL: ImageFormData = { imageUrl: '' };

const SAMPLE: ImageFormData = { imageUrl: MOCK_ITEM_IMAGE };

/* ================================================================
   GUIDES
   ================================================================ */

const guides: GuideEntry[] = [
  {
    title: 'Step 1: Open the Upload Dialog',
    description:
      'The user activates the image area on an item (e.g. clicking the image cell or an Edit Image button). This opens the ImageUploadDialog in its EmptyImage state, showing a drop zone.',
    interaction: 'Click "Open Upload Dialog" to launch the dialog in its initial EmptyImage state.',
  },
  {
    title: 'Step 2: Provide an Image',
    description:
      'The user provides an image via file pick, drag-and-drop, or URL entry. Once provided, the dialog transitions to the ProvidedImage state, showing the ImagePreviewEditor with crop controls.',
    interaction: 'Drop a file or click "Upload from computer" to select a JPEG/PNG image.',
  },
  {
    title: 'Step 3: Preview and Crop',
    description:
      'The ImagePreviewEditor renders the staged image with crop handles. The user may adjust the crop or rotation. The CopyrightAcknowledgment checkbox is shown below — Confirm stays disabled until it is checked.',
    interaction: 'Optionally adjust the crop, then check the copyright acknowledgment checkbox.',
  },
  {
    title: 'Step 4: Confirm Upload',
    description:
      'With the copyright checkbox acknowledged, the Confirm button becomes active. Clicking it transitions the dialog to the Uploading state, showing a progress bar.',
    interaction: 'Check the copyright checkbox to enable Confirm, then click Confirm.',
  },
  {
    title: 'Success',
    description:
      'The upload completes. The dialog closes and the onConfirm callback fires with the resulting ImageUploadResult. The wizard shows the final image URL.',
    interaction: 'Click "Start Over" to reset and try again.',
  },
];

/* ================================================================
   SCENES
   ================================================================ */

const scenes: Scene<ImageFormData>[] = [
  {
    wizardStep: 0,
    submitted: false,
    formData: INITIAL,
    title: 'Scene 1 of 5 \u2014 Empty State',
    description:
      'The wizard starts with no image. The dialog is closed; the user sees a prompt to open it.',
    interaction: 'The user clicks "Open Upload Dialog" to begin the flow.',
  },
  {
    wizardStep: 0,
    submitted: false,
    formData: INITIAL,
    title: 'Scene 2 of 5 \u2014 Dialog Open (EmptyImage)',
    description:
      'The ImageUploadDialog opens in its EmptyImage state, rendering the ImageDropZone with file upload and URL entry inputs.',
    interaction:
      'The user drags a file onto the zone or clicks "Upload from computer" to pick a JPEG.',
  },
  {
    wizardStep: 0,
    submitted: false,
    formData: INITIAL,
    title: 'Scene 3 of 5 \u2014 Image Staged (ProvidedImage)',
    description:
      'A file has been accepted. The dialog transitions to ProvidedImage, showing the ImagePreviewEditor with crop handles and the copyright checkbox below it.',
    interaction: 'The user adjusts the crop if needed, then checks the copyright acknowledgment.',
  },
  {
    wizardStep: 0,
    submitted: false,
    formData: INITIAL,
    title: 'Scene 4 of 5 \u2014 Copyright Acknowledged / Uploading',
    description:
      'The copyright checkbox is checked, enabling the Confirm button. On click, the dialog enters the Uploading state and shows an animated progress bar.',
    interaction:
      'The user watches the progress bar; the dialog closes automatically on completion.',
  },
  {
    wizardStep: 0,
    submitted: true,
    formData: SAMPLE,
    title: 'Scene 5 of 5 \u2014 Upload Complete',
    description:
      'The upload finished. The dialog has closed and the wizard receives the resulting image URL via onConfirm.',
    interaction: 'Click "Start Over" to reset the wizard.',
  },
];

/* ================================================================
   WIZARD
   ================================================================ */

function SetImageWizard(props: WizardProps<ImageFormData>) {
  const w = useWizard(props, {
    initial: INITIAL,
    stepNames: ['Upload Image'],
    canAdvance: (_step, data) => !!data.imageUrl,
  });

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleConfirm = (result: ImageUploadResult) => {
    w.setFormData({ imageUrl: result.imageUrl });
    setDialogOpen(false);
    w.handleSubmit();
  };

  const handleCancel = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <UseCaseShell
        wizard={w}
        guides={guides}
        heading="Set Item Image"
        subtitle="Upload a product image for this item using the unified upload dialog."
        submitLabel="Confirm Image"
        success={
          <SuccessScreen
            title="Image uploaded successfully"
            subtitle={<>The product image has been saved and is now visible in the item grid.</>}
            details={
              <SummaryCard>
                <SummaryRow label="Image URL" value={w.formData.imageUrl} />
              </SummaryCard>
            }
            onReset={() => {
              w.handleReset();
              setDialogOpen(false);
            }}
          />
        }
      >
        <div className="flex flex-col items-center gap-4">
          {w.formData.imageUrl ? (
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-muted-foreground">Image staged and ready to confirm.</p>
              <img
                src={w.formData.imageUrl}
                alt="Staged product image"
                className="w-32 h-32 object-cover rounded-lg border border-border"
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              No image selected yet. Open the dialog to upload.
            </p>
          )}
          <button
            type="button"
            data-testid="open-dialog-btn"
            onClick={() => setDialogOpen(true)}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Open Upload Dialog
          </button>
        </div>
      </UseCaseShell>

      <ImageUploadDialog
        config={ITEM_IMAGE_CONFIG}
        existingImageUrl={null}
        open={dialogOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}

/* ================================================================
   STORIES
   ================================================================ */

const meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0001 Set Image/Happy Path',
  parameters: { layout: 'centered' },
} satisfies Meta;

const { Interactive, Stepwise, Automated } = createUseCaseStories<ImageFormData>({
  guides,
  scenes,
  Wizard: SetImageWizard,
  delayMs: 1500,
  play: async ({ canvas, goToScene, delay }) => {
    // Scene 1 — empty state, open the dialog
    goToScene(0);
    await delay();

    const openBtn = canvas.getByTestId('open-dialog-btn');
    await userEvent.click(openBtn);
    goToScene(1);
    await delay();

    // Scene 2 — dialog is open in EmptyImage state, provide a file via the drop zone input
    const fileInput = await waitFor(() => {
      // The hidden <input type="file"> rendered by react-dropzone
      const el = document.querySelector<HTMLInputElement>('input[type="file"]');
      if (!el) throw new Error('File input not found');
      return el;
    });
    await userEvent.upload(fileInput, MOCK_FILE_JPEG);
    goToScene(2);
    await delay();

    // Scene 3 — ProvidedImage state: Confirm is enabled (copyright is passive subtext)
    goToScene(3);
    await delay();

    // Scene 4 — click Confirm to begin upload
    const confirmBtn = await waitFor(() => {
      const btn = screen.getByRole('button', { name: /^confirm$/i });
      expect(btn).not.toBeDisabled();
      return btn;
    });
    await userEvent.click(confirmBtn);

    // Wait for the upload to complete (dialog closes, onConfirm fires)
    await waitFor(
      () => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      },
      { timeout: 4000 },
    );

    goToScene(4);
    await expect(canvas.getByTestId('success-message')).toHaveTextContent(
      'Image uploaded successfully',
    );
  },
});

export default meta;
export { Interactive, Stepwise, Automated };
