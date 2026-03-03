import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests for all 10 Dev Witness page stories.
 *
 * Each test navigates to the Storybook iframe URL for a story's Default
 * variant, waits for rendering to stabilise, then captures a full-page
 * screenshot and compares it against the committed baseline.
 *
 * Story ID format: storybook lowercases the title path and joins with
 * double hyphens for the group separator and single hyphens within words.
 * Example: "Dev Witness/Dashboard" -> "dev-witness-dashboard--default"
 */

const STORIES = [
  { name: 'Account Profile', id: 'dev-witness-account-profile--default' },
  { name: 'Company Settings', id: 'dev-witness-company-settings--default' },
  { name: 'Dashboard', id: 'dev-witness-dashboard--default' },
  { name: 'Item Detail', id: 'dev-witness-item-detail--default' },
  { name: 'Items Grid', id: 'dev-witness-items-grid--default' },
  { name: 'Kanban Card', id: 'dev-witness-kanban-card--default' },
  { name: 'Order Queue', id: 'dev-witness-order-queue--default' },
  { name: 'Receiving', id: 'dev-witness-receiving--default' },
  { name: 'Scan', id: 'dev-witness-scan--default' },
  { name: 'Sign In', id: 'dev-witness-sign-in--default' },
] as const;

for (const story of STORIES) {
  test(`VRT: ${story.name}`, async ({ page }) => {
    // Navigate to the story iframe (bypasses Storybook manager chrome).
    await page.goto(
      `/iframe.html?id=${story.id}&viewMode=story&globals=`,
      { waitUntil: 'networkidle' },
    );

    // Give async renders (lazy data, animations) time to settle.
    // Disable CSS animations/transitions for deterministic screenshots.
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    });

    // Wait a short period for any final paints.
    await page.waitForTimeout(1000);

    // Full-page screenshot comparison.
    await expect(page).toHaveScreenshot(`${story.id}.png`, {
      fullPage: true,
    });
  });
}
