import type { Meta } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';

import { ArdaBadge } from '@/extras/components/atoms/badge/badge';
import { ArdaSupplierForm } from '@/extras/components/organisms/reference/business-affiliates/supplier-form/supplier-form';
import type {
  BusinessAffiliate,
  BusinessRole,
  BusinessRoleType,
} from '@/extras/types/reference/business-affiliates/business-affiliate';
import {
  createUseCaseStories,
  UseCaseShell,
  SummaryCard,
  SummaryRow,
  Divider,
  SuccessScreen,
  useWizard,
  type GuideEntry,
  type Scene,
  type WizardProps,
} from '@/use-cases/framework';

/* ================================================================
   DATA — mirrors BusinessAffiliate / Contact / CompanyInformation /
          PostalAddress from the backend OpenAPI spec
   ================================================================ */

interface SupplierFormData {
  /* BusinessAffiliate.name */
  name: string;

  /* BusinessRole[] — each role flag + optional notes */
  roleVendor: string;
  roleVendorNotes: string;
  roleCustomer: string;
  roleCustomerNotes: string;
  roleCarrier: string;
  roleCarrierNotes: string;
  roleOperator: string;
  roleOperatorNotes: string;
  roleOther: string;
  roleOtherNotes: string;

  /* Contact fields */
  contactSalutation: string;
  contactFirstName: string;
  contactMiddleName: string;
  contactLastName: string;
  contactJobTitle: string;
  contactEmail: string;
  contactPhone: string;

  /* PostalAddress (mainAddress) */
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;

  /* CompanyInformation (legal) */
  legalName: string;
  taxId: string;
  registrationId: string;
  naicsCode: string;

  /* BusinessAffiliate.notes */
  notes: string;
}

const INITIAL: SupplierFormData = {
  name: '',
  roleVendor: '',
  roleVendorNotes: '',
  roleCustomer: '',
  roleCustomerNotes: '',
  roleCarrier: '',
  roleCarrierNotes: '',
  roleOperator: '',
  roleOperatorNotes: '',
  roleOther: '',
  roleOtherNotes: '',
  contactSalutation: '',
  contactFirstName: '',
  contactMiddleName: '',
  contactLastName: '',
  contactJobTitle: '',
  contactEmail: '',
  contactPhone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  legalName: '',
  taxId: '',
  registrationId: '',
  naicsCode: '',
  notes: '',
};

const SAMPLE: SupplierFormData = {
  name: 'Fastenal Corp.',
  roleVendor: 'true',
  roleVendorNotes: 'Primary MRO supplier',
  roleCustomer: 'true',
  roleCustomerNotes: '',
  roleCarrier: '',
  roleCarrierNotes: '',
  roleOperator: '',
  roleOperatorNotes: '',
  roleOther: '',
  roleOtherNotes: '',
  contactSalutation: 'Ms.',
  contactFirstName: 'Sarah',
  contactMiddleName: '',
  contactLastName: 'Chen',
  contactJobTitle: 'Account Manager',
  contactEmail: 'sarah.chen@fastenal.com',
  contactPhone: '+1-507-454-5374',
  addressLine1: '2001 Theurer Blvd',
  addressLine2: 'Suite 100',
  city: 'Winona',
  state: 'MN',
  postalCode: '55987',
  country: 'US',
  legalName: 'Fastenal Company',
  taxId: '41-0948415',
  registrationId: 'MN-12345678',
  naicsCode: '423710',
  notes: 'Preferred vendor for fasteners and MRO supplies.',
};

/* ================================================================
   CONVERSION — flat SupplierFormData ↔ BusinessAffiliate
   ================================================================ */

const ROLE_MAP: {
  flag: keyof SupplierFormData;
  notes: keyof SupplierFormData;
  role: BusinessRoleType;
}[] = [
  { flag: 'roleVendor', notes: 'roleVendorNotes', role: 'VENDOR' },
  { flag: 'roleCustomer', notes: 'roleCustomerNotes', role: 'CUSTOMER' },
  { flag: 'roleCarrier', notes: 'roleCarrierNotes', role: 'CARRIER' },
  { flag: 'roleOperator', notes: 'roleOperatorNotes', role: 'OPERATOR' },
  { flag: 'roleOther', notes: 'roleOtherNotes', role: 'OTHER' },
];

