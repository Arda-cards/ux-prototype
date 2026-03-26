import React from 'react';
import type { DecoratorFunction } from 'storybook/internal/types';
import type { ReactRenderer } from '@storybook/react-vite';
import { HighlightLayer } from './highlight-layer';
import { normalizeStoryUrl } from './transform';

export const withHighlights: DecoratorFunction<ReactRenderer> = (StoryFn) => {
  // Use the same normalized URL that the bridge posts with, so the search matches.
  const storyUrl = normalizeStoryUrl(window.location.href);
  return (
    <>
      <StoryFn />
      <HighlightLayer storyUrl={storyUrl} />
    </>
  );
};
