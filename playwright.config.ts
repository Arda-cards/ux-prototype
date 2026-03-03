import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Visual Regression Testing (VRT).
 *
 * Runs against a pre-built Storybook served on localhost:6006.
 * Chromium-only; full-page screenshots compared against baseline
 * snapshots with a 1 % pixel-diff tolerance.
 */
export default defineConfig({
  testDir: './tests',
  outputDir: './tests/test-results',

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
      testDir: './tests/vrt',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 900 },
      },
    },
    {
      name: 'smoke',
      testDir: './tests/smoke',
      timeout: 300000, // 5 min — iterates all stories in a single test
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 900 },
      },
    },
  ],

  /* Snapshot configuration */
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05,
      animations: 'disabled',
    },
  },
});
