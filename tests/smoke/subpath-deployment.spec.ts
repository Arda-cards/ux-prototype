import { test, expect } from '@playwright/test';

/**
 * Subpath Deployment Smoke Test — verifies Storybook works when served under
 * a URL prefix (e.g., /ux-prototype/ on GitHub Pages).
 *
 * This catches the class of bugs where:
 *   - MSW's service worker registration fails because `mockServiceWorker.js`
 *     is requested at the root instead of under the subpath
 *   - Asset references use root-relative paths instead of base-relative paths
 *     (e.g., /vite-inject-mocker-entry.js instead of /ux-prototype/...)
 *   - Storybook renders an error overlay instead of the story
 *
 * Prerequisites:
 *   - Storybook must be built with `STORYBOOK_BASE=/ux-prototype/`
 *   - The subpath server must be running (see subpath-deployment project in
 *     playwright.config.ts)
 *
 * Usage:
 *   STORYBOOK_BASE=/ux-prototype/ npm run build-storybook
 *   npx playwright test --project=subpath-deployment
 */

const SUBPATH = '/ux-prototype';

// A handful of representative stories to verify. We don't need to test every
// story — just enough to confirm that the Storybook shell, MSW service worker,
// and asset loading all work under the subpath.
const STORIES = [
  {
    name: 'Suppliers List (MSW-dependent)',
    id: 'use-cases-reference-business-affiliates-ba-0001-browse-and-search-0001-view-suppliers-list--default',
  },
];

test.describe('Subpath deployment', () => {
  for (const story of STORIES) {
    test(`${story.name}: renders without errors under ${SUBPATH}/`, async ({ page }) => {
      const pageErrors: string[] = [];
      page.on('pageerror', (err) => pageErrors.push(err.message));

      // Track network failures (404s) for Storybook infrastructure resources.
      // Exclude: external resources, API calls (MSW intercepts at runtime),
      // and app-level image/asset paths from vendored code.
      const failedRequests: { url: string; status: number }[] = [];
      page.on('response', (response) => {
        const url = response.url();
        if (response.status() >= 400 && url.includes('localhost')) {
          // Skip API calls (MSW), app images, and vendored assets
          if (url.includes('/api/') || url.includes('/images/') || url.includes('/vendored/'))
            return;
          failedRequests.push({ url, status: response.status() });
        }
      });

      // Navigate to the story iframe directly (same as the smoke tests do)
      await page.goto(`${SUBPATH}/iframe.html?id=${story.id}&viewMode=story`, {
        waitUntil: 'networkidle',
        timeout: 30_000,
      });

      // 1. No failed network requests for local resources
      expect(
        failedRequests,
        `Failed resource requests:\n${failedRequests.map((r) => `  ${r.status} ${r.url}`).join('\n')}`,
      ).toHaveLength(0);

      // 2. No Storybook error overlay
      const errorOverlay = page.locator('.sb-errordisplay');
      const overlayVisible = await errorOverlay.isVisible().catch(() => false);
      if (overlayVisible) {
        const errorText = await errorOverlay.textContent();
        expect(overlayVisible, `Storybook error overlay shown: ${errorText}`).toBe(false);
      }

      // 3. No uncaught errors related to ServiceWorker
      const swErrors = pageErrors.filter(
        (msg) => msg.includes('ServiceWorker') || msg.includes('mockServiceWorker'),
      );
      expect(swErrors, `ServiceWorker errors: ${swErrors.join('; ')}`).toHaveLength(0);
    });
  }
});
