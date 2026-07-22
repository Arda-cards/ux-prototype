// Mirrored from `types/extras/model/general/geo/postal-address.ts` into the canary
// type tree so canary components depend only on canary (not extras). Shape matches
// the backend domain value object `cards.arda.common.lib.domain.general.geo.PostalAddress`.

export type CountrySymbol =
  | 'US'
  | 'CA'
  | 'DE'
  | 'EU'
  | 'GB'
  | 'JP'
  | 'AU'
  | 'CN'
  | 'IN'
  | 'RU'
  | 'BR'
  | 'ZA'
  | 'MX'
  | 'KR'
  | 'SG'
  | 'HK'
  | 'NZ'
  | 'CH'
  | 'SV';

/** All country symbols, e.g. for a select control. */
export const COUNTRY_SYMBOLS: readonly CountrySymbol[] = [
  'US',
  'CA',
  'DE',
  'EU',
  'GB',
  'JP',
  'AU',
  'CN',
  'IN',
  'RU',
  'BR',
  'ZA',
  'MX',
  'KR',
  'SG',
  'HK',
  'NZ',
  'CH',
  'SV',
];

/** Display names for the supported country symbols (selects, fuzzy search). */
export const COUNTRY_NAMES: Readonly<Record<CountrySymbol, string>> = {
  US: 'United States',
  CA: 'Canada',
  DE: 'Germany',
  EU: 'European Union',
  GB: 'United Kingdom',
  JP: 'Japan',
  AU: 'Australia',
  CN: 'China',
  IN: 'India',
  RU: 'Russia',
  BR: 'Brazil',
  ZA: 'South Africa',
  MX: 'Mexico',
  KR: 'South Korea',
  SG: 'Singapore',
  HK: 'Hong Kong',
  NZ: 'New Zealand',
  CH: 'Switzerland',
  SV: 'El Salvador',
};

export interface GeoLocation {
  latitude: number;
  longitude: number;
  elevation?: number;
}

export interface PostalAddress {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: CountrySymbol;
  geoLocation?: GeoLocation;
}

/** Loose subsequence match, e.g. "untd sts" → "united states". */
function isSubsequence(needle: string, haystack: string): boolean {
  let i = 0;
  for (const ch of haystack) {
    if (ch === needle[i]) i++;
    if (i === needle.length) return true;
  }
  return i === needle.length;
}

/**
 * Fuzzy country lookup for typeahead fields: prefix > substring > subsequence
 * over display names + symbols. Options are `{ label, value }` pairs
 * (structurally a `TypeaheadOption`).
 */
export async function lookupCountries(
  search: string,
): Promise<{ label: string; value: CountrySymbol }[]> {
  const q = search.trim().toLowerCase().replace(/\s+/g, ' ');
  const scored = COUNTRY_SYMBOLS.flatMap((sym) => {
    const name = COUNTRY_NAMES[sym];
    const hay = `${name} ${sym}`.toLowerCase();
    let score: number;
    if (!q) score = 0;
    else if (sym.toLowerCase() === q || hay.startsWith(q)) score = 3;
    else if (hay.includes(q)) score = 2;
    else if (isSubsequence(q.replace(/ /g, ''), hay)) score = 1;
    else return [];
    return [{ label: `${name} (${sym})`, value: sym, score }];
  });
  return scored
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
    .map(({ label, value }) => ({ label, value }));
}
