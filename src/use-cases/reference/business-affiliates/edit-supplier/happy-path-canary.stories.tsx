/**
 * REF::BA::0004::0001 — Edit Supplier: Happy Path (Canary)
 *
 * Canary variant of the edit-supplier happy path using the wizard framework
 * with a simple inline form (no ArdaSupplierForm from extras).
 *
 * Two wizard steps:
 *   Step 1: View existing details (read-only SummaryCard)
 *   Step 2: Edit form (simple inputs pre-filled)
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

interface EditFormData {
  name: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  contactJobTitle: string;
  city: string;
  state: string;
  legalName: string;
  taxId: string;
}

/** Original Apex Medical Distributors data before edits. */
const INITIAL: EditFormData = {
  name: 'Apex Medical Distributors',
  contactFirstName: 'Jordan',
  contactLastName: 'Rivera',
  contactEmail: 'jordan.rivera@apexmedical.com',
  contactPhone: '+1-303-555-0142',
  contactJobTitle: 'Account Manager',
  city: 'Denver',
  state: 'CO',
  legalName: 'Apex Medical Distributors LLC',
  taxId: '84-1234567',
};

/** Updated data after the user modifies email and city. */
const SAMPLE: EditFormData = {
  ...INITIAL,
  contactEmail: 'newemail@example.com',
  city: 'New York',
};

// ---------------------------------------------------------------------------
// Guides
// ---------------------------------------------------------------------------

const guides: GuideEntry[] = [
  {
    title: 'Step 1: View Supplier Details',
    description:
      'The supplier record is displayed in view mode. All fields show the current persisted values. ' +
      'Review the contact, address, and legal information before making changes.',
    interaction: 'Click "Next Step" to enter edit mode and modify the supplier details.',
  },
  {
    title: 'Step 2: Edit & Save',
    description:
      'Fields are now editable. The user can update the contact email and city, then save the changes.',
    interaction:
      'Update the Email field to "newemail@example.com" and City to "New York", then click "Save Changes".',
  },
  {
    title: 'Success',
    description:
      'The supplier record has been updated successfully.',
    interaction: 'Click "Start Over" to view the original record again.',
  },
];

// ---------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------

