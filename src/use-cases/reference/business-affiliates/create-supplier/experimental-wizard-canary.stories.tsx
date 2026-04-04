/**
 * REF::BA::0003::0003 — Create Supplier: [Experimental] Wizard (Canary)
 *
 * Canary variant of the experimental wizard with 4 steps:
 *   Step 1: Identity (name + roles)
 *   Step 2: Contact (firstName, lastName, email, phone)
 *   Step 3: Address (city, state, country)
 *   Step 4: Review
 *
 * Uses the wizard framework with a simple inline form. No extras imports.
 */
import type { Meta } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
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

// ---------------------------------------------------------------------------
// Form data
// ---------------------------------------------------------------------------

interface SupplierFormData {
  name: string;
  roleVendor: string;
  roleCustomer: string;
  roleCarrier: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  city: string;
  state: string;
  country: string;
}

const INITIAL: SupplierFormData = {
  name: '',
  roleVendor: '',
  roleCustomer: '',
  roleCarrier: '',
  contactFirstName: '',
  contactLastName: '',
  contactEmail: '',
  contactPhone: '',
  city: '',
  state: '',
  country: '',
};

const SAMPLE: SupplierFormData = {
  name: 'Fastenal Corp.',
  roleVendor: 'true',
  roleCustomer: 'true',
  roleCarrier: '',
  contactFirstName: 'Sarah',
  contactLastName: 'Chen',
  contactEmail: 'sarah.chen@fastenal.com',
  contactPhone: '+1-507-454-5374',
  city: 'Winona',
  state: 'MN',
  country: 'US',
};

// ---------------------------------------------------------------------------
// Guides
// ---------------------------------------------------------------------------

const guides: GuideEntry[] = [
  {
    title: 'Step 1: Identity',
    description:
      'Enter the supplier name (required) and select one or more business roles.',
    interaction:
      'Type the company name, check applicable role boxes. Click "Next Step" when done.',
  },
  {
    title: 'Step 2: Contact',
    description:
      'Provide the primary contact person for this supplier. All fields are optional.',
    interaction:
      'Fill in first name, last name, email, and phone. Click "Next Step" to proceed.',
  },
  {
    title: 'Step 3: Address',
    description:
      'Enter the main address for this supplier. All fields are optional.',
    interaction: 'Fill in city, state, and country. Click "Next Step" to review.',
  },
  {
    title: 'Step 4: Review',
    description:
      'Review all supplier information before creating the record.',
    interaction: 'Review the summary. Click "Back" to edit, or "Create Supplier" to save.',
  },
  {
    title: 'Success',
    description: 'The supplier has been created successfully.',
    interaction: 'Click "Start Over" to create another supplier.',
  },
];

// ---------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------

