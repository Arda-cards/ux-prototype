import type { Meta, StoryObj } from '@storybook/react-vite';

import { ArdaBadge } from './badge';

const meta = {
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
  tags: ['autodocs'],
} satisfies Meta<typeof ArdaBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

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

/** Numeric count — auto-caps at 99+. */
export const Count: Story = {
  args: { count: 42 },
};

/** High count — displays as 99+. */
export const HighCount: Story = {
  args: { count: 150 },
};

/** Custom max threshold. */
export const CustomMax: Story = {
  args: { count: 10, max: 9 },
};

/** All variants side by side. */
export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <ArdaBadge>Default</ArdaBadge>
      <ArdaBadge variant="secondary">Secondary</ArdaBadge>
      <ArdaBadge variant="outline">Outline</ArdaBadge>
      <ArdaBadge variant="destructive">Destructive</ArdaBadge>
      <ArdaBadge count={150} />
    </div>
  ),
};
