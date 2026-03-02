import type { Meta } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';

import { ArdaBadge } from '@/extras/components/atoms/badge/badge';
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

interface ItemFormData {
  itemName: string;
  sku: string;
  category: string;
  quantity: string;
  unitPrice: string;
  minStock: string;
  supplier: string;
  location: string;
}

const INITIAL: ItemFormData = {
  itemName: '',
  sku: '',
  category: '',
  quantity: '',
  unitPrice: '',
  minStock: '',
  supplier: '',
  location: '',
};

const SAMPLE: ItemFormData = {
  itemName: 'Hydraulic Cylinder HC-500',
  sku: 'HYD-CYL-HC500',
  category: 'Filters',
  quantity: '25',
  unitPrice: '189.99',
  minStock: '5',
  supplier: 'Fastenal Corp.',
  location: 'W-03-B2',
};

const CATEGORIES = ['Fasteners', 'Bearings', 'PPE', 'Filters', 'Lubricants', 'Drive'];

/* ================================================================
   GUIDES (Interactive mode — one per wizard phase)
   ================================================================ */

const guides: GuideEntry[] = [
  {
    title: 'Step 1: Item Details',
    description:
      'Enter the basic identification for the new inventory item: a descriptive name, a unique SKU code, and a category. All three fields are required before advancing.',
    interaction:
      'Fill in the Item Name, SKU, and select a Category from the dropdown. Click "Next Step" when all fields are completed.',
  },
  {
    title: 'Step 2: Stock & Pricing',
    description:
      'Set the initial stock quantity, unit price, minimum stock threshold, preferred supplier, and storage location. These fields drive inventory tracking and reorder behavior.',
    interaction:
      'Enter values for each field. Click "Next Step" to proceed to the review screen, or "Back" to return to Item Details.',
  },
  {
    title: 'Step 3: Review & Confirm',
    description:
      'Review all entered data before submission. The total inventory value is calculated automatically (quantity x unit price). This is the last opportunity to verify before the item is added.',
    interaction:
      'Verify the summary is correct. Click "Back" to make changes, or "Confirm & Add Item" to submit.',
  },
  {
    title: 'Success',
    description:
      'The item has been added to inventory. The confirmation screen shows item status badges and a details summary. In a real application this data would be persisted to the backend.',
    interaction: 'Click "Start Over" to add another item, or use "Reset" to return to Step 1.',
  },
];

/* ================================================================
   SCENES (Stepwise + Automated — one per discrete moment)
   ================================================================ */

