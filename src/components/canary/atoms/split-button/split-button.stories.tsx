import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ShoppingCart, Printer, FileDown } from 'lucide-react';
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/canary/primitives/dropdown-menu';
import { SplitButton } from './split-button';

const defaultMenu = (
  <>
    <DropdownMenuItem>Save as draft</DropdownMenuItem>
    <DropdownMenuItem>Save and close</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Discard changes</DropdownMenuItem>
  </>
);

const meta = {
  title: 'Components/Canary/Atoms/SplitButton',
  component: SplitButton,
  parameters: { layout: 'centered' },
  args: {
    onClick: fn(),
    children: 'Save',
    menuContent: defaultMenu,
  },
} satisfies Meta<typeof SplitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  parameters: { layout: 'padded' },
  render: (args) => (
    <div className="flex flex-col gap-6 max-w-lg">
      <h3 className="text-sm font-semibold text-muted-foreground">Variants</h3>
      {(['primary', 'secondary', 'ghost', 'destructive', 'outline'] as const).map((variant) => (
        <div key={variant} className="flex items-center gap-3">
          <span className="w-28 text-sm text-muted-foreground capitalize">{variant}</span>
          <SplitButton {...args} variant={variant}>
            Action
          </SplitButton>
        </div>
      ))}

      <h3 className="text-sm font-semibold text-muted-foreground mt-2">Sizes</h3>
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex items-center gap-3">
          <span className="w-28 text-sm text-muted-foreground">{size}</span>
          <SplitButton {...args} size={size}>
            Action
          </SplitButton>
        </div>
      ))}

      <h3 className="text-sm font-semibold text-muted-foreground mt-2">With Divider</h3>
      {(['primary', 'secondary', 'outline', 'ghost', 'destructive'] as const).map((v) => (
        <div key={`div-${v}`} className="flex items-center gap-3">
          <span className="w-28 text-sm text-muted-foreground capitalize">{v}</span>
          <SplitButton {...args} variant={v} showDivider>
            Action
          </SplitButton>
        </div>
      ))}

      <h3 className="text-sm font-semibold text-muted-foreground mt-2">States</h3>
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">Disabled</span>
        <SplitButton {...args} disabled>
          Save
        </SplitButton>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm text-muted-foreground">Loading</span>
        <SplitButton {...args} loading="Saving&#8230;">
          Save
        </SplitButton>
      </div>
    </div>
  ),
};

export const AddToOrder: Story = {
  parameters: { layout: 'padded' },
  args: {
    variant: 'primary',
    menuLabel: 'More item actions',
    menuContent: (
      <>
        <DropdownMenuItem>
          <ShoppingCart className="size-4" />
          Add to order queue
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Printer className="size-4" />
          Print kanban card
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <FileDown className="size-4" />
          Export as CSV
        </DropdownMenuItem>
      </>
    ),
  },
  render: (args) => (
    <div className="flex items-center gap-2 rounded-lg border border-border p-3 bg-background">
      <SplitButton {...args}>
        <ShoppingCart className="size-4" />
        Add to Order
      </SplitButton>
    </div>
  ),
};

export const Playground: Story = {
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'destructive', 'outline'],
    },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    loading: { control: 'text' },
    disabled: { control: 'boolean' },
    showDivider: { control: 'boolean' },
    children: { control: 'text' },
    menuLabel: { control: 'text' },
  },
  args: {
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
    showDivider: true,
    children: 'Action',
    menuLabel: 'More options',
  },
};
