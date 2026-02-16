import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, within } from '@storybook/test';
import { useState } from 'react';

import { ArdaUrlFieldDisplay } from './url-field-display';
import { ArdaUrlFieldEditor } from './url-field-editor';
import { ArdaUrlFieldInteractive } from './url-field-interactive';

const meta: Meta<typeof ArdaUrlFieldInteractive> = {
  title: 'Components/Atoms/Form/URL',
  component: ArdaUrlFieldInteractive,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'URL string value.',
      table: { category: 'Runtime' },
    },
    onValueChange: {
      action: 'valueChanged',
      description: 'Called when value changes via editing.',
      table: { category: 'Events' },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether editing is disabled.',
      table: { category: 'Runtime' },
    },
    label: {
      control: 'text',
      description: 'Static label displayed next to the field.',
      table: { category: 'Static' },
    },
    labelPosition: {
      control: 'inline-radio',
      options: ['left', 'top'],
      description: 'Position of the label relative to the field.',
      table: { category: 'Static' },
    },
  },
  args: {
    onValueChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ArdaUrlFieldInteractive>;

// ============================================================================
// Display
// ============================================================================

export const Display: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Link format</label>
        <ArdaUrlFieldDisplay value="https://example.com/page" displayFormat="link" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Button format
        </label>
        <ArdaUrlFieldDisplay value="https://example.com/page" displayFormat="button" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Custom button label
        </label>
        <ArdaUrlFieldDisplay
          value="https://example.com/page"
          displayFormat="button"
          buttonLabel="Visit Site"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Empty</label>
        <ArdaUrlFieldDisplay value={undefined} />
      </div>
    </div>
  ),
};

// ============================================================================
// Editor
// ============================================================================

export const Editor: Story = {
  render: () => {
    const [value, setValue] = useState('https://example.com/page');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Website URL
          </label>
          <ArdaUrlFieldEditor
            value={value}
            onChange={setValue}
            onComplete={(v) => console.log('Completed:', v)}
            placeholder="Enter URL…"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Value: <span className="font-medium">{value}</span>
        </div>
      </div>
    );
  },
};

// ============================================================================
// Interactive
// ============================================================================

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState('https://example.com/page');

    return (
      <div className="flex flex-col gap-4 p-4" style={{ width: 320 }}>
        <div className="text-sm text-muted-foreground">
          Double-click the field to edit. Press Enter to commit, Escape to cancel.
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Website</label>
          <ArdaUrlFieldInteractive value={value} onValueChange={setValue} />
        </div>
        <div className="text-sm text-muted-foreground">
          Value: <span className="font-medium">{value}</span>
        </div>
      </div>
    );
  },
};

// ============================================================================
// With Label
// ============================================================================

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-4" style={{ width: 480 }}>
      <div className="text-xs font-medium text-muted-foreground">Label left (default)</div>
      <ArdaUrlFieldDisplay value="https://example.com" label="Website" labelPosition="left" />
      <ArdaUrlFieldEditor value="https://example.com" label="Website" labelPosition="left" />
      <ArdaUrlFieldInteractive value="https://example.com" label="Website" labelPosition="left" />

      <div className="text-xs font-medium text-muted-foreground">Label top</div>
      <ArdaUrlFieldDisplay value="https://example.com" label="Website" labelPosition="top" />
      <ArdaUrlFieldEditor value="https://example.com" label="Website" labelPosition="top" />
      <ArdaUrlFieldInteractive value="https://example.com" label="Website" labelPosition="top" />
    </div>
  ),
};

// ============================================================================
// Playground
// ============================================================================

export const Playground: Story = {
  args: {
    value: 'https://example.com/page',
    disabled: false,
    label: 'Website',
    labelPosition: 'left',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('https://example.com/page')).toBeInTheDocument();
  },
};
