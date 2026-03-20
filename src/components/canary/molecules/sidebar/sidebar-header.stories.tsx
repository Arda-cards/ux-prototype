import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { SidebarHeader, type TeamOption } from './sidebar-header';
import { Sidebar } from '../../organisms/sidebar/sidebar';

const mockTeams: TeamOption[] = [
  { key: 'arda', name: 'Arda Cards', onSelect: fn() },
  { key: 'acme', name: 'Acme Corp', onSelect: fn() },
  { key: 'globex', name: 'Globex Inc', onSelect: fn() },
];

const meta = {
  title: 'Components/Canary/Molecules/Sidebar/Header',
  component: SidebarHeader,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Sidebar header with brand icon and team name. Optionally renders a team switcher ' +
          'dropdown when a teams array is provided. Supports custom children to fully replace ' +
          'the default content. Must be rendered inside an Sidebar (provides SidebarProvider context).',
      },
    },
  },
} satisfies Meta<typeof SidebarHeader>;

export default meta;
type Story = StoryObj<typeof SidebarHeader>;

/** Default header with team name. */
export const Default: Story = {
  args: {
    teamName: 'Arda Cards',
  },
  render: (args) => (
    <Sidebar defaultOpen>
      <SidebarHeader {...args} />
    </Sidebar>
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
    <Sidebar defaultOpen>
      <SidebarHeader {...args} />
    </Sidebar>
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
    <Sidebar defaultOpen>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <span className="text-sm font-bold">Custom Header</span>
        </div>
      </SidebarHeader>
    </Sidebar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Custom Header')).toBeVisible();
  },
};

/**
 * Interactive Controls playground — adjust `teamName` in the Controls panel.
 * `teams` is a complex array and cannot be driven by a simple control.
 */
export const Playground: Story = {
  args: {
    teamName: 'Arda Cards',
  },
  render: (args) => (
    <Sidebar defaultOpen>
      <SidebarHeader {...args} />
    </Sidebar>
  ),
};
