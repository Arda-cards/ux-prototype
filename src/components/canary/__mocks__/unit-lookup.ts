import type { TypeaheadOption } from '@/components/canary/molecules/typeahead-input/typeahead-input';

/**
 * Lookup function that calls the MSW-mocked unit endpoint.
 * Matches the vendored `ardaClient.lookupUnits()` API shape.
 */
export async function lookupUnits(search: string): Promise<TypeaheadOption[]> {
  const params = new URLSearchParams({ name: search });
  const res = await fetch(`/api/arda/items/lookup-units?${params}`);
  const json = await res.json();
  const data: { eId: string; name: string }[] = json.data ?? [];
  return data.map((d) => ({ label: d.name, value: d.name }));
}
