/**
 * Global blocker for in-app navigation when there are unsaved changes.
 * Pages (e.g. Items) register a blocker; navigation sources (e.g. AppSidebar)
 * call attemptNavigate(url) before router.push(url). If the blocker returns
 * true, the caller must not navigate.
 */

let blocker: ((url: string) => boolean) | null = null;

export function registerBlocker(fn: (url: string) => boolean): () => void {
  blocker = fn;
  return () => {
    blocker = null;
  };
}

export function attemptNavigate(url: string): boolean {
  if (!blocker) return false;
  return blocker(url);
}