const scenes: Scene<ItemFormData>[] = [
  {
    wizardStep: 0,
    submitted: false,
    formData: INITIAL,
    title: 'Scene 1 of 9 \u2014 Empty Form',
    description:
      'The form starts empty on Step 1. The "Next Step" button is disabled because all required fields must be filled before the user can advance.',
    interaction: 'The user types a descriptive name into the "Item Name" field.',
  },
  {
    wizardStep: 0,
    submitted: false,
    formData: { ...INITIAL, itemName: SAMPLE.itemName },
    title: 'Scene 2 of 9 \u2014 Item Name Entered',
    description:
      'The item name has been entered. The SKU and Category fields are still empty, so the "Next Step" button remains disabled.',
    interaction: 'The user types a unique identifier into the "SKU" field.',
  },
  {
    wizardStep: 0,
    submitted: false,
    formData: { ...INITIAL, itemName: SAMPLE.itemName, sku: SAMPLE.sku },
    title: 'Scene 3 of 9 \u2014 SKU Entered',
    description:
      'Both the name and SKU are filled. A category must still be selected from the dropdown.',
    interaction: 'The user opens the "Category" dropdown and selects the appropriate category.',
  },
  {
    wizardStep: 0,
    submitted: false,
    formData: {
      ...INITIAL,
      itemName: SAMPLE.itemName,
      sku: SAMPLE.sku,
      category: SAMPLE.category,
    },
    title: 'Scene 4 of 9 \u2014 Step 1 Complete',
    description:
      'All Item Details fields are filled. The "Next Step" button is now enabled and highlighted.',
    interaction: 'The user clicks "Next Step" to proceed to Stock & Pricing.',
  },
  {
    wizardStep: 1,
    submitted: false,
    formData: {
      ...INITIAL,
      itemName: SAMPLE.itemName,
      sku: SAMPLE.sku,
      category: SAMPLE.category,
    },
    title: 'Scene 5 of 9 \u2014 Stock & Pricing (Empty)',
    description:
      'Step 2 collects stock and pricing information. The step indicator shows Step 1 as complete (green check). All Step 2 fields start empty.',
    interaction: 'The user enters the initial quantity and unit price in the top row.',
  },
  {
    wizardStep: 1,
    submitted: false,
    formData: {
      itemName: SAMPLE.itemName,
      sku: SAMPLE.sku,
      category: SAMPLE.category,
      quantity: SAMPLE.quantity,
      unitPrice: SAMPLE.unitPrice,
      minStock: '',
      supplier: '',
      location: '',
    },
    title: 'Scene 6 of 9 \u2014 Quantity & Price Set',
    description:
      'Quantity and unit price are entered. The remaining fields configure the minimum reorder threshold, preferred supplier, and physical storage location.',
    interaction: 'The user fills in minimum stock level, supplier name, and storage location.',
  },
  {
    wizardStep: 1,
    submitted: false,
    formData: { ...SAMPLE },
    title: 'Scene 7 of 9 \u2014 Step 2 Complete',
    description:
      'All Step 2 fields are filled. The "Next Step" button is enabled. The user can also go back to edit Item Details.',
    interaction: 'The user clicks "Next Step" to review the item before submission.',
  },
  {
    wizardStep: 2,
    submitted: false,
    formData: { ...SAMPLE },
    title: 'Scene 8 of 9 \u2014 Review & Confirm',
    description:
      'The review step shows a complete summary with the calculated total value ($4,749.75 = 25 x $189.99). This is the final check before submission.',
    interaction:
      'The user reviews the data. Clicks "Back" to edit, or "Confirm & Add Item" to submit.',
  },
  {
    wizardStep: 2,
    submitted: true,
    formData: { ...SAMPLE },
    title: 'Scene 9 of 9 \u2014 Item Added',
    description:
      'The item was added successfully. A confirmation screen shows status badges (In Stock, quantity, total value) and a summary of the saved details.',
    interaction: 'The user clicks "Start Over" to add another item.',
  },
];

/* ================================================================
   WIZARD
   ================================================================ */

