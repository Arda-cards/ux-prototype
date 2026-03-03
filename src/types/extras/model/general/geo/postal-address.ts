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
