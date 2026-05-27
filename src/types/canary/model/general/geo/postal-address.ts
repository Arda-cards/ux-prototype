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
