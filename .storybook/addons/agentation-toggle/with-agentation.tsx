import React from 'react';
import type { DecoratorFunction } from 'storybook/internal/types';
import type { ReactRenderer } from '@storybook/react-vite';
import { Agentation, loadAnnotations, saveAnnotations } from 'agentation';
import type { Annotation } from 'agentation';
import { PARAM_KEY } from './constants';
import type { AgentationAnnotation } from '../hypothesis-bridge/transform';
import { transformAnnotations } from '../hypothesis-bridge/transform';
import { postAnnotation } from '../hypothesis-bridge/client';

// Track annotation IDs that have already been posted to prevent duplicates
const postedIds = new Set<string>();

async function postToHypothesis(): Promise<void> {
  const pathname = window.location.pathname;
  const annotations = loadAnnotations<Annotation>(pathname);

  // Filter out already-posted annotations
  const newAnnotations = annotations.filter((a) => !postedIds.has(a.id));
  if (newAnnotations.length === 0) {
    console.info('[hypothesis-bridge] No new annotations to post');
    return;
  }

  // Clear localStorage IMMEDIATELY to prevent Agentation from re-persisting
  // before the async POST completes. Mark IDs as posted.
  for (const a of newAnnotations) postedIds.add(a.id);
  saveAnnotations(pathname, []);

  const storyUrl = window.location.href;

  // Enrich each annotation with live DOM text for Hypothesis anchoring.
  // Hypothesis requires a TextQuoteSelector to display annotations in the
  // sidebar — without it, annotations are orphaned and hidden.
  //
  // IMPORTANT: Only use text from the story content (#storybook-root),
  // not from Storybook UI (controls panel, toolbars, etc.) which may
  // not be present after reload.
  const enriched = (newAnnotations as unknown as AgentationAnnotation[]).map((a) => {
    if (a.selectedText) return a;
    if (a.nearbyText && a.nearbyText.trim()) return a;

    try {
      const el = a.elementPath ? document.querySelector(a.elementPath) : null;
      if (!el) return a;

      // Only use text from inside the story root, not Storybook UI
      const storyRoot = document.getElementById('storybook-root');
      if (!storyRoot || !storyRoot.contains(el)) return a;

      // Walk up from element to storyRoot looking for visible text
      let current: Element | null = el;
      while (current && storyRoot.contains(current)) {
        const text = current.textContent?.trim();
        if (text) return { ...a, nearbyText: text.slice(0, 200) };
        current = current.parentElement;
      }
    } catch {
      // querySelector may throw on invalid selectors; ignore
    }
    return a;
  });
  const payloads = transformAnnotations(enriched, storyUrl);

  try {
    await Promise.all(payloads.map((p) => postAnnotation(p)));
    // Trigger highlight layer refresh
    window.dispatchEvent(new CustomEvent('hypothesis-annotations-updated'));
    console.info(`[hypothesis-bridge] Posted ${payloads.length} annotation(s) to Hypothesis`);
    // Cycle the Agentation overlay off then on to clear badges and React state.
    // The brief unmount/remount resets the component without losing the toolbar toggle.
    try {
      const channel = (window as unknown as Record<string, unknown>)
        .__STORYBOOK_ADDONS_CHANNEL__ as
        | { emit: (event: string, data: unknown) => void }
        | undefined;
      if (channel) {
        channel.emit('updateGlobals', { globals: { [PARAM_KEY]: false } });
        setTimeout(() => {
          channel.emit('updateGlobals', { globals: { [PARAM_KEY]: true } });
        }, 300);
      }
    } catch {
      // Channel may not be available; ignore
    }
  } catch (err) {
    console.error('[hypothesis-bridge] Failed to post to Hypothesis:', err);
  }
}

export const withAgentation: DecoratorFunction<ReactRenderer> = (StoryFn, context) => {
  const isActive = !!context.globals[PARAM_KEY];

  return (
    <>
      <StoryFn />
      {isActive && (
        <Agentation
          onCopy={() => {
            void postToHypothesis();
          }}
          copyToClipboard
        />
      )}
    </>
  );
};
