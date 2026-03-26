/**
 * GEN-MEDIA-0001::0006.UC — Confirm and Persist
 * Scene: Copyright Acknowledgment
 *
 * Renders CopyrightAcknowledgment in isolation with a mock "Confirm" button
 * that remains disabled until the checkbox is checked. Demonstrates the
 * copyright gate that guards the upload confirm action.
 *
 * Three scenes:
 *   1. Checkbox unchecked, Confirm button disabled
 *   2. User clicks the checkbox
 *   3. Checkbox checked, Confirm button enabled
 */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';

import { createWorkflowStories, type WorkflowScene } from '@/use-cases/framework';
import { CopyrightAcknowledgment } from '@/components/canary/atoms/copyright-acknowledgment/copyright-acknowledgment';

/* ================================================================
   LIVE COMPONENT — used by Interactive and Automated modes
   ================================================================ */

function CopyrightAcknowledgmentLive() {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="w-[480px] rounded-lg border border-border bg-background p-6 shadow-md flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-base font-semibold text-foreground">
          GEN-MEDIA-0001 &#8212; Copyright Acknowledgment
        </h1>
        <p className="text-sm text-muted-foreground">
          The Confirm button remains disabled until the copyright checkbox is checked. This prevents
          uploading images without acknowledging license terms.
        </p>
      </div>

      <div className="rounded-md border border-dashed border-border bg-muted h-24 flex items-center justify-center text-sm text-muted-foreground">
        (image preview placeholder)
      </div>

      <CopyrightAcknowledgment acknowledged={acknowledged} onAcknowledge={setAcknowledged} />

      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="px-4 py-2 rounded-md text-sm border border-border bg-background hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!acknowledged}
          data-testid="confirm-button"
          className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   STATIC SCENE RENDERER — used by Stepwise mode
   ================================================================ */

const noop = () => {};

function CopyrightScene({ sceneIndex }: { sceneIndex: number }) {
  const acknowledged = sceneIndex >= 2;

  return (
    <div className="w-[480px] rounded-lg border border-border bg-background p-6 shadow-md flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-base font-semibold text-foreground">
          GEN-MEDIA-0001 &#8212; Copyright Acknowledgment
        </h1>
        <p className="text-sm text-muted-foreground">
          The Confirm button remains disabled until the copyright checkbox is checked.
        </p>
      </div>

      <div className="rounded-md border border-dashed border-border bg-muted h-24 flex items-center justify-center text-sm text-muted-foreground">
        (image preview placeholder)
      </div>

      <CopyrightAcknowledgment acknowledged={acknowledged} onAcknowledge={noop} />

      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="px-4 py-2 rounded-md text-sm border border-border bg-background hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!acknowledged}
          data-testid="confirm-button"
          className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm
        </button>
      </div>

      {sceneIndex === 1 && (
        <p className="text-xs text-muted-foreground text-center">
          (User is clicking the checkbox&#8230;)
        </p>
      )}
    </div>
  );
}

/* ================================================================
   SCENES
   ================================================================ */

const copyrightScenes: WorkflowScene[] = [
  {
    title: 'Scene 1 of 3 \u2014 Checkbox Unchecked, Button Disabled',
    description:
      'The CopyrightAcknowledgment checkbox is unchecked. The Confirm button is disabled ' +
      '(opacity 50%, not-allowed cursor). The user cannot proceed without acknowledging the license terms.',
    interaction: 'Click the copyright acknowledgment checkbox.',
  },
  {
    title: 'Scene 2 of 3 \u2014 Clicking Checkbox',
    description:
      'The user clicks the copyright checkbox. The onAcknowledge callback fires with true. ' +
      'The internal state updates, which will enable the Confirm button.',
    interaction: 'Observe the checkbox becoming checked and the Confirm button enabling.',
  },
  {
    title: 'Scene 3 of 3 \u2014 Checkbox Checked, Button Enabled',
    description:
      'The copyright checkbox is now checked. The Confirm button is fully enabled and clickable. ' +
      'The user can now click Confirm to proceed with the upload.',
    interaction: 'The workflow is complete. Click Confirm to proceed.',
  },
];

/* ================================================================
   WORKFLOW STORIES
   ================================================================ */

const {
  Interactive: CopyrightInteractive,
  Stepwise: CopyrightStepwise,
  Automated: CopyrightAutomated,
} = createWorkflowStories({
  scenes: copyrightScenes,
  renderScene: (i) => <CopyrightScene sceneIndex={i} />,
  renderLive: () => <CopyrightAcknowledgmentLive />,
  delayMs: 2000,
  play: async ({ canvas, goToScene, delay }) => {
    goToScene(0);
    await delay();

    // Verify Confirm button is disabled initially
    await waitFor(() => {
      const confirmButton = canvas.getByTestId('confirm-button');
      expect(confirmButton).toBeDisabled();
    });

    // Scene 2: clicking checkbox
    goToScene(1);

    // Click the copyright checkbox
    const checkbox = canvas.getByRole('checkbox', { name: /copyright acknowledgment/i });
    await userEvent.click(checkbox);

    await delay();

    // Scene 3: checkbox checked, button enabled
    await waitFor(() => {
      const confirmButton = canvas.getByTestId('confirm-button');
      expect(confirmButton).not.toBeDisabled();
    });

    goToScene(2);
    await delay();
  },
});

/* ================================================================
   META + EXPORTS
   ================================================================ */

const meta: Meta = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0006 Confirm and Persist/Copyright Acknowledgment',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

export const Interactive: StoryObj = {
  ...CopyrightInteractive,
  name: 'Copyright Acknowledgment (Interactive)',
};

export const Stepwise: StoryObj = {
  ...CopyrightStepwise,
  name: 'Copyright Acknowledgment (Stepwise)',
};

export const AutomatedStory: StoryObj = {
  ...CopyrightAutomated,

  name: 'Copyright Acknowledgment (Automated)',
};
