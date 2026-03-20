import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SquarePen, ShoppingCart, Printer, Trash2 } from 'lucide-react';

import { ItemDetailsCardPreview } from './item-details-card-preview';
import { ArdaGridAction } from '../grid-action/grid-action';

const meta = {
  title: 'Components/Canary/Molecules/ItemDetails/ItemDetailsCardPreview',
  component: ItemDetailsCardPreview,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Card preview carousel with centered active card, lightbox-style arrows, ' +
          'and a children slot for actions. Handles loading, empty, and populated states.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ItemDetailsCardPreview>;

export default meta;
type Story = StoryObj<typeof ItemDetailsCardPreview>;

const noop = () => {};

const MockCard = ({ index }: { index: number }) => (
  <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-border/60 bg-background">
    <span className="text-xs text-muted-foreground">Card {index}</span>
  </div>
);

/** Multiple cards with lightbox-style arrow navigation. */
export const Default: Story = {
  render: () => {
    const [index, setIndex] = useState(1);
    return (
      <div className="w-[460px]">
        <ItemDetailsCardPreview
          currentIndex={index}
          totalCards={5}
          onIndexChange={setIndex}
          renderCard={(i) => <MockCard index={i} />}
        />
      </div>
    );
  },
};

/** Carousel with action grid rendered inside the children slot. */
export const WithActions: Story = {
  render: () => {
    const [index, setIndex] = useState(1);
    return (
      <div className="w-[460px]">
        <ItemDetailsCardPreview
          currentIndex={index}
          totalCards={3}
          onIndexChange={setIndex}
          renderCard={(i) => <MockCard index={i} />}
        >
          <div className="flex flex-wrap items-start justify-center gap-x-4 gap-y-2 px-5 pt-2 pb-1">
            <ArdaGridAction icon={SquarePen} label="Edit" onAction={noop} />
            <ArdaGridAction icon={ShoppingCart} label="Queue" onAction={noop} />
            <ArdaGridAction icon={Printer} label="Print" onAction={noop} />
            <ArdaGridAction icon={Trash2} label="Delete" destructive onAction={noop} />
          </div>
        </ItemDetailsCardPreview>
      </div>
    );
  },
};

/** Loading state. */
export const Loading: Story = {
  render: () => (
    <div className="w-[460px]">
      <ItemDetailsCardPreview currentIndex={1} totalCards={0} onIndexChange={() => {}} loading />
    </div>
  ),
};

/** Empty state — no cards. */
export const Empty: Story = {
  render: () => (
    <div className="w-[460px]">
      <ItemDetailsCardPreview currentIndex={1} totalCards={0} onIndexChange={() => {}} />
    </div>
  ),
};

/** Single card — no arrows shown. */
export const SingleCard: Story = {
  render: () => (
    <div className="w-[460px]">
      <ItemDetailsCardPreview
        currentIndex={1}
        totalCards={1}
        onIndexChange={() => {}}
        renderCard={(i) => <MockCard index={i} />}
      />
    </div>
  ),
};
