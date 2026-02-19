import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

const SampleComponent = () => (
  <div data-testid="sample-root" className="p-6 space-y-4">
    <h2 className="text-xl font-semibold">Sample Page</h2>
    <p data-testid="sample-text">
      This is a sample component used to test the Agentation feedback overlay.
    </p>
    <button data-testid="sample-button" type="button" className="px-4 py-2 bg-blue-600 text-white rounded">
      Click Me
    </button>
    <input data-testid="sample-input" type="text" placeholder="Type here..." className="border px-3 py-2 rounded" />
  </div>
);

const meta: Meta = {
  title: 'Docs/Agentation',
  component: SampleComponent,
  parameters: {
    docs: {
      description: {
        component:
          'Test stories for the Agentation feedback overlay addon. Toggle the overlay using the toolbar button or Ctrl+Shift+A.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <SampleComponent />,
};

export const OverlayEnabled: Story = {
  globals: {
    agentationEnabled: true,
  },
  render: () => <SampleComponent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByTestId('sample-root');
    await expect(root).toBeInTheDocument();
  },
};

export const OverlayDisabled: Story = {
  globals: {
    agentationEnabled: false,
  },
  render: () => <SampleComponent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByTestId('sample-button');
    await expect(button).toBeInTheDocument();
    const input = canvas.getByTestId('sample-input');
    await expect(input).toBeInTheDocument();
  },
};

export const NonInterference: Story = {
  globals: {
    agentationEnabled: false,
  },
  render: () => <SampleComponent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByTestId('sample-button');
    await expect(button).toBeEnabled();
    button.focus();
    await expect(button).toHaveFocus();
    const input = canvas.getByTestId('sample-input');
    input.focus();
    await expect(input).toHaveFocus();
  },
};
