import React, { useEffect, useRef, useState, useCallback } from 'react';
import { searchAnnotations } from './client';
import type { HypothesisAnnotation } from './client';
import {
  parseSelectorTag,
  getSeverityColor,
  getSeverity,
  getIntent,
  filterAgentationAnnotations,
} from './highlight-utils';

interface BadgePosition {
  top: number;
  left: number;
}

interface BadgeInfo {
  annotation: HypothesisAnnotation;
  position: BadgePosition;
  index: number;
  selector: string;
}

interface TooltipState {
  visible: boolean;
  badgeIndex: number;
  x: number;
  y: number;
}

interface HighlightLayerProps {
  storyUrl: string;
}

// Annotation cache keyed by normalized URL to avoid redundant fetches
const annotationCache = new Map<string, HypothesisAnnotation[]>();

/**
 * Compute badge positions for all annotations that can be resolved to DOM elements.
 */
function computeBadges(annotations: HypothesisAnnotation[]): BadgeInfo[] {
  const badges: BadgeInfo[] = [];
  let index = 1;

  for (const annotation of annotations) {
    const selector = parseSelectorTag(annotation.tags);
    if (!selector) continue;

    const element = document.querySelector(selector);
    if (!element) continue;

    const rect = element.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    badges.push({
      annotation,
      position: {
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft + rect.width - 12, // top-right corner
      },
      index,
      selector,
    });
    index++;
  }

  return badges;
}

/**
 * HighlightLayer renders numbered badge overlays for annotations sourced from Hypothesis.
 * It is rendered by the `withHighlights` Storybook decorator on every story.
 * When no annotations exist for the current story URL, nothing is rendered.
 */
export function HighlightLayer({ storyUrl }: HighlightLayerProps): React.ReactElement | null {
  const normalizedUrl = storyUrl;
  const [badges, setBadges] = useState<BadgeInfo[]>([]);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    badgeIndex: -1,
    x: 0,
    y: 0,
  });
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const mutationObserverRef = useRef<MutationObserver | null>(null);
  const annotationsRef = useRef<HypothesisAnnotation[]>([]);

  const refreshBadges = useCallback(() => {
    setBadges(computeBadges(annotationsRef.current));
  }, []);

  const fetchAndRender = useCallback(async () => {
    let annotations: HypothesisAnnotation[];

    const cached = annotationCache.get(normalizedUrl);
    if (cached) {
      annotations = cached;
    } else {
      try {
        const result = await searchAnnotations({ uri: normalizedUrl, tag: 'agentation' });
        annotations = filterAgentationAnnotations(result.rows);
        annotationCache.set(normalizedUrl, annotations);
      } catch {
        // Silently fail — Hypothesis may not be configured in all environments
        return;
      }
    }

    annotationsRef.current = annotations;
    refreshBadges();
  }, [normalizedUrl, refreshBadges]);

  // Initial fetch and event listener for updates
  useEffect(() => {
    void fetchAndRender();

    const handleUpdate = () => {
      // Clear cache for current URL so we get fresh data
      annotationCache.delete(normalizedUrl);
      void fetchAndRender();
    };

    // Refresh when the bridge posts new annotations
    window.addEventListener('hypothesis-annotations-updated', handleUpdate);

    // Refresh when the page becomes visible again (e.g., after using the
    // Hypothesis sidebar to delete or reply to annotations). This picks up
    // deletions without requiring a full page reload.
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        handleUpdate();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Also refresh on focus (covers switching between sidebar iframe and page)
    window.addEventListener('focus', handleUpdate);

    return () => {
      window.removeEventListener('hypothesis-annotations-updated', handleUpdate);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleUpdate);
    };
  }, [fetchAndRender, normalizedUrl]);

  // ResizeObserver to reposition badges when viewport changes
  useEffect(() => {
    resizeObserverRef.current = new ResizeObserver(() => {
      refreshBadges();
    });
    resizeObserverRef.current.observe(document.body);

    return () => {
      resizeObserverRef.current?.disconnect();
    };
  }, [refreshBadges]);

  // MutationObserver to reposition badges when DOM changes
  useEffect(() => {
    mutationObserverRef.current = new MutationObserver(() => {
      refreshBadges();
    });
    mutationObserverRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    return () => {
      mutationObserverRef.current?.disconnect();
    };
  }, [refreshBadges]);

  if (badges.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 100000,
      }}
    >
      {badges.map((badge) => {
        const color = getSeverityColor(badge.annotation.tags);
        const severity = getSeverity(badge.annotation.tags);
        const intent = getIntent(badge.annotation.tags);
        const isTooltipVisible = tooltip.visible && tooltip.badgeIndex === badge.index;

        return (
          <React.Fragment key={badge.annotation.id}>
            <div
              style={{
                position: 'absolute',
                top: badge.position.top,
                left: badge.position.left,
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: color,
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 'bold',
                fontFamily: 'sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'auto',
                cursor: 'pointer',
                zIndex: 100000,
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                userSelect: 'none',
              }}
              onMouseEnter={(e) => {
                setTooltip({
                  visible: true,
                  badgeIndex: badge.index,
                  x: e.clientX + 8,
                  y: e.clientY + 8,
                });
              }}
              onMouseMove={(e) => {
                setTooltip((prev) => ({ ...prev, x: e.clientX + 8, y: e.clientY + 8 }));
              }}
              onMouseLeave={() => {
                setTooltip({ visible: false, badgeIndex: -1, x: 0, y: 0 });
              }}
            >
              {badge.index}
            </div>
            {isTooltipVisible && (
              <div
                style={{
                  position: 'fixed',
                  top: tooltip.y,
                  left: tooltip.x,
                  maxWidth: 300,
                  backgroundColor: '#1e1e2e',
                  color: '#cdd6f4',
                  fontSize: '12px',
                  fontFamily: 'sans-serif',
                  lineHeight: '1.5',
                  padding: '8px 10px',
                  borderRadius: 6,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  pointerEvents: 'none',
                  zIndex: 100001,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {severity && (
                  <div style={{ marginBottom: 4 }}>
                    <span
                      style={{
                        backgroundColor: color,
                        color: '#fff',
                        borderRadius: 3,
                        padding: '1px 6px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        marginRight: 6,
                      }}
                    >
                      {severity}
                    </span>
                    {intent && <span style={{ fontSize: '10px', opacity: 0.7 }}>{intent}</span>}
                  </div>
                )}
                <div>
                  {badge.annotation.text
                    .split('---')[0]
                    ?.replace(/<!--.*?-->/gs, '')
                    .trim()}
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
