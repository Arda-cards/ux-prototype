import * as React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/types/canary/utilities/utils';

export interface AutoFillFieldProps {
  /** The source that auto-filled this field (e.g. "Amazon", "Claude"). When undefined, no badge is shown. */
  source?: string;
  /** CSS color class for the sparkle icon. Defaults to "text-muted-foreground". */
  iconColorClass?: string;
  /**
   * Which DOM event on the wrapper triggers auto-dismiss of the badge.
   *
   * - `'input'` (default) — listens for `onInput`. Covers text inputs, textareas,
   *   and typeaheads (fires on every keystroke).
   * - `'change'` — listens for `onChange`. Covers native selects, checkboxes, toggles,
   *   and file inputs.
   * - `'manual'` — no auto-dismiss. The consumer clears `source` via their own
   *   callback (e.g. in a Radix Select `onValueChange` or image upload handler).
   *   Use this for custom components that don't fire native DOM events.
   */
  dismissOn?: 'input' | 'change' | 'manual';
  /** Called when the badge is dismissed (via auto-dismiss or when `source` becomes undefined). */
  onClear?: () => void;
  /** The wrapped field content. */
  children: React.ReactNode;
  /** Additional CSS classes on the wrapper. */
  className?: string;
}

/**
 * AutoFillField — wraps any form field to show an auto-fill badge indicator.
 *
 * Renders a small sparkle badge at the top-right corner of the wrapped content.
 * On hover, the badge expands to show "Filled by {source}". The badge disappears
 * when the user interacts with the field (controlled by `dismissOn`).
 *
 * Takes no extra vertical space — the badge is absolutely positioned and overlaps
 * the field's top-right corner.
 *
 * ## Usage
 *
 * ```tsx
 * // Text input — auto-clears on typing (default)
 * <AutoFillField source="Amazon" onClear={() => clear('sku')}>
 *   <InputGroup>
 *     <InputGroupInput value={sku} onChange={...} />
 *   </InputGroup>
 * </AutoFillField>
 *
 * // Native select or checkbox — auto-clears on change
 * <AutoFillField source="Amazon" onClear={() => clear('taxable')} dismissOn="change">
 *   <Switch checked={taxable} onCheckedChange={...} />
 * </AutoFillField>
 *
 * // Custom component (Radix Select, image upload) — manual clear
 * <AutoFillField source="Amazon" dismissOn="manual">
 *   <ArdaSelect onValueChange={(v) => { setValue(v); clear('method'); }} />
 * </AutoFillField>
 * ```
 */
export function AutoFillField({
  source,
  iconColorClass = 'text-muted-foreground',
  dismissOn = 'input',
  onClear,
  children,
  className,
}: AutoFillFieldProps) {
  const onClearRef = React.useRef(onClear);
  onClearRef.current = onClear;

  const handleDismiss = React.useCallback(() => {
    onClearRef.current?.();
  }, []);

  const eventHandlers =
    dismissOn === 'input'
      ? { onInput: handleDismiss }
      : dismissOn === 'change'
        ? { onChange: handleDismiss }
        : {};

  return (
    <div data-slot="auto-fill-field" className={cn('relative', className)} {...eventHandlers}>
      {children}
      {source && (
        <span
          className={cn(
            'absolute -top-2.5 right-1 z-10',
            'group/autofill inline-flex items-center gap-1',
            'rounded-full bg-background border border-border shadow-sm',
            'px-1.5 py-0.5',
            'cursor-default select-none',
            'transition-all duration-200 ease-in-out',
          )}
        >
          <Sparkles className={cn('size-3 shrink-0', iconColorClass)} />
          <span
            className={cn(
              'text-xs text-muted-foreground whitespace-nowrap overflow-hidden',
              'max-w-0 opacity-0 group-hover/autofill:max-w-48 group-hover/autofill:opacity-100',
              'transition-all duration-200 ease-in-out',
            )}
          >
            Filled by {source}
          </span>
        </span>
      )}
    </div>
  );
}
