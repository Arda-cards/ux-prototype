export type ItemWithEntityId = { entityId: string | undefined };

export type AdjacentDirection = 'up' | 'down';

/**
 * Returns the previous or next item in the list by entityId, or null if none.
 */
export function getAdjacentItem<T extends ItemWithEntityId>(
  items: T[],
  currentEntityId: string | undefined,
  direction: AdjacentDirection
): T | null {
  if (!currentEntityId || items.length === 0) return null;
  const idx = items.findIndex((item) => item.entityId === currentEntityId);
  if (idx < 0) return null;
  if (direction === 'down' && idx < items.length - 1) return items[idx + 1];
  if (direction === 'up' && idx > 0) return items[idx - 1];
  return null;
}