function formDataToAffiliate(data: SupplierFormData): BusinessAffiliate {
  const roles: BusinessRole[] = [];
  for (const rm of ROLE_MAP) {
    if (data[rm.flag]) {
      const role: BusinessRole = { role: rm.role };
      if (data[rm.notes]) role.notes = data[rm.notes];
      roles.push(role);
    }
  }

  const affiliate: BusinessAffiliate = { eId: '', name: data.name, roles, legal: {} };

  // Contact (only set if any field is non-empty)
  const hasContact =
    data.contactSalutation ||
    data.contactFirstName ||
    data.contactMiddleName ||
    data.contactLastName ||
    data.contactJobTitle ||
    data.contactEmail ||
    data.contactPhone;
  if (hasContact) {
    const c: Record<string, string> = {};
    if (data.contactSalutation) c.salutation = data.contactSalutation;
    if (data.contactFirstName) c.firstName = data.contactFirstName;
    if (data.contactMiddleName) c.middleName = data.contactMiddleName;
    if (data.contactLastName) c.lastName = data.contactLastName;
    if (data.contactJobTitle) c.jobTitle = data.contactJobTitle;
    if (data.contactEmail) c.email = data.contactEmail;
    if (data.contactPhone) c.phone = data.contactPhone;
    affiliate.contact = c;
  }

  // Address
  const hasAddress =
    data.addressLine1 ||
    data.addressLine2 ||
    data.city ||
    data.state ||
    data.postalCode ||
    data.country;
  if (hasAddress) {
    const a: Record<string, string> = {};
    if (data.addressLine1) a.addressLine1 = data.addressLine1;
    if (data.addressLine2) a.addressLine2 = data.addressLine2;
    if (data.city) a.city = data.city;
    if (data.state) a.state = data.state;
    if (data.postalCode) a.postalCode = data.postalCode;
    if (data.country) a.country = data.country;
    affiliate.mainAddress = a as NonNullable<typeof affiliate.mainAddress>;
  }

  // Legal
  const hasLegal = data.legalName || data.taxId || data.registrationId || data.naicsCode;
  if (hasLegal) {
    const l: Record<string, string> = {};
    if (data.legalName) l.legalName = data.legalName;
    if (data.taxId) l.taxId = data.taxId;
    if (data.registrationId) l.registrationId = data.registrationId;
    if (data.naicsCode) l.naicsCode = data.naicsCode;
    affiliate.legal = l as NonNullable<typeof affiliate.legal>;
  }

  // Notes
  if (data.notes) affiliate.notes = data.notes;

  return affiliate;
}

function affiliateToFormData(ba: BusinessAffiliate): SupplierFormData {
  const findRole = (role: BusinessRoleType) => ba.roles.find((r) => r.role === role);
  return {
    name: ba.name,
    roleVendor: findRole('VENDOR') ? 'true' : '',
    roleVendorNotes: findRole('VENDOR')?.notes ?? '',
    roleCustomer: findRole('CUSTOMER') ? 'true' : '',
    roleCustomerNotes: findRole('CUSTOMER')?.notes ?? '',
    roleCarrier: findRole('CARRIER') ? 'true' : '',
    roleCarrierNotes: findRole('CARRIER')?.notes ?? '',
    roleOperator: findRole('OPERATOR') ? 'true' : '',
    roleOperatorNotes: findRole('OPERATOR')?.notes ?? '',
    roleOther: findRole('OTHER') ? 'true' : '',
    roleOtherNotes: findRole('OTHER')?.notes ?? '',
    contactSalutation: ba.contact?.salutation ?? '',
    contactFirstName: ba.contact?.firstName ?? '',
    contactMiddleName: ba.contact?.middleName ?? '',
    contactLastName: ba.contact?.lastName ?? '',
    contactJobTitle: ba.contact?.jobTitle ?? '',
    contactEmail: ba.contact?.email ?? '',
    contactPhone: ba.contact?.phone ?? '',
    addressLine1: ba.mainAddress?.addressLine1 ?? '',
    addressLine2: ba.mainAddress?.addressLine2 ?? '',
    city: ba.mainAddress?.city ?? '',
    state: ba.mainAddress?.state ?? '',
    postalCode: ba.mainAddress?.postalCode ?? '',
    country: ba.mainAddress?.country ?? '',
    legalName: ba.legal?.legalName ?? '',
    taxId: ba.legal?.taxId ?? '',
    registrationId: ba.legal?.registrationId ?? '',
    naicsCode: ba.legal?.naicsCode ?? '',
    notes: ba.notes ?? '',
  };
}

