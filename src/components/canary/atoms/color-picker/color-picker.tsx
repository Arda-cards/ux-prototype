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
 * Palette supports arrow-key navigation between swatches.
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
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const paletteRef = React.useRef<HTMLDivElement>(null);

  const selectedHex = colors[value]?.hex ?? colors.GRAY?.hex ?? '#6B7280';
  const colorEntries = Object.entries(colors);

  const handleSelect = (key: string) => {
    onValueChange(key);
    setOpen(false);
  };

  // Focus the selected swatch when palette opens
  React.useEffect(() => {
    if (!open) return;
    const selectedIdx = colorEntries.findIndex(([key]) => key === value);
    setFocusedIndex(selectedIdx >= 0 ? selectedIdx : 0);
    // Focus after popover renders
    requestAnimationFrame(() => {
      const buttons = paletteRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
      const target = buttons?.[selectedIdx >= 0 ? selectedIdx : 0];
      target?.focus();
    });
  }, [open]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      const len = colorEntries.length;
      let next = focusedIndex;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          next = (focusedIndex + 1) % len;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          next = (focusedIndex - 1 + len) % len;
          break;
        case 'Home':
          e.preventDefault();
          next = 0;
          break;
        case 'End':
          e.preventDefault();
          next = len - 1;
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < len) {
            handleSelect(
              (colorEntries[focusedIndex] as [string, { hex: string; name: string }])[0],
            );
          }
          return;
        default:
          return;
      }

      setFocusedIndex(next);
      const buttons = paletteRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
      buttons?.[next]?.focus();
    },
    [focusedIndex, colorEntries, handleSelect],
  );

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
            className="relative flex-shrink-0 cursor-pointer rounded-lg border border-input bg-background p-[7px] shadow-xs focus-ring disabled:opacity-50 disabled:pointer-events-none min-h-11 min-w-11 flex items-center justify-center"
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
          sideOffset={-44}
          className="flex gap-1.5 items-center w-auto p-3 rounded-lg"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div
            ref={paletteRef}
            role="radiogroup"
            aria-label="Color palette"
            className="flex gap-1.5 items-center"
            onKeyDown={handleKeyDown}
          >
            {colorEntries.map(([key, { hex, name }], i) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={key === value}
                aria-label={name}
                tabIndex={i === focusedIndex ? 0 : -1}
                onClick={() => handleSelect(key)}
                className={cn(
                  'relative size-[22px] rounded-sm shadow-[0.5px_0.5px_1.5px_0.5px_rgba(0,0,0,0.12)] cursor-pointer',
                  'before:absolute before:inset-[-11px] before:rounded-md',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                  key === value && 'ring-2 ring-ring ring-offset-1',
                )}
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/** Lookup a color hex by key. */
export function getColorHex(key: string, colors = DEFAULT_COLOR_MAP): string {
  return colors[key]?.hex ?? '#6B7280';
}
