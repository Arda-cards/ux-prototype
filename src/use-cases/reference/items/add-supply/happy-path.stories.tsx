import type { Meta } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';

import { ArdaBadge } from '@/components/atoms/badge/badge';
import {
  createUseCaseStories,
  UseCaseShell,
  FormField,
  FormSelect,
  FormRow,
  SummaryCard,
  SummaryRow,
  Divider,
  SuccessScreen,
  useWizard,
  formatCurrency,
  type GuideEntry,
  type Scene,
  type WizardProps,
} from '@/use-cases/framework';

/* ================================================================
   DATA
   ================================================================ */

interface SupplyFormData {
  supplier: string;
  supplyName: string;
  sku: string;
  orderMethod: string;
  url: string;
  orderQty: string;
  orderUnit: string;
  unitCost: string;
  currency: string;
  leadTime: string;
  leadTimeUnit: string;
}

const INITIAL: SupplyFormData = {
  supplier: '',
  supplyName: '',
  sku: '',
  orderMethod: '',
  url: '',
  orderQty: '',
  orderUnit: 'EACH',
  unitCost: '',
  currency: 'USD',
  leadTime: '',
  leadTimeUnit: 'DAY',
};

const SAMPLE: SupplyFormData = {
  supplier: 'Fastenal Corp.',
  supplyName: 'HC-500 Hydraulic Cylinder',
  sku: 'FAS-HC500-A',
  orderMethod: 'ONLINE',
  url: 'https://fastenal.com/hc500',
  orderQty: '5',
  orderUnit: 'EACH',
  unitCost: '189.99',
  currency: 'USD',
  leadTime: '5',
  leadTimeUnit: 'DAY',
};

const ORDER_METHODS = [
  { value: 'PURCHASE_ORDER', label: 'Purchase Order' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'PHONE', label: 'Phone' },
  { value: 'IN_STORE', label: 'In Store' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'RFQ', label: 'RFQ' },
];

const LEAD_TIME_UNITS = [
  { value: 'HOUR', label: 'Hours' },
  { value: 'DAY', label: 'Days' },
  { value: 'WEEK', label: 'Weeks' },
  { value: 'MONTH', label: 'Months' },
];

/* ================================================================
   GUIDES
   ================================================================ */

const guides: GuideEntry[] = [
  {
    title: 'Step 1: Select Supplier',
    description:
      'Choose the supplier (business affiliate) for this supply relationship. Type to search from the list of registered suppliers.',
    interaction:
      'Type a supplier name and select from the list, or enter a new supplier name. Click "Next Step" when selected.',
  },
  {
    title: 'Step 2: Supply Details',
    description:
      'Enter the supply-specific details: product name, SKU, order method, pricing, and lead time. These fields define how you order from this supplier.',
    interaction:
      'Fill in the supply name, SKU, order method, cost, and lead time. Click "Next Step" to proceed to review.',
  },
  {
    title: 'Step 3: Review & Confirm',
    description:
      'Review all supply details before saving. Verify supplier, pricing, and lead time are correct.',
    interaction:
      'Review the summary. Click "Back" to make changes, or "Confirm & Add Supply" to save.',
  },
  {
    title: 'Success',
    description:
      'The supply relationship has been created. The item is now linked to this supplier with the specified terms.',
    interaction: 'Click "Start Over" to add another supply.',
  },
];

/* ================================================================
   SCENES
   ================================================================ */

