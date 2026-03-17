import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bell, HelpCircle, Settings, Search } from 'lucide-react';

import { ArdaIconButton } from './icon-button';
import { TooltipProvider } from '@/components/ui/tooltip';

const meta = {
  title: 'Components/Canary/Atoms/IconButton',
  component: ArdaIconButton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof ArdaIconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

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
      <ArdaIconButton icon={Search} label="Search" />
      <ArdaIconButton icon={HelpCircle} label="Help" />
      <ArdaIconButton icon={Bell} label="Notifications" badgeCount={3} />
      <ArdaIconButton icon={Settings} label="Settings" />
    </div>
  ),
};
