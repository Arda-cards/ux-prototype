/**
 * GEN-MEDIA-0001::0006.UC — Confirm and Persist
 * Scene: Managed Upload
 *
 * Renders ImageUploadDialog in a controlled state simulating the full file
 * upload flow: dialog open, file uploaded, copyright acknowledged, confirm
 * clicked, upload progress shown, then success.
 */
import * as React from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, screen } from 'storybook/test';

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import { ImageUploadDialog } from '@/components/canary/organisms/shared/image-upload-dialog/image-upload-dialog';
import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import { ImagePreviewEditor } from '@/components/canary/molecules/image-preview-editor/image-preview-editor';
import { CopyrightAcknowledgment } from '@/components/canary/atoms/copyright-acknowledgment/copyright-acknowledgment';
import { Progress } from '@/components/canary/primitives/progress';
import { Button } from '@/components/canary/primitives/button';
import {
  ITEM_IMAGE_CONFIG,
  MOCK_FILE_JPEG,
  MOCK_ITEM_IMAGE,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageUploadResult } from '@/types/canary/utilities/image-field-config';

/* ================================================================
   LIVE COMPONENT — used by Interactive and Automated modes
   ================================================================ */

function ManagedUploadLive() {
  const [isOpen, setIsOpen] = useState(true);
  const [lastResult, setLastResult] = useState<ImageUploadResult | null>(null);

  return (
    <div className="flex flex-col items-center gap-4 p-6 min-w-[320px]">
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          GEN-MEDIA-0001 &#8212; Managed Upload Flow
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Provide a file, acknowledge copyright, click Confirm to observe the upload progress bar
          then the success result.
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          setLastResult(null);
          setIsOpen(true);
        }}
        className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground"
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
        config={ITEM_IMAGE_CONFIG}
        existingImageUrl={null}
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        onConfirm={(result) => {
          setLastResult(result);
          setIsOpen(false);
        }}
      />
    </div>
  );
}

/* ================================================================
   STATIC SCENE RENDERER — used by Stepwise mode
   ================================================================ */

function DialogFrame({
  title,
  children,
  footer,
}: {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="border border-border rounded-lg p-6 bg-background max-w-lg w-full">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
      {footer && <div className="flex justify-end gap-2 mt-4">{footer}</div>}
    </div>
  );
}

const noop = () => {};

function ManagedUploadScene({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    // Scene 1: Dialog open — EmptyImage drop zone
    case 0:
      return (
        <DialogFrame title="Add Product Image" footer={<Button variant="secondary">Cancel</Button>}>
          <ImageDropZone
            acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
            onInput={noop}
            onDismiss={noop}
          />
        </DialogFrame>
      );

    // Scene 2: File uploaded — ProvidedImage with copyright unchecked
    case 1:
      return (
        <DialogFrame
          title="Add Product Image"
          footer={
            <>
              <Button variant="secondary">Cancel</Button>
              <Button disabled>Confirm</Button>
            </>
          }
        >
          <ImagePreviewEditor
            aspectRatio={1}
            imageData={MOCK_ITEM_IMAGE}
            onCropChange={noop}
            onReset={noop}
          />
          <div className="mt-4">
            <CopyrightAcknowledgment acknowledged={false} onAcknowledge={noop} />
          </div>
        </DialogFrame>
      );

    // Scene 3: Copyright acknowledged — Confirm enabled
    case 2:
      return (
        <DialogFrame
          title="Add Product Image"
          footer={
            <>
              <Button variant="secondary">Cancel</Button>
              <Button>Confirm</Button>
            </>
          }
        >
          <ImagePreviewEditor
            aspectRatio={1}
            imageData={MOCK_ITEM_IMAGE}
            onCropChange={noop}
            onReset={noop}
          />
          <div className="mt-4">
            <CopyrightAcknowledgment acknowledged={true} onAcknowledge={noop} />
          </div>
        </DialogFrame>
      );

    // Scene 4: Confirm clicked — uploading progress
    case 3:
      return (
        <DialogFrame
          title="Add Product Image"
          footer={
            <Button variant="secondary" disabled>
              Uploading&#8230;
            </Button>
          }
        >
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground text-center">Uploading image&#8230;</p>
            <Progress value={65} className="bg-muted" />
          </div>
        </DialogFrame>
      );

    // Scene 5: Upload progress — near completion
    case 4:
      return (
        <DialogFrame
          title="Add Product Image"
          footer={
            <Button variant="secondary" disabled>
              Uploading&#8230;
            </Button>
          }
        >
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground text-center">Uploading image&#8230;</p>
            <Progress value={90} className="bg-muted" />
          </div>
        </DialogFrame>
      );

    // Scene 6: Success — dialog closed, result shown
    case 5:
    default:
      return (
        <div className="flex flex-col items-center gap-4 p-6 min-w-[320px]">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 &#8212; Managed Upload Flow
          </h1>
          <div className="rounded-lg border border-border p-4 text-sm max-w-sm w-full">
            <p className="font-semibold mb-2">Upload complete!</p>
            <p className="text-xs text-muted-foreground">
              onConfirm called with ImageUploadResult containing the new imageUrl.
            </p>
          </div>
        </div>
      );
  }
}

