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
}

export function ArdaSelect({
  value,
  onValueChange,
  placeholder = 'Select...',
  options,
  disabled,
  size = 'default',
  className,
}: ArdaSelectProps) {
  return (
    <SelectPrimitive
      {...(value ? { value } : {})}
      {...(onValueChange ? { onValueChange } : {})}
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
