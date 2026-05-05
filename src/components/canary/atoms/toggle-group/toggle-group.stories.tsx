import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Grid2X2,
  List,
} from 'lucide-react';
import { ToggleGroup, ToggleGroupItem, type ToggleGroupSingleProps } from './toggle-group';

const meta: Meta = {
  title: 'Components/Canary/Atoms/ToggleGroup',
  component: ToggleGroup,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj;

export const Showcase: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex flex-col gap-6 max-w-lg">
      <h3 className="text-sm font-semibold text-muted-foreground">Single Selection</h3>
      <ToggleGroup type="single" defaultValue="center" aria-label="Text alignment">
        <ToggleGroupItem value="left" aria-label="Align left">
          <AlignLeft className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <AlignCenter className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          <AlignRight className="size-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <h3 className="text-sm font-semibold text-muted-foreground">Multiple Selection</h3>
      <ToggleGroup type="multiple" defaultValue={['bold']} aria-label="Text formatting">
        <ToggleGroupItem value="bold" aria-label="Bold">
          <Bold className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic">
          <Italic className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Underline">
          <Underline className="size-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <h3 className="text-sm font-semibold text-muted-foreground">Outline Variant</h3>
      <ToggleGroup type="single" variant="outline" defaultValue="center" aria-label="Alignment">
        <ToggleGroupItem value="left" aria-label="Left">
          <AlignLeft className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Center">
          <AlignCenter className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Right">
          <AlignRight className="size-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <h3 className="text-sm font-semibold text-muted-foreground">With Text Labels</h3>
      <ToggleGroup type="single" variant="outline" defaultValue="grid" aria-label="View mode">
        <ToggleGroupItem value="grid">
          <Grid2X2 className="size-4" />
          Grid
        </ToggleGroupItem>
        <ToggleGroupItem value="list">
          <List className="size-4" />
          List
        </ToggleGroupItem>
      </ToggleGroup>

      <h3 className="text-sm font-semibold text-muted-foreground">Vertical</h3>
      <ToggleGroup type="single" orientation="vertical" defaultValue="grid" aria-label="View mode">
        <ToggleGroupItem value="grid" aria-label="Grid">
          <Grid2X2 className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="list" aria-label="List">
          <List className="size-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <h3 className="text-sm font-semibold text-muted-foreground">Disabled Item</h3>
      <ToggleGroup type="single" defaultValue="left" aria-label="Alignment">
        <ToggleGroupItem value="left" aria-label="Left">
          <AlignLeft className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Center" disabled>
          <AlignCenter className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Right">
          <AlignRight className="size-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <h3 className="text-sm font-semibold text-muted-foreground">Sizes</h3>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex items-center gap-3">
          <span className="w-12 text-sm text-muted-foreground">{size}</span>
          <ToggleGroup type="single" size={size} defaultValue="center" aria-label="Alignment">
            <ToggleGroupItem value="left" aria-label="Left">
              <AlignLeft className="size-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="center" aria-label="Center">
              <AlignCenter className="size-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="right" aria-label="Right">
              <AlignRight className="size-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      ))}
    </div>
  ),
};

export const FilterPills: Story = {
  parameters: { layout: 'padded' },
  render: () => {
    const [selected, setSelected] = React.useState<string[]>(['active']);
    return (
      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted-foreground">Status filter:</span>
        <ToggleGroup
          type="multiple"
          variant="outline"
          size="sm"
          value={selected}
          onValueChange={setSelected}
          aria-label="Status filter"
        >
          <ToggleGroupItem value="active">Active</ToggleGroupItem>
          <ToggleGroupItem value="draft">Draft</ToggleGroupItem>
          <ToggleGroupItem value="archived">Archived</ToggleGroupItem>
        </ToggleGroup>
        <span className="text-xs text-muted-foreground">
          Selected: {selected.length > 0 ? selected.join(', ') : 'none'}
        </span>
      </div>
    );
  },
};

export const Playground: Story = {
  argTypes: {
    type: { control: 'select', options: ['single', 'multiple'] },
    variant: { control: 'select', options: ['default', 'outline'] },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'icon', 'icon-sm'] },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
  },
  args: {
    type: 'single',
    variant: 'default',
    size: 'md',
    orientation: 'horizontal',
  },
  render: (args) => (
    <ToggleGroup {...(args as ToggleGroupSingleProps)} aria-label="Alignment">
      <ToggleGroupItem value="left" aria-label="Left">
        <AlignLeft className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Center">
        <AlignCenter className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Right">
        <AlignRight className="size-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};
