import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bell, HelpCircle, Settings, Search } from 'lucide-react';

import { IconButton } from './icon-button';
import { TooltipProvider } from '@/components/canary/primitives/tooltip';

const meta = {
  title: 'Components/Canary/Atoms/IconButton',
  component: IconButton,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  argTypes: {
    label: { control: 'text' },
    showTooltip: { control: 'boolean' },
    badgeCount: { control: 'number' },
    disabled: { control: 'boolean' },
    icon: { table: { disable: true } },
  },
  args: {
    icon: Bell,
    label: 'Notifications',
    showTooltip: true,
  },
};

export const Default: Story = {
  args: {
    icon: HelpCircle,
    label: 'Help',
  },
};

export const WithBadge: Story = {
  args: {
    icon: Bell,
    label: 'Notifications',
    badgeCount: 8,
  },
};

export const HighBadgeCount: Story = {
  args: {
    icon: Bell,
    label: 'Notifications',
    badgeCount: 142,
  },
};

export const NoTooltip: Story = {
  args: {
    icon: Settings,
    label: 'Settings',
    showTooltip: false,
  },
};

export const Group: StoryObj = {
  render: () => (
    <div className="flex items-center gap-2">
      <IconButton icon={Search} label="Search" />
      <IconButton icon={HelpCircle} label="Help" />
      <IconButton icon={Bell} label="Notifications" badgeCount={3} />
      <IconButton icon={Settings} label="Settings" />
    </div>
  ),
};

export const AllVariants: StoryObj = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex flex-col gap-4 max-w-xs">
      <div className="flex items-center gap-3">
        <span className="w-36 text-sm text-muted-foreground">Default</span>
        <IconButton icon={Bell} label="Notifications" />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-36 text-sm text-muted-foreground">With badge</span>
        <IconButton icon={Bell} label="Notifications" badgeCount={8} />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-36 text-sm text-muted-foreground">High badge count</span>
        <IconButton icon={Bell} label="Notifications" badgeCount={142} />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-36 text-sm text-muted-foreground">No tooltip</span>
        <IconButton icon={Settings} label="Settings" showTooltip={false} />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-36 text-sm text-muted-foreground">Group</span>
        <div className="flex items-center gap-1">
          <IconButton icon={Search} label="Search" />
          <IconButton icon={HelpCircle} label="Help" />
          <IconButton icon={Bell} label="Notifications" badgeCount={3} />
          <IconButton icon={Settings} label="Settings" />
        </div>
      </div>
    </div>
  ),
};
