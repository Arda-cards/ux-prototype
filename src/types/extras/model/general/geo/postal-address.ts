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
  | 'SV'
  | 'VN'
  | 'TH'
  | 'ID'
  | 'MY'
  | 'PH'
  | 'TW'
  | 'BD'
  | 'PK'
  | 'KH'
  | 'LK'
  | 'TR'
  | 'IL'
  | 'AE';

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
  VN: 'Vietnam',
  TH: 'Thailand',
  ID: 'Indonesia',
  MY: 'Malaysia',
  PH: 'Philippines',
  TW: 'Taiwan',
  BD: 'Bangladesh',
  PK: 'Pakistan',
  KH: 'Cambodia',
  LK: 'Sri Lanka',
  TR: 'Turkey',
  IL: 'Israel',
  AE: 'United Arab Emirates',
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
