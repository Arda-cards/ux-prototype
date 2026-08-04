// Mirrored from `types/extras/model/general/money.ts` into the canary type tree
// so canary components depend only on canary (not extras). `extras` is internal
// to this repo and is not part of the published package.

export type Currency = 'USD' | 'CAD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CNY' | 'INR' | 'MXN';

export interface Money {
  value: number;
  currency: Currency;
}
