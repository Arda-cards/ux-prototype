import type { Page } from '@playwright/test';

/**
 * Disables CSS animations/transitions and waits for final paints.
 * Call after page navigation to ensure deterministic screenshots.
 */
export async function disableAnimationsAndSettle(page: Page): Promise<void> {
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
  await page.waitForTimeout(1000);
}
