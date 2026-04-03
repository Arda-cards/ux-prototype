import * as React from 'react';

import { DEFAULT_COLOR_MAP } from '@/components/canary/atoms/grid/color/color-cell-display';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/canary/primitives/popover';

// --- Interfaces ---

export interface ColorSwatchPickerProps {
  /** Selected color key (e.g. "GRAY"). */
  value: string;
  /** Called when a color is selected. */
  onChange: (color: string) => void;
  /** Custom color map. Defaults to the standard 10-color palette. */
  colors?: Record<string, { hex: string; name: string }>;
}

// --- Component ---

/**
 * ColorSwatchPicker — compact color selector with a popover palette.
 *
 * Default state shows a small swatch + accent bar. Clicking opens a popover
 * overlay with the full palette.
 */
export function ColorSwatchPicker({
  value,
  onChange,
  colors = DEFAULT_COLOR_MAP,
}: ColorSwatchPickerProps) {
  const [open, setOpen] = React.useState(false);

  const selectedHex = colors[value]?.hex ?? colors.GRAY?.hex ?? '#6B7280';
  const colorEntries = Object.entries(colors);

  const handleSelect = (key: string) => {
    onChange(key);
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-[8px] w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex-shrink-0 cursor-pointer rounded-[8px] border border-input bg-white p-[7px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Color: ${colors[value]?.name ?? value}. Click to change.`}
          >
            <div
              className="size-[22px] rounded-[2px] shadow-[0.5px_0.5px_1.5px_0.5px_rgba(0,0,0,0.12)]"
              style={{ backgroundColor: selectedHex }}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={-38}
          className="flex gap-[6px] items-center w-auto p-[7px] rounded-[8px] border border-border bg-white"
        >
          {colorEntries.map(([key, { hex, name }]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleSelect(key)}
              className={
                key === value
                  ? 'size-[22px] rounded-[2px] shadow-[0.5px_0.5px_1.5px_0.5px_rgba(0,0,0,0.12)] border-2 border-[#9ca3af] cursor-pointer'
                  : 'size-[22px] rounded-[2px] shadow-[0.5px_0.5px_1.5px_0.5px_rgba(0,0,0,0.12)] cursor-pointer'
              }
              style={{ backgroundColor: hex }}
              aria-label={name}
              aria-pressed={key === value}
            />
          ))}
        </PopoverContent>
      </Popover>

      {/* Color bar */}
      <div className="flex-1 h-[10px] transition-colors" style={{ backgroundColor: selectedHex }} />
    </div>
  );
}

/** Lookup a swatch hex by key. */
export function getSwatchHex(key: string, colors = DEFAULT_COLOR_MAP): string {
  return colors[key]?.hex ?? '#6B7280';
}
