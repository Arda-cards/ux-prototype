/** A single color option entry. */
export interface ColorOption {
  value: string;
  label: string;
  hex: string;
}

/** Default 8-color palette — the `ItemColor` values the backend accepts (PDEV-2289). */
export const DEFAULT_COLOR_MAP: Record<string, { hex: string; name: string }> = {
  RED: { hex: '#EF4444', name: 'Red' },
  GREEN: { hex: '#22C55E', name: 'Green' },
  BLUE: { hex: '#3B82F6', name: 'Blue' },
  YELLOW: { hex: '#FDE047', name: 'Yellow' },
  ORANGE: { hex: '#F97316', name: 'Orange' },
  PURPLE: { hex: '#A855F7', name: 'Purple' },
  PINK: { hex: '#EC4899', name: 'Pink' },
  GRAY: { hex: '#6B7280', name: 'Gray' },
};

/** Design-time configuration for color cell display. */
export interface ColorCellDisplayStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Custom color map. Defaults to the 8-color palette. */
  colorMap?: Record<string, { hex: string; name: string }>;
}

/** Runtime configuration for color cell display. */
export interface ColorCellDisplayRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** The color enum value (e.g. "RED"). */
  value?: string;
}

export interface ColorCellDisplayProps
  extends ColorCellDisplayStaticConfig, ColorCellDisplayRuntimeConfig {}

/** Compact read-only color renderer showing a swatch + label. */
export function ColorCellDisplay({ value, colorMap = DEFAULT_COLOR_MAP }: ColorCellDisplayProps) {
  if (!value) {
    return <span className="text-sm leading-normal text-muted-foreground">—</span>;
  }

  const colorInfo = colorMap[value] ?? { hex: '#6B7280', name: value };

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"
        style={{ backgroundColor: colorInfo.hex }}
      />
      <span className="text-sm leading-normal">{colorInfo.name}</span>
    </div>
  );
}
