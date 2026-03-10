import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

const meta: Meta = {
  title: 'Visual Elements/Canary/Colors',
};

export default meta;
type Story = StoryObj;

interface SwatchProps {
  name: string;
  variable: string;
  tailwind: string;
  hex: string;
}

function Swatch({ name, variable, tailwind, hex }: SwatchProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div
        className="w-12 h-12 rounded-lg border border-border shrink-0"
        style={{ backgroundColor: hex }}
      />
      <div>
        <div className="font-semibold text-sm text-foreground">{name}</div>
        <div className="text-xs text-muted-foreground font-mono">{variable}</div>
        <div className="text-xs text-muted-foreground font-mono">{tailwind}</div>
        <div className="text-xs text-muted-foreground font-mono opacity-60">{hex}</div>
      </div>
    </div>
  );
}

function ColorGroup({ title, colors }: { title: string; colors: SwatchProps[] }) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-foreground mb-3 border-b border-border pb-2">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
        {colors.map((color) => (
          <Swatch key={color.variable} {...color} />
        ))}
      </div>
    </div>
  );
}

export const AllColors: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Arda Design Tokens')).toBeInTheDocument();
  },
  render: () => (
    <div className="p-6 max-w-5xl">
      <h2 className="text-2xl font-bold text-foreground mb-2">Arda Design Tokens</h2>
      <p className="text-sm text-muted-foreground mb-6">
        All color tokens defined in{' '}
        <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">globals.css</code>. Use
        Tailwind classes (not hardcoded hex values) in all components.
      </p>

      {/* ── shadcn semantic tokens ── */}

      <ColorGroup
        title="Brand / Primary"
        colors={[
          {
            name: 'Primary (Arda Orange)',
            variable: '--primary',
            tailwind: 'bg-primary / text-primary',
            hex: '#FC5A29',
          },
          {
            name: 'Primary Foreground',
            variable: '--primary-foreground',
            tailwind: 'text-primary-foreground',
            hex: '#FFFFFF',
          },
          {
            name: 'Primary Hover',
            variable: '--primary-hover',
            tailwind: 'hover:bg-primary-hover',
            hex: '#D14A1F',
          },
          {
            name: 'Primary Active',
            variable: '--primary-active',
            tailwind: 'active:bg-primary-active',
            hex: '#A83B18',
          },
          {
            name: 'Primary Muted',
            variable: '--primary-muted',
            tailwind: 'bg-primary-muted',
            hex: '#FEF7F5',
          },
        ]}
      />

      <ColorGroup
        title="Background / Foreground"
        colors={[
          {
            name: 'Background',
            variable: '--background',
            tailwind: 'bg-background',
            hex: '#FFFFFF',
          },
          {
            name: 'Foreground',
            variable: '--foreground',
            tailwind: 'text-foreground',
            hex: '#0A0A0A',
          },
          {
            name: 'Card',
            variable: '--card',
            tailwind: 'bg-card',
            hex: '#FFFFFF',
          },
          {
            name: 'Card Foreground',
            variable: '--card-foreground',
            tailwind: 'text-card-foreground',
            hex: '#0A0A0A',
          },
          {
            name: 'Popover',
            variable: '--popover',
            tailwind: 'bg-popover',
            hex: '#FFFFFF',
          },
          {
            name: 'Popover Foreground',
            variable: '--popover-foreground',
            tailwind: 'text-popover-foreground',
            hex: '#0A0A0A',
          },
        ]}
      />

      <ColorGroup
        title="Secondary / Muted / Accent"
        colors={[
          {
            name: 'Secondary',
            variable: '--secondary',
            tailwind: 'bg-secondary',
            hex: '#F5F5F5',
          },
          {
            name: 'Secondary Foreground',
            variable: '--secondary-foreground',
            tailwind: 'text-secondary-foreground',
            hex: '#171717',
          },
          {
            name: 'Muted',
            variable: '--muted',
            tailwind: 'bg-muted',
            hex: '#F5F5F5',
          },
          {
            name: 'Muted Foreground',
            variable: '--muted-foreground',
            tailwind: 'text-muted-foreground',
            hex: '#737373',
          },
          {
            name: 'Accent',
            variable: '--accent',
            tailwind: 'bg-accent',
            hex: '#F5F5F5',
          },
          {
            name: 'Accent Foreground',
            variable: '--accent-foreground',
            tailwind: 'text-accent-foreground',
            hex: '#171717',
          },
          {
            name: 'Accent Light',
            variable: '--accent-light',
            tailwind: 'bg-accent-light',
            hex: '#FEF7F5',
          },
        ]}
      />

      <ColorGroup
        title="Destructive"
        colors={[
          {
            name: 'Destructive',
            variable: '--destructive',
            tailwind: 'bg-destructive / text-destructive',
            hex: '#DC2626',
          },
          {
            name: 'Destructive Foreground',
            variable: '--destructive-foreground',
            tailwind: 'text-destructive-foreground',
            hex: '#FFFFFF',
          },
          {
            name: 'Destructive Hover BG',
            variable: '--destructive-foreground-light-hover',
            tailwind: 'hover:bg-destructive-foreground-light-hover',
            hex: '#FEF2F2',
          },
        ]}
      />

      <ColorGroup
        title="Borders / Input / Ring"
        colors={[
          {
            name: 'Border',
            variable: '--border',
            tailwind: 'border-border',
            hex: '#E5E5E5',
          },
          {
            name: 'Input',
            variable: '--input',
            tailwind: 'border-input',
            hex: '#E5E5E5',
          },
          {
            name: 'Ring (Focus)',
            variable: '--ring',
            tailwind: 'ring-ring',
            hex: '#FC5A29',
          },
        ]}
      />

      {/* ── Sidebar tokens ── */}

      <ColorGroup
        title="Sidebar (Light)"
        colors={[
          {
            name: 'Sidebar BG',
            variable: '--sidebar',
            tailwind: 'bg-sidebar',
            hex: '#FAFAFA',
          },
          {
            name: 'Sidebar Foreground',
            variable: '--sidebar-foreground',
            tailwind: 'text-sidebar-foreground',
            hex: '#171717',
          },
          {
            name: 'Sidebar Primary',
            variable: '--sidebar-primary',
            tailwind: 'bg-sidebar-primary',
            hex: '#FC5A29',
          },
          {
            name: 'Sidebar Primary Foreground',
            variable: '--sidebar-primary-foreground',
            tailwind: 'text-sidebar-primary-foreground',
            hex: '#FFFFFF',
          },
          {
            name: 'Sidebar Accent',
            variable: '--sidebar-accent',
            tailwind: 'bg-sidebar-accent',
            hex: '#F5F5F5',
          },
          {
            name: 'Sidebar Accent Foreground',
            variable: '--sidebar-accent-foreground',
            tailwind: 'text-sidebar-accent-foreground',
            hex: '#171717',
          },
          {
            name: 'Sidebar Border',
            variable: '--sidebar-border',
            tailwind: 'border-sidebar-border',
            hex: '#E5E5E5',
          },
          {
            name: 'Sidebar Ring',
            variable: '--sidebar-ring',
            tailwind: 'ring-sidebar-ring',
            hex: '#FC5A29',
          },
        ]}
      />

      <ColorGroup
        title="Sidebar (Dark)"
        colors={[
          {
            name: 'Sidebar BG',
            variable: '--sidebar (dark)',
            tailwind: 'bg-sidebar',
            hex: '#0A0A0A',
          },
          {
            name: 'Sidebar Foreground',
            variable: '--sidebar-foreground (dark)',
            tailwind: 'text-sidebar-foreground',
            hex: '#D4D4D4',
          },
          {
            name: 'Sidebar Primary',
            variable: '--sidebar-primary (dark)',
            tailwind: 'bg-sidebar-primary',
            hex: '#FC5A29',
          },
          {
            name: 'Sidebar Accent',
            variable: '--sidebar-accent (dark)',
            tailwind: 'bg-sidebar-accent',
            hex: '#1A1A1A',
          },
          {
            name: 'Sidebar Accent Foreground',
            variable: '--sidebar-accent-foreground (dark)',
            tailwind: 'text-sidebar-accent-foreground',
            hex: '#FFFFFF',
          },
          {
            name: 'Sidebar Border',
            variable: '--sidebar-border (dark)',
            tailwind: 'border-sidebar-border',
            hex: '#262626',
          },
        ]}
      />

      {/* ── Figma / legacy tokens ── */}

      <ColorGroup
        title="Form"
        colors={[
          {
            name: 'Form Separator',
            variable: '--form-separator',
            tailwind: 'border-form-separator',
            hex: '#E5E5E5',
          },
          {
            name: 'Form Text Primary',
            variable: '--form-text-primary',
            tailwind: 'text-form-text-primary',
            hex: '#0A0A0A',
          },
          {
            name: 'Form Text Secondary',
            variable: '--form-text-secondary',
            tailwind: 'text-form-text-secondary',
            hex: '#737373',
          },
          {
            name: 'Form Background',
            variable: '--form-background',
            tailwind: 'bg-form-background',
            hex: '#FFFFFF',
          },
          {
            name: 'Form Background Secondary',
            variable: '--form-background-secondary',
            tailwind: 'bg-form-background-secondary',
            hex: '#F3F4F6',
          },
          {
            name: 'Form Switch Active',
            variable: '--form-switch-active',
            tailwind: 'bg-form-switch-active',
            hex: '#FC5A29',
          },
          {
            name: 'Form Switch Inactive',
            variable: '--form-switch-inactive',
            tailwind: 'bg-form-switch-inactive',
            hex: '#E5E5E5',
          },
        ]}
      />

      <ColorGroup
        title="Utility"
        colors={[
          {
            name: 'Link',
            variable: '--colors-link-light',
            tailwind: 'text-link',
            hex: '#0A68F3',
          },
          {
            name: 'Hover Color',
            variable: '--hover-color',
            tailwind: 'hover:bg-hover-color',
            hex: '#282828',
          },
        ]}
      />

      {/* ── Charts ── */}

      <ColorGroup
        title="Charts"
        colors={[
          {
            name: 'Chart 1 (Orange)',
            variable: '--chart-1',
            tailwind: 'text-chart-1',
            hex: '#FC5A29',
          },
          {
            name: 'Chart 2',
            variable: '--chart-2',
            tailwind: 'text-chart-2',
            hex: '#2AA198',
          },
          {
            name: 'Chart 3',
            variable: '--chart-3',
            tailwind: 'text-chart-3',
            hex: '#3A6B8A',
          },
          {
            name: 'Chart 4',
            variable: '--chart-4',
            tailwind: 'text-chart-4',
            hex: '#C4A840',
          },
          {
            name: 'Chart 5',
            variable: '--chart-5',
            tailwind: 'text-chart-5',
            hex: '#D4A030',
          },
        ]}
      />
    </div>
  ),
};
