/**
 * REF::BA::0003::0001 — Create Supplier: Happy Path (Canary)
 *
 * Canary variant of the create-supplier happy path using the wizard framework
 * with a simple inline form (no ArdaSupplierForm from extras).
 *
 * Two wizard steps:
 *   Step 1: Enter Name + select roles (checkboxes)
 *   Step 2: Review & Confirm
 */
import type { Meta } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import {
  createUseCaseStories,
  UseCaseShell,
  SummaryCard,
  SummaryRow,
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
}

const INITIAL: SupplierFormData = {
  name: '',
  roleVendor: '',
  roleCustomer: '',
  roleCarrier: '',
};

const SAMPLE: SupplierFormData = {
  name: 'Fastenal Corp.',
  roleVendor: 'true',
  roleCustomer: 'true',
  roleCarrier: '',
};

// ---------------------------------------------------------------------------
// Guides
// ---------------------------------------------------------------------------

const guides: GuideEntry[] = [
  {
    title: 'Step 1: Name & Roles',
    description:
      'Enter the supplier name (required) and select one or more business roles using the checkboxes.',
    interaction:
      'Type the company name, check applicable role boxes. Click "Next Step" when done.',
  },
  {
    title: 'Step 2: Review & Confirm',
    description:
      'Review the supplier name and roles before creating the record.',
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
    title: 'Scene 1 of 5 \u2014 Empty Form',
    description: 'The wizard starts on Step 1 with an empty name field.',
    interaction: 'The user types the company name.',
  },
  {
    wizardStep: 0,
    submitted: false,
    formData: { ...INITIAL, name: SAMPLE.name },
    title: 'Scene 2 of 5 \u2014 Name Entered',
    description: 'The company name is entered. The user selects business roles.',
    interaction: 'The user checks Vendor and Customer.',
  },
  {
    wizardStep: 0,
    submitted: false,
    formData: { ...SAMPLE },
    title: 'Scene 3 of 5 \u2014 Roles Selected',
    description: 'Name and roles are set. The user advances to review.',
    interaction: 'The user clicks "Next Step" to proceed.',
  },
  {
    wizardStep: 1,
    submitted: false,
    formData: { ...SAMPLE },
    title: 'Scene 4 of 5 \u2014 Review',
    description: 'The review shows the supplier name and selected roles.',
    interaction: 'The user verifies and clicks "Create Supplier".',
  },
  {
    wizardStep: 1,
    submitted: true,
    formData: { ...SAMPLE },
    title: 'Scene 5 of 5 \u2014 Supplier Created',
    description: 'The supplier has been created successfully.',
    interaction: 'The user clicks "Start Over" to create another supplier.',
  },
];

// ---------------------------------------------------------------------------
// Inline form component (replaces ArdaSupplierForm)
// ---------------------------------------------------------------------------

function InlineSupplierForm({
  data,
  onChange,
}: {
  data: SupplierFormData;
  onChange: (updated: SupplierFormData) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label htmlFor="supplier-name" style={{ fontSize: 14, fontWeight: 500 }}>
          Name
        </label>
        <input
          id="supplier-name"
          aria-label="Name"
          type="text"
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          placeholder="Enter supplier name"
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: 6,
            fontSize: 14,
          }}
        />
      </div>

      <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Roles</legend>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <input
              type="checkbox"
              checked={data.roleVendor === 'true'}
              onChange={(e) =>
                onChange({ ...data, roleVendor: e.target.checked ? 'true' : '' })
              }
            />
            Vendor
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <input
              type="checkbox"
              checked={data.roleCustomer === 'true'}
              onChange={(e) =>
                onChange({ ...data, roleCustomer: e.target.checked ? 'true' : '' })
              }
            />
            Customer
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <input
              type="checkbox"
              checked={data.roleCarrier === 'true'}
              onChange={(e) =>
                onChange({ ...data, roleCarrier: e.target.checked ? 'true' : '' })
              }
            />
            Carrier
          </label>
        </div>
      </fieldset>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Wizard
// ---------------------------------------------------------------------------

function CreateSupplierCanaryWizard(props: WizardProps<SupplierFormData>) {
  const w = useWizard(props, {
    initial: INITIAL,
    stepNames: ['Name & Roles', 'Review & Confirm'],
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

  return (
    <UseCaseShell
      wizard={w}
      guides={guides}
      heading="Create New Supplier"
      subtitle="Enter the supplier name and assign business roles."
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
            </>
          }
          onReset={w.handleReset}
        />
      }
    >
      {/* Step 0 -- Name & Roles */}
      {w.step === 0 && (
        <InlineSupplierForm data={w.formData} onChange={w.setFormData} />
      )}

      {/* Step 1 -- Review & Confirm */}
      {w.step === 1 && (
        <>
          <p style={{ fontSize: 14, color: 'var(--base-muted-foreground)', margin: 0 }}>
            Review the supplier details below before creating the record.
          </p>
          <SummaryCard>
            <SummaryRow label="Supplier Name" value={w.formData.name} bold />
            <SummaryRow label="Roles" value={rolesLabel} />
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
    'Use Cases/Reference/Business Affiliates/BA-0003 Create Supplier/Happy Path (Canary)',
  tags: ['skip-ci'],
  parameters: { layout: 'centered' },
} satisfies Meta;

const { Interactive, Stepwise, Automated } = createUseCaseStories<SupplierFormData>({
  guides,
  scenes,
  Wizard: CreateSupplierCanaryWizard,
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
