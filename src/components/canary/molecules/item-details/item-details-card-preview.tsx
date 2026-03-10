'use client';

import { useRef, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

// --- Interfaces ---

export interface ArdaItemDetailsCardPreviewProps {
  /* --- Model / Data Binding --- */
  /** Current card index (1-based). */
  currentIndex: number;
  /** Total number of cards. */
  totalCards: number;
  /** Called when the user navigates to a different card. */
  onIndexChange: (index: number) => void;
  /** Whether cards are loading. */
  loading?: boolean;

  /* --- View / Layout / Controller --- */
  /** Render prop for the card visual. Receives the current 1-based index. */
  renderCard?: (index: number) => React.ReactNode;
  /** Empty state content when no cards exist. */
  emptyState?: React.ReactNode;
  /** Additional CSS classes. */
  className?: string;
}

// --- Constants ---
const SWIPE_THRESHOLD = 50;
/** Card width in pixels — large enough to verify print content. */
const CARD_W = 260;
/** Gap between cards in pixels. */
const GAP = 16;

// --- Component ---

/**
 * ArdaItemDetailsCardPreview — centered card carousel with animated slide transitions.
 *
 * Renders all cards in a horizontal strip and translates to center the active card.
 * Peek cards on either side hint at more content. Supports swipe and click navigation.
 */
export function ArdaItemDetailsCardPreview({
  currentIndex,
  totalCards,
  onIndexChange,
  loading,
  renderCard,
  emptyState,
  className,
}: ArdaItemDetailsCardPreviewProps) {
  const hasCards = totalCards > 0;
  const touchStartX = useRef<number | null>(null);
  const hasNext = currentIndex < totalCards;
  const hasPrev = currentIndex > 1;

  const goNext = useCallback(() => {
    if (hasNext) onIndexChange(currentIndex + 1);
  }, [hasNext, currentIndex, onIndexChange]);

  const goPrev = useCallback(() => {
    if (hasPrev) onIndexChange(currentIndex - 1);
  }, [hasPrev, currentIndex, onIndexChange]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return;
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      touchStartX.current = null;

      if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
      if (deltaX < 0) goNext();
      else goPrev();
    },
    [goNext, goPrev],
  );

  const renderCardContent = useCallback(
    (index: number) =>
      renderCard?.(index) ?? (
        <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-border/60 bg-background">
          <span className="text-xs text-muted-foreground">Card {index}</span>
        </div>
      ),
    [renderCard],
  );

  // Build array of card indices to render
  const cardIndices = useMemo(
    () => Array.from({ length: totalCards }, (_, i) => i + 1),
    [totalCards],
  );

  // Calculate translateX to center the active card.
  // Each card occupies CARD_W + GAP. We shift so the active card's center aligns with 50%.
  const translateX = `calc(50% - ${(currentIndex - 1) * (CARD_W + GAP) + CARD_W / 2}px)`;

  return (
    <div className={cn('w-full border-b border-border bg-muted/40 py-4', className)}>
      {/* Loading */}
      {loading && (
        <div className="flex w-full items-center justify-center py-16">
          <Loader2
            className="size-5 animate-spin motion-reduce:animate-none text-muted-foreground"
            aria-hidden="true"
          />
          <span className="sr-only">Loading cards</span>
        </div>
      )}

      {/* Empty */}
      {!loading && !hasCards && (
        <div className="flex w-full flex-col items-center gap-2 py-16">
          {emptyState ?? (
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">No cards yet</p>
              <p className="text-xs text-muted-foreground">
                Create kanban cards to track this item on the shop floor.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Card carousel */}
      {!loading && hasCards && (
        <div className="flex flex-col gap-2">
          {/* Carousel track — overflow hidden, swipeable */}
          <div
            className="overflow-hidden touch-pan-y select-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex items-stretch transition-transform duration-300 ease-out motion-reduce:transition-none"
              style={{
                gap: `${GAP}px`,
                transform: `translateX(${translateX})`,
              }}
            >
              {cardIndices.map((i) => {
                const isActive = i === currentIndex;
                return (
                  <button
                    key={i}
                    type="button"
                    className={cn(
                      'relative shrink-0 cursor-pointer rounded-lg transition-opacity duration-300 ease-out motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                      isActive ? 'opacity-100' : 'opacity-30 hover:opacity-50',
                    )}
                    style={{ width: `${CARD_W}px` }}
                    onClick={() => {
                      if (!isActive) onIndexChange(i);
                    }}
                    aria-label={isActive ? `Card ${i} of ${totalCards}` : `Go to card ${i}`}
                  >
                    <div className="aspect-[3/4]">{renderCardContent(i)}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation — single compact row, 44px+ touch targets */}
          <div className="flex items-center justify-center gap-1 px-5">
            <Button
              variant="ghost"
              size="sm"
              onClick={goPrev}
              disabled={!hasPrev}
              className="size-9 p-0"
              aria-label="Previous card"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-[3rem] text-center text-sm text-muted-foreground font-mono tabular-nums">
              {currentIndex} / {totalCards}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={goNext}
              disabled={!hasNext}
              className="size-9 p-0"
              aria-label="Next card"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
