import { test, expect } from '@playwright/test';
import { disableAnimationsAndSettle } from './vrt-helpers';

/**
 * Visual Regression Tests for Dev Witness page stories.
 *
 * Each test navigates to the Storybook iframe URL for a story's Default
 * variant, waits for rendering to stabilise, then captures a full-page
 * screenshot and compares it against the committed baseline.
 *
 * Story ID format: Storybook lowercases the title path and joins with
 * double hyphens for the group separator and single hyphens within words.
 * Example: "Dev Witness/Home/Dashboard" -> "dev-witness-home-dashboard--default"
 */

const STORIES = [
  { name: 'Settings — Account',    id: 'dev-witness-system-settings--account' },
  { name: 'Settings — Companies',  id: 'dev-witness-system-settings--companies' },
  { name: 'Dashboard',             id: 'dev-witness-home-dashboard--default' },
  { name: 'Item Detail',           id: 'dev-witness-reference-items-item-detail--default' },
  { name: 'Items Grid',            id: 'dev-witness-reference-items-items-grid--default' },
  { name: 'Kanban Card',           id: 'dev-witness-resources-kanban-cards-kanban-card--default' },
  { name: 'Order Queue',           id: 'dev-witness-transactions-orders-order-queue--default' },
  { name: 'Receiving',             id: 'dev-witness-transactions-receiving--default' },
  { name: 'Scan',                  id: 'dev-witness-resources-kanban-cards-scan--default' },
  { name: 'Sign In',               id: 'dev-witness-system-authentication-sign-in--default' },
] as const;

for (const story of STORIES) {
  test(`VRT: ${story.name}`, async ({ page }) => {
    // Navigate to the story iframe (bypasses Storybook manager chrome).
    await page.goto(
      `/iframe.html?id=${story.id}&viewMode=story&globals=`,
      { waitUntil: 'networkidle' },
    );

    await disableAnimationsAndSettle(page);

    // Full-page screenshot comparison.
    await expect(page).toHaveScreenshot(`${story.id}.png`, {
      fullPage: true,
    });
  });
}
