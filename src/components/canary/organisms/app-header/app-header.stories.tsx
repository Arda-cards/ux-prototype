import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bell, HelpCircle, ScanBarcode } from 'lucide-react';

import { AppHeader } from './app-header';
import { TooltipProvider } from '@/components/canary/primitives/tooltip';

const meta = {
  title: 'Components/Canary/Organisms/AppHeader',
  component: AppHeader,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof AppHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultActions = [
  { key: 'help', icon: HelpCircle, label: 'Help' },
  { key: 'notifications', icon: Bell, label: 'Notifications', badgeCount: 8 },
];

const defaultButtonActions = [{ key: 'scan', icon: ScanBarcode, label: 'Scan' }];

export const Default: Story = {
  args: {
    actions: defaultActions,
    buttonActions: defaultButtonActions,
  },
};

export const WithSearch: Story = {
  render: () => {
    const [search, setSearch] = useState('');
    return (
      <AppHeader
        actions={defaultActions}
        buttonActions={defaultButtonActions}
        searchValue={search}
        onSearchChange={setSearch}
      />
    );
  },
};

export const NoSearch: Story = {
  args: {
    showSearch: false,
    actions: defaultActions,
    buttonActions: defaultButtonActions,
  },
};

export const IconActionsOnly: Story = {
  args: {
    actions: defaultActions,
    showSearch: false,
  },
};

export const WithLeadingContent: Story = {
  args: {
    leading: (
      <button className="size-9 flex items-center justify-center rounded-md hover:bg-accent">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" x2="21" y1="6" y2="6" />
          <line x1="3" x2="21" y1="12" y2="12" />
          <line x1="3" x2="21" y1="18" y2="18" />
        </svg>
      </button>
    ),
    actions: defaultActions,
    buttonActions: defaultButtonActions,
  },
};

export const Composition: Story = {
  render: () => {
    const [search, setSearch] = useState('');
    return (
      <div className="min-h-[400px] bg-muted/30">
        <AppHeader
          leading={
            <span className="text-sm font-medium text-muted-foreground mr-4">
              Items &rsaquo; Inventory
            </span>
          }
          actions={defaultActions}
          buttonActions={defaultButtonActions}
          searchValue={search}
          onSearchChange={setSearch}
        />
        <div className="p-8">
          <p className="text-muted-foreground">Page content goes here</p>
        </div>
      </div>
    );
  },
};

/**
 * Interactive Controls playground — use the Controls panel to toggle
 * `showSearch`. `actions` and `buttonActions` are complex arrays pre-populated
 * here. Search is wired to local state.
 */
export const Playground: Story = {
  render: () => {
    const [search, setSearch] = useState('');
    return (
      <AppHeader
        actions={defaultActions}
        buttonActions={defaultButtonActions}
        searchValue={search}
        onSearchChange={setSearch}
        showSearch
      />
    );
  },
};
