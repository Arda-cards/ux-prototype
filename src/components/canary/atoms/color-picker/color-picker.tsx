import * as React from 'react';

import { cn } from '@/types/canary/utilities/utils';
import { DEFAULT_COLOR_MAP } from '@/components/canary/atoms/grid/color/color-cell-display';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/canary/primitives/popover';

// --- Types ---

export interface ColorPickerProps extends Omit<React.ComponentProps<'div'>, 'onChange'> {
  /** Selected color key (e.g. "GRAY"). */
  value: string;
  /** Called when a color is selected. */
  onValueChange: (color: string) => void;
  /** Custom color map. Defaults to the standard 10-color palette. */
  colors?: Record<string, { hex: string; name: string }>;
  /** Disable the picker. */
  disabled?: boolean;
}

// --- Component ---

/**
 * ColorPicker — compact color selector with a popover palette.
 *
 * Shows a small swatch button. Clicking opens a popover with the full palette.
 */
export function ColorPicker({
  value,
  onValueChange,
  colors = DEFAULT_COLOR_MAP,
  disabled = false,
  className,
  ...rest
}: ColorPickerProps) {
  const [open, setOpen] = React.useState(false);

  const selectedHex = colors[value]?.hex ?? colors.GRAY?.hex ?? '#6B7280';
  const colorEntries = Object.entries(colors);

  const handleSelect = (key: string) => {
    onValueChange(key);
    setOpen(false);
  };

  return (
    <div
      data-slot="color-picker"
      data-state={open ? 'open' : 'closed'}
      data-disabled={disabled || undefined}
      className={cn(className)}
      {...rest}
    >
      <Popover open={open} onOpenChange={disabled ? () => {} : setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className="flex-shrink-0 cursor-pointer rounded-lg border border-input bg-background p-[7px] shadow-xs focus-ring disabled:opacity-50 disabled:pointer-events-none"
            aria-label={`Color: ${colors[value]?.name ?? value}. Click to change.`}
          >
            <div
              className="size-[22px] rounded-sm shadow-[0.5px_0.5px_1.5px_0.5px_rgba(0,0,0,0.12)]"
              style={{ backgroundColor: selectedHex }}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={4}
          className="flex gap-1.5 items-center w-auto p-[7px] rounded-lg"
        >
          {colorEntries.map(([key, { hex, name }]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleSelect(key)}
              className={cn(
                'size-[22px] rounded-sm shadow-[0.5px_0.5px_1.5px_0.5px_rgba(0,0,0,0.12)] cursor-pointer',
                key === value && 'ring-2 ring-ring ring-offset-1',
              )}
              style={{ backgroundColor: hex }}
              aria-label={name}
              aria-pressed={key === value}
            />
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}

/** Lookup a color hex by key. */
export function getColorHex(key: string, colors = DEFAULT_COLOR_MAP): string {
  return colors[key]?.hex ?? '#6B7280';
}
