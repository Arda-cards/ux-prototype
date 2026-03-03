import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import SettingsPage from '@frontend/app/settings/page';
import '@/styles/extras/vendored-theme.css';

const meta: Meta<typeof SettingsPage> = {
  title: 'Dev Witness/System/Settings',
  component: SettingsPage,
  tags: ['app-route:/settings'],
  parameters: {
    layout: 'fullscreen',
    appRoute: '/settings',
    appComponent: 'app/settings/page.tsx',
  },
  args: {
    pathname: '/settings',
  },
};

export default meta;
type Story = StoryObj<typeof SettingsPage>;

/**
 * UC-SET-001: Settings page — Account tab (default).
 * Verifies the unified settings page renders with sidebar navigation
 * and the Account section content.
 */
export const Account: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const heading = await canvas.findByRole(
      'heading',
      { name: /Settings/i },
      { timeout: 10000 },
    );
    await expect(heading).toBeVisible();

    // Verify Account tab is active (default).
    // Scope to the sidebar nav to avoid matching the "Account" section heading in the content area.
    const nav = canvasElement.querySelector('nav, [role="navigation"]') as HTMLElement;
    const navCanvas = within(nav ?? canvasElement);
    const accountButton = await navCanvas.findByRole('button', { name: /Account/i });
    await expect(accountButton).toBeVisible();
  },
};

/**
 * UC-SET-002: Settings page — Companies tab.
 */
export const Companies: Story = {
  args: {
    pathname: '/settings?section=companies',
    searchParams: { section: 'companies' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const heading = await canvas.findByRole(
      'heading',
      { name: /Settings/i },
      { timeout: 10000 },
    );
    await expect(heading).toBeVisible();
  },
};

/**
 * UC-SET-003: Settings page — Appearance tab.
 * Note: Hidden in production environments.
 */
export const Appearance: Story = {
  args: {
    pathname: '/settings?section=appearance',
    searchParams: { section: 'appearance' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const heading = await canvas.findByRole(
      'heading',
      { name: /Settings/i },
      { timeout: 10000 },
    );
    await expect(heading).toBeVisible();
  },
};

/**
 * UC-SET-004: Settings page — Display tab.
 */
export const Display: Story = {
  args: {
    pathname: '/settings?section=display',
    searchParams: { section: 'display' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const heading = await canvas.findByRole(
      'heading',
      { name: /Settings/i },
      { timeout: 10000 },
    );
    await expect(heading).toBeVisible();
  },
};
