/**
 * BA::0004::0001 — Edit Supplier: Happy Path
 *
 * Three story variants:
 *   Interactive — live page with drawer auto-opened in view mode; user drives interaction
 *   Stepwise    — manual scene navigator showing key states of the edit flow
 *   Automated   — play function executes the full view → edit → save round-trip
 *
 * Uses EditableSuppliersPage wrapper which manages view/edit mode transitions
 * and wires the PUT /api/arda/business-affiliate/:entityId handler.
 */
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect, waitFor, userEvent, screen } from 'storybook/test';
import { EditableSuppliersPage } from './editable-suppliers-page';
import {
  businessAffiliateHandlers,
  resetAffiliateStore,
  affiliateStore,
} from '../_shared/msw-handlers';
import { storyStepDelay } from '../_shared/story-step-delay';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof EditableSuppliersPage> = {
  title: 'Use Cases/Reference/Business Affiliates/BA-0004 Edit Supplier/0001 Happy Path',
  component: EditableSuppliersPage,
  parameters: {
    layout: 'fullscreen',
    fullAppProviders: true,
    msw: { handlers: businessAffiliateHandlers },
  },
  beforeEach: () => {
    resetAffiliateStore();
  },
};
export default meta;
type Story = StoryObj<typeof EditableSuppliersPage>;

// ---------------------------------------------------------------------------
// Stepwise scene navigator
// ---------------------------------------------------------------------------

/**
 * Guide entry describing a single step in the edit flow.
 */
interface GuideEntry {
  step: number;
  title: string;
  description: string;
  interaction: string;
}

const GUIDE_ENTRIES: GuideEntry[] = [
  {
    step: 1,
    title: 'View Supplier Details',
    description: 'The detail drawer is open showing supplier data in read-only mode.',
    interaction: 'Observe the read-only fields. Edit and Delete buttons are visible in the footer.',
  },
  {
    step: 2,
    title: 'Enter Edit Mode',
    description: 'Click "Edit". Fields become editable input controls.',
    interaction: 'Click the "Edit" button in the drawer footer.',
  },
  {
    step: 3,
    title: 'Modify Fields',
    description: 'Change contact email and city fields.',
    interaction:
      'Clear the Email field and type "newemail@example.com". Clear City and type "New York".',
  },
  {
    step: 4,
    title: 'Save Changes',
    description: 'Click "Save". The PUT request is sent and a success toast appears.',
    interaction: 'Click the "Save" button in the drawer footer.',
  },
  {
    step: 5,
    title: 'View Updated Data',
    description: 'Drawer returns to view mode showing the updated email and city values.',
    interaction: 'Observe "newemail@example.com" and "New York" in the read-only fields.',
  },
];

function StepwiseGuide({ entries, currentStep }: { entries: GuideEntry[]; currentStep: number }) {
  const entry = entries[currentStep];
  if (!entry) return null;
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        width: 320,
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: '16px 20px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        zIndex: 1000,
        fontFamily: 'sans-serif',
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#6b7280',
          marginBottom: 4,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Step {entry.step} of {entries.length}
      </p>
      <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
        {entry.title}
      </p>
      <p style={{ fontSize: 13, color: '#374151', marginBottom: 8 }}>{entry.description}</p>
      <p style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>{entry.interaction}</p>
    </div>
  );
}

function StepwiseNavControls({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  onReset,
}: {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        display: 'flex',
        gap: 8,
        zIndex: 1001,
      }}
    >
      <button
        onClick={onReset}
        style={{
          padding: '8px 14px',
          borderRadius: 8,
          border: '1px solid #d1d5db',
          background: 'white',
          fontSize: 13,
          cursor: 'pointer',
          color: '#374151',
        }}
      >
        Reset
      </button>
      <button
        onClick={onPrev}
        disabled={currentStep === 0}
        style={{
          padding: '8px 14px',
          borderRadius: 8,
          border: '1px solid #d1d5db',
          background: currentStep === 0 ? '#f9fafb' : 'white',
          fontSize: 13,
          cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
          color: currentStep === 0 ? '#9ca3af' : '#374151',
        }}
      >
        Previous
      </button>
      <button
        onClick={onNext}
        disabled={currentStep === totalSteps - 1}
        style={{
          padding: '8px 14px',
          borderRadius: 8,
          border: '1px solid #d1d5db',
          background: currentStep === totalSteps - 1 ? '#f9fafb' : '#111827',
          fontSize: 13,
          cursor: currentStep === totalSteps - 1 ? 'not-allowed' : 'pointer',
          color: currentStep === totalSteps - 1 ? '#9ca3af' : 'white',
        }}
      >
        Next
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stepwise story — scene navigator with guide panels
// ---------------------------------------------------------------------------

