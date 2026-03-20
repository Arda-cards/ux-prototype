import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { BrandLogo, BrandIcon } from './brand-logo';

const meta = {
  title: 'Components/Canary/Atoms/BrandLogo',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Arda brand logo atoms in 4 variants: default, inverted, mono, mono-inverted. ' +
          'BrandLogo is the full wordmark (55x30), BrandIcon is the compact square (30x30).',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

/** Full wordmark — default variant (orange bg, white A). */
export const Wordmark: Story = {
  render: () => <BrandLogo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByAltText('Arda')).toBeInTheDocument();
  },
};

/** Compact icon — default variant (orange bg, white A). */
export const Icon: Story = {
  render: () => <BrandIcon />,
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
          <BrandLogo />
          <BrandIcon />
        </div>
        <div className="flex flex-col items-start gap-3">
          <span className="text-xs text-sidebar-foreground/70 uppercase tracking-wider">mono</span>
          <BrandLogo variant="mono" />
          <BrandIcon variant="mono" />
        </div>
      </div>
      <div className="flex items-center gap-6 bg-background border p-6 rounded-lg">
        <div className="flex flex-col items-start gap-3">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">inverted</span>
          <BrandLogo variant="inverted" />
          <BrandIcon variant="inverted" />
        </div>
        <div className="flex flex-col items-start gap-3">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            mono-inverted
          </span>
          <BrandLogo variant="mono-inverted" />
          <BrandIcon variant="mono-inverted" />
        </div>
      </div>
    </div>
  ),
};
