import type { KanbanCardResult } from '@frontend/types/kanban';

/**
 * Extracts kanban card records from an ARDA API response body.
 *
 * The backend may return records in one of several envelope formats:
 *   1. data.data.records
 *   2. data.data.data.records  (nested)
 *   3. data.data               (direct array)
 *   4. data.data.results
 *   5. data.results            (top-level)
 *
 * Returns the records array, or an empty array if none is found.
 */
export function extractKanbanRecords(data: unknown): KanbanCardResult[] {
  if (!data || typeof data !== 'object') return [];
  const body = data as Record<string, unknown>;

  // Format 3: data.data is a direct array
  if (Array.isArray(body.data)) return body.data as KanbanCardResult[];

  // Format 5: top-level data.results
  if (Array.isArray(body.results)) return body.results as KanbanCardResult[];

  if (body.data && typeof body.data === 'object') {
    const inner = body.data as Record<string, unknown>;

    // Format 1: data.data.records
    if (Array.isArray(inner.records)) return inner.records as KanbanCardResult[];

    // Format 4: data.data.results
    if (Array.isArray(inner.results)) return inner.results as KanbanCardResult[];

    // Format 2: data.data.data.records
    if (inner.data && typeof inner.data === 'object') {
      const nested = inner.data as Record<string, unknown>;
      if (Array.isArray(nested.records)) return nested.records as KanbanCardResult[];
    }
  }

  return [];
}
