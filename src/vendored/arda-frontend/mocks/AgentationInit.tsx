'use client';

import dynamic from 'next/dynamic';

const Agentation = dynamic(
  () => import('agentation').then((m) => m.Agentation ?? m.default),
  { ssr: false },
);

export function AgentationInit() {
  // Suppress in automated environments (Playwright, Selenium, etc.)
  // to prevent the toolbar from intercepting pointer events during E2E tests.
  // Must be synchronous — useEffect fires after the first render, allowing
  // the toolbar to briefly initialise and break click targets.
  if (typeof navigator !== 'undefined' && navigator.webdriver) {
    return null;
  }
  return <Agentation />;
}
