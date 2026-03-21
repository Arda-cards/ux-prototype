/**
 * Pauses between play-function steps so humans can follow the interaction.
 * Skips the delay when running under the Storybook test runner (Playwright)
 * to keep CI fast.
 */
export const storyStepDelay = (ms = 2000): Promise<void> => {
  if (typeof navigator !== 'undefined' && navigator.webdriver) {
    return Promise.resolve();
  }
  return new Promise((resolve) => setTimeout(resolve, ms));
};