const scenes: Scene<EditFormData>[] = [
  {
    wizardStep: 0,
    submitted: false,
    formData: INITIAL,
    title: 'Scene 1 of 5 \u2014 View Mode',
    description:
      'The supplier detail form shows Apex Medical Distributors in read-only view mode with all current values.',
    interaction: 'The user reviews the supplier details.',
  },
  {
    wizardStep: 1,
    submitted: false,
    formData: INITIAL,
    title: 'Scene 2 of 5 \u2014 Edit Mode (unchanged)',
    description:
      'The form switches to edit mode. Fields become editable inputs with the existing values pre-filled.',
    interaction: 'The user clicks into the Email field and changes it.',
  },
  {
    wizardStep: 1,
    submitted: false,
    formData: { ...INITIAL, contactEmail: SAMPLE.contactEmail },
    title: 'Scene 3 of 5 \u2014 Email Updated',
    description:
      'The contact email has been changed to "newemail@example.com". The user now updates the city.',
    interaction: 'The user clears the City field and types "New York".',
  },
  {
    wizardStep: 1,
    submitted: false,
    formData: { ...SAMPLE },
    title: 'Scene 4 of 5 \u2014 Both Fields Updated',
    description:
      'Both email and city are updated. The form is ready to save.',
    interaction: 'The user clicks "Save Changes".',
  },
  {
    wizardStep: 1,
    submitted: true,
    formData: { ...SAMPLE },
    title: 'Scene 5 of 5 \u2014 Supplier Updated',
    description:
      'The supplier record has been saved successfully with the new email and city values.',
    interaction: 'The user clicks "Start Over" to view the original record.',
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

function EditSupplierCanaryWizard(props: WizardProps<EditFormData>) {
  const w = useWizard(props, {
    initial: INITIAL,
    stepNames: ['View Details', 'Edit & Save'],
    canAdvance: () => true,
  });

  const contactName = [w.formData.contactFirstName, w.formData.contactLastName]
    .filter(Boolean)
    .join(' ');

  return (
    <UseCaseShell
      wizard={w}
      guides={guides}
      heading="Edit Supplier"
      subtitle="Update the supplier's contact, address, or legal information."
      submitLabel="Save Changes"
      success={
        <SuccessScreen
          title="Supplier updated successfully"
          subtitle={
            <>
              <strong>{w.formData.name}</strong> has been updated with the new details.
            </>
          }
          details={
            <>
              <SummaryRow label="Contact" value={contactName || '\u2014'} />
              <SummaryRow label="Email" value={w.formData.contactEmail || '\u2014'} />
              <SummaryRow label="Phone" value={w.formData.contactPhone || '\u2014'} />
              <Divider />
              <SummaryRow label="City" value={w.formData.city || '\u2014'} />
              <SummaryRow label="State" value={w.formData.state || '\u2014'} />
            </>
          }
          onReset={w.handleReset}
          resetLabel="Start Over"
        />
      }
    >
      {/* Step 0 -- View Details (read-only) */}
      {w.step === 0 && (
        <>
          <p style={{ fontSize: 14, color: 'var(--base-muted-foreground)', margin: 0 }}>
            Review the current supplier details before editing.
          </p>
          <SummaryCard>
            <SummaryRow label="Company Name" value={w.formData.name} bold />
            <Divider />
            <SummaryRow label="Contact" value={contactName || '\u2014'} />
            <SummaryRow label="Job Title" value={w.formData.contactJobTitle || '\u2014'} />
            <SummaryRow label="Email" value={w.formData.contactEmail || '\u2014'} />
            <SummaryRow label="Phone" value={w.formData.contactPhone || '\u2014'} />
            <Divider />
            <SummaryRow label="City" value={w.formData.city || '\u2014'} />
            <SummaryRow label="State" value={w.formData.state || '\u2014'} />
            <Divider />
            <SummaryRow label="Legal Name" value={w.formData.legalName || '\u2014'} />
            <SummaryRow label="Tax ID" value={w.formData.taxId || '\u2014'} />
          </SummaryCard>
        </>
      )}

      {/* Step 1 -- Edit form (pre-filled inputs) */}
      {w.step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FormField
            id="edit-name"
            label="Name"
            value={w.formData.name}
            onChange={(v) => w.setFormData({ ...w.formData, name: v })}
            placeholder="Supplier name"
          />
          <FormField
            id="edit-first-name"
            label="First Name"
            value={w.formData.contactFirstName}
            onChange={(v) => w.setFormData({ ...w.formData, contactFirstName: v })}
            placeholder="Contact first name"
          />
          <FormField
            id="edit-last-name"
            label="Last Name"
            value={w.formData.contactLastName}
            onChange={(v) => w.setFormData({ ...w.formData, contactLastName: v })}
            placeholder="Contact last name"
          />
          <FormField
            id="edit-email"
            label="Email"
            value={w.formData.contactEmail}
            onChange={(v) => w.setFormData({ ...w.formData, contactEmail: v })}
            placeholder="Contact email"
          />
          <FormField
            id="edit-phone"
            label="Phone"
            value={w.formData.contactPhone}
            onChange={(v) => w.setFormData({ ...w.formData, contactPhone: v })}
            placeholder="Contact phone"
          />
          <FormField
            id="edit-city"
            label="City"
            value={w.formData.city}
            onChange={(v) => w.setFormData({ ...w.formData, city: v })}
            placeholder="City"
          />
          <FormField
            id="edit-state"
            label="State"
            value={w.formData.state}
            onChange={(v) => w.setFormData({ ...w.formData, state: v })}
            placeholder="State"
          />
        </div>
      )}
    </UseCaseShell>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

const meta = {
  title:
    'Use Cases/Reference/Business Affiliates/BA-0004 Edit Supplier/Happy Path (Canary)',
  parameters: { layout: 'centered' },
} satisfies Meta;

const { Interactive, Stepwise, Automated } = createUseCaseStories<EditFormData>({
  guides,
  scenes,
  Wizard: EditSupplierCanaryWizard,
  delayMs: 1500,
  play: async ({ canvas, goToScene, delay }) => {
    /* Scene 1 -- view mode with initial supplier data */
    goToScene(0);
    await delay();

    /* Advance to edit step */
    const nextBtn = canvas.getByRole('button', { name: /next step/i });
    await userEvent.click(nextBtn);
    goToScene(1);
    await delay();

    /* Update email field */
    const emailInput = canvas.getByLabelText('Email') as HTMLInputElement;
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, SAMPLE.contactEmail);
    goToScene(2);
    await delay();

    /* Update city field */
    const cityInput = canvas.getByLabelText('City') as HTMLInputElement;
    await userEvent.clear(cityInput);
    await userEvent.type(cityInput, SAMPLE.city);
    goToScene(3);
    await delay();

    /* Verify updated values */
    await expect(emailInput).toHaveValue(SAMPLE.contactEmail);
    await expect(cityInput).toHaveValue(SAMPLE.city);
  },
});

export default meta;
export { Interactive, Stepwise, Automated };
