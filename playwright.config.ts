import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Visual Regression Testing (VRT).
 *
 * Runs against a pre-built Storybook served on localhost:6006.
 * Chromium-only; full-page screenshots compared against baseline
 * snapshots with a 1 % pixel-diff tolerance.
 */
export default defineConfig({
  testDir: './tests/vrt',
  outputDir: './tests/vrt/test-results',

  /* Platform-independent snapshot names so baselines work on macOS and Linux. */
  snapshotPathTemplate:
    '{testDir}/{testFileDir}/__snapshots__/{arg}{ext}',

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* No retries — VRT flakes indicate real rendering variance. */
  retries: 0,

  /* Single worker keeps screenshot timing deterministic. */
  workers: 1,

  /* Reporter */
  reporter: process.env.CI ? 'github' : 'list',

  /* Shared settings for all projects. */
  use: {
    baseURL: 'http://localhost:6006',
    /* Collect trace on failure for debugging. */
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'vrt',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 900 },
      },
    },
  ],

  /* Snapshot configuration */
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
    },
  },
});
