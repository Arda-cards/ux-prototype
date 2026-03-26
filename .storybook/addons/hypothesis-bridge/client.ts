import { PROXY_BASE, HYPOTHESIS_API_BASE } from './constants';
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

/**
 * Hypothesis API token injected at build time via Vite `define`.
 * In local dev the proxy handles auth, so this may be empty.
 * In production (GitHub Pages) this is the primary auth mechanism.
 */
declare const __HYPOTHESIS_API_TOKEN__: string;

function getApiToken(): string {
  try {
    return typeof __HYPOTHESIS_API_TOKEN__ === 'string' ? __HYPOTHESIS_API_TOKEN__ : '';
  } catch {
    return '';
  }
}

/**
 * Determine whether to use the local dev proxy or the direct Hypothesis API.
 *
 * In local dev (Vite dev server), the proxy is available at `/hypothesis-proxy`.
 * In static builds (GitHub Pages, Vercel), there is no proxy — we call the
 * Hypothesis API directly using a build-time token for CORS-authenticated requests.
 */
function getBaseUrl(): string {
  // Static builds set import.meta.env.MODE to 'production'
  if (import.meta.env.MODE === 'production') {
    return HYPOTHESIS_API_BASE;
  }
  return PROXY_BASE;
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // In production, attach the token directly for CORS requests.
  // In dev, the proxy adds the Authorization header server-side.
  if (import.meta.env.MODE === 'production') {
    const token = getApiToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
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
    throw new Error(`Hypothesis API error ${response.status}: ${message}`);
  }
}

/**
 * Post an annotation to the Hypothesis API.
 * Uses the local proxy in dev, direct API in production.
 */
export async function postAnnotation(
  payload: HypothesisAnnotationPayload,
): Promise<HypothesisAnnotation> {
  const response = await fetch(`${getBaseUrl()}/annotations`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  await assertOk(response);
  return response.json() as Promise<HypothesisAnnotation>;
}

/**
 * Search for annotations via the Hypothesis API.
 * Uses the local proxy in dev, direct API in production.
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

  const response = await fetch(`${getBaseUrl()}/search?${query.toString()}`, {
    headers: getHeaders(),
  });

  await assertOk(response);
  return response.json() as Promise<SearchResult>;
}
