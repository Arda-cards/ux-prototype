'use client';

import {
  useRef,
  useState,
  useEffect,
  useMemo,
  Children,
  Fragment,
  isValidElement,
  type ReactNode,
  type ReactElement,
} from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface OverflowToolbarProps {
  children: ReactNode;
  /** Gap between items in pixels. Default 8. */
  gap?: number;
  /** Class for the container. */
  className?: string;
}

// Flatten fragments so <><A/><B/></> becomes [A, B]
function flattenChildren(nodes: ReactNode): ReactNode[] {
  const result: ReactNode[] = [];
  Children.forEach(nodes, (child) => {
    if (!child) return;
    if (isValidElement(child) && child.type === Fragment) {
      result.push(
        ...flattenChildren((child as ReactElement<{ children?: ReactNode }>).props.children),
      );
    } else {
      result.push(child);
    }
  });
  return result;
}

/**
 * Renders children inline. Items that don't fit collapse into a "more" overflow menu.
 * Uses ResizeObserver to adapt to actual available space — no breakpoints needed.
 *
 * Each child should have a `data-overflow-label` attribute for the overflow menu text.
 * Children without it use their text content as the label.
 */
export function OverflowToolbar({ children, gap = 8, className }: OverflowToolbarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(0);

  const childArray = useMemo(() => flattenChildren(children), [children]);
  const childCount = childArray.length;

  useEffect(() => {
    const container = containerRef.current;
    const measurer = measureRef.current;
    if (!container || !measurer) return;

    const overflowButtonWidth = 40;

    const measure = () => {
      const containerWidth = container.offsetWidth;
      const items = Array.from(measurer.children) as HTMLElement[];

      let usedWidth = 0;
      let count = 0;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item) break;
        const itemWidth = item.offsetWidth + (i > 0 ? gap : 0);
        const remaining = containerWidth - usedWidth;
        const needsOverflow = i < items.length - 1;
        const spaceNeeded = needsOverflow ? itemWidth + overflowButtonWidth + gap : itemWidth;

        if (remaining >= spaceNeeded) {
          usedWidth += itemWidth;
          count++;
        } else {
          break;
        }
      }

      setVisibleCount(count === items.length ? items.length : count);
    };

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(measure);
    });
    observer.observe(container);

    // Initial measure after children render
    requestAnimationFrame(measure);

    return () => observer.disconnect();
  }, [childCount, gap]);

  const visibleItems = childArray.slice(0, visibleCount);
  const overflowItems = childArray.slice(visibleCount);

  return (
    <div ref={containerRef} className={`flex items-center ${className ?? ''}`} style={{ gap }}>
      {/* Hidden measurer — renders all children off-screen to measure widths */}
      <div
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-[-9999px] top-0 flex items-center"
        style={{ gap, visibility: 'hidden' }}
      >
        {childArray}
      </div>

      {/* Visible items */}
      {visibleItems}

      {/* Overflow menu */}
      {overflowItems.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="px-2" aria-label="More actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {overflowItems.map((child, i) => {
              const el = child as React.ReactElement<{
                'data-overflow-label'?: string;
                'data-overflow-icon'?: ReactNode;
                'aria-label'?: string;
                onClick?: () => void;
                children?: ReactNode;
                className?: string;
              }>;
              const props = el.props ?? {};
              const label =
                props['data-overflow-label'] ??
                props['aria-label'] ??
                `Action ${visibleCount + i + 1}`;
              const icon = props['data-overflow-icon'];
              const isDestructive = props.className?.includes('destructive');

              return (
                <DropdownMenuItem
                  key={i}
                  onClick={props.onClick}
                  className={isDestructive ? 'text-destructive focus:text-destructive' : undefined}
                >
                  {icon}
                  {label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
