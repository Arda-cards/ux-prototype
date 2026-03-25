/**
 * GEN-MEDIA-0001::0006.FS — Confirm and Persist
 * Scene: Copyright Acknowledgment
 *
 * Renders CopyrightAcknowledgment in isolation with a mock "Confirm" button
 * that remains disabled until the checkbox is checked. Demonstrates the
 * copyright gate that guards the upload confirm action.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, userEvent, waitFor, fn } from 'storybook/test';
import { useState } from 'react';

import { CopyrightAcknowledgment } from '@/components/canary/atoms/copyright-acknowledgment/copyright-acknowledgment';

// ---------------------------------------------------------------------------
// Page wrapper
// ---------------------------------------------------------------------------

interface CopyrightAcknowledgmentPageProps {
  acknowledged: boolean;
  onAcknowledge: (acknowledged: boolean) => void;
}

function CopyrightAcknowledgmentPage({
  acknowledged,
  onAcknowledge,
}: CopyrightAcknowledgmentPageProps) {
  const [localAcknowledged, setLocalAcknowledged] = useState(acknowledged);

  const handleAcknowledge = (value: boolean) => {
    setLocalAcknowledged(value);
    onAcknowledge(value);
  };

  return (
    <div className="w-[480px] rounded-lg border border-border bg-background p-6 shadow-md flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-base font-semibold text-foreground">
          GEN-MEDIA-0001 — Copyright Acknowledgment
        </h1>
        <p className="text-sm text-muted-foreground">
          The Confirm button remains disabled until the copyright checkbox is checked. This prevents
          uploading images without acknowledging license terms.
        </p>
      </div>

      <div className="rounded-md border border-dashed border-border bg-muted h-24 flex items-center justify-center text-sm text-muted-foreground">
        (image preview placeholder)
      </div>

      <CopyrightAcknowledgment acknowledged={localAcknowledged} onAcknowledge={handleAcknowledge} />

      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="px-4 py-2 rounded-md text-sm border border-border bg-background hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!localAcknowledged}
          data-testid="confirm-button"
          className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof CopyrightAcknowledgmentPage> = {
  title:
    'Use Cases/General Behaviors/Entity Media/GEN-MEDIA-0001 Set Entity Image/0006 Confirm and Persist/Copyright Acknowledgment',
  component: CopyrightAcknowledgmentPage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The `CopyrightAcknowledgment` checkbox gates the Confirm action. ' +
          'Confirm is disabled until the user explicitly checks the box, preventing accidental uploads of unlicensed images.',
      },
    },
  },
  argTypes: {
    acknowledged: {
      control: 'boolean',
      description: 'Initial acknowledgment state.',
      table: { category: 'Runtime' },
    },
    onAcknowledge: {
      description: 'Called with the new acknowledged value when the checkbox changes.',
      table: { category: 'Runtime' },
    },
  },
  args: {
    acknowledged: false,
    onAcknowledge: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof CopyrightAcknowledgmentPage>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Playground — toggle the acknowledged arg in Controls to see the Confirm button state change. */
export const Playground: Story = {};

/**
 * Automated — verifies that Confirm is disabled before acknowledgment,
 * clicking the checkbox enables it, and the callback fires.
 */
export const Automated: Story = {
  args: {
    acknowledged: false,
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step('Confirm button is disabled initially', async () => {
      await waitFor(() => {
        const confirmButton = canvas.getByTestId('confirm-button');
        expect(confirmButton).toBeDisabled();
      });
    });

    await step('Click the copyright acknowledgment checkbox', async () => {
      const checkbox = canvas.getByRole('checkbox', { name: /copyright acknowledgment/i });
      await userEvent.click(checkbox);
    });

    await step('onAcknowledge callback fires with true', async () => {
      await waitFor(() => {
        expect(args.onAcknowledge).toHaveBeenCalledWith(true);
      });
    });

    await step('Confirm button becomes enabled after acknowledgment', async () => {
      await waitFor(() => {
        const confirmButton = canvas.getByTestId('confirm-button');
        expect(confirmButton).not.toBeDisabled();
      });
    });
  },
};
