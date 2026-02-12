import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Visual Elements/Colors',
};

export default meta;
type Story = StoryObj;

interface SwatchProps {
  name: string;
  variable: string;
  hex: string;
}

function Swatch({ name, variable, hex }: SwatchProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div
        className="w-12 h-12 rounded-lg border border-[#E5E5E5] shrink-0"
        style={{ backgroundColor: hex }}
      />
      <div>
        <div className="font-semibold text-sm text-[#0A0A0A]">{name}</div>
        <div className="text-xs text-[#737373] font-mono">{variable}</div>
        <div className="text-xs text-[#737373] font-mono">{hex}</div>
      </div>
    </div>
  );
}

function ColorGroup({ title, colors }: { title: string; colors: SwatchProps[] }) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-[#0A0A0A] mb-3 border-b border-[#E5E5E5] pb-2">
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
      <h2 className="text-2xl font-bold text-[#0A0A0A] mb-6">Arda Design Tokens</h2>

      <ColorGroup
        title="Brand"
        colors={[
          { name: 'Primary (Orange)', variable: '--base-primary', hex: '#FC5A29' },
          { name: 'Primary Foreground', variable: '--base-primary-foreground', hex: '#FAFAFA' },
          { name: 'Secondary', variable: '--base-secondary', hex: '#F5F5F5' },
          { name: 'Destructive', variable: '--base-destructive', hex: '#DC2626' },
        ]}
      />

      <ColorGroup
        title="Background / Foreground"
        colors={[
          { name: 'Background', variable: '--base-background', hex: '#FFFFFF' },
          { name: 'Foreground', variable: '--base-foreground', hex: '#0A0A0A' },
          { name: 'App Background', variable: '--background', hex: '#FFFFFF' },
          { name: 'App Foreground', variable: '--foreground', hex: '#171717' },
        ]}
      />

      <ColorGroup
        title="Borders"
        colors={[
          { name: 'Border', variable: '--base-border', hex: '#E5E5E5' },
          { name: 'Input Border', variable: '--base-input', hex: '#E5E5E5' },
        ]}
      />

      <ColorGroup
        title="Muted / Accent"
        colors={[
          { name: 'Muted Foreground', variable: '--base-muted-foreground', hex: '#737373' },
          { name: 'Accent Foreground', variable: '--base-accent-foreground', hex: '#171717' },
        ]}
      />

      <ColorGroup
        title="Status Colors (Badge)"
        colors={[
          { name: 'Default BG', variable: 'badge/default', hex: '#F5F5F5' },
          { name: 'Default Text', variable: 'badge/default-text', hex: '#0A0A0A' },
          { name: 'Success BG', variable: 'badge/success', hex: '#DCFCE7' },
          { name: 'Success Text', variable: 'badge/success-text', hex: '#166534' },
          { name: 'Warning BG', variable: 'badge/warning', hex: '#FEF3C7' },
          { name: 'Warning Text', variable: 'badge/warning-text', hex: '#92400E' },
          { name: 'Info BG', variable: 'badge/info', hex: '#DBEAFE' },
          { name: 'Info Text', variable: 'badge/info-text', hex: '#1E40AF' },
          { name: 'Destructive BG', variable: 'badge/destructive', hex: '#FEE2E2' },
          { name: 'Destructive Text', variable: 'badge/destructive-text', hex: '#991B1B' },
        ]}
      />

      <ColorGroup
        title="UI Chrome"
        colors={[
          { name: 'Sidebar BG', variable: 'sidebar/bg', hex: '#0A0A0A' },
          { name: 'Active Indicator', variable: 'sidebar/active', hex: '#FC5A29' },
          { name: 'Table Header BG', variable: 'table/header', hex: '#F9FAFB' },
          { name: 'Table Hover', variable: 'table/hover', hex: '#F3F4F6' },
          { name: 'Card Accent', variable: 'card/accent', hex: '#3B82F6' },
          { name: 'Button Destructive', variable: 'button/destructive', hex: '#EF4444' },
        ]}
      />
    </div>
  ),
};