/* ================================================================
   SCENES
   ================================================================ */

const managedUploadScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 6 \u2014 Dialog Open',
    description:
      'The ImageUploadDialog opens in EmptyImage state. The drop zone is visible with drag-and-drop ' +
      'and file-picker affordances. Only a Cancel button is shown in the footer.',
    interaction: 'Upload a JPEG file via the hidden file input.',
  },
  {
    title: 'Scene 2 of 6 \u2014 File Uploaded',
    description:
      'A JPEG file has been selected and passed validation. The dialog transitions to ProvidedImage ' +
      'state showing the crop editor. The Confirm button is disabled until copyright is acknowledged.',
    interaction: 'Check the copyright acknowledgment checkbox.',
  },
  {
    title: 'Scene 3 of 6 \u2014 Copyright Acknowledged',
    description:
      'The copyright checkbox is now checked. The Confirm button becomes fully enabled. ' +
      'The user has asserted they hold the rights to use this image.',
    interaction: 'Click the Confirm button to start the upload.',
  },
  {
    title: 'Scene 4 of 6 \u2014 Confirm Clicked \u2014 Upload Progress',
    description:
      'Confirm was clicked. The dialog shows a progress bar at 65%. The footer shows a disabled ' +
      '"Uploading\u2026" button. The dialog cannot be dismissed during upload.',
    interaction: 'Wait for the upload to complete.',
  },
  {
    title: 'Scene 5 of 6 \u2014 Upload Progress Near Completion',
    description:
      'The progress bar has advanced to 90%. The upload is nearly done. ' +
      'The onConfirm callback will fire once the upload resolves.',
    interaction: 'Wait for the final callback.',
  },
  {
    title: 'Scene 6 of 6 \u2014 Success',
    description:
      'The upload is complete. The dialog has closed and the onConfirm callback fired with ' +
      'an ImageUploadResult containing the new imageUrl. The page shows the result.',
    interaction: 'The workflow is complete. Click "Open Upload Dialog" to run again.',
  },
];

/* ================================================================
   WORKFLOW STORIES
   ================================================================ */

const {
  Interactive: ManagedUploadInteractive,
  Stepwise: ManagedUploadStepwise,
  Automated: ManagedUploadAutomated,
} = createWorkflowStories({
  scenes: managedUploadScenes,
  renderScene: (i) => <ManagedUploadScene sceneIndex={i} />,
  renderLive: () => <ManagedUploadLive />,
  delayMs: 2000,
  maxWidth: 640,
  play: async ({ goToScene, delay }) => {
    goToScene(0);
    await delay();

    // Wait for dialog to open
    await waitFor(
      () => {
        expect(screen.getByRole('dialog')).toBeVisible();
      },
      { timeout: 5000 },
    );

    // Upload a file
    const fileInput = await waitFor(() => {
      const el = document.querySelector<HTMLInputElement>('input[type="file"]');
      if (!el) throw new Error('File input not found');
      return el;
    });
    await userEvent.upload(fileInput, MOCK_FILE_JPEG);

    // Wait for ProvidedImage state (Confirm is enabled, copyright is passive subtext)
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /confirm/i })).not.toBeDisabled();
      },
      { timeout: 5000 },
    );

    goToScene(1);
    await delay();

    goToScene(2);
    await delay();

    // Click confirm
    const confirmBtn = screen.getByRole('button', { name: /confirm/i });
    await userEvent.click(confirmBtn);

    goToScene(3);
    await delay();

    goToScene(4);
    await delay();

    // Wait for dialog to close (upload complete)
    await waitFor(
      () => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      },
      { timeout: 10000 },
    );

    goToScene(5);
    await delay();
  },
});

/* ================================================================
   META + EXPORTS
   ================================================================ */

const meta: Meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0006 Confirm and Persist/Managed Upload',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

export const Interactive: StoryObj = {
  ...ManagedUploadInteractive,
  name: 'Managed Upload (Interactive)',
};

export const Stepwise: StoryObj = {
  ...ManagedUploadStepwise,
  name: 'Managed Upload (Stepwise)',
};

export const Automated: StoryObj = {
  ...ManagedUploadAutomated,

  name: 'Managed Upload (Automated)',
};
