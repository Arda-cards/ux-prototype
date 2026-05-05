import type { Meta, StoryObj } from '@storybook/react-vite';
import { X, Save, Send, Trash2, Download } from 'lucide-react';
import { TooltipProvider } from '@/components/canary/primitives/tooltip';
import { ButtonGroup } from './button-group';
import { Button, type ButtonProps } from '../button/button';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  none: () => null,
  X,
  Save,
  Send,
  Trash2,
  Download,
};
const iconOptions = Object.keys(iconMap);

const variants: NonNullable<ButtonProps['variant']>[] = [
  'primary',
  'secondary',
  'ghost',
  'destructive',
  'outline',
];

const sizes: NonNullable<ButtonProps['size']>[] = ['xs', 'sm', 'md', 'lg'];

const meta: Meta = {
  title: 'Components/Canary/Atoms/ButtonGroup',
  component: ButtonGroup,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj;

export const Showcase: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex flex-col gap-6 max-w-md">
      <h3 className="text-sm font-semibold text-muted-foreground">Horizontal (default)</h3>
      <ButtonGroup aria-label="Text alignment">
        <Button variant="outline">Left</Button>
        <Button variant="outline">Center</Button>
        <Button variant="outline">Right</Button>
      </ButtonGroup>

      <h3 className="text-sm font-semibold text-muted-foreground">With Divider</h3>
      <ButtonGroup aria-label="Actions" showDivider dividerClassName="bg-white/30">
        <Button variant="primary">Save</Button>
        <Button variant="primary">Save &#38; Close</Button>
      </ButtonGroup>

      <h3 className="text-sm font-semibold text-muted-foreground">Mixed Variants</h3>
      <ButtonGroup aria-label="Actions">
        <Button variant="outline">Cancel</Button>
        <Button variant="primary">Confirm</Button>
      </ButtonGroup>

      <h3 className="text-sm font-semibold text-muted-foreground">Vertical</h3>
      <ButtonGroup orientation="vertical" aria-label="Navigation">
        <Button variant="outline">Top</Button>
        <Button variant="outline">Middle</Button>
        <Button variant="outline">Bottom</Button>
      </ButtonGroup>
    </div>
  ),
};

export const Playground: Story = {
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
  },
  args: {
    orientation: 'horizontal',
  },
  render: (args) => {
    const a = args as Record<string, unknown>;
    const buttonCount = (a['buttonCount'] as number) ?? 3;
    const btnSize = (a['buttonSize'] as ButtonProps['size']) ?? 'md';
    const dividerClass = (a['dividerClassName'] as string) ?? '';

    const btnVariants: NonNullable<ButtonProps['variant']>[] = [];
    for (let i = 0; i < buttonCount; i++) {
      btnVariants.push(
        ((a[`button${i + 1}Variant`] as string) ?? 'outline') as NonNullable<
          ButtonProps['variant']
        >,
      );
    }

    const labels = ['Cancel', 'Save', 'Submit', 'Delete', 'Export'];

    return (
      <ButtonGroup
        {...args}
        {...(dividerClass ? { dividerClassName: dividerClass } : {})}
        aria-label="Actions"
      >
        {btnVariants.map((variant, i) => {
          const iconKey = (a[`button${i + 1}Icon`] as string) ?? 'none';
          const Icon = iconKey !== 'none' ? iconMap[iconKey] : undefined;
          const tooltipText = (a[`button${i + 1}Tooltip`] as string) ?? '';
          return (
            <Button
              key={i}
              variant={variant}
              size={btnSize}
              {...(tooltipText ? { tooltip: tooltipText } : {})}
            >
              {Icon && <Icon className="size-4" />}
              {labels[i]}
            </Button>
          );
        })}
      </ButtonGroup>
    );
  },
};

// --- Group settings ---

const at = Playground.argTypes as Record<string, unknown>;
const ag = Playground.args as Record<string, unknown>;

at['buttonCount'] = {
  control: { type: 'range', min: 2, max: 5, step: 1 },
  table: { category: 'Group' },
};
at['buttonSize'] = {
  control: 'select',
  options: sizes,
  table: { category: 'Group' },
};
at['showDivider'] = {
  control: 'boolean',
  table: { category: 'Group' },
};
at['dividerClassName'] = {
  control: 'text',
  table: { category: 'Group' },
};

ag['buttonCount'] = 3;
ag['buttonSize'] = 'md';
ag['showDivider'] = false;
ag['dividerClassName'] = '';

// --- Per-button settings ---

const defaultVariants = ['outline', 'outline', 'primary', 'outline', 'outline'];

for (let i = 1; i <= 5; i++) {
  const cat = `Button ${i}`;
  at[`button${i}Variant`] = {
    control: 'select',
    options: variants,
    table: { category: cat },
  };
  at[`button${i}Icon`] = {
    control: 'select',
    options: iconOptions,
    table: { category: cat },
  };
  at[`button${i}Tooltip`] = {
    control: 'text',
    table: { category: cat },
  };

  ag[`button${i}Variant`] = defaultVariants[i - 1];
  ag[`button${i}Icon`] = 'none';
  ag[`button${i}Tooltip`] = '';
}