/** Renders the stepwise scene navigator that steps through the edit flow. */
function StepwiseEditViewer() {
  const [step, setStep] = useState(0);
  const [key, setKey] = useState(0);

  // Reset resets both the step and remounts the page (fresh MSW store)
  const handleReset = () => {
    resetAffiliateStore();
    setKey((k) => k + 1);
    setStep(0);
  };

  // Get the first affiliate eId from the store for auto-open
  const firstAffiliateId = affiliateStore[0]?.payload.eId;

  return (
    <>
      <EditableSuppliersPage key={key} initialAffiliateId={firstAffiliateId} pageSize={10} />
      <StepwiseGuide entries={GUIDE_ENTRIES} currentStep={step} />
      <StepwiseNavControls
        currentStep={step}
        totalSteps={GUIDE_ENTRIES.length}
        onPrev={() => setStep((s) => Math.max(0, s - 1))}
        onNext={() => setStep((s) => Math.min(GUIDE_ENTRIES.length - 1, s + 1))}
        onReset={handleReset}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Interactive — free-form user interaction, no play function
// ---------------------------------------------------------------------------

export const Interactive: Story = {
  name: 'Interactive',
  render: () => {
    // Get the first affiliate eId at render time (after resetAffiliateStore runs)
    const firstAffiliateId = affiliateStore[0]?.payload.eId;
    return <EditableSuppliersPage initialAffiliateId={firstAffiliateId} pageSize={10} />;
  },
};

// ---------------------------------------------------------------------------
// Stepwise — scene navigator with guide panels
// ---------------------------------------------------------------------------

export const Stepwise: Story = {
  name: 'Stepwise',
  render: () => <StepwiseEditViewer />,
};

// ---------------------------------------------------------------------------
// Automated — full play function verifying the edit round-trip
// ---------------------------------------------------------------------------

export const Automated: Story = {
  name: 'Automated',
  render: () => {
    const firstAffiliateId = affiliateStore[0]?.payload.eId;
    return <EditableSuppliersPage initialAffiliateId={firstAffiliateId} pageSize={10} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Step 1: Wait for grid to load — find Apex Medical Distributors in the grid cell,
    // then click the row to open the drawer.
    // Note: EditableSuppliersPage sets onRowClick on SuppliersPage, which bypasses
    // the deep-link auto-open; the drawer only opens via an explicit row click.
    const gridCell = await canvas.findByText(
      'Apex Medical Distributors',
      { selector: '[role="gridcell"]' },
      { timeout: 10000 },
    );
    await userEvent.click(gridCell);

    // Step 2: Verify the drawer opens in view mode — "Edit" and "Delete" buttons visible
    const drawer = await canvas.findByRole('dialog', {}, { timeout: 10000 });
    expect(drawer).toBeVisible();
    const drawerScope = within(drawer);
    const editButton = await drawerScope.findByRole(
      'button',
      { name: /^edit$/i },
      { timeout: 10000 },
    );
    expect(editButton).toBeVisible();
    const deleteButton = drawerScope.getByRole('button', { name: /^delete$/i });
    expect(deleteButton).toBeVisible();

    await storyStepDelay();

    // Step 3: Click "Edit" to transition to edit mode
    await userEvent.click(editButton);

    // Step 4: Verify mode transition — Save/Cancel shown, Edit/Delete hidden
    const saveButton = await canvas.findByRole('button', { name: /^save$/i }, { timeout: 10000 });
    expect(saveButton).toBeVisible();
    const cancelButton = canvas.getByRole('button', { name: /^cancel$/i });
    expect(cancelButton).toBeVisible();
    await waitFor(
      () => {
        expect(canvas.queryByRole('button', { name: /^edit$/i })).not.toBeInTheDocument();
      },
      { timeout: 10000 },
    );

    await storyStepDelay();

    // Step 5: Locate the contact email field (Contact section is expanded since Apex has contact data)
    const emailInput = canvas.getByLabelText(/^email$/i) as HTMLInputElement;
    expect(emailInput).toBeVisible();

    // Step 6: Clear current email and type new value
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'newemail@example.com');

    await storyStepDelay();

    // Step 7: Locate the city field (Address section is expanded since Apex has address data)
    const cityInput = canvas.getByLabelText(/^city$/i) as HTMLInputElement;
    expect(cityInput).toBeVisible();

    // Step 8: Clear current city ("Denver") and type new value
    await userEvent.clear(cityInput);
    await userEvent.type(cityInput, 'New York');

    await storyStepDelay();

    // Step 9: Click "Save"
    await userEvent.click(saveButton);

    // Step 10: Verify success toast (Sonner renders via portal to document.body — use screen)
    const toastText = await screen.findByText(
      /supplier updated successfully/i,
      {},
      { timeout: 10000 },
    );
    await waitFor(
      () => {
        expect(toastText).toBeVisible();
      },
      { timeout: 10000 },
    );

    await storyStepDelay();

    // Step 11: Verify drawer returns to view mode (Save button disappears, Edit button reappears)
    await waitFor(
      () => {
        expect(canvas.queryByRole('button', { name: /^save$/i })).not.toBeInTheDocument();
      },
      { timeout: 10000 },
    );
    const editButtonAfterSave = await canvas.findByRole(
      'button',
      { name: /^edit$/i },
      { timeout: 10000 },
    );
    expect(editButtonAfterSave).toBeVisible();

    await storyStepDelay();

    // Step 12: Verify the updated email shows in view mode (scope to drawer to avoid
    // matching the grid cell which also updates with the new email)
    const drawerAfterSave = await canvas.findByRole('dialog', {}, { timeout: 10000 });
    const viewScope = within(drawerAfterSave);
    expect(viewScope.getByText('newemail@example.com')).toBeVisible();

    // Step 13: Verify the updated city shows in view mode
    expect(viewScope.getByText('New York')).toBeVisible();
  },
};
