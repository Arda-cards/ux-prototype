import type { CompanyInformation } from '../../model/assets/company-information';
import type { Contact } from '../../model/assets/contact';
import type { PostalAddress } from '../../model/general/geo/postal-address';

export type BusinessRoleType = 'VENDOR' | 'CUSTOMER' | 'CARRIER' | 'OPERATOR' | 'OTHER';

export interface BusinessRole {
  eId?: string;
  name?: string;
  role: BusinessRoleType;
  notes?: string;
}

export interface BusinessAffiliate {
  eId: string;
  name: string;
  legal?: CompanyInformation;
  contact?: Contact;
  mainAddress?: PostalAddress;
  contacts?: Record<string, Contact>;
  addresses?: Record<string, PostalAddress>;
  roles: BusinessRole[];
  notes?: string;
}

export interface BusinessAffiliateRoleDetails {
  businessAffiliate: BusinessAffiliate;
  roles: BusinessRoleType[];
}
