import type { CountrySymbol } from '../general/geo/postal-address';

export interface CompanyInformation {
  name?: string;
  legalName?: string;
  country?: CountrySymbol;
  taxId?: string;
  registrationId?: string;
  naicsCode?: string;
}
