export type Currency = 'USD' | 'CAD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CNY' | 'INR' | 'MXN';

export interface Money {
  value: number;
  currency: Currency;
}
