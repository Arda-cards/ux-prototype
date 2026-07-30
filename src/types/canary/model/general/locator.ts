// Mirrored from `types/extras/model/general/locator.ts` into the canary type tree
// so canary components depend only on canary (not extras). `extras` is internal
// to this repo and is not part of the published package.

export interface Locator {
  facility: string;
  department?: string;
  location?: string;
}
