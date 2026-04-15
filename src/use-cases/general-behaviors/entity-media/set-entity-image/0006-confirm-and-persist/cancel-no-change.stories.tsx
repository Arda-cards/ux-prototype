/**
 * GEN-MEDIA-0001::0006.UC — Confirm and Persist
 * Scene: Cancel No Change
 *
 * Demonstrates two cancel paths through ImageUploadDialog:
 *
 *   DirectCancel — no image staged: Cancel fires onCancel immediately, dialog closes
 *   WarnOnDiscard — image staged: Cancel triggers the Warn AlertDialog, user must
 *                   confirm "Discard" before the dialog closes
 *
 * Two workflows implemented with createWorkflowStories:
 *   DirectCancelPath   — dialog open → Cancel clicked → dialog closes
 *   WarnOnDiscardPath  — dialog open → file staged → Cancel → Warn dialog → Discard → closes
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
import { Button } from '@/components/canary/primitives/button';
import {
  ITEM_IMAGE_CONFIG,
  MOCK_FILE_JPEG,
  MOCK_ITEM_IMAGE,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageUploadResult } from '@/types/canary/utilities/image-field-config';

/* ================================================================
   LIVE COMPONENT — shared by both workflows
   ================================================================ */

function CancelNoChangeLive() {
  const [isOpen, setIsOpen] = useState(true);
  const [cancelledCount, setCancelledCount] = useState(0);

  return (
    <div className="flex flex-col items-center gap-4 p-6 min-w-[320px]">
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          GEN-MEDIA-0001 &#8212; Cancel: No Change
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cancelling with no image staged closes the dialog immediately. Cancelling after staging an
          image shows a discard confirmation guard.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground"
      >
        Open Upload Dialog
      </button>

      {cancelledCount > 0 && (
        <p className="text-sm text-muted-foreground" data-testid="cancel-count">
          Cancelled {cancelledCount} time{cancelledCount > 1 ? 's' : ''}.
        </p>
      )}

      <ImageUploadDialog
        config={ITEM_IMAGE_CONFIG}
        existingImageUrl={null}
        open={isOpen}
        onCancel={() => {
          setCancelledCount((c) => c + 1);
          setIsOpen(false);
        }}
        onConfirm={(_result: ImageUploadResult) => {
          setIsOpen(false);
        }}
      />
    </div>
  );
}

/* ================================================================
   STATIC SCENE RENDERER — shared scenes for both paths
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

function DirectCancelScene({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    // Scene 1: Dialog open — EmptyImage drop zone
    case 0:
      return (
        <DialogFrame title="Add Product Image" footer={<Button variant="secondary">Cancel</Button>}>
          <ImageDropZone acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats} onInput={noop} />
        </DialogFrame>
      );

    // Scene 2: Cancel clicked — dialog closes
    case 1:
    default:
      return (
        <div className="flex flex-col items-center gap-4 p-6 min-w-[320px]">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 &#8212; Cancel: No Change
          </h1>
          <p className="text-sm text-muted-foreground" data-testid="cancel-count">
            Cancelled 1 time.
          </p>
        </div>
      );
  }
}

function WarnOnDiscardScene({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    // Scene 1: Dialog open — EmptyImage drop zone
    case 0:
      return (
        <DialogFrame title="Add Product Image" footer={<Button variant="secondary">Cancel</Button>}>
          <ImageDropZone acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats} onInput={noop} />
        </DialogFrame>
      );

    // Scene 2: File staged — ProvidedImage with copyright unchecked
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
            onCropComplete={noop}
            onZoomChange={noop}
            onRotationChange={noop}
            onReset={noop}
          />
          <div className="mt-4">
            <CopyrightAcknowledgment acknowledged={false} onAcknowledge={noop} />
          </div>
        </DialogFrame>
      );

    // Scene 3: Cancel clicked — Warn AlertDialog
    case 2:
      return (
        <div className="flex flex-col items-center gap-4 p-8">
          <div className="border border-border rounded-lg p-6 bg-background max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold mb-2">Discard unsaved image?</h2>
            <p className="text-sm text-muted-foreground mb-4">
              You have an image staged for upload. Discarding will lose your changes.
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="secondary">Go Back</Button>
              <Button variant="destructive">Discard</Button>
            </div>
          </div>
        </div>
      );

    // Scene 4: Discard clicked — dialog closes
    case 3:
    default:
      return (
        <div className="flex flex-col items-center gap-4 p-6 min-w-[320px]">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 &#8212; Cancel: No Change
          </h1>
          <p className="text-sm text-muted-foreground" data-testid="cancel-count">
            Cancelled 1 time.
          </p>
        </div>
      );
  }
}

/* ================================================================
   DIRECT CANCEL PATH
   ================================================================ */

const directCancelScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 2 \u2014 Dialog Open',
    description:
      'The ImageUploadDialog opens in EmptyImage state. No image has been staged. ' +
      'Only a Cancel button is shown in the footer.',
    interaction: 'Click the Cancel button.',
  },
  {
    title: 'Scene 2 of 2 \u2014 Dialog Closed',
    description:
      'Cancel was clicked with no image staged. The onCancel callback fired immediately and ' +
      'the dialog closed without a confirmation guard. The cancel count increments.',
    interaction: 'The workflow is complete. Click "Open Upload Dialog" to try again.',
  },
];

const {
  Interactive: DirectCancelInteractive,
  Stepwise: DirectCancelStepwise,
  Automated: DirectCancelAutomated,
} = createWorkflowStories({
  scenes: directCancelScenes,
  renderScene: (i) => <DirectCancelScene sceneIndex={i} />,
  renderLive: () => <CancelNoChangeLive />,
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

    // Click Cancel with no image staged
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    // Verify dialog closes
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    goToScene(1);
    await delay();

    // Verify cancel count appeared
    await waitFor(() => {
      expect(screen.getByTestId('cancel-count')).toBeVisible();
    });
  },
});

/* ================================================================
   WARN ON DISCARD PATH
   ================================================================ */

const warnOnDiscardScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 4 \u2014 Dialog Open',
    description:
      'The ImageUploadDialog opens in EmptyImage state. The drop zone is visible. ' +
      'No image has been staged yet.',
    interaction: 'Upload a file to stage an image.',
  },
  {
    title: 'Scene 2 of 4 \u2014 Image Staged',
    description:
      'A JPEG file has been uploaded. The dialog is now in ProvidedImage state showing the ' +
      'crop editor and copyright checkbox. The Confirm button is disabled until copyright is acknowledged.',
    interaction: 'Click Cancel to trigger the Warn guard.',
  },
  {
    title: 'Scene 3 of 4 \u2014 Warn AlertDialog',
    description:
      'Cancel was clicked while an image was staged. The Warn AlertDialog appears: ' +
      '"Discard unsaved image?" with two actions: Discard (removes staged image) and Go Back (returns to editor).',
    interaction: 'Click "Discard" to permanently remove the staged image and close the dialog.',
  },
  {
    title: 'Scene 4 of 4 \u2014 Dialog Closed',
    description:
      'Discard was clicked. The staged image was discarded, the onCancel callback fired, ' +
      'and the dialog has closed. The cancel count increments.',
    interaction: 'The workflow is complete. Click "Open Upload Dialog" to try again.',
  },
];

const {
  Interactive: WarnOnDiscardInteractive,
  Stepwise: WarnOnDiscardStepwise,
  Automated: WarnOnDiscardAutomated,
} = createWorkflowStories({
  scenes: warnOnDiscardScenes,
  renderScene: (i) => <WarnOnDiscardScene sceneIndex={i} />,
  renderLive: () => <CancelNoChangeLive />,
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

    // Stage a JPEG file
    const fileInput = await waitFor(() => {
      const el = document.querySelector<HTMLInputElement>('input[type="file"]');
      if (!el) throw new Error('File input not found');
      return el;
    });
    await userEvent.upload(fileInput, MOCK_FILE_JPEG);

    // Wait for ProvidedImage state (Confirm button appears)
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /^cancel$/i })).toBeVisible();
      },
      { timeout: 5000 },
    );

    goToScene(1);
    await delay();

    // Click Cancel to trigger Warn
    const cancelButton = screen.getByRole('button', { name: /^cancel$/i });
    await userEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByText(/discard unsaved image/i)).toBeVisible();
    });

    goToScene(2);
    await delay();

    // Click Discard
    const discardButton = screen.getByRole('button', { name: /discard/i });
    await userEvent.click(discardButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    goToScene(3);
    await delay();

    // Verify cancel count appeared
    await waitFor(() => {
      expect(screen.getByTestId('cancel-count')).toBeVisible();
    });
  },
});

/* ================================================================
   META + EXPORTS
   ================================================================ */

const meta: Meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0006 Confirm and Persist/Cancel No Change',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

// Direct cancel path
export const DirectCancelPathInteractive: StoryObj = {
  ...DirectCancelInteractive,
  name: 'Direct Cancel (Interactive)',
};

export const DirectCancelPathStepwise: StoryObj = {
  ...DirectCancelStepwise,
  name: 'Direct Cancel (Stepwise)',
};

export const DirectCancelPathAutomated: StoryObj = {
  ...DirectCancelAutomated,

  name: 'Direct Cancel (Automated)',
};

// Warn on discard path
export const WarnOnDiscardPathInteractive: StoryObj = {
  ...WarnOnDiscardInteractive,
  name: 'Warn on Discard (Interactive)',
};

export const WarnOnDiscardPathStepwise: StoryObj = {
  ...WarnOnDiscardStepwise,
  name: 'Warn on Discard (Stepwise)',
};

export const WarnOnDiscardPathAutomated: StoryObj = {
  ...WarnOnDiscardAutomated,

  name: 'Warn on Discard (Automated)',
};
