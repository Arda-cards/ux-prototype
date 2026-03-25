import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { CopyrightAcknowledgment } from './copyright-acknowledgment';

const meta = {
  title: 'Components/Canary/Atoms/CopyrightAcknowledgment',
  component: CopyrightAcknowledgment,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Mandatory checkbox confirming image ownership or license. The confirm action on ImageUploadDialog is disabled until this is checked.',
      },
    },
  },
  args: {
    onAcknowledge: fn(),
  },
} satisfies Meta<typeof CopyrightAcknowledgment>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  argTypes: {
    acknowledged: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    acknowledged: false,
    disabled: false,
  },
};

export const Unchecked: Story = {
  args: {
    acknowledged: false,
  },
};

export const Checked: Story = {
  args: {
    acknowledged: true,
  },
};

export const DisabledUnchecked: Story = {
  args: {
    acknowledged: false,
    disabled: true,
  },
};

export const InDialogContext: Story = {
  render: () => {
    const [acknowledged, setAcknowledged] = useState(false);
    return (
      <div className="w-[420px] rounded-lg border border-border bg-background p-6 shadow-md flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-foreground">Upload Image</h3>
          <p className="text-sm text-muted-foreground">
            Please review and accept the terms before uploading.
          </p>
        </div>
        <div className="rounded-md border border-dashed border-border bg-muted h-24 flex items-center justify-center text-sm text-muted-foreground">
          Image drop zone
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
            className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm
          </button>
        </div>
      </div>
    );
  },
};
