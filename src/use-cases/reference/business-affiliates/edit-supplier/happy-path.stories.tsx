/**
 * BA::0004::0001 — Edit Supplier: Happy Path
 *
 * Three story variants:
 *   Interactive — live form in view mode; user switches to edit and saves
 *   Stepwise    — scene-by-scene walkthrough of the edit flow states
 *   Automated   — play function executes the full view → edit → save flow
 *
 * Uses the DSL framework (createUseCaseStories + useWizard + UseCaseShell)
 * to render the edit flow with ArdaSupplierForm.
 */
import type { Meta } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { ArdaSupplierForm } from '@/components/extras/organisms/reference/business-affiliates/supplier-form/supplier-form';
import type { BusinessAffiliate, BusinessRoleType } from '@/types/extras';
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
   DATA — Apex Medical Distributors (first affiliate in mock store)
   ================================================================ */

interface EditFormData {
  /* Identity */
  name: string;

  /* Contact */
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  contactJobTitle: string;

  /* Address */
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;

  /* Legal */
  legalName: string;
  taxId: string;

  /* Notes */
  notes: string;
}

/** Original Apex Medical Distributors data before edits. */
const INITIAL: EditFormData = {
  name: 'Apex Medical Distributors',
  contactFirstName: 'Jordan',
  contactLastName: 'Rivera',
  contactEmail: 'jordan.rivera@apexmedical.com',
  contactPhone: '+1-303-555-0142',
  contactJobTitle: 'Account Manager',
  addressLine1: '4200 E 9th Ave',
  addressLine2: '',
  city: 'Denver',
  state: 'CO',
  postalCode: '80220',
  country: 'US',
  legalName: 'Apex Medical Distributors LLC',
  taxId: '84-1234567',
  notes: '',
};

/** Updated data after the user modifies email and city. */
const SAMPLE: EditFormData = {
  ...INITIAL,
  contactEmail: 'newemail@example.com',
  city: 'New York',
};

function formDataToAffiliate(data: EditFormData): BusinessAffiliate {
  const vendorRole: BusinessAffiliate['roles'][number] = { role: 'VENDOR' as BusinessRoleType };
  return {
    eId: 'apex-medical-001',
    name: data.name,
    roles: [vendorRole],
    contact: {
      firstName: data.contactFirstName,
      lastName: data.contactLastName,
      email: data.contactEmail,
      phone: data.contactPhone,
      jobTitle: data.contactJobTitle,
    },
    mainAddress: {
      addressLine1: data.addressLine1,
      ...(data.addressLine2 ? { addressLine2: data.addressLine2 } : {}),
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country,
    },
    legal: {
      legalName: data.legalName,
      taxId: data.taxId,
    },
    ...(data.notes ? { notes: data.notes } : {}),
  };
}

function affiliateToFormData(ba: BusinessAffiliate): EditFormData {
  return {
    name: ba.name,
    contactFirstName: ba.contact?.firstName ?? '',
    contactLastName: ba.contact?.lastName ?? '',
    contactEmail: ba.contact?.email ?? '',
    contactPhone: ba.contact?.phone ?? '',
    contactJobTitle: ba.contact?.jobTitle ?? '',
    addressLine1: ba.mainAddress?.addressLine1 ?? '',
    addressLine2: ba.mainAddress?.addressLine2 ?? '',
    city: ba.mainAddress?.city ?? '',
    state: ba.mainAddress?.state ?? '',
    postalCode: ba.mainAddress?.postalCode ?? '',
    country: ba.mainAddress?.country ?? '',
    legalName: ba.legal?.legalName ?? '',
    taxId: ba.legal?.taxId ?? '',
    notes: ba.notes ?? '',
  };
}

/* ================================================================
   GUIDES — two wizard steps + success
   ================================================================ */

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
      'Fields are now editable. The user can update the contact email and city, then save the changes. ' +
      'The PUT request is sent and a confirmation is shown on success.',
    interaction:
      'Update the Email field to "newemail@example.com" and City to "New York", then click "Save Changes".',
  },
  {
    title: 'Success',
    description:
      'The supplier record has been updated successfully. The updated email and city values are now persisted.',
    interaction: 'Click "Start Over" to view the original record again.',
  },
];

/* ================================================================
   SCENES — five steps through the edit flow
   ================================================================ */

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
      'Both email and city are updated. The form is ready to save. Clicking "Save Changes" sends the PUT request.',
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

/* ================================================================
   WIZARD — two-step edit flow
   ================================================================ */

