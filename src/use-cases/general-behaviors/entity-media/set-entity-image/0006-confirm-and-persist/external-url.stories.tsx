/**
 * GEN-MEDIA-0001::0006.UC — Confirm and Persist
 * Scene: External URL
 *
 * Demonstrates the URL-entry path through ImageUploadDialog. The user types
 * an HTTPS URL, acknowledges copyright, and clicks Confirm. Unlike the file
 * upload path there is no progress bar — the URL is stored as-is.
 *
 * Scenes: Dialog open, URL entered, Copyright acknowledged, Confirm, URL stored.
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
  MOCK_EXTERNAL_URL,
  MOCK_ITEM_IMAGE,
} from '@/use-cases/general-behaviors/entity-media/_shared/mock-data';
import type { ImageUploadResult } from '@/types/canary/utilities/image-field-config';

/* ================================================================
   LIVE COMPONENT — used by Interactive and Automated modes
   ================================================================ */

function ExternalUrlLive() {
  const [isOpen, setIsOpen] = useState(true);
  const [lastResult, setLastResult] = useState<ImageUploadResult | null>(null);

  return (
    <div className="flex flex-col items-center gap-4 p-6 min-w-[320px]">
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          GEN-MEDIA-0001 &#8212; External URL Flow
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Type an HTTPS URL into the drop zone, acknowledge copyright, then confirm. No upload
          progress bar &#8212; the URL is stored as-is.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Suggested URL: <code className="break-all">{MOCK_EXTERNAL_URL}</code>
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
          <p className="font-semibold mb-2">Image confirmed!</p>
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

function ExternalUrlScene({ sceneIndex }: { sceneIndex: number }) {
  switch (sceneIndex) {
    // Scene 1: Dialog open — EmptyImage drop zone with URL field
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

    // Scene 2: URL entered — drop zone shows the URL being typed
    case 1:
      return (
        <DialogFrame title="Add Product Image" footer={<Button variant="secondary">Cancel</Button>}>
          <ImageDropZone
            acceptedFormats={ITEM_IMAGE_CONFIG.acceptedFormats}
            onInput={noop}
            onDismiss={noop}
          />
          <p className="mt-2 text-xs text-muted-foreground text-center">
            URL typed: <code className="break-all">{MOCK_EXTERNAL_URL}</code>
          </p>
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

    // Scene 4: Confirm clicked — no progress bar for URL path
    case 3:
      return (
        <div className="flex flex-col items-center gap-4 p-6 min-w-[320px]">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 &#8212; External URL Flow
          </h1>
          <p className="text-sm text-muted-foreground">
            Confirm was clicked. For the URL path, no upload occurs &#8212; the dialog closes
            immediately and onConfirm fires.
          </p>
        </div>
      );

    // Scene 5: URL stored — result shown
    case 4:
    default:
      return (
        <div className="flex flex-col items-center gap-4 p-6 min-w-[320px]">
          <h1 className="text-xl font-semibold tracking-tight">
            GEN-MEDIA-0001 &#8212; External URL Flow
          </h1>
          <div className="rounded-lg border border-border p-4 text-sm max-w-sm w-full">
            <p className="font-semibold mb-2">Image confirmed!</p>
            <p className="text-xs text-muted-foreground break-all">imageUrl: {MOCK_EXTERNAL_URL}</p>
          </div>
        </div>
      );
  }
}

/* ================================================================
   SCENES
   ================================================================ */

const externalUrlScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 5 \u2014 Dialog Open',
    description:
      'The ImageUploadDialog opens in EmptyImage state. The drop zone is visible with a URL text ' +
      'input field at the bottom. The user can type or paste an HTTPS image URL.',
    interaction: 'Type a valid HTTPS image URL into the URL field.',
  },
  {
    title: 'Scene 2 of 5 \u2014 URL Entered',
    description:
      'The user has typed the URL and pressed Enter. The dialog validates the URL format, then ' +
      'checks image reachability. On success the dialog transitions to ProvidedImage state.',
    interaction: 'Observe the URL being validated and the editor loading.',
  },
  {
    title: 'Scene 3 of 5 \u2014 Copyright Acknowledged',
    description:
      'The URL passed validation. The ProvidedImage crop editor is shown with the remote image. ' +
      'The copyright checkbox has been checked, enabling the Confirm button.',
    interaction: 'Click the Confirm button.',
  },
  {
    title: 'Scene 4 of 5 \u2014 Confirm Clicked',
    description:
      'Confirm was clicked. Unlike the file upload path, there is no progress bar. ' +
      'The URL is stored as-is via the onConfirm callback and the dialog closes immediately.',
    interaction: 'Observe the dialog closing and the result appearing.',
  },
  {
    title: 'Scene 5 of 5 \u2014 URL Stored',
    description:
      'The dialog has closed. The onConfirm callback fired with the external URL as the imageUrl. ' +
      'No file upload took place &#8212; the URL is stored directly.',
    interaction: 'The workflow is complete. Click "Open Upload Dialog" to run again.',
  },
];

/* ================================================================
   WORKFLOW STORIES
   ================================================================ */

const {
  Interactive: ExternalUrlInteractive,
  Stepwise: ExternalUrlStepwise,
  Automated: ExternalUrlAutomated,
} = createWorkflowStories({
  scenes: externalUrlScenes,
  renderScene: (i) => <ExternalUrlScene sceneIndex={i} />,
  renderLive: () => <ExternalUrlLive />,
  delayMs: 2000,
  maxWidth: 640,
  play: async ({ goToScene, delay }) => {
    goToScene(0);
    await delay();

    // Wait for dialog to open and URL input to appear
    await waitFor(
      () => {
        expect(screen.getByRole('dialog')).toBeVisible();
      },
      { timeout: 5000 },
    );
    await waitFor(
      () => {
        expect(screen.getByPlaceholderText(/paste an image url/i)).toBeVisible();
      },
      { timeout: 5000 },
    );

    // Type the URL and press Enter
    const urlInput = screen.getByPlaceholderText(/paste an image url/i);
    await userEvent.clear(urlInput);
    await userEvent.type(urlInput, MOCK_EXTERNAL_URL);
    goToScene(1);
    await userEvent.keyboard('{Enter}');

    // Wait for copyright checkbox to appear (ProvidedImage state)
    await waitFor(
      () => {
        expect(screen.getByRole('checkbox', { name: /copyright acknowledgment/i })).toBeVisible();
      },
      { timeout: 5000 },
    );

    // Check copyright
    const checkbox = screen.getByRole('checkbox', { name: /copyright acknowledgment/i });
    await userEvent.click(checkbox);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /confirm/i })).not.toBeDisabled();
    });

    goToScene(2);
    await delay();

    // Click confirm
    const confirmBtn = screen.getByRole('button', { name: /confirm/i });
    await userEvent.click(confirmBtn);

    goToScene(3);
    await delay();

    // Wait for dialog to close
    await waitFor(
      () => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    goToScene(4);
    await delay();
  },
});

/* ================================================================
   META + EXPORTS
   ================================================================ */

const meta: Meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0006 Confirm and Persist/External URL',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

export const Interactive: StoryObj = {
  ...ExternalUrlInteractive,
  name: 'External URL (Interactive)',
};

export const Stepwise: StoryObj = {
  ...ExternalUrlStepwise,
  name: 'External URL (Stepwise)',
};

export const Automated: StoryObj = {
  ...ExternalUrlAutomated,

  name: 'External URL (Automated)',
};
