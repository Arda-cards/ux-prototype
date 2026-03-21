import * as Tooltip from '@radix-ui/react-tooltip';

/** Design-time configuration for memo cell display. */
export interface MemoCellDisplayStaticConfig {
  /* --- View / Layout / Controller --- */
  /** Maximum characters before truncation. */
  maxLength?: number;
  /** Milliseconds before hover overlay appears. Default 500. */
  hoverDelay?: number;
}

/** Runtime configuration for memo cell display. */
export interface MemoCellDisplayRuntimeConfig {
  /* --- Model / Data Binding --- */
  /** The memo text value to display. */
  value?: string;
}

export interface MemoCellDisplayProps
  extends MemoCellDisplayStaticConfig, MemoCellDisplayRuntimeConfig {}

/** Inline truncated memo renderer with hover overlay for full text. */
export function MemoCellDisplay({ value, maxLength = 50, hoverDelay = 500 }: MemoCellDisplayProps) {
  if (!value) {
    return <span className="text-sm leading-normal text-muted-foreground">—</span>;
  }

  const needsTruncation = value.length > maxLength;
  const displayText = needsTruncation ? value.slice(0, maxLength) + '…' : value;

  if (!needsTruncation) {
    return <span className="truncate text-sm leading-normal">{displayText}</span>;
  }

  return (
    <Tooltip.Provider delayDuration={hoverDelay}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span className="truncate text-sm leading-normal">{displayText}</span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="max-w-xs rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md"
            sideOffset={5}
          >
            <p className="whitespace-pre-wrap break-words">{value}</p>
            <Tooltip.Arrow className="fill-popover" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
