import { test, expect } from '@playwright/test';
import { disableAnimationsAndSettle } from '../vrt/vrt-helpers';

/**
 * Layout Integrity Tests — catch CSS regressions that leave elements
 * invisible even though they exist in the DOM.
 *
 * These tests guard against two known failure modes:
 *
 * 1. **Missing Tailwind class generation**: When Tailwind v4 doesn't scan
 *    gitignored directories (e.g., `src/vendored/`), responsive classes
 *    like `hidden md:block` have no generated CSS rules, so elements stay
 *    hidden at all viewport sizes.
 *
 * 2. **Flex-height chain breaks**: When a flex column ancestor lacks
 *    `min-h-0`, AG Grid's `height: 100%` resolves to 0px and rows
 *    become invisible despite existing in the DOM.
 *
 * Usage:
 *   npx playwright test --project=smoke tests/smoke/layout-integrity.spec.ts
 */

// Stories that contain a sidebar (nav menu) that should be visible at desktop width.
const SIDEBAR_STORIES = [
  { name: 'Dashboard',    id: 'dev-witness-home-dashboard--default' },
  { name: 'Items Grid',   id: 'dev-witness-reference-items-items-grid--default' },
  { name: 'Order Queue',  id: 'dev-witness-transactions-orders-order-queue--default' },
  { name: 'Receiving',    id: 'dev-witness-transactions-receiving--default' },
  { name: 'Suppliers',    id: 'use-cases-reference-business-affiliates-pages-suppliers-list-view--default' },
] as const;

// Stories that render an AG Grid with expected data rows.
const GRID_STORIES = [
  { name: 'Items Grid',     id: 'dev-witness-reference-items-items-grid--default',  minRows: 1 },
  { name: 'Suppliers Grid', id: 'use-cases-reference-business-affiliates-pages-suppliers-list-view--default', minRows: 1 },
] as const;

test.describe('Sidebar visibility', () => {
  for (const story of SIDEBAR_STORIES) {
    test(`${story.name}: sidebar navigation is visible`, async ({ page }) => {
      await page.goto(
        `/iframe.html?id=${story.id}&viewMode=story&globals=`,
        { waitUntil: 'networkidle', timeout: 30000 },
      );
      await disableAnimationsAndSettle(page);

      // The sidebar should be rendered and visible at desktop viewport (1280px).
      // It uses `hidden md:block` — if Tailwind classes aren't generated, it stays hidden.
      const sidebar = page.locator('[data-sidebar="sidebar"]');
      await expect(sidebar, 'Sidebar element should exist in the DOM').toHaveCount(1);

      const box = await sidebar.boundingBox();
      expect(box, 'Sidebar should have a visible bounding box (not display:none)').not.toBeNull();
      expect(box!.width).toBeGreaterThan(0);
      expect(box!.height).toBeGreaterThan(0);
    });
  }
});

test.describe('AG Grid data visibility', () => {
  for (const story of GRID_STORIES) {
    test(`${story.name}: grid rows are visible to the user`, async ({ page }) => {
      await page.goto(
        `/iframe.html?id=${story.id}&viewMode=story&globals=`,
        { waitUntil: 'networkidle', timeout: 30000 },
      );
      await disableAnimationsAndSettle(page);

      // Wait for AG Grid to render rows (MSW data may take a moment).
      const rows = page.locator('.ag-row');
      await expect(rows.first()).toBeAttached({ timeout: 10000 });

      const rowCount = await rows.count();
      expect(rowCount, `Expected at least ${story.minRows} AG Grid row(s)`).toBeGreaterThanOrEqual(
        story.minRows,
      );

      // Use elementFromPoint to verify grid data is actually visible to the user.
      // This catches the case where rows exist in the DOM but are invisible due
      // to a zero-height container clipping absolutely-positioned row elements.
      // We probe near the top of the grid body area to find a rendered row cell.
      const dataVisible = await page.evaluate(() => {
        const gridBody = document.querySelector('.ag-body-viewport');
        if (!gridBody) return { visible: false, reason: 'no .ag-body-viewport element' };

        const rect = gridBody.getBoundingClientRect();
        if (rect.height <= 0 || rect.width <= 0) {
          return { visible: false, reason: `body viewport has no size: ${rect.width}x${rect.height}` };
        }

        // Probe a point inside the grid body where the first data row should be.
        // Use center-x and a point ~30px below the top of the body (past any padding).
        const probeX = rect.left + rect.width / 2;
        const probeY = rect.top + Math.min(30, rect.height / 2);
        const el = document.elementFromPoint(probeX, probeY);

        if (!el) return { visible: false, reason: `no element at (${probeX}, ${probeY})` };

        // The element at this point should be inside an AG Grid row.
        const inRow = !!el.closest('.ag-row');
        return {
          visible: inRow,
          reason: inRow
            ? 'row cell found at probe point'
            : `element at probe is ${el.tagName}.${el.className.toString().substring(0, 80)}`,
        };
      });

      expect(
        dataVisible.visible,
        `AG Grid data should be visible to the user. ${dataVisible.reason}`,
      ).toBe(true);
    });
  }
});
