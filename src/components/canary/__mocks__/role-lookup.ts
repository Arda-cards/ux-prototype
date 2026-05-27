import type { MultiSelectOption } from '@/components/canary/molecules/typeahead-input/multiselect-typeahead-input';

/**
 * Lookup function that calls the MSW-mocked role endpoint.
 */
export async function lookupRoles(search: string): Promise<MultiSelectOption[]> {
  const params = new URLSearchParams({ name: search });
  const res = await fetch(`/api/arda/business-affiliate/lookup-roles?${params}`);
  const json = await res.json();
  const data: { eId: string; name: string }[] = json.data ?? [];
  return data.map((d) => ({ label: d.name, value: d.name }));
}
