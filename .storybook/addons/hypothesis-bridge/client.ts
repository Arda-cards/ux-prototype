import { PROXY_BASE } from './constants';
import type { HypothesisAnnotationPayload } from './transform';

export interface HypothesisAnnotation {
  id: string;
  uri: string;
  text: string;
  tags: string[];
  group: string;
  created: string;
  updated: string;
  target: Array<{
    source: string;
    selector?: Array<{ type: string; value?: string; exact?: string }>;
  }>;
}

export interface SearchResult {
  total: number;
  rows: HypothesisAnnotation[];
}

export interface SearchParams {
  uri: string;
  tag?: string;
  group?: string;
  limit?: number;
}

async function assertOk(response: Response): Promise<void> {
  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = (await response.json()) as { reason?: string };
      if (body.reason) {
        message = body.reason;
      }
    } catch {
      // Ignore JSON parse errors; use status text
    }
    throw new Error(`Hypothesis proxy error ${response.status}: ${message}`);
  }
}

/**
 * Post an annotation to the Hypothesis API via the local proxy.
 * Returns the created annotation (with `id` assigned by Hypothesis).
 */
export async function postAnnotation(
  payload: HypothesisAnnotationPayload,
): Promise<HypothesisAnnotation> {
  const response = await fetch(`${PROXY_BASE}/annotations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  await assertOk(response);
  return response.json() as Promise<HypothesisAnnotation>;
}

/**
 * Search for annotations via the local proxy.
 * Returns `{ total, rows }` from the Hypothesis search API.
 */
export async function searchAnnotations(params: SearchParams): Promise<SearchResult> {
  const query = new URLSearchParams();
  query.set('uri', params.uri);
  if (params.tag !== undefined) {
    query.set('tag', params.tag);
  }
  if (params.group !== undefined) {
    query.set('group', params.group);
  }
  if (params.limit !== undefined) {
    query.set('limit', String(params.limit));
  }

  const response = await fetch(`${PROXY_BASE}/search?${query.toString()}`);

  await assertOk(response);
  return response.json() as Promise<SearchResult>;
}
