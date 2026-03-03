export type TimeUnit = 'MILLI' | 'SECOND' | 'MINUTE' | 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

export interface Duration {
  length: number;
  unit: TimeUnit;
}
