/**
 * Mock BusinessAffiliate data for Storybook stories.
 *
 * Each entry follows the ArdaResult<BusinessAffiliateWithRoles> shape
 * so the MSW handler can return them directly inside an ArdaQueryResponse.
 */
import type { ArdaResult } from '@frontend/types/arda-api';
import { MOCK_TENANT_ID } from '@frontend/mocks/data/mockUser';
import type { BusinessAffiliateWithRoles } from './types';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const now = Date.now();

function wrapAsResult(payload: BusinessAffiliateWithRoles): ArdaResult<BusinessAffiliateWithRoles> {
  return {
    rId: generateUUID(),
    asOf: { effective: now, recorded: now },
    payload,
    metadata: { tenantId: MOCK_TENANT_ID },
    author: 'user/mock-admin',
    retired: false,
    createdBy: 'user/mock-admin',
    createdAt: now - 86_400_000 * 30,
  };
}

const sampleAffiliates: BusinessAffiliateWithRoles[] = [
  {
    eId: generateUUID(),
    name: 'MedSupply Co.',
    legal: { name: 'MedSupply Co.', taxId: '12-3456789', website: 'https://www.medsupplyco.com' },
    contact: { name: 'Sarah Johnson', email: 'sarah@medsupplyco.com', phone: '(555) 100-2000' },
    mainAddress: {
      addressLine1: '100 Medical Drive',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60601',
      country: { symbol: 'US', name: 'United States' },
    },
    roles: ['VENDOR'],
  },
  {
    eId: generateUUID(),
    name: 'Healthcare Direct',
    legal: {
      name: 'Healthcare Direct Inc.',
      taxId: '98-7654321',
      website: 'https://healthcaredirect.com',
    },
    contact: { name: 'Michael Chen', email: 'mchen@healthcaredirect.com', phone: '(555) 200-3000' },
    mainAddress: {
      addressLine1: '250 Pharma Blvd',
      addressLine2: 'Suite 400',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: { symbol: 'US', name: 'United States' },
    },
    roles: ['VENDOR', 'CUSTOMER'],
  },
  {
    eId: generateUUID(),
    name: 'Medical Essentials',
    legal: { name: 'Medical Essentials LLC', website: 'https://medessentials.com' },
    contact: { name: 'Lisa Park', email: 'lisa@medessentials.com', phone: '(555) 300-4000' },
    mainAddress: {
      addressLine1: '75 Supply Chain Way',
      city: 'Dallas',
      state: 'TX',
      postalCode: '75201',
      country: { symbol: 'US', name: 'United States' },
    },
    roles: ['VENDOR'],
  },
  {
    eId: generateUUID(),
    name: 'SupplyChain Medical',
    legal: { name: 'SupplyChain Medical Corp.', taxId: '55-1234567' },
    contact: { name: 'James Williams', email: 'jwilliams@scmedical.com', phone: '(555) 400-5000' },
    mainAddress: {
      addressLine1: '500 Distribution Center Rd',
      city: 'Atlanta',
      state: 'GA',
      postalCode: '30301',
      country: { symbol: 'US', name: 'United States' },
    },
    roles: ['VENDOR', 'CARRIER'],
  },
  {
    eId: generateUUID(),
    name: 'GlobalMed',
    legal: {
      name: 'GlobalMed International',
      taxId: '77-9876543',
      website: 'https://globalmed.com',
    },
    contact: { name: 'Ana Rodriguez', email: 'arodriguez@globalmed.com', phone: '(555) 500-6000' },
    mainAddress: {
      addressLine1: '1200 International Plaza',
      city: 'Miami',
      state: 'FL',
      postalCode: '33101',
      country: { symbol: 'US', name: 'United States' },
    },
    roles: ['VENDOR'],
  },
  {
    eId: generateUUID(),
    name: 'Pacific Lab Supplies',
    legal: { name: 'Pacific Lab Supplies Inc.', website: 'https://pacificlabs.com' },
    contact: { name: 'David Kim', email: 'dkim@pacificlabs.com', phone: '(555) 600-7000' },
    mainAddress: {
      addressLine1: '890 Lab Equipment Lane',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101',
      country: { symbol: 'US', name: 'United States' },
    },
    roles: ['VENDOR'],
  },
  {
    eId: generateUUID(),
    name: 'BioTech Instruments',
    legal: {
      name: 'BioTech Instruments Ltd.',
      taxId: '33-4567890',
      website: 'https://biotechinst.com',
    },
    contact: { name: 'Emily Watson', email: 'ewatson@biotechinst.com', phone: '(555) 700-8000' },
    mainAddress: {
      addressLine1: '3300 Innovation Drive',
      addressLine2: 'Building C',
      city: 'Boston',
      state: 'MA',
      postalCode: '02101',
      country: { symbol: 'US', name: 'United States' },
    },
    roles: ['VENDOR'],
  },
  {
    eId: generateUUID(),
    name: 'CleanRoom Solutions',
    contact: { name: 'Robert Taylor', email: 'rtaylor@cleanroom.com', phone: '(555) 800-9000' },
    mainAddress: {
      addressLine1: '450 Sterile Way',
      city: 'Phoenix',
      state: 'AZ',
      postalCode: '85001',
      country: { symbol: 'US', name: 'United States' },
    },
    roles: ['VENDOR'],
  },
  {
    eId: generateUUID(),
    name: 'National Freight Medical',
    legal: { name: 'National Freight Medical LLC' },
    contact: { name: 'Tom Baker', email: 'tbaker@nfmedical.com', phone: '(555) 900-1000' },
    mainAddress: {
      addressLine1: '2000 Logistics Pkwy',
      city: 'Memphis',
      state: 'TN',
      postalCode: '38101',
      country: { symbol: 'US', name: 'United States' },
    },
    roles: ['CARRIER'],
  },
  {
    eId: generateUUID(),
    name: 'Precision Surgical',
    legal: {
      name: 'Precision Surgical Inc.',
      taxId: '44-5678901',
      website: 'https://precisionsurgical.com',
    },
    contact: {
      name: 'Karen Martinez',
      email: 'kmartinez@precisionsurgical.com',
      phone: '(555) 111-2222',
    },
    mainAddress: {
      addressLine1: '600 Surgical Instruments Blvd',
      city: 'Minneapolis',
      state: 'MN',
      postalCode: '55401',
      country: { symbol: 'US', name: 'United States' },
    },
    roles: ['VENDOR'],
  },
];

export const mockBusinessAffiliates: ArdaResult<BusinessAffiliateWithRoles>[] =
  sampleAffiliates.map(wrapAsResult);