/* ================================================================
   GUIDES — four wizard steps
   ================================================================ */

const guides: GuideEntry[] = [
  {
    title: 'Step 1: Affiliate Identity',
    description:
      'Enter the business affiliate name (required) and assign one or more business roles. ' +
      'Each role may include optional notes describing the relationship context.',
    interaction:
      'Type the company name, check applicable role boxes, and optionally add role notes. Click "Next Step" when done.',
  },
  {
    title: 'Step 2: Primary Contact',
    description:
      'Provide the primary contact person for this affiliate. Fields include salutation, ' +
      'first/middle/last name, job title, email, and phone. All fields are optional.',
    interaction:
      'Fill in contact details. Click "Next Step" to proceed to address and legal information.',
  },
  {
    title: 'Step 3: Address & Legal',
    description:
      'Enter the main postal address and legal entity information (company legal name, ' +
      'tax ID, registration ID, and NAICS code). These are optional but recommended for compliance.',
    interaction: 'Fill in address and legal fields. Click "Next Step" to review.',
  },
  {
    title: 'Step 4: Review & Confirm',
    description:
      'Review all affiliate information before creating the record. Verify identity, roles, ' +
      'contact details, address, and legal information.',
    interaction: 'Review the summary. Click "Back" to edit, or "Create Supplier" to save.',
  },
  {
    title: 'Success',
    description:
      'The business affiliate has been created. The new record is ready for linking to item supplies.',
    interaction: 'Click "Start Over" to create another affiliate.',
  },
];

/* ================================================================
   SCENES — nine steps through the wizard
   ================================================================ */

const scenes: Scene<SupplierFormData>[] = [
  {
    wizardStep: 0,
    submitted: false,
    formData: INITIAL,
    title: 'Scene 1 of 9 \u2014 Empty Form',
    description:
      'The wizard starts on Step 1 (Affiliate Identity) with an empty name field. A name is required to advance.',
    interaction: 'The user types the company name.',
  },
  {
    wizardStep: 0,
    submitted: false,
    formData: { ...INITIAL, name: SAMPLE.name },
    title: 'Scene 2 of 9 \u2014 Name Entered',
    description:
      'The company name is entered. The user selects business roles and adds role notes.',
    interaction: 'The user checks Vendor and Customer, then enters notes for the Vendor role.',
  },
  {
    wizardStep: 0,
    submitted: false,
    formData: {
      ...INITIAL,
      name: SAMPLE.name,
      roleVendor: SAMPLE.roleVendor,
      roleVendorNotes: SAMPLE.roleVendorNotes,
      roleCustomer: SAMPLE.roleCustomer,
    },
    title: 'Scene 3 of 9 \u2014 Roles Selected',
    description:
      'Name and roles are set with vendor notes. The user can now advance to contact details.',
    interaction: 'The user clicks "Next Step" to proceed.',
  },
  {
    wizardStep: 1,
    submitted: false,
    formData: {
      ...INITIAL,
      name: SAMPLE.name,
      roleVendor: SAMPLE.roleVendor,
      roleVendorNotes: SAMPLE.roleVendorNotes,
      roleCustomer: SAMPLE.roleCustomer,
    },
    title: 'Scene 4 of 9 \u2014 Contact Step (Empty)',
    description:
      'The contact form is displayed. The user enters salutation, name, job title, email, and phone.',
    interaction: 'The user fills in contact details.',
  },
  {
    wizardStep: 1,
    submitted: false,
    formData: {
      ...INITIAL,
      name: SAMPLE.name,
      roleVendor: SAMPLE.roleVendor,
      roleVendorNotes: SAMPLE.roleVendorNotes,
      roleCustomer: SAMPLE.roleCustomer,
      contactSalutation: SAMPLE.contactSalutation,
      contactFirstName: SAMPLE.contactFirstName,
      contactLastName: SAMPLE.contactLastName,
      contactJobTitle: SAMPLE.contactJobTitle,
      contactEmail: SAMPLE.contactEmail,
      contactPhone: SAMPLE.contactPhone,
    },
    title: 'Scene 5 of 9 \u2014 Contact Filled',
    description:
      'Contact details are complete. The user proceeds to address and legal information.',
    interaction: 'The user clicks "Next Step" to proceed.',
  },
  {
    wizardStep: 2,
    submitted: false,
    formData: {
      ...INITIAL,
      name: SAMPLE.name,
      roleVendor: SAMPLE.roleVendor,
      roleVendorNotes: SAMPLE.roleVendorNotes,
      roleCustomer: SAMPLE.roleCustomer,
      contactSalutation: SAMPLE.contactSalutation,
      contactFirstName: SAMPLE.contactFirstName,
      contactLastName: SAMPLE.contactLastName,
      contactJobTitle: SAMPLE.contactJobTitle,
      contactEmail: SAMPLE.contactEmail,
      contactPhone: SAMPLE.contactPhone,
    },
    title: 'Scene 6 of 9 \u2014 Address & Legal (Empty)',
    description:
      'The address and legal form is displayed. The user enters address, legal name, tax ID, registration, and NAICS code.',
    interaction: 'The user fills in address and legal fields.',
  },
  {
    wizardStep: 2,
    submitted: false,
    formData: { ...SAMPLE },
    title: 'Scene 7 of 9 \u2014 Address & Legal Complete',
    description: 'All address and legal details are filled. The user can review before submission.',
    interaction: 'The user clicks "Next Step" to review.',
  },
  {
    wizardStep: 3,
    submitted: false,
    formData: { ...SAMPLE },
    title: 'Scene 8 of 9 \u2014 Review & Confirm',
    description:
      'The review shows the full affiliate record: identity, roles with notes, contact, address, legal details, and general notes.',
    interaction: 'The user verifies and clicks "Create Supplier".',
  },
  {
    wizardStep: 3,
    submitted: true,
    formData: { ...SAMPLE },
    title: 'Scene 9 of 9 \u2014 Supplier Created',
    description:
      'The business affiliate has been created successfully. The record is ready for use in item supply relationships.',
    interaction: 'The user clicks "Start Over" to create another affiliate.',
  },
];

