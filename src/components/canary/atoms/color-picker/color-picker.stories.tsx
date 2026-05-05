import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ColorPicker } from './color-picker';

function ColorPickerDemo({ initialValue = 'GRAY' }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="p-8 flex flex-col gap-4">
      <ColorPicker value={value} onValueChange={setValue} />
      <p className="text-xs text-muted-foreground">
        Selected: <code>{value}</code>
      </p>
    </div>
  );
}

const meta: Meta = {
  title: 'Components/Canary/Atoms/ColorPicker',
};

export default meta;

export const Default: StoryObj = {
  render: () => <ColorPickerDemo />,
};

export const PreSelected: StoryObj = {
  render: () => <ColorPickerDemo initialValue="BLUE" />,
};

export const Disabled: StoryObj = {
  render: () => (
    <div className="p-8">
      <ColorPicker value="RED" onValueChange={() => {}} disabled />
    </div>
  ),
};

function ColorPickerLabelDemo({ initialValue = 'RED' }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="p-8 flex flex-col gap-4 max-w-[200px]">
      <ColorPicker value={value} onValueChange={setValue} displayLabel />
      <p className="text-xs text-muted-foreground">
        Selected: <code>{value}</code>
      </p>
    </div>
  );
}

export const WithLabel: StoryObj = {
  render: () => <ColorPickerLabelDemo />,
};

export const WithLabelDisabled: StoryObj = {
  render: () => (
    <div className="p-8 max-w-[200px]">
      <ColorPicker value="BLUE" onValueChange={() => {}} displayLabel disabled />
    </div>
  ),
};
