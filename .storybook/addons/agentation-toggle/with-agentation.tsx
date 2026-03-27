import React, { useState, useCallback } from 'react';
import type { DecoratorFunction } from 'storybook/internal/types';
import type { ReactRenderer } from '@storybook/react-vite';
import { Agentation, loadAnnotations, saveAnnotations } from 'agentation';
import type { Annotation } from 'agentation';
import { PARAM_KEY } from './constants';
import type { AgentationAnnotation } from '../hypothesis-bridge/transform';
import { transformAnnotations } from '../hypothesis-bridge/transform';
import { postAnnotation } from '../hypothesis-bridge/client';
import { hasToken, clearToken } from '../hypothesis-bridge/token-store';
import { HypothesisLogin } from '../hypothesis-bridge/hypothesis-login';

// Track annotation IDs that have already been posted to prevent duplicates
const postedIds = new Set<string>();

/** True when running a production (static) build rather than the Vite dev server. */
const isProduction = import.meta.env.MODE === 'production';

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

function AgentationWrapper({ onCopy }: { onCopy: () => void }): React.ReactElement {
  const [showLogin, setShowLogin] = useState(() => isProduction && !hasToken());

  const handleCopy = useCallback(() => {
    // In production, ensure a token is present before posting
    if (isProduction && !hasToken()) {
      setShowLogin(true);
      return;
    }
    onCopy();
  }, [onCopy]);

  const handleSignOut = useCallback(() => {
    clearToken();
    setShowLogin(true);
  }, []);

  return (
    <>
      {showLogin && (
        <HypothesisLogin
          onAuthenticated={() => {
            setShowLogin(false);
            // Trigger highlight layer refresh now that we have a token
            window.dispatchEvent(new CustomEvent('hypothesis-annotations-updated'));
          }}
        />
      )}
      <Agentation onCopy={handleCopy} copyToClipboard />
      {isProduction && hasToken() && !showLogin && (
        <button
          type="button"
          onClick={handleSignOut}
          title="Disconnect Hypothesis token"
          style={{
            position: 'fixed',
            bottom: 12,
            right: 60,
            zIndex: 100000,
            padding: '4px 10px',
            fontSize: 11,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: '#6b7280',
            backgroundColor: '#f3f4f6',
            border: '1px solid #e5e7eb',
            borderRadius: 6,
            cursor: 'pointer',
            opacity: 0.7,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.7';
          }}
        >
          Disconnect Hypothesis
        </button>
      )}
    </>
  );
}

export const withAgentation: DecoratorFunction<ReactRenderer> = (StoryFn, context) => {
  const isActive = !!context.globals[PARAM_KEY];

  return (
    <>
      <StoryFn />
      {isActive && (
        <AgentationWrapper
          onCopy={() => {
            void postToHypothesis();
          }}
        />
      )}
    </>
  );
};