function EditSupplierWizard(props: WizardProps<EditFormData>) {
  const w = useWizard(props, {
    initial: INITIAL,
    stepNames: ['View Details', 'Edit & Save'],
    canAdvance: () => true,
  });

  const contactName = [w.formData.contactFirstName, w.formData.contactLastName]
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
              <SummaryRow label="Address" value={addressLabel} />
            </>
          }
          onReset={w.handleReset}
          resetLabel="Start Over"
        />
      }
    >
      {/* Step 0 — View Details (read-only) */}
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
            <SummaryRow label="Address" value={addressLabel} />
            <Divider />
            <SummaryRow label="Legal Name" value={w.formData.legalName || '\u2014'} />
            <SummaryRow label="Tax ID" value={w.formData.taxId || '\u2014'} />
          </SummaryCard>
        </>
      )}

      {/* Step 1 — Edit form */}
      {w.step === 1 && (
        <ArdaSupplierForm
          value={formDataToAffiliate(w.formData)}
          onChange={(ba) => w.setFormData(affiliateToFormData(ba))}
          mode="single-scroll"
        />
      )}
    </UseCaseShell>
  );
}

/* ================================================================
   STORIES
   ================================================================ */

const meta = {
  title: 'Use Cases/Reference/Business Affiliates/BA-0004 Edit Supplier/Happy Path',
  parameters: { layout: 'centered' },
} satisfies Meta;

const { Interactive, Stepwise, Automated } = createUseCaseStories<EditFormData>({
  guides,
  scenes,
  Wizard: EditSupplierWizard,
  delayMs: 1500,
  play: async ({ canvas, goToScene, delay }) => {
    /* Scene 1 — view mode with initial supplier data */
    goToScene(0);
    await delay();

    /* Advance to edit step — ArdaSupplierViewer is rendered in step 1 */
    const nextBtn = canvas.getByRole('button', { name: /next step/i });
    await userEvent.click(nextBtn);
    goToScene(1);
    await delay();

    /* Wait for ArdaSupplierViewer to finish loading (getSupplier has 300ms delay) */
    await waitFor(
      () => {
        // Loading overlay shows "Loading…"; once it's gone the viewer is ready
        expect(canvas.queryByText('Loading…')).not.toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    /* Enter edit mode in the viewer */
    const editBtn = await waitFor(
      () => canvas.getByRole('button', { name: /^edit$/i }),
      { timeout: 5000 },
    );
    await userEvent.click(editBtn);

    /* Expand the Contact Information sub-viewer */
    const contactToggle = canvas.getByRole('button', { name: /contact information/i });
    await userEvent.click(contactToggle);

    /* Update email field */
    const emailInput = await waitFor(
      () => canvas.getByLabelText(/^email$/i) as HTMLInputElement,
      { timeout: 5000 },
    );
    expect(emailInput).toBeVisible();
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, SAMPLE.contactEmail);
    goToScene(2);
    await delay();

    /* Expand the Primary Address sub-viewer */
    const addressToggle = canvas.getByRole('button', { name: /primary address/i });
    await userEvent.click(addressToggle);

    /* Update city field — scope to the Primary Address sub-viewer container to avoid
       ambiguity with the Contact sub-viewer's postalAddress city field */
    const cityInput = await waitFor(
      () => {
        // The SubViewerContainer renders: <div><button>Primary Address</button><div>fields</div></div>
        // Get the container div (parent of the toggle button) and query within it
        const container = addressToggle.closest('.border.border-gray-200.rounded-lg') as HTMLElement;
        if (!container) throw new Error('Primary Address container not found');
        return within(container).getByLabelText(/^city$/i) as HTMLInputElement;
      },
      { timeout: 5000 },
    );
    expect(cityInput).toBeVisible();
    await userEvent.clear(cityInput);
    await userEvent.type(cityInput, SAMPLE.city);
    goToScene(3);
    await delay();

    /* Submit via the viewer's built-in Submit button */
    const submitBtn = canvas.getByRole('button', { name: /^submit$/i });
    await userEvent.click(submitBtn);

    /* Wait for viewer to finish saving (updateSupplier has 300ms delay) */
    await waitFor(
      () => {
        expect(canvas.queryByText('Loading…')).not.toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    /* Advance the wizard to complete by clicking Save Changes */
    const saveBtn = canvas.getByRole('button', { name: /save changes/i });
    await userEvent.click(saveBtn);
    goToScene(4);
    await delay();

    /* Verify success */
    await expect(canvas.getByTestId('success-message')).toBeVisible();
  },
});

export default meta;
export { Interactive, Stepwise, Automated };
