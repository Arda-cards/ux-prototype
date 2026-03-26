import { describe, it, expect, vi, beforeEach } from 'vitest';
import { postAnnotation, searchAnnotations } from '../client';
import { PROXY_BASE } from '../constants';
import type { HypothesisAnnotationPayload } from '../transform';

const mockPayload: HypothesisAnnotationPayload = {
  uri: 'http://localhost:6006/iframe.html?id=use-cases--story',
  text: 'Test annotation',
  tags: ['Forensic', 'agentation', 'selector:div.test'],
  group: 'e4e5jGAx',
  target: [
    {
      source: 'http://localhost:6006/iframe.html?id=use-cases--story',
      selector: [{ type: 'CssSelector', value: 'div.test' }],
    },
  ],
};

const mockCreatedAnnotation = {
  id: 'abc123',
  uri: mockPayload.uri,
  text: mockPayload.text,
  tags: mockPayload.tags,
  group: mockPayload.group,
  created: '2024-01-01T00:00:00Z',
  updated: '2024-01-01T00:00:00Z',
  target: mockPayload.target,
};

describe('postAnnotation', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('sends a POST request to the proxy annotations endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCreatedAnnotation),
    });
    vi.stubGlobal('fetch', fetchMock);

    await postAnnotation(mockPayload);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${PROXY_BASE}/annotations`);
    expect(options.method).toBe('POST');
    expect((options.headers as Record<string, string>)['Content-Type']).toBe('application/json');
    expect(options.body).toBe(JSON.stringify(mockPayload));
  });

  it('returns the created annotation with id assigned by Hypothesis', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCreatedAnnotation),
      }),
    );

    const result = await postAnnotation(mockPayload);
    expect(result.id).toBe('abc123');
    expect(result.uri).toBe(mockPayload.uri);
  });

  it('throws on non-2xx HTTP responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ reason: 'Invalid token' }),
      }),
    );

    await expect(postAnnotation(mockPayload)).rejects.toThrow('401');
  });
});

describe('searchAnnotations', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('sends a GET request to the proxy search endpoint with query params', async () => {
    const mockResponse = { total: 2, rows: [mockCreatedAnnotation] };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });
    vi.stubGlobal('fetch', fetchMock);

    await searchAnnotations({
      uri: 'http://localhost:6006/iframe.html?id=story',
      tag: 'agentation',
      group: 'e4e5jGAx',
      limit: 50,
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toContain(`${PROXY_BASE}/search`);
    expect(url).toContain('uri=');
    expect(url).toContain('tag=agentation');
    expect(url).toContain('group=e4e5jGAx');
    expect(url).toContain('limit=50');
  });

  it('returns parsed total and rows from the response', async () => {
    const mockResponse = { total: 1, rows: [mockCreatedAnnotation] };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      }),
    );

    const result = await searchAnnotations({ uri: mockPayload.uri });
    expect(result.total).toBe(1);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.id).toBe('abc123');
  });

  it('URL-encodes special characters in URI and tag parameters', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ total: 0, rows: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const uriWithSpecialChars = 'http://localhost:6006/iframe.html?id=story&args=foo%3Dbar';
    await searchAnnotations({ uri: uriWithSpecialChars, tag: 'selector:div > span' });

    const [url] = fetchMock.mock.calls[0] as [string];
    // The URL must not contain raw & in the uri value or unencoded > in the tag
    const parsedUrl = new URL(url, 'http://localhost');
    expect(parsedUrl.searchParams.get('uri')).toBe(uriWithSpecialChars);
    expect(parsedUrl.searchParams.get('tag')).toBe('selector:div > span');
  });
});
