import * as React from 'react';

import { cn } from '@/types/canary/utilities/utils';
import { DEFAULT_COLOR_MAP } from '@/components/canary/atoms/grid/color/color-cell-display';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/canary/primitives/popover';
import { Input } from '@/components/canary/primitives/input';
import { ChevronDown } from 'lucide-react';

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
  /** Show the color name in the trigger and use a searchable vertical dropdown. Defaults to `false`. */
  displayLabel?: boolean;
}

// --- Component ---

/**
 * ColorPicker — compact color selector with a popover palette.
 *
 * In default mode, shows a small swatch button with a horizontal palette popover.
 * With `displayLabel`, shows an input-style trigger with swatch + name, and a
 * searchable vertical dropdown list.
 */
export function ColorPicker({
  value,
  onValueChange,
  colors = DEFAULT_COLOR_MAP,
  disabled = false,
  displayLabel = false,
  className,
  ...rest
}: ColorPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const [search, setSearch] = React.useState('');
  const paletteRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const searchTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  const selectedHex = colors[value]?.hex ?? colors.GRAY?.hex ?? '#6B7280';
  const selectedName = colors[value]?.name ?? value;
  const colorEntries = Object.entries(colors);

  const filteredEntries =
    displayLabel && search
      ? colorEntries.filter(([, { name }]) => name.toLowerCase().includes(search.toLowerCase()))
      : colorEntries;

  const handleSelect = (key: string) => {
    onValueChange(key);
    setOpen(false);
    setSearch('');
  };

  // Cleanup search timeout on unmount
  React.useEffect(() => () => clearTimeout(searchTimeoutRef.current), []);

  // Focus management when popover opens
  React.useEffect(() => {
    if (!open) return;
    const entries = displayLabel ? filteredEntries : colorEntries;
    const selectedIdx = entries.findIndex(([key]) => key === value);
    setFocusedIndex(selectedIdx >= 0 ? selectedIdx : 0);

    if (displayLabel) {
      requestAnimationFrame(() => searchRef.current?.focus());
    } else {
      requestAnimationFrame(() => {
        const buttons = paletteRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
        const target = buttons?.[selectedIdx >= 0 ? selectedIdx : 0];
        target?.focus();
      });
    }
  }, [open]);

  // Reset focused index when search changes (label mode)
  React.useEffect(() => {
    if (displayLabel) setFocusedIndex(0);
  }, [search]);

  // Compact mode keyboard handler (original behavior preserved)
  const handleCompactKeyDown = React.useCallback(
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

  // Label mode keyboard handler (search input)
  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    const len = filteredEntries.length;
    if (len === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % len);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + len) % len);
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < len) {
          handleSelect(
            (filteredEntries[focusedIndex] as [string, { hex: string; name: string }])[0],
          );
        }
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        setSearch('');
        break;
      default:
        break;
    }
  };

  // Scroll focused item into view in label mode
  React.useEffect(() => {
    if (!displayLabel || focusedIndex < 0) return;
    const items = paletteRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    items?.[focusedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [focusedIndex, displayLabel]);

  return (
    <div
      data-slot="color-picker"
      data-state={open ? 'open' : 'closed'}
      data-disabled={disabled || undefined}
      className={cn(className)}
      {...rest}
    >
      <Popover
        open={open}
        onOpenChange={(o) => {
          if (disabled) return;
          setOpen(o);
          if (!o) setSearch('');
        }}
      >
        <PopoverTrigger asChild>
          {displayLabel ? (
            <button
              type="button"
              disabled={disabled}
              className="flex items-center gap-2 h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs cursor-pointer focus-ring disabled:opacity-50 disabled:pointer-events-none"
              aria-label={`Color: ${selectedName}. Enter to select.`}
            >
              <span
                className="size-4 flex-shrink-0 rounded-sm shadow-xs"
                style={{ backgroundColor: selectedHex }}
              />
              <span className="flex-1 text-left truncate text-foreground">{selectedName}</span>
              <ChevronDown className="size-4 text-muted-foreground flex-shrink-0" />
            </button>
          ) : (
            <button
              type="button"
              disabled={disabled}
              className="relative flex-shrink-0 cursor-pointer rounded-lg border border-input bg-background shadow-xs focus-ring disabled:opacity-50 disabled:pointer-events-none h-9 w-9 flex items-center justify-center"
              aria-label={`Color: ${selectedName}. Click to change.`}
            >
              <div
                className="size-5 rounded-sm shadow-xs"
                style={{ backgroundColor: selectedHex }}
              />
            </button>
          )}
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={displayLabel ? 4 : -36}
          className={cn(
            'p-0 rounded-md',
            displayLabel
              ? 'w-[var(--radix-popover-trigger-width)]'
              : 'w-auto max-w-[calc(100vw-2rem)]',
          )}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {displayLabel && (
            <div className="p-1 border-b border-border">
              <Input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleLabelKeyDown}
                placeholder="Filter..."
                className="h-8 border-0 shadow-none focus-visible:ring-0"
              />
            </div>
          )}
          <div
            ref={paletteRef}
            role="radiogroup"
            aria-label="Color palette"
            className={cn(
              displayLabel
                ? 'flex flex-col max-h-48 overflow-y-auto p-1'
                : 'flex flex-wrap items-center',
            )}
            onKeyDown={displayLabel ? undefined : handleCompactKeyDown}
          >
            {filteredEntries.map(([key, { hex, name }], i) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={key === value}
                aria-label={name}
                tabIndex={i === focusedIndex ? 0 : -1}
                onClick={() => handleSelect(key)}
                onKeyDown={displayLabel ? undefined : handleCompactKeyDown}
                className={cn(
                  'cursor-pointer outline-none rounded-sm',
                  displayLabel
                    ? 'flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground'
                    : 'h-9 w-9 flex items-center justify-center',
                  displayLabel && key === value && 'bg-accent',
                  displayLabel && i === focusedIndex && 'bg-accent text-accent-foreground',
                  !displayLabel && i === focusedIndex && 'ring-2 ring-ring ring-offset-1',
                )}
              >
                <span
                  className={cn(
                    'rounded-sm shadow-xs pointer-events-none',
                    displayLabel ? 'size-4 flex-shrink-0' : 'size-5',
                  )}
                  style={{ backgroundColor: hex }}
                />
                {displayLabel && <span className="truncate">{name}</span>}
              </button>
            ))}
            {displayLabel && filteredEntries.length === 0 && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">No colors match</div>
            )}
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

/*
 * Notes: What TypeaheadInput would need to support this use case natively:
 *
 * 1. Custom option rendering — a `renderOption` prop or slot so each item can
 *    show a swatch + label instead of plain text.
 * 2. Static options mode — currently TypeaheadInput requires an async `lookup`
 *    function. A `staticOptions` prop (or synchronous lookup) would avoid the
 *    unnecessary async/loading machinery for fixed lists.
 * 3. Custom trigger — TypeaheadInput always renders an Input as the trigger.
 *    A `renderTrigger` prop or `displayValue` slot would allow showing a
 *    swatch + name when closed, then switching to a search input when opened.
 * 4. No "create new" — already supported via `allowCreate={false}`.
 * 5. MAX_RESULTS as a prop — currently hardcoded to 8. A `maxResults` prop
 *    would let consumers control the visible list length.
 */
