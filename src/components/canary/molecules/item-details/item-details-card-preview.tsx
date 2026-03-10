'use client';

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
  /** Called when "Card preview" button is clicked. */
  onPreview?: () => void;
  /** Empty state content when no cards exist. */
  emptyState?: React.ReactNode;
  /** Additional CSS classes. */
  className?: string;
}

// --- Component ---

/**
 * ArdaItemDetailsCardPreview — card preview area with navigation and count badge.
 *
 * Shows a card visual with prev/next navigation and a count badge.
 * Handles loading, empty, and populated states.
 */
export function ArdaItemDetailsCardPreview({
  currentIndex,
  totalCards,
  onIndexChange,
  loading,
  renderCard,
  onPreview,
  emptyState,
  className,
}: ArdaItemDetailsCardPreviewProps) {
  const hasCards = totalCards > 0;

  return (
    <div className={cn('w-full bg-accent px-6 py-4', className)}>
      <div className="mx-auto flex max-w-[396px] flex-col items-center gap-2">
        {/* Loading */}
        {loading && (
          <div className="flex w-full items-center justify-center py-8">
            <Loader2
              className="size-5 animate-spin motion-reduce:animate-none text-muted-foreground"
              aria-hidden="true"
            />
            <span className="sr-only">Loading cards</span>
          </div>
        )}

        {/* Empty */}
        {!loading && !hasCards && (
          <div className="flex w-full flex-col items-center gap-3 py-8">
            {emptyState ?? (
              <div className="text-center">
                <p className="text-lg font-medium text-foreground">No cards available</p>
                <p className="text-sm text-muted-foreground">
                  This item doesn&apos;t have any kanban cards yet.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Card */}
        {!loading && hasCards && (
          <div className="relative mb-2">
            {renderCard?.(currentIndex) ?? (
              <div className="flex h-48 w-72 items-center justify-center rounded-lg border border-dashed border-border bg-background">
                <span className="text-sm text-muted-foreground">Card {currentIndex}</span>
              </div>
            )}
            {/* Count badge */}
            <div className="absolute -left-4 -top-3 rounded-full border border-border bg-background px-2 py-1 text-sm font-semibold font-mono tabular-nums text-muted-foreground shadow-sm">
              x{totalCards}
            </div>
          </div>
        )}

        {/* Navigation */}
        {!loading && hasCards && (
          <div className="flex w-full items-center justify-between px-2 pt-1">
            {onPreview ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8 bg-background px-3 text-sm font-medium shadow-sm"
                onClick={onPreview}
              >
                Card preview
              </Button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onIndexChange(Math.max(1, currentIndex - 1))}
                disabled={currentIndex === 1}
                className="size-9 p-0 shadow-sm bg-background"
                aria-label="Previous card"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm font-medium font-mono tabular-nums">
                <strong>{currentIndex}</strong> of <strong>{totalCards}</strong>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onIndexChange(Math.min(totalCards, currentIndex + 1))}
                disabled={currentIndex === totalCards}
                className="size-9 p-0 shadow-sm bg-background"
                aria-label="Next card"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