const scenes: Scene<SupplyFormData>[] = [
  {
    wizardStep: 0,
    submitted: false,
    formData: INITIAL,
    title: 'Scene 1 of 7 \u2014 Empty Form',
    description:
      'The form starts empty on Step 1. The user must select a supplier before they can advance.',
    interaction: 'The user types a supplier name into the search field.',
  },
  {
    wizardStep: 0,
    submitted: false,
    formData: { ...INITIAL, supplier: SAMPLE.supplier },
    title: 'Scene 2 of 7 \u2014 Supplier Selected',
    description: 'A supplier has been selected. The "Next Step" button is now enabled.',
    interaction: 'The user clicks "Next Step" to proceed to Supply Details.',
  },
  {
    wizardStep: 1,
    submitted: false,
    formData: { ...INITIAL, supplier: SAMPLE.supplier },
    title: 'Scene 3 of 7 \u2014 Supply Details (Empty)',
    description:
      'Step 2 collects supply-specific details. The step indicator shows Step 1 as complete.',
    interaction: 'The user enters the supply name and SKU.',
  },
  {
    wizardStep: 1,
    submitted: false,
    formData: {
      ...INITIAL,
      supplier: SAMPLE.supplier,
      supplyName: SAMPLE.supplyName,
      sku: SAMPLE.sku,
      orderMethod: SAMPLE.orderMethod,
    },
    title: 'Scene 4 of 7 \u2014 Name, SKU & Order Method Set',
    description:
      'Supply name, SKU, and order method are filled. The user continues with pricing and lead time.',
    interaction: 'The user enters the unit cost and lead time.',
  },
  {
    wizardStep: 1,
    submitted: false,
    formData: { ...SAMPLE },
    title: 'Scene 5 of 7 \u2014 Step 2 Complete',
    description: 'All supply details are filled. The user can advance to review.',
    interaction: 'The user clicks "Next Step" to review before submission.',
  },
  {
    wizardStep: 2,
    submitted: false,
    formData: { ...SAMPLE },
    title: 'Scene 6 of 7 \u2014 Review & Confirm',
    description:
      'The review shows all supply details including supplier, pricing ($189.99/unit), and lead time (5 Days).',
    interaction: 'The user verifies the data and clicks "Confirm & Add Supply" to save.',
  },
  {
    wizardStep: 2,
    submitted: true,
    formData: { ...SAMPLE },
    title: 'Scene 7 of 7 \u2014 Supply Added',
    description:
      'The supply relationship has been created successfully. The item is now linked to the supplier.',
    interaction: 'The user clicks "Start Over" to add another supply.',
  },
];

/* ================================================================
   WIZARD
   ================================================================ */

