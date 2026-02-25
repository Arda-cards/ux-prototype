/***********************************************************************************************************************************
 * Domain Types, will likely be reused for different entities. Recommend to move to separate files.
***********************************************************************************************************************************/

export type Currency = "USD" | "CAD" | "EUR" | "GBP" | "JPY" | "AUD" | "CNY" | "INR" | "RUB" | "BRL" | "ZAR" | "MXN" | "KRW" | "SGD" | "HKD" | "NZD" | "CHF";

export const defaultCurrency: Currency = "USD";

export const CurrencySymbols: Record<Currency, string> = {
  USD: "$",
  CAD: "C$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AUD: "A$",
  CNY: "¥",
  INR: "₹",
  RUB: "₽",
  BRL: "R$",
  ZAR: "R",
  MXN: "$",
  KRW: "₩",
  SGD: "S$",
  HKD: "HK$",
  NZD: "NZ$",
  CHF: "CHF",
};

export interface Money {
  value: number;
  currency: Currency;
}

export const defaultMoney: Money = {
  value: 0.0,
  currency: defaultCurrency,
};


export interface Locator {
  facility: string;
  department?: string;
  location?: string;
  subLocation?: string;
}
