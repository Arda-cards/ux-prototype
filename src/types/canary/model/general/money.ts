// Mirrored from `types/extras/model/general/money.ts` into the canary type tree
// so canary components depend only on canary (not extras). `extras` is internal
// to this repo and is not part of the published package.

// Mirrors the backend `cards.arda.common.lib.domain.general.Currency` enum. This list had
// drifted to 9 entries; PDEV-1590 restored the full set and added the sourcing-country
// currencies. This is the published surface — `canary.ts` re-exports `Currency` from here.
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
