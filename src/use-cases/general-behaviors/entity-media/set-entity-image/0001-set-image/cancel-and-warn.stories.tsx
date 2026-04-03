/**
 * GEN-MEDIA-0001::0001.UC — Set Image via Unified Input Surface
 * Scene: Cancel and Warn
 *
 * When a user has staged an image (ProvidedImage state) and then attempts to dismiss
 * the dialog, the state machine transitions to the Warn state. An AlertDialog appears
 * asking "Discard unsaved image?" with two actions:
 *
 *   Discard     — permanently removes the staged image, dialog closes
 *   Go Back     — returns to the ProvidedImage editor, dialog stays open
 *
 * Two workflows implemented with createWorkflowStories:
 *   DiscardPath      — user confirms discard; dialog closes, onCancel fires
 *   ReturnToEditPath — user clicks Go Back; Warn dialog closes, editor is restored
 */
import * as React from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import { ImageUploadDialog } from '@/components/canary/organisms/shared/image-upload-dialog/image-upload-dialog';
import { ImageDropZone } from '@/components/canary/molecules/image-drop-zone/image-drop-zone';
import { ImagePreviewEditor } from '@/components/canary/molecules/image-preview-editor/image-preview-editor';
import { CopyrightAcknowledgment } from '@/components/canary/atoms/copyright-acknowledgment/copyright-acknowledgment';
import { Button } from '@/components/canary/primitives/button';
import {
  ITEM_IMAGE_CONFIG,
  MOCK_ITEM_IMAGE,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';

/* ================================================================
   LIVE COMPONENT — used by Interactive and Automated modes
   ================================================================ */

function CancelWarnLive() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'cancelled' | 'confirmed'>('idle');

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="text-center max-w-md">
        <h1 className="text-xl font-semibold tracking-tight mb-1">Cancel and Warn</h1>
        <p className="text-sm text-muted-foreground">
          After staging an image, clicking Cancel triggers a confirmation guard.
        </p>
      </div>

      <button
        type="button"
        data-testid="open-dialog-btn"
        onClick={() => {
          setStatus('idle');
          setOpen(true);
        }}
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Open Upload Dialog
      </button>

      {status === 'cancelled' && (
        <p
          data-testid="status-cancelled"
          className="text-sm text-muted-foreground border border-border rounded-md px-4 py-2"
        >
          Image discarded. Dialog closed.
        </p>
      )}
      {status === 'confirmed' && (
        <p
          data-testid="status-confirmed"
          className="text-sm text-green-700 dark:text-green-400 border border-border rounded-md px-4 py-2"
        >
          Image confirmed and uploaded.
        </p>
      )}

      <ImageUploadDialog
        config={ITEM_IMAGE_CONFIG}
        existingImageUrl={null}
        open={open}
        onConfirm={() => {
          setStatus('confirmed');
          setOpen(false);
        }}
        onCancel={() => {
          setStatus('cancelled');
          setOpen(false);
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

function DiscardSceneRenderer({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    // Scene 1: Idle — "Open Upload Dialog" button
    case 0:
      return (
        <div className="flex flex-col items-center gap-4 p-8">
          <h1 className="text-xl font-semibold">Cancel and Warn</h1>
          <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">
            Open Upload Dialog
          </button>
        </div>
      );

    // Scene 2: Dialog open — EmptyImage drop zone
    case 1:
      return (
        <DialogFrame title="Add Product Image" footer={<Button variant="secondary">Cancel</Button>}>
          <ImageDropZone acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats} onInput={noop} />
        </DialogFrame>
      );

    // Scene 3: File staged — ProvidedImage with copyright checkbox
    case 2:
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

    // Scene 4: Cancel clicked — Warn AlertDialog
    case 3:
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

    // Scene 5: Discard clicked — dialog closed
    case 4:
    default:
      return (
        <div className="flex flex-col items-center gap-4 p-8">
          <h1 className="text-xl font-semibold">Cancel and Warn</h1>
          <p className="text-sm text-muted-foreground border border-border rounded-md px-4 py-2">
            Image discarded. Dialog closed.
          </p>
        </div>
      );
  }
}

function ReturnToEditSceneRenderer({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    case 0:
    case 1:
    case 2:
    case 3:
      // Scenes 1–4 are identical to DiscardPath
      return <DiscardSceneRenderer sceneIndex={sceneIndex} />;

    // Scene 5: Go Back clicked — back to ProvidedImage editor
    case 4:
    default:
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
          <p className="mt-2 text-xs text-muted-foreground text-center">
            Returned to editor — staged image preserved.
          </p>
        </DialogFrame>
      );
  }
}

/* ================================================================
   DISCARD PATH — createWorkflowStories
   ================================================================ */

const discardScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 5 \u2014 Idle',
    description: 'The page shows an "Open Upload Dialog" button. No dialog is open yet.',
    interaction: 'Click the button to open the upload dialog.',
  },
  {
    title: 'Scene 2 of 5 \u2014 Dialog Open',
    description: 'The ImageUploadDialog opens in EmptyImage state showing the drop zone.',
    interaction: 'Upload a file to stage an image.',
  },
  {
    title: 'Scene 3 of 5 \u2014 Image Staged',
    description:
      'A file has been uploaded. The dialog shows the crop editor and copyright checkbox. The Confirm button is disabled until copyright is acknowledged.',
    interaction: 'Click Cancel to trigger the Warn guard.',
  },
  {
    title: 'Scene 4 of 5 \u2014 Warn Dialog',
    description:
      'The Warn AlertDialog appears: "Discard unsaved image?" with two actions: Discard (removes staged image, closes dialog) and Go Back (returns to editor).',
    interaction: 'Click "Discard" to permanently remove the staged image.',
  },
  {
    title: 'Scene 5 of 5 \u2014 Discarded',
    description:
      'The dialog has closed. The staged image was discarded. The onCancel callback was fired.',
    interaction: 'The workflow is complete. Click "Open Upload Dialog" to try again.',
  },
];

