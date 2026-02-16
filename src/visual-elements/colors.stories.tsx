import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Visual Elements/Colors',
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
  render: () => (
    <div className="p-6 max-w-5xl">
      <h2 className="text-2xl font-bold text-foreground mb-2">Arda Design Tokens</h2>
      <p className="text-sm text-muted-foreground mb-6">
        All color tokens defined in{' '}
        <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">globals.css</code>. Use
        Tailwind classes (not hardcoded hex values) in all components.
      </p>

      <ColorGroup
        title="Brand"
        colors={[
          {
            name: 'Primary (Orange)',
            variable: '--base-primary',
            tailwind: 'bg-primary / text-primary',
            hex: '#FC5A29',
          },
          {
            name: 'Primary Foreground',
            variable: '--base-primary-foreground',
            tailwind: 'text-primary-foreground',
            hex: '#FAFAFA',
          },
          {
            name: 'Secondary',
            variable: '--base-secondary',
            tailwind: 'bg-secondary',
            hex: '#F5F5F5',
          },
          {
            name: 'Destructive',
            variable: '--base-destructive',
            tailwind: 'bg-destructive / text-destructive',
            hex: '#DC2626',
          },
        ]}
      />

      <ColorGroup
        title="Background / Foreground"
        colors={[
          {
            name: 'Background',
            variable: '--base-background',
            tailwind: 'bg-background',
            hex: '#FFFFFF',
          },
          {
            name: 'Foreground',
            variable: '--base-foreground',
            tailwind: 'text-foreground',
            hex: '#0A0A0A',
          },
          {
            name: 'Muted Foreground',
            variable: '--base-muted-foreground',
            tailwind: 'text-muted-foreground',
            hex: '#737373',
          },
          {
            name: 'Accent Foreground',
            variable: '--base-accent-foreground',
            tailwind: 'text-accent-foreground',
            hex: '#171717',
          },
        ]}
      />

      <ColorGroup
        title="Borders / Input"
        colors={[
          {
            name: 'Border',
            variable: '--base-border',
            tailwind: 'border-border',
            hex: '#E5E5E5',
          },
          {
            name: 'Input',
            variable: '--base-input',
            tailwind: 'border-input',
            hex: '#E5E5E5',
          },
          {
            name: 'Ring (Focus)',
            variable: '--focus-ring',
            tailwind: 'ring-ring',
            hex: '#3B82F6',
          },
        ]}
      />

      <ColorGroup
        title="Status Colors"
        colors={[
          {
            name: 'Success BG',
            variable: '--status-success-bg',
            tailwind: 'bg-status-success-bg',
            hex: '#DCFCE7',
          },
          {
            name: 'Success Text',
            variable: '--status-success-text',
            tailwind: 'text-status-success-text',
            hex: '#166534',
          },
          {
            name: 'Success Border',
            variable: '--status-success-border',
            tailwind: 'border-status-success-border',
            hex: '#BBF7D0',
          },
          {
            name: 'Warning BG',
            variable: '--status-warning-bg',
            tailwind: 'bg-status-warning-bg',
            hex: '#FEF3C7',
          },
          {
            name: 'Warning Text',
            variable: '--status-warning-text',
            tailwind: 'text-status-warning-text',
            hex: '#92400E',
          },
          {
            name: 'Warning Border',
            variable: '--status-warning-border',
            tailwind: 'border-status-warning-border',
            hex: '#FDE68A',
          },
          {
            name: 'Info BG',
            variable: '--status-info-bg',
            tailwind: 'bg-status-info-bg',
            hex: '#DBEAFE',
          },
          {
            name: 'Info Text',
            variable: '--status-info-text',
            tailwind: 'text-status-info-text',
            hex: '#1E40AF',
          },
          {
            name: 'Info Border',
            variable: '--status-info-border',
            tailwind: 'border-status-info-border',
            hex: '#BFDBFE',
          },
          {
            name: 'Destructive BG',
            variable: '--status-destructive-bg',
            tailwind: 'bg-status-destructive-bg',
            hex: '#FEE2E2',
          },
          {
            name: 'Destructive Text',
            variable: '--status-destructive-text',
            tailwind: 'text-status-destructive-text',
            hex: '#991B1B',
          },
          {
            name: 'Destructive Border',
            variable: '--status-destructive-border',
            tailwind: 'border-status-destructive-border',
            hex: '#FECACA',
          },
          {
            name: 'Default BG',
            variable: '--status-default-bg',
            tailwind: 'bg-status-default-bg',
            hex: '#F5F5F5',
          },
          {
            name: 'Default Text',
            variable: '--status-default-text',
            tailwind: 'text-status-default-text',
            hex: '#0A0A0A',
          },
          {
            name: 'Default Border',
            variable: '--status-default-border',
            tailwind: 'border-status-default-border',
            hex: '#E5E5E5',
          },
        ]}
      />

      <ColorGroup
        title="Sidebar Chrome"
        colors={[
          {
            name: 'Sidebar BG',
            variable: '--sidebar-bg',
            tailwind: 'bg-sidebar-bg',
            hex: '#0A0A0A',
          },
          {
            name: 'Sidebar Tooltip BG',
            variable: '--sidebar-tooltip-bg',
            tailwind: 'bg-sidebar-tooltip-bg',
            hex: '#1A1A1A',
          },
          {
            name: 'Sidebar Text',
            variable: '--sidebar-text',
            tailwind: 'text-sidebar-text',
            hex: 'rgba(255,255,255,0.7)',
          },
          {
            name: 'Sidebar Text Active',
            variable: '--sidebar-text-active',
            tailwind: 'text-sidebar-text-active',
            hex: '#FFFFFF',
          },
          {
            name: 'Sidebar Text Muted',
            variable: '--sidebar-text-muted',
            tailwind: 'text-sidebar-text-muted',
            hex: 'rgba(255,255,255,0.4)',
          },
          {
            name: 'Sidebar Border',
            variable: '--sidebar-border',
            tailwind: 'border-sidebar-border',
            hex: 'rgba(255,255,255,0.1)',
          },
          {
            name: 'Sidebar Hover',
            variable: '--sidebar-hover',
            tailwind: 'hover:bg-sidebar-hover',
            hex: 'rgba(255,255,255,0.1)',
          },
          {
            name: 'Sidebar Active BG',
            variable: '--sidebar-active-bg',
            tailwind: 'bg-sidebar-active-bg',
            hex: 'rgba(255,255,255,0.1)',
          },
          {
            name: 'Active Indicator',
            variable: '--sidebar-active-indicator',
            tailwind: 'bg-sidebar-active-indicator',
            hex: '#FC5A29',
          },
        ]}
      />

      <ColorGroup
        title="Table Chrome"
        colors={[
          {
            name: 'Table Header BG',
            variable: '--table-header-bg',
            tailwind: 'bg-table-header-bg',
            hex: '#F9FAFB',
          },
          {
            name: 'Table Row Hover',
            variable: '--table-row-hover',
            tailwind: 'hover:bg-table-row-hover',
            hex: '#F3F4F6',
          },
        ]}
      />

      <ColorGroup
        title="Accent / Utility"
        colors={[
          {
            name: 'Accent Blue',
            variable: '--accent-blue',
            tailwind: 'bg-accent-blue / text-accent-blue',
            hex: '#3B82F6',
          },
          {
            name: 'Focus Ring',
            variable: '--focus-ring',
            tailwind: 'ring-focus-ring',
            hex: '#3B82F6',
          },
          {
            name: 'Star Color',
            variable: '--star-color',
            tailwind: 'text-star / bg-star',
            hex: '#FBBF24',
          },
        ]}
      />
    </div>
  ),
};
