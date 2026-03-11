/**
 * Mock BusinessAffiliate data for Storybook stories.
 *
 * 29 affiliates sorted A–Z by name, covering edge cases:
 * - 3+ with no contact field
 * - 2+ with no legal field
 * - 2+ with no mainAddress field
 * - 3+ with multiple roles
 * - 1+ with only CARRIER role (no VENDOR)
 * - 1 minimal (name + roles only): ColdChain Direct
 * - Names spread A–Z for sort testing
 *
 * Fully-populated affiliate (all fields including notes): Apex Medical Distributors
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

export function wrapAsResult(
  payload: BusinessAffiliateWithRoles,
): ArdaResult<BusinessAffiliateWithRoles> {
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
  // --- Original 10 affiliates (stable eIds via generateUUID) ---
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
    notes: 'Key distributor for West Coast facilities. Net-30 payment terms.',
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
    notes: 'International supplier. Requires customs documentation for all orders.',
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

  // --- 18 new affiliates ---

  // Fully-populated affiliate (all fields including notes) — used by Default story
  {
    eId: generateUUID(),
    name: 'Apex Medical Distributors',
    legal: {
      name: 'Apex Medical Distributors Inc.',
      taxId: '11-2233445',
      registrationId: 'REG-2024-0042',
      naicsCode: '423450',
    },
    contact: {
      name: 'Dr. Maria Santos',
      salutation: 'Dr.',
      firstName: 'Maria',
      lastName: 'Santos',
      jobTitle: 'Procurement Director',
      email: 'msantos@apexmedical.com',
      phone: '(555) 123-4567',
    },
    mainAddress: {
      addressLine1: '10 Summit Rd',
      city: 'Denver',
      state: 'CO',
      postalCode: '80201',
      country: { symbol: 'US', name: 'United States' },
    },
    notes: 'Preferred vendor for surgical instruments. Annual contract renewal in Q3.',
    roles: ['VENDOR'],
  },
  {
    eId: generateUUID(),
    name: 'Delta Pharma Group',
    legal: { name: 'Delta Pharma Group LLC', taxId: '22-3344556', website: 'https://deltapharma.com' },
    mainAddress: {
      addressLine1: '400 Pharma Park',
      city: 'Raleigh',
      state: 'NC',
      postalCode: '27601',
      country: { symbol: 'US', name: 'United States' },
    },
    roles: ['VENDOR', 'CUSTOMER'],
  },
  {
    eId: generateUUID(),
    name: 'QuickShip Logistics',
    legal: { name: 'QuickShip Logistics Corp.' },
    mainAddress: {
      addressLine1: '8800 Express Blvd',
      city: 'Louisville',
      state: 'KY',
      postalCode: '40201',
      country: { symbol: 'US', name: 'United States' },
    },
    roles: ['CARRIER'],
  },

  // No legal field (2 affiliates — CleanRoom Solutions above already has no legal)
  {
    eId: generateUUID(),
    name: 'Evergreen Health Supplies',
    contact: { name: 'Nina Patel', email: 'npatel@evergreenhealth.com', phone: '(555) 333-4444' },
    mainAddress: {
      addressLine1: '220 Wellness Way',
      city: 'Portland',
      state: 'OR',
      postalCode: '97201',
      country: { symbol: 'US', name: 'United States' },
    },
    roles: ['VENDOR'],
  },
  {
    eId: generateUUID(),
    name: 'Frontier Biomedical',
    contact: { name: 'Carlos Ruiz', email: 'cruiz@frontierbio.com', phone: '(555) 444-5555' },
    mainAddress: {
      addressLine1: '1550 Research Park Dr',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: { symbol: 'US', name: 'United States' },
    },
    roles: ['VENDOR', 'OPERATOR'],
  },

  // No mainAddress field (2 affiliates)
  {
    eId: generateUUID(),
    name: 'Integrated Lab Systems',
    legal: { name: 'Integrated Lab Systems Inc.', taxId: '66-7788990' },
    contact: { name: 'Wei Zhang', email: 'wzhang@integratedlabs.com', phone: '(555) 555-6666' },
    roles: ['VENDOR'],
  },
  {
    eId: generateUUID(),
    name: 'OmniCare Partners',
    legal: { name: 'OmniCare Partners LLC', website: 'https://omnicarepartners.com' },
    contact: { name: 'Diana Ross', email: 'dross@omnicare.com' },
    roles: ['CUSTOMER'],
  },

  // Multiple roles (3+ — some already above: Healthcare Direct, SupplyChain Medical, Delta Pharma, Frontier Biomedical)
  {
    eId: generateUUID(),
    name: 'Keystone Medical Group',
    legal: { name: 'Keystone Medical Group Inc.', taxId: '88-9900112' },
    contact: { name: 'Frank Miller', email: 'fmiller@keystonemedical.com', phone: '(555) 666-7777' },
    mainAddress: {
      addressLine1: '900 Cornerstone Ave',
      city: 'Philadelphia',
      state: 'PA',
      postalCode: '19101',
      country: { symbol: 'US', name: 'United States' },
    },
    roles: ['VENDOR', 'CUSTOMER', 'CARRIER'],
  },

  // Fill A-Z spread
  {
    eId: generateUUID(),
    name: 'Atlas Surgical Supply',
    legal: { name: 'Atlas Surgical Supply Co.', taxId: '10-1122334' },
    contact: { name: 'George Harris', email: 'gharris@atlassurgical.com', phone: '(555) 777-8888' },
    mainAddress: {
      addressLine1: '55 Titan Rd',
      city: 'Nashville',
      state: 'TN',
      postalCode: '37201',
      country: { symbol: 'US', name: 'United States' },
    },
    roles: ['VENDOR'],
  },
  {
    eId: generateUUID(),
    name: 'Cardinal Health Solutions',
    legal: { name: 'Cardinal Health Solutions Inc.', website: 'https://cardinalhs.com' },
    contact: { name: 'Helen Clark', email: 'hclark@cardinalhs.com', phone: '(555) 888-9999' },
    mainAddress: {
      addressLine1: '1800 Cardinal Way',
      city: 'Columbus',
      state: 'OH',
      postalCode: '43201',
      country: { symbol: 'US', name: 'United States' },
    },
    roles: ['VENDOR'],
  },
  {
    eId: generateUUID(),
    name: 'Horizon Diagnostics',
    legal: { name: 'Horizon Diagnostics Ltd.', taxId: '55-6677889' },
    contact: { name: 'Irene Novak', email: 'inovak@horizondx.com', phone: '(555) 101-2020' },
    mainAddress: {
      addressLine1: '720 Diagnostic Dr',
      city: 'San Diego',
      state: 'CA',
      postalCode: '92101',
      country: { symbol: 'US', name: 'United States' },
    },
    roles: ['VENDOR'],
  },
  {
    eId: generateUUID(),
    name: 'Lumina Therapeutics',
    legal: { name: 'Lumina Therapeutics Corp.', taxId: '99-0011223', website: 'https://luminatx.com' },
    contact: { name: 'Jack Reeves', email: 'jreeves@luminatx.com', phone: '(555) 202-3030' },
    mainAddress: {
      addressLine1: '3400 Bright St',
      city: 'Salt Lake City',
      state: 'UT',
      postalCode: '84101',
      country: { symbol: 'US', name: 'United States' },
    },
    roles: ['VENDOR'],
  },
  {
    eId: generateUUID(),
    name: 'Riverside Medical Equipment',
    legal: { name: 'Riverside Medical Equipment Inc.' },
    contact: { name: 'Laura Chen', email: 'lchen@riversidemed.com', phone: '(555) 303-4040' },
    mainAddress: {
      addressLine1: '510 River Rd',
      city: 'Sacramento',
      state: 'CA',
      postalCode: '95814',
      country: { symbol: 'US', name: 'United States' },
    },
    roles: ['VENDOR'],
  },
  {
    eId: generateUUID(),
    name: 'TrueNorth Carriers',
    legal: { name: 'TrueNorth Carriers LLC' },
    contact: { name: 'Mark Stevens', email: 'mstevens@truenorth.com', phone: '(555) 404-5050' },
    mainAddress: {
      addressLine1: '6600 Freight Line Pkwy',
      city: 'Detroit',
      state: 'MI',
      postalCode: '48201',
      country: { symbol: 'US', name: 'United States' },
    },
    roles: ['CARRIER', 'VENDOR'],
  },
  {
    eId: generateUUID(),
    name: 'Vanguard Specialty Labs',
    legal: { name: 'Vanguard Specialty Labs Inc.', taxId: '77-8899001', website: 'https://vanguardlabs.com' },
    contact: { name: 'Olivia Grant', email: 'ogrant@vanguardlabs.com', phone: '(555) 505-6060' },
    mainAddress: {
      addressLine1: '200 Vanguard Blvd',
      city: 'Charlotte',
      state: 'NC',
      postalCode: '28201',
      country: { symbol: 'US', name: 'United States' },
    },
    roles: ['VENDOR'],
  },
  {
    eId: generateUUID(),
    name: 'Westgate Pharmaceuticals',
    legal: { name: 'Westgate Pharmaceuticals Corp.', website: 'https://westgatepharma.com' },
    contact: { name: 'Peter Dunn', email: 'pdunn@westgatepharma.com', phone: '(555) 606-7070' },
    mainAddress: {
      addressLine1: '4400 Gate Blvd',
      city: 'Kansas City',
      state: 'MO',
      postalCode: '64101',
      country: { symbol: 'US', name: 'United States' },
    },
    roles: ['VENDOR'],
  },
  {
    eId: generateUUID(),
    name: 'Unity Healthcare Logistics',
    legal: { name: 'Unity Healthcare Logistics Inc.' },
    contact: { name: 'Sam Torres', email: 'storres@unityhcl.com', phone: '(555) 808-9090' },
    mainAddress: {
      addressLine1: '1100 Unity Pkwy',
      city: 'Orlando',
      state: 'FL',
      postalCode: '32801',
      country: { symbol: 'US', name: 'United States' },
    },
    roles: ['VENDOR', 'CARRIER'],
  },
  {
    eId: generateUUID(),
    name: 'Zenith Supplies',
    legal: { name: 'Zenith Supplies Co.', taxId: '33-4455667' },
    contact: { name: 'Rachel Kim', email: 'rkim@zenithsupplies.com', phone: '(555) 707-8080' },
    mainAddress: {
      addressLine1: '9900 Peak Ave',
      city: 'Tucson',
      state: 'AZ',
      postalCode: '85701',
      country: { symbol: 'US', name: 'United States' },
    },
    roles: ['VENDOR'],
  },

  // Minimal-data affiliate (name + roles only) — used by MinimalData story
  {
    eId: generateUUID(),
    name: 'ColdChain Direct',
    roles: ['VENDOR'],
  },
];

// Sort A-Z by name for predictable test assertions
sampleAffiliates.sort((a, b) => a.name.localeCompare(b.name));

export const mockBusinessAffiliates: ArdaResult<BusinessAffiliateWithRoles>[] =
  sampleAffiliates.map(wrapAsResult);

/** Look up a single affiliate result by entity ID. */
export function mockBusinessAffiliateById(
  eId: string,
): ArdaResult<BusinessAffiliateWithRoles> | undefined {
  return mockBusinessAffiliates.find((r) => r.payload.eId === eId);
}
