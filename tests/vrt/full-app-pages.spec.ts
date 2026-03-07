import { test, expect } from '@playwright/test';
import { disableAnimationsAndSettle } from './vrt-helpers';

/**
 * Visual Regression Tests for all App/Current page stories.
 *
 * Each test navigates to the Storybook iframe URL for a story's Default
 * variant, waits for rendering to stabilise, then captures a full-page
 * screenshot and compares it against the committed baseline.
 *
 * Story ID format: Storybook lowercases the title path and joins with
 * double hyphens for the group separator and single hyphens within words.
 * Example: "App/Current/Home/Dashboard" -> "app-current-home-dashboard--default"
 */

const STORIES = [
  { name: 'Dashboard', id: 'app-current-home-dashboard--default' },
  { name: 'Item Detail', id: 'app-current-reference-items-item-detail--default' },
  { name: 'Items Grid', id: 'app-current-reference-items-items-grid--default' },
  { name: 'Kanban Card', id: 'app-current-resources-kanban-cards-kanban-card--default' },
  {
    name: 'Mobile Device Check',
    id: 'app-current-resources-kanban-cards-mobile-device-check--default',
  },
  { name: 'Scan', id: 'app-current-resources-kanban-cards-scan--default' },
  { name: 'Reset Password', id: 'app-current-system-authentication-reset-password--default' },
  { name: 'Sign In', id: 'app-current-system-authentication-sign-in--default' },
  { name: 'Sign Up', id: 'app-current-system-authentication-sign-up--default' },
  { name: 'Settings Account', id: 'app-current-system-settings--account' },
  { name: 'Order Queue', id: 'app-current-transactions-orders-order-queue--default' },
  { name: 'Receiving', id: 'app-current-transactions-receiving--default' },
] as const;

for (const story of STORIES) {
  test(`VRT: ${story.name}`, async ({ page }) => {
    // Navigate to the story iframe (bypasses Storybook manager chrome).
    await page.goto(`/iframe.html?id=${story.id}&viewMode=story&globals=`, {
      waitUntil: 'networkidle',
    });

    await disableAnimationsAndSettle(page);

    // Viewport-only screenshot (1280×900) — deterministic across macOS and Linux.
    // fullPage: true captures scroll bounds which vary by platform font rendering.
    await expect(page).toHaveScreenshot(`${story.id}.png`, {
      clip: { x: 0, y: 0, width: 1280, height: 900 },
    });
  });
}