/* ================================================================
   WIZARD — four-step form
   ================================================================ */

function CreateSupplierWizard(props: WizardProps<SupplierFormData>) {
  const w = useWizard(props, {
    initial: INITIAL,
    stepNames: ['Affiliate Identity', 'Primary Contact', 'Address & Legal', 'Review & Confirm'],
    canAdvance: (step, data) => {
      if (step === 0) return !!data.name;
      return true;
    },
  });

  /* Derived display values */
  const roles: string[] = [];
  if (w.formData.roleVendor) roles.push('Vendor');
  if (w.formData.roleCustomer) roles.push('Customer');
  if (w.formData.roleCarrier) roles.push('Carrier');
  if (w.formData.roleOperator) roles.push('Operator');
  if (w.formData.roleOther) roles.push('Other');
  const rolesLabel = roles.length > 0 ? roles.join(', ') : '\u2014';

  const contactName = [
    w.formData.contactSalutation,
    w.formData.contactFirstName,
    w.formData.contactMiddleName,
    w.formData.contactLastName,
  ]
    .filter(Boolean)
    .join(' ');

  const addressParts = [
    w.formData.addressLine1,
    w.formData.addressLine2,
    w.formData.city,
    w.formData.state,
    w.formData.postalCode,
    w.formData.country,
  ].filter(Boolean);
  const addressLabel = addressParts.length > 0 ? addressParts.join(', ') : '\u2014';

  const roleDetails: { label: string; notes: string }[] = [];
  if (w.formData.roleVendor)
    roleDetails.push({ label: 'Vendor', notes: w.formData.roleVendorNotes });
  if (w.formData.roleCustomer)
    roleDetails.push({ label: 'Customer', notes: w.formData.roleCustomerNotes });
  if (w.formData.roleCarrier)
    roleDetails.push({ label: 'Carrier', notes: w.formData.roleCarrierNotes });
  if (w.formData.roleOperator)
    roleDetails.push({ label: 'Operator', notes: w.formData.roleOperatorNotes });
  if (w.formData.roleOther) roleDetails.push({ label: 'Other', notes: w.formData.roleOtherNotes });

  return (
    <UseCaseShell
      wizard={w}
      guides={guides}
      heading="Create New Business Affiliate"
      subtitle="Register a new business affiliate (supplier, customer, carrier, or other partner)."
      submitLabel="Create Supplier"
      success={
        <SuccessScreen
          title="Business affiliate created successfully"
          subtitle={
            <>
              <strong>{w.formData.name}</strong> has been added to your affiliate registry.
            </>
          }
          badges={
            <>
              {w.formData.roleVendor && <ArdaBadge variant="info">Vendor</ArdaBadge>}
              {w.formData.roleCustomer && <ArdaBadge variant="success">Customer</ArdaBadge>}
              {w.formData.roleCarrier && <ArdaBadge variant="warning">Carrier</ArdaBadge>}
              {w.formData.roleOperator && <ArdaBadge variant="default">Operator</ArdaBadge>}
              {w.formData.roleOther && <ArdaBadge variant="outline">Other</ArdaBadge>}
            </>
          }
          details={
            <>
              <SummaryRow label="Contact" value={contactName || '\u2014'} />
              <SummaryRow label="Job Title" value={w.formData.contactJobTitle || '\u2014'} />
              <SummaryRow label="Email" value={w.formData.contactEmail || '\u2014'} />
              <SummaryRow label="Legal Name" value={w.formData.legalName || '\u2014'} />
              <SummaryRow label="Tax ID" value={w.formData.taxId || '\u2014'} />
              <SummaryRow label="NAICS Code" value={w.formData.naicsCode || '\u2014'} />
            </>
          }
          onReset={w.handleReset}
        />
      }
    >
      {/* Steps 0-2 — shared form component */}
      {w.step >= 0 && w.step <= 2 && (
        <ArdaSupplierForm
          value={formDataToAffiliate(w.formData)}
          onChange={(ba) => w.setFormData(affiliateToFormData(ba))}
          mode="stepped"
          currentStep={w.step}
        />
      )}

      {/* Step 4 — Review & Confirm */}
      {w.step === 3 && (
        <>
          <p style={{ fontSize: 14, color: 'var(--base-muted-foreground)', margin: 0 }}>
            Review the business affiliate details below before creating the record.
          </p>
          <SummaryCard>
            <SummaryRow label="Company Name" value={w.formData.name} bold />
            <SummaryRow label="Roles" value={rolesLabel} />
            {roleDetails
              .filter((r) => r.notes)
              .map((r) => (
                <SummaryRow key={r.label} label={`${r.label} Notes`} value={r.notes} />
              ))}
            {w.formData.notes && <SummaryRow label="General Notes" value={w.formData.notes} />}
            <Divider />
            <SummaryRow label="Contact" value={contactName || '\u2014'} />
            <SummaryRow label="Job Title" value={w.formData.contactJobTitle || '\u2014'} />
            <SummaryRow label="Email" value={w.formData.contactEmail || '\u2014'} />
            <SummaryRow label="Phone" value={w.formData.contactPhone || '\u2014'} />
            <Divider />
            <SummaryRow label="Address" value={addressLabel} />
            <Divider />
            <SummaryRow label="Legal Name" value={w.formData.legalName || '\u2014'} />
            <SummaryRow label="Tax ID" value={w.formData.taxId || '\u2014'} />
            <SummaryRow label="Registration ID" value={w.formData.registrationId || '\u2014'} />
            <SummaryRow label="NAICS Code" value={w.formData.naicsCode || '\u2014'} />
          </SummaryCard>
        </>
      )}
    </UseCaseShell>
  );
}