const {
  Interactive: DiscardInteractive,
  Stepwise: DiscardStepwise,
  Automated: DiscardAutomated,
} = createWorkflowStories({
  scenes: discardScenes,
  renderScene: (i) => <DiscardSceneRenderer sceneIndex={i} />,
  renderLive: () => <CancelWarnLive />,
  delayMs: 2000,
  maxWidth: 640,
  play: async ({ goToScene, delay }) => {
    for (let i = 0; i < discardScenes.length; i++) {
      goToScene(i);
      await delay();
    }
  },
});

/* ================================================================
   RETURN TO EDIT PATH — createWorkflowStories
   ================================================================ */

const returnScenes: WorkflowScene[] = [
  ...discardScenes.slice(0, 4),
  {
    title: 'Scene 5 of 5 \u2014 Back to Editor',
    description:
      'The user clicked "Go Back". The Warn dialog dismissed and the main dialog is restored to ProvidedImage state. The staged image is preserved.',
    interaction:
      'The workflow is complete. The user can continue editing or acknowledge copyright to confirm.',
  },
];

const {
  Interactive: ReturnInteractive,
  Stepwise: ReturnStepwise,
  Automated: ReturnAutomated,
} = createWorkflowStories({
  scenes: returnScenes,
  renderScene: (i) => <ReturnToEditSceneRenderer sceneIndex={i} />,
  renderLive: () => <CancelWarnLive />,
  delayMs: 2000,
  maxWidth: 640,
  play: async ({ goToScene, delay }) => {
    for (let i = 0; i < returnScenes.length; i++) {
      goToScene(i);
      await delay();
    }
  },
});

/* ================================================================
   META + EXPORTS
   ================================================================ */

const meta: Meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0001 Set Image/Cancel and Warn',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

// Discard path
export const DiscardPathInteractive: StoryObj = {
  ...DiscardInteractive,
  name: 'Discard Path (Interactive)',
};

export const DiscardPathStepwise: StoryObj = {
  ...DiscardStepwise,
  name: 'Discard Path (Stepwise)',
};

export const DiscardPathAutomated: StoryObj = {
  ...DiscardAutomated,

  name: 'Discard Path (Automated)',
};

// Return to edit path
export const ReturnToEditInteractive: StoryObj = {
  ...ReturnInteractive,
  name: 'Return to Edit (Interactive)',
};

export const ReturnToEditStepwise: StoryObj = {
  ...ReturnStepwise,
  name: 'Return to Edit (Stepwise)',
};

export const ReturnToEditAutomated: StoryObj = {
  ...ReturnAutomated,

  name: 'Return to Edit (Automated)',
};
