import type { ItemFormState } from '@frontend/constants/types';
import { isItemFormValidForPublish } from './itemFormValidator';

/** Minimal form shape for tests; validator only reads name. */
const formWithName = (name: string): ItemFormState =>
  ({ name, imageUrl: '' } as ItemFormState);

describe('itemFormValidator', () => {
  describe('isItemFormValidForPublish', () => {
    it('returns false when name is blank', () => {
      expect(isItemFormValidForPublish(formWithName(''))).toBe(false);
    });

    it('returns false when name is only whitespace', () => {
      expect(isItemFormValidForPublish(formWithName('   \t\n  '))).toBe(false);
    });

    it('returns true when name has non-whitespace content', () => {
      expect(isItemFormValidForPublish(formWithName('Item name'))).toBe(true);
    });

    it('returns true when name has content with leading/trailing spaces', () => {
      expect(
        isItemFormValidForPublish(formWithName('  Item name  '))
      ).toBe(true);
    });
  });
});
