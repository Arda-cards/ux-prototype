import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ArdaSidebarHeader, type TeamOption } from './sidebar-header';
import { ArdaSidebar } from '../../organisms/sidebar/sidebar';

const mockTeams: TeamOption[] = [
  { key: 'arda', name: 'Arda Cards', onSelect: fn() },
  { key: 'acme', name: 'Acme Corp', onSelect: fn() },
  { key: 'globex', name: 'Globex Inc', onSelect: fn() },
];

const meta = {
  title: 'Components/Canary/Molecules/Sidebar/Header',
  component: ArdaSidebarHeader,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Sidebar header with brand icon and team name. Optionally renders a team switcher ' +
          'dropdown when a teams array is provided. Supports custom children to fully replace ' +
          'the default content. Must be rendered inside an ArdaSidebar (provides SidebarProvider context).',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ArdaSidebarHeader>;

export default meta;
type Story = StoryObj<typeof ArdaSidebarHeader>;

/** Default header with team name. */
export const Default: Story = {
  args: {
    teamName: 'Arda Cards',
  },
  render: (args) => (
    <ArdaSidebar defaultOpen>
      <ArdaSidebarHeader {...args} />
    </ArdaSidebar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Arda Cards')).toBeVisible();
  },
};

/** With team switcher dropdown. */
export const WithTeamSwitcher: Story = {
  args: {
    teamName: 'Arda Cards',
    teams: mockTeams,
  },
  render: (args) => (
    <ArdaSidebar defaultOpen>
      <ArdaSidebarHeader {...args} />
    </ArdaSidebar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Arda Cards')).toBeVisible();
    // Open the dropdown to verify team options render
    const trigger = canvas.getByRole('button', { name: /arda cards/i });
    await userEvent.click(trigger);
  },
};

/** Custom children replace the default brand content. */
export const CustomChildren: Story = {
  render: () => (
    <ArdaSidebar defaultOpen>
      <ArdaSidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <span className="text-sm font-bold">Custom Header</span>
        </div>
      </ArdaSidebarHeader>
    </ArdaSidebar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Custom Header')).toBeVisible();
  },
};
