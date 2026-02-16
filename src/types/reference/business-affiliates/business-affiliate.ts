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

export const sampleAffiliates: BusinessAffiliate[] = [
  {
    eId: 'ba-001',
    name: 'Fastenal Corp.',
    legal: {
      name: 'Fastenal Corp.',
      legalName: 'Fastenal Company',
      country: 'US',
      taxId: '41-0948415',
    },
    roles: [{ role: 'VENDOR', notes: 'Primary MRO supplier' }, { role: 'CUSTOMER' }],
    contact: {
      firstName: 'Sarah',
      lastName: 'Chen',
      email: 'sarah.chen@fastenal.com',
      phone: '+1-507-454-5374',
      postalAddress: {
        addressLine1: '2001 Theurer Blvd',
        city: 'Winona',
        state: 'MN',
        postalCode: '55987',
        country: 'US',
      },
    },
    mainAddress: {
      addressLine1: '2001 Theurer Blvd',
      city: 'Winona',
      state: 'MN',
      postalCode: '55987',
      country: 'US',
    },
    notes: 'Preferred vendor for fasteners and MRO supplies.',
  },
  {
    eId: 'ba-002',
    name: 'Parker Hannifin',
    legal: {
      name: 'Parker Hannifin',
      legalName: 'Parker-Hannifin Corporation',
      country: 'US',
      taxId: '34-0451060',
    },
    roles: [{ role: 'VENDOR', notes: 'Hydraulic components' }, { role: 'OTHER' }],
    contact: {
      firstName: 'James',
      lastName: 'Rodriguez',
      email: 'j.rodriguez@parker.com',
      phone: '+1-216-896-3000',
    },
    mainAddress: {
      addressLine1: '6035 Parkland Blvd',
      city: 'Cleveland',
      state: 'OH',
      postalCode: '44124',
      country: 'US',
    },
  },
  {
    eId: 'ba-003',
    name: 'Grainger Industrial',
    legal: {
      name: 'Grainger Industrial',
      legalName: 'W.W. Grainger, Inc.',
      country: 'US',
      taxId: '36-1150280',
    },
    roles: [{ role: 'VENDOR' }, { role: 'CUSTOMER' }],
    contact: {
      firstName: 'Maria',
      lastName: 'Gonzalez',
      email: 'm.gonzalez@grainger.com',
      phone: '+1-847-535-1000',
      postalAddress: {
        addressLine1: '100 Grainger Parkway',
        city: 'Lake Forest',
        state: 'IL',
        postalCode: '60045',
        country: 'US',
      },
    },
    mainAddress: {
      addressLine1: '100 Grainger Parkway',
      city: 'Lake Forest',
      state: 'IL',
      postalCode: '60045',
      country: 'US',
    },
    notes: 'Large-volume distributor with next-day delivery.',
  },
];
