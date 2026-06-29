import { useEffect, type RefObject } from 'react';

/**
 * Enables horizontal drag-to-scroll on an AG Grid container.
 *
 * Attaches mousedown/mousemove/mouseup listeners to the container. When the
 * user clicks and drags horizontally past a threshold (5px), the grid's
 * center-cols-viewport scrolls with the drag. A click event is suppressed
 * after a drag so row-click handlers don't fire accidentally.
 *
 * Ignores drags that start on headers, popups, inputs, or buttons.
 *
 * Pass `enabled: false` to opt out (e.g., for touch-only surfaces where
 * AG Grid's native touch scrolling is preferable). Defaults to enabled.
 */
export function useDragToScroll(
  containerRef: RefObject<HTMLDivElement | null>,
  enabled: boolean = true,
) {
  useEffect(() => {
    if (!enabled) return;
    const el = containerRef.current;
    if (!el) return;

    let isDown = false;
    let hasDragged = false;
    let startX = 0;
    let scrollLeft = 0;
    let viewport: HTMLElement | null = null;
    let didWarnMissingViewport = false;
    const dragThreshold = 5;

    const getViewport = () => {
      if (!viewport) {
        viewport = el.querySelector('.ag-center-cols-viewport');
        if (!viewport && !didWarnMissingViewport) {
          didWarnMissingViewport = true;
          // The selector is an AG Grid internal class. If AG Grid changes it
          // (across major versions) or the grid hasn't mounted yet, every
          // subsequent drag would be a silent no-op without this warning.
          console.warn(
            '[DataGrid] Drag-to-scroll: AG Grid viewport element ' +
              '(.ag-center-cols-viewport) not found. Drag-to-scroll will be ' +
              'inactive until the grid mounts or the selector is updated.',
          );
        }
      }
      return viewport;
    };

    const onMouseDown = (e: MouseEvent) => {
      const vp = getViewport();
      if (!vp) return;

      // Don't intercept clicks on headers, popups, inputs, or buttons
      const target = e.target as HTMLElement;
      if (
        target.closest('.ag-header') ||
        target.closest('.ag-popup') ||
        target.closest('input') ||
        target.closest('button')
      ) {
        return;
      }

      isDown = true;
      hasDragged = false;
      startX = e.pageX;
      scrollLeft = vp.scrollLeft;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      const dx = e.pageX - startX;
      if (!hasDragged && Math.abs(dx) > dragThreshold) {
        hasDragged = true;
        el.style.cursor = 'grabbing';
        (document.activeElement as HTMLElement)?.blur?.();
      }
      const vp = getViewport();
      if (!vp || !hasDragged) return;
      vp.scrollLeft = scrollLeft - dx;
    };

    const onMouseUp = () => {
      if (!isDown) return;
      isDown = false;
      el.style.cursor = '';
      if (hasDragged) {
        // Suppress the click that follows mouseup after a drag
        const suppressClick = (e: MouseEvent) => {
          e.stopPropagation();
          e.preventDefault();
        };
        el.addEventListener('click', suppressClick, { capture: true, once: true });
        setTimeout(() => el.removeEventListener('click', suppressClick, { capture: true }), 100);
      }
    };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [containerRef, enabled]);
}
