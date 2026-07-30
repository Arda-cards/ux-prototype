// Mirrored from `types/extras/model/general/time/duration.ts` into the canary type
// tree so canary components depend only on canary (not extras). `extras` is internal
// to this repo and is not part of the published package.

export type TimeUnit = 'MILLI' | 'SECOND' | 'MINUTE' | 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

export interface Duration {
  length: number;
  unit: TimeUnit;
}
