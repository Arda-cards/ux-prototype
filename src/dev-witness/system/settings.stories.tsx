import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import SettingsPage from '@frontend/app/settings/page';
import '@/styles/vendored/globals.css';

const meta: Meta<typeof SettingsPage> = {
  title: 'App/Current/System/Settings',
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
    // Use exact string match to avoid matching "Update account" button in the content area.
    const accountButton = await canvas.findByRole('button', { name: 'Account', exact: true });
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
