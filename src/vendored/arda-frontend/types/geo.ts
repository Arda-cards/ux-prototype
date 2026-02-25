
export interface GeoLocation {
  readonly latitude: number;
  readonly longitude: number;
  readonly elevation?: number;
}
export type CountrySymbol =
  | "US"
  | "CA"
  | "EU"
  | "GB"
  | "JP"
  | "AU"
  | "CN"
  | "IN"
  | "RU"
  | "BR"
  | "ZA"
  | "MX"
  | "KR"
  | "SG"
  | "HK"
  | "NZ"
  | "CH";
export interface Country {
  symbol: CountrySymbol;
  name?: string;
}

export interface PostalAddress {
  readonly addressLine1: string
  readonly addressLine2?: string
  readonly city?: string
  readonly state?: string
  readonly postalCode?: string
  readonly country?: Country
  readonly geoLocation?: GeoLocation
}