import { getAdjacentItem } from './itemListNavigation';

type Item = { entityId: string };

describe('getAdjacentItem', () => {
  const items: Item[] = [
    { entityId: 'a' },
    { entityId: 'b' },
    { entityId: 'c' },
  ];

  it('returns next item on down from first', () => {
    expect(getAdjacentItem(items, 'a', 'down')).toEqual({ entityId: 'b' });
  });

  it('returns next item on down from middle', () => {
    expect(getAdjacentItem(items, 'b', 'down')).toEqual({ entityId: 'c' });
  });

  it('returns null on down from last', () => {
    expect(getAdjacentItem(items, 'c', 'down')).toBeNull();
  });

  it('returns previous item on up from last', () => {
    expect(getAdjacentItem(items, 'c', 'up')).toEqual({ entityId: 'b' });
  });

  it('returns previous item on up from middle', () => {
    expect(getAdjacentItem(items, 'b', 'up')).toEqual({ entityId: 'a' });
  });

  it('returns null on up from first', () => {
    expect(getAdjacentItem(items, 'a', 'up')).toBeNull();
  });

  it('returns null when currentEntityId is missing', () => {
    expect(getAdjacentItem(items, undefined, 'down')).toBeNull();
    expect(getAdjacentItem(items, undefined, 'up')).toBeNull();
  });

  it('returns null when items is empty', () => {
    expect(getAdjacentItem([], 'a', 'down')).toBeNull();
    expect(getAdjacentItem([], 'a', 'up')).toBeNull();
  });

  it('returns null when currentEntityId not in list', () => {
    expect(getAdjacentItem(items, 'x', 'down')).toBeNull();
    expect(getAdjacentItem(items, 'x', 'up')).toBeNull();
  });

  it('returns same object reference from list', () => {
    const next = getAdjacentItem(items, 'a', 'down');
    expect(next).toBe(items[1]);
  });
});
