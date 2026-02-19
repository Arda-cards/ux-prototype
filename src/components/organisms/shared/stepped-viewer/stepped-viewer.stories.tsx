import type { Meta, StoryObj } from '@storybook/react-vite';

import { ArdaBadge } from '@/components/atoms/badge/badge';
import {
  UseCaseShell,
  useWizard,
  FormField,
  FormSelect,
  FormRow,
  SummaryCard,
  SummaryRow,
  Divider,
  SuccessScreen,
  type GuideEntry,
  type WizardProps,
} from '@/use-cases/framework';

/* ================================================================
   DEMO DATA
   ================================================================ */

interface DemoFormData {
  fullName: string;
  email: string;
  role: string;
  department: string;
  notes: string;
}

const INITIAL: DemoFormData = {
  fullName: '',
  email: '',
  role: '',
  department: '',
  notes: '',
};

const ROLES = ['Engineer', 'Designer', 'Manager', 'Analyst'];
const DEPARTMENTS = ['Engineering', 'Design', 'Operations', 'Finance'];

const guides: GuideEntry[] = [
  {
    title: 'Step 1: Identity',
    description: 'Enter the person\u2019s full name and email address.',
    interaction: 'Fill in both fields and click "Next Step" to continue.',
  },
  {
    title: 'Step 2: Assignment',
    description: 'Select a role and department for the new team member.',
    interaction: 'Choose values from the dropdowns and click "Next Step".',
  },
  {
    title: 'Step 3: Review',
    description: 'Verify all details before confirming.',
    interaction: 'Click "Confirm" to finish, or "Back" to make changes.',
  },
  {
    title: 'Success',
    description: 'The team member has been added.',
    interaction: 'Click "Start Over" to add another.',
  },
];

/* ================================================================
   DEMO WIZARD
   ================================================================ */

function DemoWizard(props: WizardProps<DemoFormData>) {
  const w = useWizard(props, {
    initial: INITIAL,
    stepNames: ['Identity', 'Assignment', 'Review'],
    canAdvance: (step, data) => {
      if (step === 0) return !!(data.fullName && data.email);
      if (step === 1) return !!(data.role && data.department);
      return true;
    },
  });

  return (
    <UseCaseShell
      wizard={w}
      guides={guides}
      heading="Add Team Member"
      subtitle="Register a new team member with role and department."
      submitLabel="Confirm"
      success={
        <SuccessScreen
          title="Team member added"
          subtitle={
            <>
              <strong>{w.formData.fullName}</strong> has been registered.
            </>
          }
          badges={
            <>
              <ArdaBadge variant="info">{w.formData.role}</ArdaBadge>
              <ArdaBadge variant="outline">{w.formData.department}</ArdaBadge>
            </>
          }
          details={
            <>
              <SummaryRow label="Email" value={w.formData.email} />
              <SummaryRow label="Notes" value={w.formData.notes || '\u2014'} />
            </>
          }
          onReset={w.handleReset}
        />
      }
    >
      {w.step === 0 && (
        <>
          <FormField
            label="Full Name"
            name="fullName"
            placeholder="e.g. Jane Doe"
            value={w.formData.fullName}
            onChange={w.handleChange}
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            placeholder="e.g. jane@example.com"
            value={w.formData.email}
            onChange={w.handleChange}
          />
        </>
      )}

      {w.step === 1 && (
        <>
          <FormRow>
            <FormSelect
              label="Role"
              name="role"
              value={w.formData.role}
              onChange={w.handleChange}
              options={ROLES}
              placeholder="Select role..."
            />
            <FormSelect
              label="Department"
              name="department"
              value={w.formData.department}
              onChange={w.handleChange}
              options={DEPARTMENTS}
              placeholder="Select department..."
            />
          </FormRow>
          <FormField
            label="Notes"
            name="notes"
            placeholder="Optional notes..."
            value={w.formData.notes}
            onChange={w.handleChange}
          />
        </>
      )}

      {w.step === 2 && (
        <>
          <p style={{ fontSize: 14, color: 'var(--base-muted-foreground)', margin: 0 }}>
            Review the details below before confirming.
          </p>
          <SummaryCard>
            <SummaryRow label="Full Name" value={w.formData.fullName} bold />
            <SummaryRow label="Email" value={w.formData.email} />
            <Divider />
            <SummaryRow label="Role" value={w.formData.role} />
            <SummaryRow label="Department" value={w.formData.department} />
            {w.formData.notes && (
              <>
                <Divider />
                <SummaryRow label="Notes" value={w.formData.notes} />
              </>
            )}
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
  title: 'Components/Organisms/Shared/Stepped Viewer/Demo',
  component: DemoWizard,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof DemoWizard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive wizard with guide panel. */
export const Interactive: Story = {
  render: () => <DemoWizard showGuide />,
};

/** Wizard without guide panel. */
export const WithoutGuide: Story = {
  render: () => <DemoWizard />,
};
