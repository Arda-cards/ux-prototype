import * as React from 'react';

import {
  Select as SelectPrimitive,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/canary/primitives/select';
import { AutoFillLabel } from '@/components/canary/atoms/auto-fill-label';

export interface ArdaSelectProps {
  /** Current value. */
  value?: string;
  /** Called when value changes. */
  onValueChange?: (value: string) => void;
  /** Placeholder text shown when no value is selected. */
  placeholder?: string;
  /** Select options as { label, value } pairs. */
  options: { label: string; value: string }[];
  /** Disable the select. */
  disabled?: boolean;
  /** Size variant for the trigger. */
  size?: 'sm' | 'default';
  /** Additional CSS classes on the trigger. */
  className?: string;
  /** Source label for auto-filled state. When set, shows helper text below the field. */
  autoFillSource?: string;
  /** CSS color class for the auto-fill sparkle icon. */
  autoFillIconClass?: string;
  /** Called when user changes the value, signaling auto-fill should clear. */
  onAutoFillClear?: () => void;
}

export function ArdaSelect({
  value,
  onValueChange,
  placeholder = 'Select...',
  options,
  disabled,
  size = 'default',
  className,
  autoFillSource,
  autoFillIconClass,
  onAutoFillClear,
}: ArdaSelectProps) {
  const handleValueChange = React.useCallback(
    (val: string) => {
      onValueChange?.(val);
      onAutoFillClear?.();
    },
    [onValueChange, onAutoFillClear],
  );

  return (
    <>
      <SelectPrimitive
        {...(value ? { value } : {})}
        onValueChange={handleValueChange}
        {...(disabled ? { disabled } : {})}
      >
        <SelectTrigger size={size} className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectPrimitive>
      {autoFillSource && (
        <AutoFillLabel
          source={autoFillSource}
          {...(autoFillIconClass ? { iconClass: autoFillIconClass } : {})}
        />
      )}
    </>
  );
}

// Re-export primitives for advanced composition
export {
  SelectPrimitive as Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
