import type { Meta, StoryObj } from '@storybook/react-vite';
import { MoreHorizontal } from 'lucide-react';

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
} from './avatar';

const meta = {
  title: 'Components/Canary/Atoms/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Avatar component built on Radix UI primitives. Supports three sizes, an optional badge overlay, and a group composition pattern.',
      },
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg'],
    },
  },
  args: {
    size: 'default',
  },
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const WithFallback: Story = {
  render: () => (
    <Avatar>
      {/* intentionally broken src to show fallback */}
      <AvatarImage src="/broken-image.png" alt="Broken" />
      <AvatarFallback>AB</AvatarFallback>
    </Avatar>
  ),
};

export const WithBadge: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>JD</AvatarFallback>
      <AvatarBadge />
    </Avatar>
  ),
};

export const AvatarGroupStory: Story = {
  name: 'AvatarGroup',
  render: () => (
    <AvatarGroup>
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>
        <MoreHorizontal />
      </AvatarGroupCount>
    </AvatarGroup>
  ),
};

export const InitialsFromName: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex flex-col gap-4 max-w-xs">
      {[
        { name: 'Hex Bolt', expected: 'HB' },
        { name: 'Alice', expected: 'A' },
        { name: 'John Michael Doe', expected: 'JM' },
        { name: '', expected: '?' },
      ].map(({ name, expected }) => (
        <div key={expected + name} className="flex items-center gap-3">
          <span className="w-40 text-sm text-muted-foreground">{name || '(empty)'}</span>
          <Avatar>
            <AvatarFallback entityName={name} />
          </Avatar>
          <span className="text-xs text-muted-foreground">→ {expected}</span>
        </div>
      ))}
    </div>
  ),
};

export const AllSizesWithImage: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex items-end gap-4">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground">{size}</span>
          <Avatar size={size}>
            <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      ))}
    </div>
  ),
};

export const AllSizesWithFallback: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex items-end gap-4">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground">{size}</span>
          <Avatar size={size}>
            <AvatarFallback entityName="John Doe" />
          </Avatar>
        </div>
      ))}
    </div>
  ),
};

export const AllSizesWithBadge: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex items-end gap-4">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground">{size}</span>
          <Avatar size={size}>
            <AvatarFallback>JD</AvatarFallback>
            <AvatarBadge />
          </Avatar>
        </div>
      ))}
    </div>
  ),
};

export const ImageLoadError: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="/definitely-broken-image.png" alt="Broken" />
      <AvatarFallback entityName="Error State" />
    </Avatar>
  ),
};

export const AllVariants: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex flex-col gap-6 max-w-sm">
      <div className="flex items-center gap-3">
        <span className="w-36 text-sm text-muted-foreground">Default</span>
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-36 text-sm text-muted-foreground">Small</span>
        <Avatar size="sm">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-36 text-sm text-muted-foreground">Large</span>
        <Avatar size="lg">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-36 text-sm text-muted-foreground">With image</span>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-36 text-sm text-muted-foreground">With badge</span>
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
          <AvatarBadge />
        </Avatar>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-36 text-sm text-muted-foreground">Group</span>
        <AvatarGroup>
          <Avatar>
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <AvatarGroupCount>
            <MoreHorizontal />
          </AvatarGroupCount>
        </AvatarGroup>
      </div>
    </div>
  ),
};