function AddItemWizard(props: WizardProps<ItemFormData>) {
  const w = useWizard(props, {
    initial: INITIAL,
    stepNames: ['Item Details', 'Stock & Pricing', 'Review & Confirm'],
    canAdvance: (step, data) => {
      if (step === 0) return !!(data.itemName && data.sku && data.category);
      if (step === 1) return !!(data.quantity && data.unitPrice && data.supplier && data.location);
      return true;
    },
  });

  const totalValue = formatCurrency(Number(w.formData.quantity) * Number(w.formData.unitPrice));

  return (
    <UseCaseShell
      wizard={w}
      guides={guides}
      heading="Add New Inventory Item"
      subtitle="Complete each step to add a new item to your inventory."
      submitLabel="Confirm & Add Item"
      success={
        <SuccessScreen
          title="Item added successfully"
          subtitle={
            <>
              <strong>{w.formData.itemName}</strong> ({w.formData.sku}) has been added to your
              inventory.
            </>
          }
          badges={
            <>
              <ArdaBadge variant="success" dot>
                In Stock
              </ArdaBadge>
              <ArdaBadge variant="info">{w.formData.quantity} units</ArdaBadge>
              <ArdaBadge variant="outline">{totalValue} total</ArdaBadge>
            </>
          }
          details={
            <>
              <SummaryRow label="Category" value={w.formData.category} />
              <SummaryRow label="Supplier" value={w.formData.supplier} />
              <SummaryRow label="Location" value={w.formData.location} />
              <SummaryRow label="Min Stock" value={w.formData.minStock || '\u2014'} />
            </>
          }
          onReset={w.handleReset}
        />
      }
    >
      {/* Step 1 — Item Details */}
      {w.step === 0 && (
        <>
          <FormField
            label="Item Name"
            name="itemName"
            placeholder="e.g. Hex Socket Bolt M8x40"
            value={w.formData.itemName}
            onChange={w.handleChange}
          />
          <FormField
            label="SKU"
            name="sku"
            placeholder="e.g. FST-HSB-M8X40"
            value={w.formData.sku}
            onChange={w.handleChange}
          />
          <FormSelect
            label="Category"
            name="category"
            value={w.formData.category}
            onChange={w.handleChange}
            options={CATEGORIES}
            placeholder="Select a category"
          />
        </>
      )}

      {/* Step 2 — Stock & Pricing */}
      {w.step === 1 && (
        <>
          <FormRow>
            <FormField
              label="Initial Quantity"
              name="quantity"
              type="number"
              placeholder="0"
              value={w.formData.quantity}
              onChange={w.handleChange}
              min="0"
            />
            <FormField
              label="Unit Price ($)"
              name="unitPrice"
              type="number"
              placeholder="0.00"
              value={w.formData.unitPrice}
              onChange={w.handleChange}
              min="0"
              step="0.01"
            />
          </FormRow>
          <FormField
            label="Minimum Stock Level"
            name="minStock"
            type="number"
            placeholder="e.g. 10"
            value={w.formData.minStock}
            onChange={w.handleChange}
            min="0"
          />
          <FormField
            label="Supplier"
            name="supplier"
            placeholder="e.g. Fastenal Corp."
            value={w.formData.supplier}
            onChange={w.handleChange}
          />
          <FormField
            label="Storage Location"
            name="location"
            placeholder="e.g. W-03-B2"
            value={w.formData.location}
            onChange={w.handleChange}
          />
        </>
      )}

      {/* Step 3 — Review & Confirm */}
      {w.step === 2 && (
        <>
          <p style={{ fontSize: 14, color: 'var(--base-muted-foreground)', margin: 0 }}>
            Please review the details below before adding this item to inventory.
          </p>
          <SummaryCard>
            <SummaryRow label="Item Name" value={w.formData.itemName} />
            <SummaryRow label="SKU" value={w.formData.sku} />
            <SummaryRow label="Category" value={w.formData.category} />
            <Divider />
            <SummaryRow label="Initial Quantity" value={w.formData.quantity} />
            <SummaryRow label="Unit Price" value={formatCurrency(Number(w.formData.unitPrice))} />
            <SummaryRow label="Total Value" value={totalValue} bold />
            <SummaryRow label="Min Stock Level" value={w.formData.minStock || '\u2014'} />
            <Divider />
            <SummaryRow label="Supplier" value={w.formData.supplier} />
            <SummaryRow label="Location" value={w.formData.location} />
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
  title: 'Use Cases/Examples/Add Item (Sample Only)/Happy Path',
  parameters: { layout: 'centered' },
} satisfies Meta;

const { Interactive, Stepwise, Automated } = createUseCaseStories<ItemFormData>({
  guides,
  scenes,
  Wizard: AddItemWizard,
  delayMs: 2000,
  play: async ({ canvas, goToScene, delay }) => {
    goToScene(0);
    await delay();

    await userEvent.type(canvas.getByLabelText('Item Name'), SAMPLE.itemName);
    goToScene(1);
    await delay();

    await userEvent.type(canvas.getByLabelText('SKU'), SAMPLE.sku);
    goToScene(2);
    await delay();

    await userEvent.selectOptions(canvas.getByLabelText('Category'), SAMPLE.category);
    goToScene(3);
    await delay();

    await userEvent.click(canvas.getByRole('button', { name: /next step/i }));
    goToScene(4);
    await delay();

    await userEvent.type(canvas.getByLabelText('Initial Quantity'), SAMPLE.quantity);
    await userEvent.type(canvas.getByLabelText('Unit Price ($)'), SAMPLE.unitPrice);
    goToScene(5);
    await delay();

    await userEvent.type(canvas.getByLabelText('Minimum Stock Level'), SAMPLE.minStock);
    await userEvent.type(canvas.getByLabelText('Supplier'), SAMPLE.supplier);
    await userEvent.type(canvas.getByLabelText('Storage Location'), SAMPLE.location);
    goToScene(6);
    await delay();

    await userEvent.click(canvas.getByRole('button', { name: /next step/i }));
    goToScene(7);
    await expect(canvas.getByText(SAMPLE.itemName)).toBeInTheDocument();
    await expect(canvas.getByText(SAMPLE.sku)).toBeInTheDocument();
    await expect(canvas.getByText('$4,749.75', { exact: false })).toBeInTheDocument();
    await delay();

    await userEvent.click(canvas.getByRole('button', { name: /confirm & add item/i }));
    goToScene(8);
    await expect(canvas.getByTestId('success-message')).toHaveTextContent(
      'Item added successfully',
    );
    await delay();
  },
});

export default meta;
export { Interactive, Stepwise, Automated };