const scenes: Scene<SupplierFormData>[] = [
  {
    wizardStep: 0,
    submitted: false,
    formData: INITIAL,
    title: 'Scene 1 of 9 \u2014 Empty Form',
    description: 'The wizard starts on Step 1 (Identity) with an empty name field.',
    interaction: 'The user types the company name.',
  },
  {
    wizardStep: 0,
    submitted: false,
    formData: { ...INITIAL, name: SAMPLE.name },
    title: 'Scene 2 of 9 \u2014 Name Entered',
    description: 'The company name is entered. The user selects business roles.',
    interaction: 'The user checks Vendor and Customer.',
  },
  {
    wizardStep: 0,
    submitted: false,
    formData: { ...INITIAL, name: SAMPLE.name, roleVendor: SAMPLE.roleVendor, roleCustomer: SAMPLE.roleCustomer },
    title: 'Scene 3 of 9 \u2014 Roles Selected',
    description: 'Name and roles are set. The user advances to contact details.',
    interaction: 'The user clicks "Next Step" to proceed.',
  },
  {
    wizardStep: 1,
    submitted: false,
    formData: { ...INITIAL, name: SAMPLE.name, roleVendor: SAMPLE.roleVendor, roleCustomer: SAMPLE.roleCustomer },
    title: 'Scene 4 of 9 \u2014 Contact Step (Empty)',
    description: 'The contact form is displayed. The user enters name, email, and phone.',
    interaction: 'The user fills in contact details.',
  },
  {
    wizardStep: 1,
    submitted: false,
    formData: {
      ...INITIAL,
      name: SAMPLE.name,
      roleVendor: SAMPLE.roleVendor,
      roleCustomer: SAMPLE.roleCustomer,
      contactFirstName: SAMPLE.contactFirstName,
      contactLastName: SAMPLE.contactLastName,
      contactEmail: SAMPLE.contactEmail,
      contactPhone: SAMPLE.contactPhone,
    },
    title: 'Scene 5 of 9 \u2014 Contact Filled',
    description: 'Contact details are complete. The user proceeds to address.',
    interaction: 'The user clicks "Next Step" to proceed.',
  },
  {
    wizardStep: 2,
    submitted: false,
    formData: {
      ...INITIAL,
      name: SAMPLE.name,
      roleVendor: SAMPLE.roleVendor,
      roleCustomer: SAMPLE.roleCustomer,
      contactFirstName: SAMPLE.contactFirstName,
      contactLastName: SAMPLE.contactLastName,
      contactEmail: SAMPLE.contactEmail,
      contactPhone: SAMPLE.contactPhone,
    },
    title: 'Scene 6 of 9 \u2014 Address Step (Empty)',
    description: 'The address form is displayed. The user enters city, state, and country.',
    interaction: 'The user fills in address fields.',
  },
  {
    wizardStep: 2,
    submitted: false,
    formData: { ...SAMPLE },
    title: 'Scene 7 of 9 \u2014 Address Complete',
    description: 'All address details are filled. The user advances to review.',
    interaction: 'The user clicks "Next Step" to review.',
  },
  {
    wizardStep: 3,
    submitted: false,
    formData: { ...SAMPLE },
    title: 'Scene 8 of 9 \u2014 Review',
    description: 'The review shows the full supplier record.',
    interaction: 'The user verifies and clicks "Create Supplier".',
  },
  {
    wizardStep: 3,
    submitted: true,
    formData: { ...SAMPLE },
    title: 'Scene 9 of 9 \u2014 Supplier Created',
    description: 'The supplier has been created successfully.',
    interaction: 'The user clicks "Start Over" to create another supplier.',
  },
];

// ---------------------------------------------------------------------------
// Inline form helpers
// ---------------------------------------------------------------------------

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  fontSize: 14,
  width: '100%',
};

const labelStyle: React.CSSProperties = { fontSize: 14, fontWeight: 500 };

function FormField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label htmlFor={id} style={labelStyle}>
        {label}
      </label>
      <input
        id={id}
        aria-label={label}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Wizard
// ---------------------------------------------------------------------------

