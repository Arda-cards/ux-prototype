import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { ArdaBrandLogo, ArdaBrandIcon } from './brand-logo';

const meta = {
  title: 'Components/Canary/Atoms/BrandLogo',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Arda brand logo atoms in 4 variants: default, inverted, mono, mono-inverted. ' +
          'ArdaBrandLogo is the full wordmark (55×30), ArdaBrandIcon is the compact square (30×30).',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

/** Full wordmark — default variant (orange bg, white A). */
export const Wordmark: Story = {
  render: () => <ArdaBrandLogo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByAltText('Arda')).toBeInTheDocument();
  },
};

/** Compact icon — default variant (orange bg, white A). */
export const Icon: Story = {
  render: () => <ArdaBrandIcon />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByAltText('Arda')).toBeInTheDocument();
  },
};

/** All variants on their intended backgrounds. */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-6 bg-sidebar p-6 rounded-lg">
        <div className="flex flex-col items-start gap-3">
          <span className="text-xs text-sidebar-foreground/70 uppercase tracking-wider">
            default
          </span>
          <ArdaBrandLogo />
          <ArdaBrandIcon />
        </div>
        <div className="flex flex-col items-start gap-3">
          <span className="text-xs text-sidebar-foreground/70 uppercase tracking-wider">mono</span>
          <ArdaBrandLogo variant="mono" />
          <ArdaBrandIcon variant="mono" />
        </div>
      </div>
      <div className="flex items-center gap-6 bg-background border p-6 rounded-lg">
        <div className="flex flex-col items-start gap-3">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">inverted</span>
          <ArdaBrandLogo variant="inverted" />
          <ArdaBrandIcon variant="inverted" />
        </div>
        <div className="flex flex-col items-start gap-3">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            mono-inverted
          </span>
          <ArdaBrandLogo variant="mono-inverted" />
          <ArdaBrandIcon variant="mono-inverted" />
        </div>
      </div>
    </div>
  ),
};
