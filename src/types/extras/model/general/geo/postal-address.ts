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