function ExperimentalWizardCanary(props: WizardProps<SupplierFormData>) {
  const w = useWizard(props, {
    initial: INITIAL,
    stepNames: ['Identity', 'Contact', 'Address', 'Review'],
    canAdvance: (step, data) => {
      if (step === 0) return !!data.name.trim();
      return true;
    },
  });

  const roles: string[] = [];
  if (w.formData.roleVendor) roles.push('Vendor');
  if (w.formData.roleCustomer) roles.push('Customer');
  if (w.formData.roleCarrier) roles.push('Carrier');
  const rolesLabel = roles.length > 0 ? roles.join(', ') : '\u2014';

  const contactName = [w.formData.contactFirstName, w.formData.contactLastName]
    .filter(Boolean)
    .join(' ');

  const addressParts = [w.formData.city, w.formData.state, w.formData.country].filter(Boolean);
  const addressLabel = addressParts.length > 0 ? addressParts.join(', ') : '\u2014';

  return (
    <UseCaseShell
      wizard={w}
      guides={guides}
      heading="Create New Supplier"
      subtitle="Register a new supplier with identity, contact, and address details."
      submitLabel="Create Supplier"
      success={
        <SuccessScreen
          title="Supplier created successfully"
          subtitle={
            <>
              <strong>{w.formData.name}</strong> has been added to your supplier registry.
            </>
          }
          details={
            <>
              <SummaryRow label="Roles" value={rolesLabel} />
              <SummaryRow label="Contact" value={contactName || '\u2014'} />
              <SummaryRow label="Email" value={w.formData.contactEmail || '\u2014'} />
              <SummaryRow label="Address" value={addressLabel} />
            </>
          }
          onReset={w.handleReset}
        />
      }
    >
      {/* Step 0 -- Identity */}
      {w.step === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FormField
            id="supplier-name"
            label="Name"
            value={w.formData.name}
            onChange={(v) => w.setFormData({ ...w.formData, name: v })}
            placeholder="Enter supplier name"
          />
          <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Roles</legend>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                <input
                  type="checkbox"
                  checked={w.formData.roleVendor === 'true'}
                  onChange={(e) =>
                    w.setFormData({ ...w.formData, roleVendor: e.target.checked ? 'true' : '' })
                  }
                />
                Vendor
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                <input
                  type="checkbox"
                  checked={w.formData.roleCustomer === 'true'}
                  onChange={(e) =>
                    w.setFormData({ ...w.formData, roleCustomer: e.target.checked ? 'true' : '' })
                  }
                />
                Customer
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                <input
                  type="checkbox"
                  checked={w.formData.roleCarrier === 'true'}
                  onChange={(e) =>
                    w.setFormData({ ...w.formData, roleCarrier: e.target.checked ? 'true' : '' })
                  }
                />
                Carrier
              </label>
            </div>
          </fieldset>
        </div>
      )}

      {/* Step 1 -- Contact */}
      {w.step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FormField
            id="contact-first-name"
            label="First Name"
            value={w.formData.contactFirstName}
            onChange={(v) => w.setFormData({ ...w.formData, contactFirstName: v })}
            placeholder="Enter first name"
          />
          <FormField
            id="contact-last-name"
            label="Last Name"
            value={w.formData.contactLastName}
            onChange={(v) => w.setFormData({ ...w.formData, contactLastName: v })}
            placeholder="Enter last name"
          />
          <FormField
            id="contact-email"
            label="Email"
            value={w.formData.contactEmail}
            onChange={(v) => w.setFormData({ ...w.formData, contactEmail: v })}
            placeholder="Enter email address"
          />
          <FormField
            id="contact-phone"
            label="Phone"
            value={w.formData.contactPhone}
            onChange={(v) => w.setFormData({ ...w.formData, contactPhone: v })}
            placeholder="Enter phone number"
          />
        </div>
      )}

      {/* Step 2 -- Address */}
      {w.step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FormField
            id="address-city"
            label="City"
            value={w.formData.city}
            onChange={(v) => w.setFormData({ ...w.formData, city: v })}
            placeholder="Enter city"
          />
          <FormField
            id="address-state"
            label="State"
            value={w.formData.state}
            onChange={(v) => w.setFormData({ ...w.formData, state: v })}
            placeholder="Enter state"
          />
          <FormField
            id="address-country"
            label="Country"
            value={w.formData.country}
            onChange={(v) => w.setFormData({ ...w.formData, country: v })}
            placeholder="Enter country"
          />
        </div>
      )}

      {/* Step 3 -- Review */}
      {w.step === 3 && (
        <>
          <p style={{ fontSize: 14, color: 'var(--base-muted-foreground)', margin: 0 }}>
            Review the supplier details below before creating the record.
          </p>
          <SummaryCard>
            <SummaryRow label="Supplier Name" value={w.formData.name} bold />
            <SummaryRow label="Roles" value={rolesLabel} />
            <Divider />
            <SummaryRow label="Contact" value={contactName || '\u2014'} />
            <SummaryRow label="Email" value={w.formData.contactEmail || '\u2014'} />
            <SummaryRow label="Phone" value={w.formData.contactPhone || '\u2014'} />
            <Divider />
            <SummaryRow label="Address" value={addressLabel} />
          </SummaryCard>
        </>
      )}
    </UseCaseShell>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

const meta = {
  title:
    'Use Cases/Reference/Business Affiliates/BA-0003 Create Supplier/[Experimental] Wizard (Canary)',
  tags: ['skip-ci', 'experimental'],
  parameters: { layout: 'centered' },
} satisfies Meta;

const { Interactive, Stepwise, Automated } = createUseCaseStories<SupplierFormData>({
  guides,
  scenes,
  Wizard: ExperimentalWizardCanary,
  delayMs: 2000,
  play: async ({ canvas, goToScene, delay }) => {
    /* Scene 1 -- empty form */
    goToScene(0);
    await delay();

    /* Scene 2 -- type company name */
    await userEvent.type(canvas.getByLabelText('Name'), SAMPLE.name);
    goToScene(1);
    await delay();

    /* Scene 3 -- check Vendor + Customer */
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
