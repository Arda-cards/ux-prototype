import { HYPOTHESIS_GROUP, DEFAULT_TAG, ORIGIN_TAG, SELECTOR_TAG_PREFIX } from './constants';

/**
 * Agentation annotation schema v2 fields relevant to the bridge transform.
 */
export interface AgentationAnnotation {
  id: string;
  comment: string;
  elementPath: string;
  timestamp: number;
  x: number;
  y: number;
  element: string;
  url?: string;
  reactComponents?: string;
  cssClasses?: string;
  computedStyles?: string;
  accessibility?: string;
  nearbyText?: string;
  selectedText?: string;
  intent?: 'fix' | 'change' | 'question' | 'approve';
  severity?: 'blocking' | 'important' | 'suggestion';
  status?: string;
  thread?: Array<{ author: string; content: string; timestamp: number }>;
}

interface CssSelector {
  type: 'CssSelector';
  value: string;
}

interface TextQuoteSelector {
  type: 'TextQuoteSelector';
  exact: string;
}

type AnnotationSelector = CssSelector | TextQuoteSelector;

export interface HypothesisAnnotationPayload {
  uri: string;
  text: string;
  tags: string[];
  group: string;
  permissions: {
    read: string[];
  };
  target: Array<{
    source: string;
    selector?: AnnotationSelector[];
  }>;
  references?: string[];
}

/**
 * Normalize a Storybook iframe URL by stripping volatile query parameters
 * (globals, args) while preserving stable ones (id, viewMode).
 *
 * The Hypothesis sidebar resolves the document URI from the canonical link
 * or the page URL. We must ensure the URI we post matches what the sidebar
 * resolves. Storybook appends `globals=` when toggling addons like Agentation,
 * so we strip that. We keep `viewMode` because it's always present.
 */
export function normalizeStoryUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const storyId = parsed.searchParams.get('id');
    if (!storyId) {
      return `${parsed.origin}${parsed.pathname}`;
    }
    // Rebuild with only stable params
    const clean = new URL(parsed.origin + parsed.pathname);
    clean.searchParams.set('id', storyId);
    const viewMode = parsed.searchParams.get('viewMode');
    if (viewMode) {
      clean.searchParams.set('viewMode', viewMode);
    }
    return clean.toString();
  } catch {
    return url;
  }
}

/**
 * Build the Markdown text body for a Hypothesis annotation.
 */
function buildTextBody(annotation: AgentationAnnotation): string {
  const lines: string[] = [];

  // HTML comment for machine parsing by the highlight layer
  lines.push(`<!-- agentation:elementPath=${annotation.elementPath} -->`);
  lines.push('');
  lines.push(annotation.comment);
  lines.push('');
  lines.push('---');

  // Human-readable metadata block
  lines.push(`**Element:** \`${annotation.element}\``);

  if (annotation.reactComponents) {
    lines.push(`**Component:** \`${annotation.reactComponents}\``);
  }

  if (annotation.cssClasses) {
    lines.push(`**CSS Classes:** \`${annotation.cssClasses}\``);
  }

  const severityStr = annotation.severity ?? '';
  const intentStr = annotation.intent ?? '';

  const metaParts: string[] = [];
  if (severityStr) metaParts.push(`**Severity:** ${severityStr}`);
  if (intentStr) metaParts.push(`**Intent:** ${intentStr}`);
  if (metaParts.length > 0) {
    lines.push(metaParts.join(' | '));
  }

  return lines.join('\n');
}

/**
 * Build the tags array for a Hypothesis annotation.
 */
function buildTags(annotation: AgentationAnnotation): string[] {
  const tags: string[] = [DEFAULT_TAG, ORIGIN_TAG];

  // CSS selector tag for machine parsing
  tags.push(`${SELECTOR_TAG_PREFIX}${annotation.elementPath}`);

  if (annotation.intent) {
    tags.push(annotation.intent);
  }

  if (annotation.severity) {
    tags.push(annotation.severity);
  }

  return tags;
}

/**
 * Build the target array for a Hypothesis annotation.
 */
function buildTarget(
  annotation: AgentationAnnotation,
  uri: string,
): HypothesisAnnotationPayload['target'] {
  // A TextQuoteSelector is required for Hypothesis to anchor the annotation
  // and display it in the "Annotations" tab of the sidebar. Without it,
  // annotations are classified as "orphaned" and hidden.
  //
  // When anchorable text exists (selectedText or nearbyText), we create a
  // full target with both CssSelector (for our highlight layer) and
  // TextQuoteSelector (for Hypothesis anchoring).
  //
  // When no anchorable text exists, we create a page note (empty target)
  // which shows in the "Page Notes" tab of the sidebar. This is preferable
  // to creating an orphaned annotation that Hypothesis hides entirely.
  const quoteText = annotation.selectedText || annotation.nearbyText || '';
  if (quoteText) {
    const selectors: AnnotationSelector[] = [
      { type: 'CssSelector', value: annotation.elementPath },
      { type: 'TextQuoteSelector', exact: quoteText },
    ];
    return [{ source: uri, selector: selectors }];
  }

  // No anchorable text — create a page note (target with source, no selectors).
  // Page notes show in the "Page Notes" tab of the Hypothesis sidebar.
  // The element path is still available in the text body and tags for our highlight layer.
  return [{ source: uri }];
}

/**
 * Transform a single Agentation annotation into a Hypothesis annotation payload.
 */
export function transformAnnotation(
  annotation: AgentationAnnotation,
  storyUrl: string,
): HypothesisAnnotationPayload {
  const uri = normalizeStoryUrl(storyUrl);

  const payload: HypothesisAnnotationPayload = {
    uri,
    text: buildTextBody(annotation),
    tags: buildTags(annotation),
    group: HYPOTHESIS_GROUP,
    permissions: {
      read: [`group:${HYPOTHESIS_GROUP}`],
    },
    target: buildTarget(annotation, uri),
  };

  // Include thread references if the annotation is a reply
  if (annotation.thread && annotation.thread.length > 0) {
    payload.references = annotation.thread.map((msg) => msg.author);
  }

  return payload;
}

/**
 * Transform multiple Agentation annotations into Hypothesis annotation payloads.
 */
export function transformAnnotations(
  annotations: AgentationAnnotation[],
  storyUrl: string,
): HypothesisAnnotationPayload[] {
  return annotations.map((annotation) => transformAnnotation(annotation, storyUrl));
}
