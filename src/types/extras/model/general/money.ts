// Mirrors the backend `cards.arda.common.lib.domain.general.Currency` enum. This list had drifted
// to 9 entries; PDEV-1590 restored the full set and added the sourcing-country currencies.
export type Currency =
  | 'USD'
  | 'CAD'
  | 'EUR'
  | 'GBP'
  | 'JPY'
  | 'AUD'
  | 'CNY'
  | 'INR'
  | 'RUB'
  | 'BRL'
  | 'ZAR'
  | 'MXN'
  | 'KRW'
  | 'SGD'
  | 'HKD'
  | 'NZD'
  | 'CHF'
  | 'AED'
  | 'VND'
  | 'THB'
  | 'IDR'
  | 'MYR'
  | 'PHP'
  | 'TWD'
  | 'BDT'
  | 'PKR'
  | 'KHR'
  | 'LKR'
  | 'TRY'
  | 'ILS';

export interface Money {
  value: number;
  currency: Currency;
}
