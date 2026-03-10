import type { Meta, StoryObj } from '@storybook/react-vite';

import { ArdaBadge } from './badge';

const meta: Meta<typeof ArdaBadge> = {
  title: 'Components/Canary/Atoms/Badge',
  component: ArdaBadge,
  parameters: {
    docs: {
      description: {
        component:
          'Thin Arda wrapper around shadcn Badge. Rounded-md shape, tight padding, text-2xs (11px) semibold. ' +
          'Use className for context-specific overrides.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ArdaBadge>;

/** Default — uses primary color (Arda orange). */
export const Default: Story = {
  args: { children: '3' },
};

/** Secondary variant. */
export const Secondary: Story = {
  args: { children: '42', variant: 'secondary' },
};

/** Outline variant. */
export const Outline: Story = {
  args: { children: 'New', variant: 'outline' },
};

/** All variants side by side. */
export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <ArdaBadge>Default</ArdaBadge>
      <ArdaBadge variant="secondary">Secondary</ArdaBadge>
      <ArdaBadge variant="outline">Outline</ArdaBadge>
      <ArdaBadge variant="destructive">Destructive</ArdaBadge>
    </div>
  ),
};
