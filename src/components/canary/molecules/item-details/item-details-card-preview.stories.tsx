import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ArdaItemDetailsCardPreview } from './item-details-card-preview';

const meta = {
  title: 'Components/Canary/Molecules/ItemDetails/ItemDetailsCardPreview',
  component: ArdaItemDetailsCardPreview,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Card preview carousel with centered active card, animated transitions, ' +
          'Handles loading, empty, and populated states.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ArdaItemDetailsCardPreview>;

export default meta;
type Story = StoryObj<typeof ArdaItemDetailsCardPreview>;

const MockCard = ({ index }: { index: number }) => (
  <div className="flex h-48 w-72 items-center justify-center rounded-lg border bg-background shadow-sm">
    <span className="text-sm text-muted-foreground">Card {index} preview</span>
  </div>
);

/** With multiple cards and navigation. */
export const Default: Story = {
  render: () => {
    const [index, setIndex] = useState(1);
    return (
      <div className="w-[460px]">
        <ArdaItemDetailsCardPreview
          currentIndex={index}
          totalCards={5}
          onIndexChange={setIndex}
          renderCard={(i) => <MockCard index={i} />}
        />
      </div>
    );
  },
};

/** Loading state. */
export const Loading: Story = {
  render: () => (
    <div className="w-[460px]">
      <ArdaItemDetailsCardPreview
        currentIndex={1}
        totalCards={0}
        onIndexChange={() => {}}
        loading
      />
    </div>
  ),
};

/** Empty state — no cards. */
export const Empty: Story = {
  render: () => (
    <div className="w-[460px]">
      <ArdaItemDetailsCardPreview currentIndex={1} totalCards={0} onIndexChange={() => {}} />
    </div>
  ),
};
