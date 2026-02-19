import React from 'react';
import type { DecoratorFunction } from 'storybook/internal/types';
import type { ReactRenderer } from '@storybook/react-vite';
import { Agentation } from 'agentation';
import { PARAM_KEY } from './constants';

export const withAgentation: DecoratorFunction<ReactRenderer> = (StoryFn, context) => {
  const isActive = !!context.globals[PARAM_KEY];

  return (
    <>
      <StoryFn />
      {isActive && (
        <Agentation
          submitLabel="Copy JSON"
          onSubmit={(json) => navigator.clipboard.writeText(json)}
          onCopy={(markdown) => navigator.clipboard.writeText(markdown)}
          copyToClipboard
          // endpoint="http://localhost:4747"  // future MCP integration
          // sessionId=""                       // future MCP integration
        />
      )}
    </>
  );
};
