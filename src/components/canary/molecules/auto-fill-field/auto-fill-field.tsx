import * as React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/types/canary/utilities/utils';
import { Badge } from '@/components/canary/atoms/badge/badge';

export interface AutoFillFieldProps {
  /** The source that auto-filled this field (e.g. "Amazon", "Claude"). When undefined, no badge is shown. */
  source?: string;
  /** CSS color class for the sparkle icon (e.g. "text-primary" for orange). */
  iconColor?: string;
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
 * Renders a collapsible secondary Badge with a sparkle icon at the top-right
 * corner. On hover, the badge expands to show "Filled by {source}".
 *
 * Wrap both the label and the input so the badge aligns with the label row:
 *
 * ```tsx
 * <AutoFillField source="Amazon" onClear={() => clear('sku')}>
 *   <label>SKU</label>
 *   <InputGroup>
 *     <InputGroupInput value={sku} onChange={...} />
 *   </InputGroup>
 * </AutoFillField>
 * ```
 */
export function AutoFillField({
  source,
  iconColor,
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
        <Badge
          variant="secondary"
          icon={Sparkles}
          {...(iconColor ? { iconColor } : {})}
          collapsible
          className="absolute top-0 right-0 z-10 cursor-default select-none"
        >
          Filled by {source}
        </Badge>
      )}
    </div>
  );
}
