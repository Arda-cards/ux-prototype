import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bold } from 'lucide-react';
import { Toggle } from './toggle';

const meta = {
  title: 'Components/Canary/Atoms/Toggle',
  component: Toggle,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex flex-col gap-4 max-w-md">
      <h3 className="text-sm font-semibold text-muted-foreground">Variants</h3>
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">Default</span>
        <Toggle aria-label="Bold">
          <Bold className="size-4" />
        </Toggle>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">Outline</span>
        <Toggle variant="outline" aria-label="Bold">
          <Bold className="size-4" />
        </Toggle>
      </div>

      <h3 className="text-sm font-semibold text-muted-foreground mt-4">States</h3>
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">Pressed</span>
        <Toggle aria-label="Bold" defaultPressed>
          <Bold className="size-4" />
        </Toggle>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">Disabled</span>
        <Toggle aria-label="Bold" disabled>
          <Bold className="size-4" />
        </Toggle>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">With Text</span>
        <Toggle aria-label="Bold">
          <Bold className="size-4" />
          Bold
        </Toggle>
      </div>

      <h3 className="text-sm font-semibold text-muted-foreground mt-4">Sizes</h3>
      {(['sm', 'md', 'lg', 'icon', 'icon-sm'] as const).map((size) => (
        <div key={size} className="flex items-center gap-3">
          <span className="w-28 text-sm text-muted-foreground">{size}</span>
          <Toggle size={size} aria-label="Bold">
            <Bold className="size-4" />
          </Toggle>
        </div>
      ))}
    </div>
  ),
};

export const Playground: Story = {
  argTypes: {
    variant: { control: 'select', options: ['default', 'outline'] },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'icon', 'icon-sm'] },
    disabled: { control: 'boolean' },
  },
  args: {
    variant: 'default',
    size: 'md',
    disabled: false,
    'aria-label': 'Toggle bold',
    children: 'Bold',
  },
};