function AddSupplyWizard(props: WizardProps<SupplyFormData>) {
  const w = useWizard(props, {
    initial: INITIAL,
    stepNames: ['Select Supplier', 'Supply Details', 'Review & Confirm'],
    canAdvance: (step, data) => {
      if (step === 0) return !!data.supplier;
      if (step === 1) return !!(data.supplyName && data.unitCost);
      return true;
    },
  });

  return (
    <UseCaseShell
      wizard={w}
      guides={guides}
      heading="Add Item Supply"
      subtitle="Link an item to a supplier with pricing and ordering details."
      submitLabel="Confirm & Add Supply"
      success={
        <SuccessScreen
          title="Supply added successfully"
          subtitle={
            <>
              <strong>{w.formData.supplyName}</strong> from {w.formData.supplier} has been linked.
            </>
          }
          badges={
            <>
              <ArdaBadge variant="info">Primary</ArdaBadge>
              <ArdaBadge variant="outline">
                {formatCurrency(Number(w.formData.unitCost))}/unit
              </ArdaBadge>
              <ArdaBadge variant="default">
                {w.formData.leadTime}{' '}
                {w.formData.leadTimeUnit.charAt(0) + w.formData.leadTimeUnit.slice(1).toLowerCase()}
                s
              </ArdaBadge>
            </>
          }
          details={
            <>
              <SummaryRow label="Supplier" value={w.formData.supplier} />
              <SummaryRow label="SKU" value={w.formData.sku || '\u2014'} />
              <SummaryRow label="Order Method" value={w.formData.orderMethod || '\u2014'} />
              <SummaryRow
                label="Order Qty"
                value={`${w.formData.orderQty || '0'} ${w.formData.orderUnit}`}
              />
            </>
          }
          onReset={w.handleReset}
        />
      }
    >
      {/* Step 1 — Select Supplier */}
      {w.step === 0 && (
        <FormField
          label="Supplier"
          name="supplier"
          placeholder="e.g. Fastenal Corp."
          value={w.formData.supplier}
          onChange={w.handleChange}
        />
      )}

      {/* Step 2 — Supply Details */}
      {w.step === 1 && (
        <>
          <FormField
            label="Supply Name"
            name="supplyName"
            placeholder="e.g. HC-500 Hydraulic Cylinder"
            value={w.formData.supplyName}
            onChange={w.handleChange}
          />
          <FormField
            label="Supplier SKU"
            name="sku"
            placeholder="e.g. FAS-HC500-A"
            value={w.formData.sku}
            onChange={w.handleChange}
          />
          <FormSelect
            label="Order Method"
            name="orderMethod"
            value={w.formData.orderMethod}
            onChange={w.handleChange}
            options={ORDER_METHODS}
            placeholder="Select..."
          />
          <FormRow>
            <FormField
              label="Unit Cost ($)"
              name="unitCost"
              type="number"
              placeholder="0.00"
              value={w.formData.unitCost}
              onChange={w.handleChange}
              min="0"
              step="0.01"
            />
            <FormField
              label="Order Qty"
              name="orderQty"
              type="number"
              placeholder="0"
              value={w.formData.orderQty}
              onChange={w.handleChange}
              min="0"
            />
          </FormRow>
          <FormRow>
            <FormField
              label="Lead Time"
              name="leadTime"
              type="number"
              placeholder="0"
              value={w.formData.leadTime}
              onChange={w.handleChange}
              min="0"
            />
            <FormSelect
              label="Lead Time Unit"
              name="leadTimeUnit"
              value={w.formData.leadTimeUnit}
              onChange={w.handleChange}
              options={LEAD_TIME_UNITS}
            />
          </FormRow>
        </>
      )}

      {/* Step 3 — Review & Confirm */}
      {w.step === 2 && (
        <>
          <p style={{ fontSize: 14, color: 'var(--base-muted-foreground)', margin: 0 }}>
            Review the supply details below before saving.
          </p>
          <SummaryCard>
            <SummaryRow label="Supplier" value={w.formData.supplier} />
            <SummaryRow label="Supply Name" value={w.formData.supplyName} />
            <SummaryRow label="SKU" value={w.formData.sku || '\u2014'} />
            <Divider />
            <SummaryRow label="Order Method" value={w.formData.orderMethod || '\u2014'} />
            <SummaryRow
              label="Unit Cost"
              value={formatCurrency(Number(w.formData.unitCost))}
              bold
            />
            <SummaryRow
              label="Order Qty"
              value={`${w.formData.orderQty || '0'} ${w.formData.orderUnit}`}
            />
            <Divider />
            <SummaryRow
              label="Lead Time"
              value={`${w.formData.leadTime || '0'} ${w.formData.leadTimeUnit.charAt(0) + w.formData.leadTimeUnit.slice(1).toLowerCase()}s`}
            />
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
  title: 'Use Cases/Reference/Items/Add Supply/Happy Path',
  parameters: { layout: 'centered' },
} satisfies Meta;

const { Interactive, Stepwise, Automated } = createUseCaseStories<SupplyFormData>({
  guides,
  scenes,
  Wizard: AddSupplyWizard,
  delayMs: 2000,
  play: async ({ canvas, goToScene, delay }) => {
    goToScene(0);
    await delay();

    await userEvent.type(canvas.getByLabelText('Supplier'), SAMPLE.supplier);
    goToScene(1);
    await delay();

    await userEvent.click(canvas.getByRole('button', { name: /next step/i }));
    goToScene(2);
    await delay();

    await userEvent.type(canvas.getByLabelText('Supply Name'), SAMPLE.supplyName);
    await userEvent.type(canvas.getByLabelText('Supplier SKU'), SAMPLE.sku);
    await userEvent.selectOptions(canvas.getByLabelText('Order Method'), SAMPLE.orderMethod);
    goToScene(3);
    await delay();

    await userEvent.type(canvas.getByLabelText('Unit Cost ($)'), SAMPLE.unitCost);
    await userEvent.type(canvas.getByLabelText('Order Qty'), SAMPLE.orderQty);
    await userEvent.type(canvas.getByLabelText('Lead Time'), SAMPLE.leadTime);
    goToScene(4);
    await delay();

    await userEvent.click(canvas.getByRole('button', { name: /next step/i }));
    goToScene(5);
    await expect(canvas.getByText(SAMPLE.supplier)).toBeInTheDocument();
    await expect(canvas.getByText(SAMPLE.supplyName)).toBeInTheDocument();
    await delay();

    await userEvent.click(canvas.getByRole('button', { name: /confirm & add supply/i }));
    goToScene(6);
    await expect(canvas.getByTestId('success-message')).toHaveTextContent(
      'Supply added successfully',
    );
    await delay();
  },
});

export default meta;
export { Interactive, Stepwise, Automated };
