import { registerBlocker, attemptNavigate } from './unsavedNavigation';

describe('unsavedNavigation', () => {
  let unregister: (() => void) | null = null;

  afterEach(() => {
    // Always clean up the global blocker state between tests
    if (unregister) {
      unregister();
      unregister = null;
    }
  });

  it('registerBlocker sets the blocker so attemptNavigate invokes it', () => {
    const mockBlocker = jest.fn().mockReturnValue(false);
    unregister = registerBlocker(mockBlocker);

    attemptNavigate('/some-url');

    expect(mockBlocker).toHaveBeenCalledTimes(1);
  });

  it('registerBlocker returns unregister function that removes the blocker', () => {
    const mockBlocker = jest.fn().mockReturnValue(false);
    unregister = registerBlocker(mockBlocker);

    unregister();
    unregister = null;

    const result = attemptNavigate('/some-url');

    expect(result).toBe(false);
    expect(mockBlocker).not.toHaveBeenCalled();
  });

  it('attemptNavigate returns false when no blocker is registered', () => {
    const result = attemptNavigate('/some-url');

    expect(result).toBe(false);
  });

  it('attemptNavigate returns true when blocker returns true (block navigation)', () => {
    const mockBlocker = jest.fn().mockReturnValue(true);
    unregister = registerBlocker(mockBlocker);

    const result = attemptNavigate('/some-url');

    expect(result).toBe(true);
  });

  it('attemptNavigate passes the URL string to the blocker function', () => {
    const mockBlocker = jest.fn().mockReturnValue(false);
    unregister = registerBlocker(mockBlocker);

    attemptNavigate('/items/123');

    expect(mockBlocker).toHaveBeenCalledWith('/items/123');
  });

  it('after calling unregister, attemptNavigate returns false', () => {
    const mockBlocker = jest.fn().mockReturnValue(true);
    unregister = registerBlocker(mockBlocker);

    unregister();
    unregister = null;

    const result = attemptNavigate('/some-url');

    expect(result).toBe(false);
  });

  it('registering a new blocker replaces the previous one', () => {
    const firstBlocker = jest.fn().mockReturnValue(true);
    const secondBlocker = jest.fn().mockReturnValue(false);

    const firstUnregister = registerBlocker(firstBlocker);
    unregister = registerBlocker(secondBlocker);

    const result = attemptNavigate('/some-url');

    expect(result).toBe(false);
    expect(firstBlocker).not.toHaveBeenCalled();
    expect(secondBlocker).toHaveBeenCalledTimes(1);

    // Clean up the first unregister reference (it's now a no-op since blocker was replaced,
    // but call it to demonstrate the pattern)
    firstUnregister();
  });
});
