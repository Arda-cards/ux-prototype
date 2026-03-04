import { test, expect } from '@playwright/test';
import { disableAnimationsAndSettle } from './vrt-helpers';

/**
 * Canary Refactor parity tests.
 *
 * For each Canary Refactor story, two baseline screenshots are committed:
 *   <name>--dev-witness.png  — the Dev Witness reference (production vendored code)
 *   <name>--canary.png       — the Canary Refactor equivalent (library components)
 *
 * Both baselines are independently regression-tested on every CI run.
 * A reviewer can diff the two PNGs side-by-side to inspect intentional
 * deviations (documented in each story's JSDoc comment).
 *
 * To regenerate baselines after intentional changes:
 *   ./tools/generate-vrt-baselines.sh
 *
 * Story ID format: Storybook lowercases the title path and joins with
 * double hyphens for the group separator and single hyphens within words.
 * Example: "Canary Refactor/Reference/Items/Item Detail"
 *       -> "canary-refactor-reference-items-item-detail--default"
 */

const PAIRS = [
  {
    name: 'item-detail',
    label: 'Item Detail',
    devWitnessId: 'dev-witness-reference-items-item-detail--default',
    canaryId: 'canary-refactor-reference-items-item-detail--default',
  },
] as const;

for (const pair of PAIRS) {
  test(`Canary parity: ${pair.label} — Dev Witness`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=${pair.devWitnessId}&viewMode=story&globals=`,
      { waitUntil: 'networkidle' },
    );
    await disableAnimationsAndSettle(page);
    await expect(page).toHaveScreenshot(`${pair.name}--dev-witness.png`, {
      fullPage: true,
    });
  });

  test(`Canary parity: ${pair.label} — Canary Refactor`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=${pair.canaryId}&viewMode=story&globals=`,
      { waitUntil: 'networkidle' },
    );
    await disableAnimationsAndSettle(page);
    await expect(page).toHaveScreenshot(`${pair.name}--canary.png`, {
      fullPage: true,
    });
  });
}
