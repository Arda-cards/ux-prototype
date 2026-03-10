/**
 * Pauses between play-function steps so humans can follow the interaction.
 * Skips the delay when running under the Storybook test runner (Playwright)
 * to keep CI fast.
 *
 * Detection: `navigator.webdriver` is true when the browser is controlled by
 * WebDriver/CDP (Playwright, Puppeteer, Selenium), which is the case for
 * `test-storybook`. In a regular browser session it is false/undefined.
 */
export const storyStepDelay = (ms = 2000): Promise<void> => {
  if (typeof navigator !== 'undefined' && navigator.webdriver) {
    return Promise.resolve();
  }
  return new Promise((resolve) => setTimeout(resolve, ms));
};
