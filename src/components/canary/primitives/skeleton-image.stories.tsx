import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Skeleton } from './skeleton';

const meta = {
  title: 'Components/Canary/Primitives/Skeleton (Image Context)',
  component: Skeleton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Skeleton loading states as they appear in image grid cells and preview panels.',
      },
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Grid cell loading state — 64&#215;64 square placeholder. */
export const ImagePlaceholder: Story = {
  render: () => <Skeleton className="size-16 rounded" />,
};

/** Preview / inspector loading state — 256&#215;256 large placeholder. */
export const ImagePlaceholderLarge: Story = {
  render: () => <Skeleton className="size-64 rounded-md" />,
};

/** Shimmer animation cycling between skeleton and a loaded state. */
export const ShimmerAnimation: Story = {
  render: function ShimmerAnimationStory() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
      const id = setInterval(() => setLoaded((prev) => !prev), 2000);
      return () => clearInterval(id);
    }, []);

    return (
      <div className="size-16 rounded overflow-hidden">
        {loaded ? (
          <div className="size-full bg-blue-400 rounded" />
        ) : (
          <Skeleton className="size-full rounded" />
        )}
      </div>
    );
  },
};
