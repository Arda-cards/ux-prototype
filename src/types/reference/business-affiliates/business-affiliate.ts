import type { CompanyInformation } from '../../model/assets/company-information';
import type { Contact } from '../../model/assets/contact';
import type { PostalAddress } from '../../model/general/geo/postal-address';

export type BusinessRoleType = 'SUPPLIER' | 'CUSTOMER' | 'MANUFACTURER' | 'DISTRIBUTOR';

export interface BusinessRole {
  type: BusinessRoleType;
  description?: string;
}

export interface BusinessAffiliate {
  entityId: string;
  companyInformation: CompanyInformation;
  roles: BusinessRole[];
  primaryContact?: Contact;
  address?: PostalAddress;
  notes?: string;
}

export const sampleAffiliates: BusinessAffiliate[] = [
  {
    entityId: 'ba-001',
    companyInformation: {
      name: 'Fastenal Corp.',
      legalName: 'Fastenal Company',
      country: 'US',
      taxId: '41-0948415',
    },
    roles: [{ type: 'SUPPLIER', description: 'Primary MRO supplier' }, { type: 'DISTRIBUTOR' }],
    primaryContact: {
      name: 'Sarah Chen',
      email: 'sarah.chen@fastenal.com',
      phone: '+1-507-454-5374',
      address: {
        addressLine1: '2001 Theurer Blvd',
        city: 'Winona',
        state: 'MN',
        postalCode: '55987',
        country: 'US',
      },
    },
    address: {
      addressLine1: '2001 Theurer Blvd',
      city: 'Winona',
      state: 'MN',
      postalCode: '55987',
      country: 'US',
    },
    notes: 'Preferred vendor for fasteners and MRO supplies.',
  },
  {
    entityId: 'ba-002',
    companyInformation: {
      name: 'Parker Hannifin',
      legalName: 'Parker-Hannifin Corporation',
      country: 'US',
      taxId: '34-0451060',
    },
    roles: [{ type: 'MANUFACTURER' }, { type: 'SUPPLIER', description: 'Hydraulic components' }],
    primaryContact: {
      name: 'James Rodriguez',
      email: 'j.rodriguez@parker.com',
      phone: '+1-216-896-3000',
    },
    address: {
      addressLine1: '6035 Parkland Blvd',
      city: 'Cleveland',
      state: 'OH',
      postalCode: '44124',
      country: 'US',
    },
  },
  {
    entityId: 'ba-003',
    companyInformation: {
      name: 'Grainger Industrial',
      legalName: 'W.W. Grainger, Inc.',
      country: 'US',
      taxId: '36-1150280',
    },
    roles: [{ type: 'SUPPLIER' }, { type: 'DISTRIBUTOR' }],
    primaryContact: {
      name: 'Maria Gonzalez',
      email: 'm.gonzalez@grainger.com',
      phone: '+1-847-535-1000',
      address: {
        addressLine1: '100 Grainger Parkway',
        city: 'Lake Forest',
        state: 'IL',
        postalCode: '60045',
        country: 'US',
      },
    },
    address: {
      addressLine1: '100 Grainger Parkway',
      city: 'Lake Forest',
      state: 'IL',
      postalCode: '60045',
      country: 'US',
    },
    notes: 'Large-volume distributor with next-day delivery.',
  },
];
