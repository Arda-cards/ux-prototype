import * as React from 'react';

// Base interface for dropdown options
export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

// Interface for static prefix/suffix content
export interface StaticContent {
  content: React.ReactNode;
  className?: string;
}

// Interface for dropdown prefix/suffix content
export interface DropdownContent {
  options: DropdownOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Union type for prefix/suffix content
export type PrefixSuffixContent = StaticContent | DropdownContent;

// Type guards to differentiate between static and dropdown content
export const isStaticContent = (content: PrefixSuffixContent): content is StaticContent => {
  return 'content' in content;
};

export const isDropdownContent = (content: PrefixSuffixContent): content is DropdownContent => {
  return 'options' in content;
};

// Enhanced Input component props
export interface EnhancedInputProps extends Omit<React.ComponentProps<'input'>, 'prefix'> {
  // Prefix configuration
  prefix?: PrefixSuffixContent;
  
  // Suffix configuration  
  suffix?: PrefixSuffixContent;
  
  // Input container styling
  containerClassName?: string;
  
  // Error state affects the entire input group
  error?: boolean;
  
  // Description text below input
  description?: string;
  
  // Whether to show the input in a loading state
  loading?: boolean;
}

// Convenience types for common use cases
export interface UrlInputProps extends Omit<EnhancedInputProps, 'prefix'> {
  protocol?: string; // defaults to "https://"
}

export interface UnitInputProps extends Omit<EnhancedInputProps, 'suffix'> {
  unit?: string | DropdownOption[]; // string for static, array for dropdown
  unitValue?: string;
  onUnitChange?: (unit: string) => void;
}

export interface CurrencyInputProps extends Omit<EnhancedInputProps, 'prefix'> {
  currency?: string | DropdownOption[]; // string for static, array for dropdown  
  currencyValue?: string;
  onCurrencyChange?: (currency: string) => void;
} 