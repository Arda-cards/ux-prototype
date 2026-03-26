import { describe, it, expect } from 'vitest';
import {
  parseSelectorTag,
  getSeverityColor,
  getIntent,
  getSeverity,
  filterAgentationAnnotations,
  parseElementPathFromComment,
  normalizeStoryUrl,
} from '../highlight-utils';
import type { HypothesisAnnotation } from '../client';

function makeAnnotation(tags: string[], text = ''): HypothesisAnnotation {
  return {
    id: 'ann_test',
    uri: 'http://localhost:6006/iframe.html?id=story',
    text,
    tags,
    group: 'e4e5jGAx',
    created: '2024-01-01T00:00:00Z',
    updated: '2024-01-01T00:00:00Z',
    target: [{ source: 'http://localhost:6006/iframe.html?id=story' }],
  };
}

describe('parseSelectorTag', () => {
  it('extracts the CSS selector from a selector: tag', () => {
    const tags = ['Forensic', 'agentation', 'selector:div.container > form > button'];
    expect(parseSelectorTag(tags)).toBe('div.container > form > button');
  });

  it('returns null when no selector: tag is present', () => {
    const tags = ['Forensic', 'agentation', 'blocking'];
    expect(parseSelectorTag(tags)).toBeNull();
  });
});

describe('getSeverityColor', () => {
  it('maps blocking to red', () => {
    expect(getSeverityColor(['blocking'])).toBe('#ef4444');
  });

  it('maps important to orange', () => {
    expect(getSeverityColor(['important'])).toBe('#f97316');
  });

  it('maps suggestion to blue', () => {
    expect(getSeverityColor(['suggestion'])).toBe('#3b82f6');
  });

  it('returns default gray for unrecognized severity', () => {
    const color = getSeverityColor(['Forensic', 'agentation', 'fix']);
    expect(color).toBe('#6b7280');
  });
});

describe('filterAgentationAnnotations', () => {
  it('keeps only annotations that have the agentation tag', () => {
    const annotations: HypothesisAnnotation[] = [
      makeAnnotation(['Forensic', 'agentation', 'blocking']),
      makeAnnotation(['Forensic', 'manually-created']),
      makeAnnotation(['agentation', 'suggestion']),
    ];

    const filtered = filterAgentationAnnotations(annotations);
    expect(filtered).toHaveLength(2);
    expect(filtered.every((a) => a.tags.includes('agentation'))).toBe(true);
  });
});

describe('getSeverity', () => {
  it('extracts severity from a mixed tag array', () => {
    expect(getSeverity(['Forensic', 'agentation', 'fix', 'important'])).toBe('important');
    expect(getSeverity(['Forensic', 'agentation', 'blocking'])).toBe('blocking');
    expect(getSeverity(['Forensic', 'agentation', 'suggestion', 'change'])).toBe('suggestion');
  });

  it('returns null when no severity tag is present', () => {
    expect(getSeverity(['Forensic', 'agentation', 'fix'])).toBeNull();
  });
});

describe('getIntent', () => {
  it('extracts intent from a mixed tag array', () => {
    expect(getIntent(['Forensic', 'agentation', 'fix', 'important'])).toBe('fix');
    expect(getIntent(['change', 'suggestion'])).toBe('change');
    expect(getIntent(['question'])).toBe('question');
    expect(getIntent(['approve', 'important'])).toBe('approve');
  });

  it('returns null when no intent tag is present', () => {
    expect(getIntent(['Forensic', 'agentation', 'blocking'])).toBeNull();
  });
});

describe('normalizeStoryUrl', () => {
  it('strips volatile params and retains id', () => {
    const url =
      'http://localhost:6006/iframe.html?id=use-cases-receiving--stepwise&viewMode=story&args={}';
    const normalized = normalizeStoryUrl(url);
    expect(normalized).toBe(
      'http://localhost:6006/iframe.html?id=use-cases-receiving--stepwise&viewMode=story',
    );
  });
});

describe('parseElementPathFromComment', () => {
  it('extracts elementPath from an HTML comment in the annotation text', () => {
    const text =
      '<!-- agentation:elementPath=div.container > form > button.primary-action -->\n\nComment text';
    expect(parseElementPathFromComment(text)).toBe('div.container > form > button.primary-action');
  });

  it('returns null when no HTML comment is present', () => {
    const text = 'Plain annotation without a comment';
    expect(parseElementPathFromComment(text)).toBeNull();
  });
});
