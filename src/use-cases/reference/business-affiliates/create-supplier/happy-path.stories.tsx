import type { Meta } from '@storybook/react';
import { expect, userEvent } from '@storybook/test';

import { ArdaBadge } from '@/components/atoms/badge/badge';
import {
  createUseCaseStories,
  UseCaseShell,
  FormField,
  FormRow,
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
   DATA
   ================================================================ */

interface SupplierFormData {
  name: string;
  roleSupplier: string;
  roleCustomer: string;
  roleManufacturer: string;
  roleDistributor: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  legalName: string;
  taxId: string;
}

const INITIAL: SupplierFormData = {
  name: '',
  roleSupplier: '',
  roleCustomer: '',
  roleManufacturer: '',
  roleDistributor: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  addressLine1: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  legalName: '',
  taxId: '',
};

const SAMPLE: SupplierFormData = {
  name: 'Fastenal Corp.',
  roleSupplier: 'true',
  roleCustomer: '',
  roleManufacturer: '',
  roleDistributor: 'true',
  contactName: 'Sarah Chen',
  contactEmail: 'sarah.chen@fastenal.com',
  contactPhone: '+1-507-454-5374',
  addressLine1: '2001 Theurer Blvd',
  city: 'Winona',
  state: 'MN',
  postalCode: '55987',
  country: 'US',
  legalName: 'Fastenal Company',
  taxId: '41-0948415',
};

/* ================================================================
   GUIDES
   ================================================================ */

const guides: GuideEntry[] = [
  {
    title: 'Step 1: Basic Information',
    description:
      'Enter the supplier company name and select which business roles this affiliate fills. At minimum, a name is required.',
    interaction:
      'Type the company name and check applicable role boxes. Click "Next Step" when done.',
  },
  {
    title: 'Step 2: Contact & Legal',
    description:
      'Provide the primary contact person, address, and legal entity details. These are optional but recommended for compliance and communication.',
    interaction:
      'Fill in contact name, email, phone, address, and legal details. Click "Next Step" to review.',
  },
  {
    title: 'Step 3: Review & Confirm',
    description:
      'Review all supplier information before creating the record. Verify name, roles, contact, and legal details.',
    interaction: 'Review the summary. Click "Back" to edit, or "Create Supplier" to save.',
  },
  {
    title: 'Success',
    description:
      'The supplier has been created. The new business affiliate record is ready for linking to item supplies.',
    interaction: 'Click "Start Over" to create another supplier.',
  },
];

/* ================================================================
   SCENES
   ================================================================ */

const scenes: Scene<SupplierFormData>[] = [
  {
    wizardStep: 0,
    submitted: false,
    formData: INITIAL,
    title: 'Scene 1 of 7 \u2014 Empty Form',
    description:
      'The form starts on Step 1 with an empty name field. The user must enter a company name to advance.',
    interaction: 'The user types the company name.',
  },
  {
    wizardStep: 0,
    submitted: false,
    formData: { ...INITIAL, name: SAMPLE.name },
    title: 'Scene 2 of 7 \u2014 Name Entered',
    description: 'The company name is entered. The user selects the business roles.',
    interaction: 'The user checks the Supplier and Distributor role boxes.',
  },
  {
    wizardStep: 0,
    submitted: false,
    formData: {
      ...INITIAL,
      name: SAMPLE.name,
      roleSupplier: SAMPLE.roleSupplier,
      roleDistributor: SAMPLE.roleDistributor,
    },
    title: 'Scene 3 of 7 \u2014 Roles Selected',
    description: 'Name and roles are set. The user can now advance to Contact & Legal details.',
    interaction: 'The user clicks "Next Step" to proceed.',
  },
  {
    wizardStep: 1,
    submitted: false,
    formData: {
      ...INITIAL,
      name: SAMPLE.name,
      roleSupplier: SAMPLE.roleSupplier,
      roleDistributor: SAMPLE.roleDistributor,
      contactName: SAMPLE.contactName,
      contactEmail: SAMPLE.contactEmail,
      contactPhone: SAMPLE.contactPhone,
    },
    title: 'Scene 4 of 7 \u2014 Contact Filled',
    description:
      'Contact information is entered. The user continues with address and legal details.',
    interaction: 'The user fills in the address fields.',
  },
  {
    wizardStep: 1,
    submitted: false,
    formData: { ...SAMPLE },
    title: 'Scene 5 of 7 \u2014 Step 2 Complete',
    description:
      'All contact, address, and legal details are filled. The user can review before submission.',
    interaction: 'The user clicks "Next Step" to review.',
  },
  {
    wizardStep: 2,
    submitted: false,
    formData: { ...SAMPLE },
    title: 'Scene 6 of 7 \u2014 Review & Confirm',
    description:
      'The review shows the full supplier record including roles (Vendor, Distributor), contact, address, and legal information.',
    interaction: 'The user verifies and clicks "Create Supplier".',
  },
  {
    wizardStep: 2,
    submitted: true,
    formData: { ...SAMPLE },
    title: 'Scene 7 of 7 \u2014 Supplier Created',
    description:
      'The supplier has been created successfully. The record is ready for use in item supply relationships.',
    interaction: 'The user clicks "Start Over" to create another supplier.',
  },
];

/* ================================================================
   WIZARD
   ================================================================ */

function CreateSupplierWizard(props: WizardProps<SupplierFormData>) {
  const w = useWizard(props, {
    initial: INITIAL,
    stepNames: ['Basic Information', 'Contact & Legal', 'Review & Confirm'],
    canAdvance: (step, data) => {
      if (step === 0) return !!data.name;
      return true;
    },
  });

  const roles: string[] = [];
  if (w.formData.roleSupplier) roles.push('Vendor');
  if (w.formData.roleCustomer) roles.push('Customer');
  if (w.formData.roleManufacturer) roles.push('Manufacturer');
  if (w.formData.roleDistributor) roles.push('Distributor');
  const rolesLabel = roles.length > 0 ? roles.join(', ') : '\u2014';

  const addressParts = [
    w.formData.addressLine1,
    w.formData.city,
    w.formData.state,
    w.formData.postalCode,
    w.formData.country,
  ].filter(Boolean);
  const addressLabel = addressParts.length > 0 ? addressParts.join(', ') : '\u2014';

  return (
    <UseCaseShell
      wizard={w}
      guides={guides}
      heading="Create New Supplier"
      subtitle="Register a new business affiliate as a supplier."
      submitLabel="Create Supplier"
      success={
        <SuccessScreen
          title="Supplier created successfully"
          subtitle={
            <>
              <strong>{w.formData.name}</strong> has been added to your supplier registry.
            </>
          }
          badges={
            <>
              {w.formData.roleSupplier && <ArdaBadge variant="info">Vendor</ArdaBadge>}
              {w.formData.roleDistributor && <ArdaBadge variant="default">Distributor</ArdaBadge>}
              {w.formData.roleManufacturer && <ArdaBadge variant="warning">Manufacturer</ArdaBadge>}
              {w.formData.roleCustomer && <ArdaBadge variant="success">Customer</ArdaBadge>}
            </>
          }
          details={
            <>
              <SummaryRow label="Contact" value={w.formData.contactName || '\u2014'} />
              <SummaryRow label="Email" value={w.formData.contactEmail || '\u2014'} />
              <SummaryRow label="Legal Name" value={w.formData.legalName || '\u2014'} />
              <SummaryRow label="Tax ID" value={w.formData.taxId || '\u2014'} />
            </>
          }
          onReset={w.handleReset}
        />
      }
    >
      {/* Step 1 — Basic Information */}
      {w.step === 0 && (
        <>
          <FormField
            label="Company Name"
            name="name"
            placeholder="e.g. Fastenal Corp."
            value={w.formData.name}
            onChange={w.handleChange}
          />
          <div>
            <span
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: '#0A0A0A',
                marginBottom: 8,
              }}
            >
              Business Roles
            </span>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { name: 'roleSupplier', label: 'Vendor' },
                { name: 'roleCustomer', label: 'Customer' },
                { name: 'roleManufacturer', label: 'Manufacturer' },
                { name: 'roleDistributor', label: 'Distributor' },
              ].map((role) => (
                <label
                  key={role.name}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}
                >
                  <input
                    type="checkbox"
                    name={role.name}
                    checked={!!w.formData[role.name as keyof SupplierFormData]}
                    onChange={(e) => {
                      const syntheticEvent = {
                        target: { name: role.name, value: e.target.checked ? 'true' : '' },
                      } as React.ChangeEvent<HTMLInputElement>;
                      w.handleChange(syntheticEvent);
                    }}
                    style={{ width: 16, height: 16 }}
                  />
                  {role.label}
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Step 2 — Contact & Legal */}
      {w.step === 1 && (
        <>
          <FormField
            label="Contact Name"
            name="contactName"
            placeholder="e.g. Sarah Chen"
            value={w.formData.contactName}
            onChange={w.handleChange}
          />
          <FormRow>
            <FormField
              label="Email"
              name="contactEmail"
              type="email"
              placeholder="email@example.com"
              value={w.formData.contactEmail}
              onChange={w.handleChange}
            />
            <FormField
              label="Phone"
              name="contactPhone"
              placeholder="+1-555-555-5555"
              value={w.formData.contactPhone}
              onChange={w.handleChange}
            />
          </FormRow>
          <FormField
            label="Address"
            name="addressLine1"
            placeholder="Street address"
            value={w.formData.addressLine1}
            onChange={w.handleChange}
          />
          <FormRow>
            <FormField
              label="City"
              name="city"
              placeholder="City"
              value={w.formData.city}
              onChange={w.handleChange}
            />
            <FormField
              label="State"
              name="state"
              placeholder="State"
              value={w.formData.state}
              onChange={w.handleChange}
            />
          </FormRow>
          <FormRow>
            <FormField
              label="Postal Code"
              name="postalCode"
              placeholder="Zip"
              value={w.formData.postalCode}
              onChange={w.handleChange}
            />
            <FormField
              label="Country"
              name="country"
              placeholder="US"
              value={w.formData.country}
              onChange={w.handleChange}
            />
          </FormRow>
          <Divider />
          <FormField
            label="Legal Name"
            name="legalName"
            placeholder="Legal entity name"
            value={w.formData.legalName}
            onChange={w.handleChange}
          />
          <FormField
            label="Tax ID"
            name="taxId"
            placeholder="e.g. 41-0948415"
            value={w.formData.taxId}
            onChange={w.handleChange}
          />
        </>
      )}

      {/* Step 3 — Review & Confirm */}
      {w.step === 2 && (
        <>
          <p style={{ fontSize: 14, color: '#737373', margin: 0 }}>
            Review the supplier details below before creating the record.
          </p>
          <SummaryCard>
            <SummaryRow label="Company Name" value={w.formData.name} bold />
            <SummaryRow label="Roles" value={rolesLabel} />
            <Divider />
            <SummaryRow label="Contact" value={w.formData.contactName || '\u2014'} />
            <SummaryRow label="Email" value={w.formData.contactEmail || '\u2014'} />
            <SummaryRow label="Phone" value={w.formData.contactPhone || '\u2014'} />
            <SummaryRow label="Address" value={addressLabel} />
            <Divider />
            <SummaryRow label="Legal Name" value={w.formData.legalName || '\u2014'} />
            <SummaryRow label="Tax ID" value={w.formData.taxId || '\u2014'} />
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
    goToScene(0);
    await delay();

    await userEvent.type(canvas.getByLabelText('Company Name'), SAMPLE.name);
    goToScene(1);
    await delay();

    // Check role boxes
    const checkboxes = canvas.getAllByRole('checkbox');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- storybook test data guaranteed
    await userEvent.click(checkboxes[0]!); // Vendor
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- storybook test data guaranteed
    await userEvent.click(checkboxes[3]!); // Distributor
    goToScene(2);
    await delay();

    await userEvent.click(canvas.getByRole('button', { name: /next step/i }));
    goToScene(3);
    await delay();

    await userEvent.type(canvas.getByLabelText('Contact Name'), SAMPLE.contactName);
    await userEvent.type(canvas.getByLabelText('Email'), SAMPLE.contactEmail);
    await userEvent.type(canvas.getByLabelText('Phone'), SAMPLE.contactPhone);
    await userEvent.type(canvas.getByLabelText('Address'), SAMPLE.addressLine1);
    await userEvent.type(canvas.getByLabelText('City'), SAMPLE.city);
    await userEvent.type(canvas.getByLabelText('State'), SAMPLE.state);
    await userEvent.type(canvas.getByLabelText('Postal Code'), SAMPLE.postalCode);
    await userEvent.type(canvas.getByLabelText('Country'), SAMPLE.country);
    await userEvent.type(canvas.getByLabelText('Legal Name'), SAMPLE.legalName);
    await userEvent.type(canvas.getByLabelText('Tax ID'), SAMPLE.taxId);
    goToScene(4);
    await delay();

    await userEvent.click(canvas.getByRole('button', { name: /next step/i }));
    goToScene(5);
    await expect(canvas.getByText(SAMPLE.name)).toBeInTheDocument();
    await delay();

    await userEvent.click(canvas.getByRole('button', { name: /create supplier/i }));
    goToScene(6);
    await expect(canvas.getByTestId('success-message')).toHaveTextContent(
      'Supplier created successfully',
    );
    await delay();
  },
});

export default meta;
export { Interactive, Stepwise, Automated };
