import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests for all 10 Full App page stories.
 *
 * Each test navigates to the Storybook iframe URL for a story's Default
 * variant, waits for rendering to stabilise, then captures a full-page
 * screenshot and compares it against the committed baseline.
 *
 * Story ID format: storybook lowercases the title path and joins with
 * double hyphens for the group separator and single hyphens within words.
 * Example: "Full App/Dashboard" -> "full-app--dashboard"
 */

const STORIES = [
  { name: 'Account Profile', id: 'full-app-account-profile--default' },
  { name: 'Company Settings', id: 'full-app-company-settings--default' },
  { name: 'Dashboard', id: 'full-app-dashboard--default' },
  { name: 'Item Detail', id: 'full-app-item-detail--default' },
  { name: 'Items Grid', id: 'full-app-items-grid--default' },
  { name: 'Kanban Card', id: 'full-app-kanban-card--default' },
  { name: 'Order Queue', id: 'full-app-order-queue--default' },
  { name: 'Receiving', id: 'full-app-receiving--default' },
  { name: 'Scan', id: 'full-app-scan--default' },
  { name: 'Sign In', id: 'full-app-sign-in--default' },
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
