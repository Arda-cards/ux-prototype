import { describe, it, expect } from 'vitest';
import {
  transformAnnotation,
  transformAnnotations,
  normalizeStoryUrl,
  type AgentationAnnotation,
} from '../transform';
import { DEFAULT_TAG, ORIGIN_TAG, SELECTOR_TAG_PREFIX, HYPOTHESIS_GROUP } from '../constants';

const baseAnnotation: AgentationAnnotation = {
  id: 'ann_abc123',
  comment: 'The button text is truncated on narrow viewports',
  elementPath: 'div.container > form > button.primary-action',
  timestamp: 1711000000000,
  x: 50,
  y: 200,
  element: 'button',
  url: 'http://localhost:6006/iframe.html?id=use-cases-receiving--stepwise&viewMode=story',
  reactComponents: 'App > Dashboard > ActionPanel > SubmitButton',
  cssClasses: 'primary-action btn-lg',
  intent: 'fix',
  severity: 'important',
  selectedText: 'Subm...',
};

const storyUrl =
  'http://localhost:6006/iframe.html?id=use-cases-receiving--stepwise&viewMode=story&args={}';

describe('normalizeStoryUrl', () => {
  it('strips volatile query params and retains id and viewMode', () => {
    const result = normalizeStoryUrl(storyUrl);
    expect(result).toBe(
      'http://localhost:6006/iframe.html?id=use-cases-receiving--stepwise&viewMode=story',
    );
    expect(result).not.toContain('args');
  });

  it('handles URLs without id param gracefully', () => {
    const result = normalizeStoryUrl('http://localhost:6006/iframe.html?viewMode=story');
    expect(result).toBe('http://localhost:6006/iframe.html');
  });

  it('returns the url unchanged when it cannot be parsed', () => {
    const malformed = 'not-a-url';
    const result = normalizeStoryUrl(malformed);
    expect(result).toBe(malformed);
  });
});

describe('transformAnnotation', () => {
  it('maps all required fields to the Hypothesis payload', () => {
    const payload = transformAnnotation(baseAnnotation, storyUrl);

    expect(payload.uri).toBe(
      'http://localhost:6006/iframe.html?id=use-cases-receiving--stepwise&viewMode=story',
    );
    expect(payload.group).toBe(HYPOTHESIS_GROUP);
    expect(payload.permissions.read).toContain(`group:${HYPOTHESIS_GROUP}`);
    expect(typeof payload.text).toBe('string');
    expect(payload.text.length).toBeGreaterThan(0);
    expect(Array.isArray(payload.tags)).toBe(true);
    expect(Array.isArray(payload.target)).toBe(true);
    expect(payload.target.length).toBeGreaterThan(0);
  });

  it('always includes the Forensic tag', () => {
    const payload = transformAnnotation(baseAnnotation, storyUrl);
    expect(payload.tags).toContain(DEFAULT_TAG);
  });

  it('always includes the agentation origin tag', () => {
    const payload = transformAnnotation(baseAnnotation, storyUrl);
    expect(payload.tags).toContain(ORIGIN_TAG);
  });

  it('generates a selector: tag from elementPath', () => {
    const payload = transformAnnotation(baseAnnotation, storyUrl);
    const selectorTag = `${SELECTOR_TAG_PREFIX}${baseAnnotation.elementPath}`;
    expect(payload.tags).toContain(selectorTag);
  });

  it('includes intent and severity tags', () => {
    const payload = transformAnnotation(baseAnnotation, storyUrl);
    expect(payload.tags).toContain('fix');
    expect(payload.tags).toContain('important');
  });

  it('formats the Markdown text body with HTML comment and metadata block', () => {
    const payload = transformAnnotation(baseAnnotation, storyUrl);
    expect(payload.text).toContain(`<!-- agentation:elementPath=${baseAnnotation.elementPath} -->`);
    expect(payload.text).toContain(baseAnnotation.comment);
    expect(payload.text).toContain('---');
    expect(payload.text).toContain('**Element:**');
    expect(payload.text).toContain('**Severity:** important');
    expect(payload.text).toContain('**Intent:** fix');
  });

  it('normalizes the story URL in the payload, keeping viewMode', () => {
    const payload = transformAnnotation(baseAnnotation, storyUrl);
    expect(payload.uri).toContain('viewMode=story');
    expect(payload.uri).toContain('id=use-cases-receiving--stepwise');
    expect(payload.uri).not.toContain('args');
  });

  it('omits TextQuoteSelector when selectedText is absent', () => {
    const annotation: AgentationAnnotation = { ...baseAnnotation };
    delete (annotation as Partial<AgentationAnnotation>).selectedText;
    // Also remove nearbyText to trigger page note fallback
    delete (annotation as Partial<AgentationAnnotation>).nearbyText;
    const payload = transformAnnotation(annotation, storyUrl);
    // Without text, this becomes a page note (target with source but no selectors)
    const selectors = payload.target[0]?.selector ?? [];
    const tqSelectors = selectors.filter((s) => s.type === 'TextQuoteSelector');
    expect(tqSelectors).toHaveLength(0);
  });

  it('includes TextQuoteSelector when selectedText is present', () => {
    const payload = transformAnnotation(baseAnnotation, storyUrl);
    const selectors = payload.target[0]?.selector ?? [];
    const tqSelector = selectors.find((s) => s.type === 'TextQuoteSelector');
    expect(tqSelector).toBeDefined();
    expect((tqSelector as { type: string; exact?: string }).exact).toBe(
      baseAnnotation.selectedText,
    );
  });

  it('creates a page note when no anchorable text is available', () => {
    const minimalAnnotation: AgentationAnnotation = {
      id: 'ann_min',
      comment: 'Minimal annotation',
      elementPath: 'div',
      timestamp: 1711000000000,
      x: 0,
      y: 0,
      element: 'div',
    };

    const payload = transformAnnotation(minimalAnnotation, storyUrl);
    expect(payload.tags).toContain(DEFAULT_TAG);
    expect(payload.tags).toContain(ORIGIN_TAG);
    // No intent or severity tags
    expect(payload.tags).not.toContain('fix');
    expect(payload.tags).not.toContain('blocking');
    expect(payload.text).not.toContain('**Component:**');
    expect(payload.text).not.toContain('**CSS Classes:**');
    // Page note: target has source but no selectors
    expect(payload.target.length).toBe(1);
    expect(payload.target[0]?.selector).toBeUndefined();
  });

  it('transforms multiple annotations as a batch', () => {
    const secondAnnotation: AgentationAnnotation = {
      ...baseAnnotation,
      id: 'ann_def456',
      comment: 'Second annotation',
      elementPath: 'header > nav > a',
      element: 'a',
    };

    const payloads = transformAnnotations([baseAnnotation, secondAnnotation], storyUrl);
    expect(payloads).toHaveLength(2);
    expect(payloads[0]?.tags).toContain(`${SELECTOR_TAG_PREFIX}${baseAnnotation.elementPath}`);
    expect(payloads[1]?.tags).toContain(`${SELECTOR_TAG_PREFIX}${secondAnnotation.elementPath}`);
  });
});
