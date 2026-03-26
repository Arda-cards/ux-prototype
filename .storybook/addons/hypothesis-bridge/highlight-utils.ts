import { ORIGIN_TAG, SELECTOR_TAG_PREFIX } from './constants';
import { normalizeStoryUrl } from './transform';
import type { HypothesisAnnotation } from './client';

// Re-export for use in tests and other modules
export { normalizeStoryUrl };

/**
 * Severity-to-color mapping for badge rendering.
 */
const SEVERITY_COLORS: Record<string, string> = {
  blocking: '#ef4444', // red-500
  important: '#f97316', // orange-500
  suggestion: '#3b82f6', // blue-500
};

const DEFAULT_BADGE_COLOR = '#6b7280'; // gray-500

/**
 * Extract the CSS selector from a `selector:<path>` tag, or return null if absent.
 */
export function parseSelectorTag(tags: string[]): string | null {
  const tag = tags.find((t) => t.startsWith(SELECTOR_TAG_PREFIX));
  if (!tag) return null;
  return tag.slice(SELECTOR_TAG_PREFIX.length);
}

/**
 * Map severity tags to a CSS color string.
 * Returns the default gray color if no recognized severity tag is present.
 */
export function getSeverityColor(tags: string[]): string {
  for (const tag of tags) {
    if (tag in SEVERITY_COLORS) {
      return SEVERITY_COLORS[tag] as string;
    }
  }
  return DEFAULT_BADGE_COLOR;
}

/**
 * Extract the intent value from a tags array.
 * Recognized intents: fix, change, question, approve.
 */
export function getIntent(tags: string[]): string | null {
  const intents = new Set(['fix', 'change', 'question', 'approve']);
  return tags.find((t) => intents.has(t)) ?? null;
}

/**
 * Extract the severity value from a tags array.
 * Recognized severities: blocking, important, suggestion.
 */
export function getSeverity(tags: string[]): string | null {
  const severities = new Set(['blocking', 'important', 'suggestion']);
  return tags.find((t) => severities.has(t)) ?? null;
}

/**
 * Filter annotations to only those created by the Agentation bridge
 * (those with the `agentation` origin tag).
 */
export function filterAgentationAnnotations(
  annotations: HypothesisAnnotation[],
): HypothesisAnnotation[] {
  return annotations.filter((a) => a.tags.includes(ORIGIN_TAG));
}

/**
 * Extract the elementPath value from an HTML comment embedded in the
 * annotation text body: `<!-- agentation:elementPath=<path> -->`.
 * Returns null if the comment is not present.
 */
export function parseElementPathFromComment(text: string): string | null {
  // Match <!-- agentation:elementPath=<path> --> where <path> may contain '>'
  // (e.g., CSS combinators). We capture everything up to the closing ' -->'.
  const match = /<!--\s*agentation:elementPath=(.*?)\s*-->/.exec(text);
  if (!match) return null;
  return match[1]?.trim() ?? null;
}