/* ================================================================
   STORIES
   ================================================================ */

const meta = {
  title: 'Use Cases/Reference/Business Affiliates/Create Supplier/Happy Path',
  parameters: { layout: 'centered' },
} satisfies Meta;

const { Interactive, Stepwise, Automated } = createUseCaseStories<SupplierFormData>({
  guides,
  scenes,
  Wizard: CreateSupplierWizard,
  delayMs: 2000,
  play: async ({ canvas, goToScene, delay }) => {
    /*
     * Note: The entity viewer manages its own tab navigation independently from
     * the wizard framework's step navigation. This play function tests the
     * Identity tab fields (name + roles) which are visible on initial load.
     * Full multi-tab automation requires tighter wizard/viewer integration.
     */

    /* Scene 1 — empty form (entity viewer starts in create/edit mode) */
    goToScene(0);
    await delay();

    /* Scene 2 — type company name */
    await userEvent.type(canvas.getByLabelText('Name'), SAMPLE.name);
    goToScene(1);
    await delay();

    /* Scene 3 — check Vendor + Customer */
    const checkboxes = canvas.getAllByRole('checkbox');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- storybook test data guaranteed
    await userEvent.click(checkboxes[0]!); // Vendor
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- storybook test data guaranteed
    await userEvent.click(checkboxes[1]!); // Customer
    goToScene(2);
    await delay();

    /* Verify the form captured the data */
    await expect(canvas.getByLabelText('Name')).toHaveValue(SAMPLE.name);
  },
});

export default meta;
export { Interactive, Stepwise, Automated };
