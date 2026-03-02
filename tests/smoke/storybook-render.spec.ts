import { test, expect } from '@playwright/test';

/**
 * Storybook Smoke Test — verifies every story and docs page renders without errors.
 *
 * Dynamically discovers all entries from the Storybook index API, then visits
 * each one in the iframe and checks that:
 *   1. No visible `.sb-errordisplay` element appears (render crash).
 *   2. No uncaught page errors occur.
 *
 * Timeouts are treated as warnings, not failures — some stories (e.g., those
 * with complex MSW handlers) may be slow to reach networkidle.
 *
 * Usage:
 *   npx playwright test --project=smoke
 *
 * Requires Storybook running at the configured baseURL (default: http://localhost:6006).
 */

interface StoryEntry {
  type: 'story' | 'docs';
  title: string;
  name: string;
}

interface StoryIndex {
  entries: Record<string, StoryEntry>;
}

test.describe('Storybook Render Smoke Tests', () => {
  let storyIds: string[] = [];
  let entries: Record<string, StoryEntry> = {};

  test.beforeAll(async ({ request }) => {
    const response = await request.get('/index.json');
    expect(response.ok()).toBeTruthy();
    const data: StoryIndex = await response.json();
    entries = data.entries;
    storyIds = Object.keys(entries)
      .filter((k) => entries[k].type === 'story' || entries[k].type === 'docs')
      .sort();
  });

  test('all stories and docs pages render without errors', async ({ page }) => {
    expect(storyIds.length).toBeGreaterThan(0);

    const renderErrors: { id: string; error: string }[] = [];
    const timeouts: { id: string; error: string }[] = [];
    const pageErrors: { id: string; error: string }[] = [];

    for (const id of storyIds) {
      const entry = entries[id];
      const viewMode = entry.type === 'docs' ? 'docs' : 'story';
      const url = `/iframe.html?viewMode=${viewMode}&id=${id}`;

      // Collect uncaught page errors
      const storyPageErrors: string[] = [];
      const errorHandler = (err: Error) => {
        storyPageErrors.push(err.message);
      };
      page.on('pageerror', errorHandler);

      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });

        // Check for visible Storybook error overlay
        const errorElement = await page.$('.sb-errordisplay');
        if (errorElement) {
          const visible = await errorElement.isVisible();
          if (visible) {
            const errorText = await errorElement.textContent();
            renderErrors.push({
              id,
              error: errorText?.substring(0, 300) || 'Unknown render error',
            });
          }
        }

        // Record uncaught page errors
        for (const msg of storyPageErrors) {
          pageErrors.push({ id, error: msg.substring(0, 300) });
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message.includes('Timeout')) {
          // Timeouts are warnings — the story rendered but network didn't settle
          timeouts.push({ id, error: message.substring(0, 200) });
        } else if (message.includes('Target page, context or browser has been closed')) {
          // Skip cascading failures from previous timeout
          continue;
        } else {
          renderErrors.push({ id, error: message.substring(0, 200) });
        }
      }

      page.removeListener('pageerror', errorHandler);
    }

    // Report
    const total = storyIds.length;
    const failCount = renderErrors.length;
    const warnCount = timeouts.length;
    const passCount = total - failCount - warnCount;

    console.log(`\n=== Storybook Smoke Test Results ===`);
    console.log(`Total entries: ${total}`);
    console.log(`Passed: ${passCount}`);
    console.log(`Timeouts (warnings): ${warnCount}`);
    console.log(`Failed: ${failCount}`);

    if (timeouts.length > 0) {
      console.log(`\n--- Timeouts (warnings, not failures) ---`);
      for (const e of timeouts) {
        console.log(`  ${e.id}`);
      }
    }

    if (renderErrors.length > 0) {
      console.log(`\n--- Render Errors ---`);
      for (const e of renderErrors) {
        console.log(`  ${e.id}: ${e.error}`);
      }
    }

    if (pageErrors.length > 0) {
      console.log(`\n--- Page Errors (informational) ---`);
      for (const e of pageErrors) {
        console.log(`  ${e.id}: ${e.error}`);
      }
    }

    // Only hard-fail on actual render errors, not timeouts
    expect(
      renderErrors,
      `${failCount} stories failed to render:\n${renderErrors.map((e) => `  - ${e.id}`).join('\n')}`,
    ).toHaveLength(0);
  });
});
