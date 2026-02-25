import { loggerMiddleware } from './logger';

describe('loggerMiddleware', () => {
  const store = { getState: jest.fn(), dispatch: jest.fn() };
  const next = jest.fn((action) => action);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('passes action through to next in production', () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as Record<string, string>).NODE_ENV = 'production';

    const action = { type: 'test/action' };
    const result = loggerMiddleware(store)(next)(action);

    expect(next).toHaveBeenCalledWith(action);
    expect(result).toEqual(action);

    (process.env as Record<string, string>).NODE_ENV = originalEnv ?? 'test';
  });

  it('logs and passes action through in development', () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as Record<string, string>).NODE_ENV = 'development';

    const groupSpy = jest.spyOn(console, 'group').mockImplementation();
    const logSpy = jest.spyOn(console, 'log').mockImplementation();
    const groupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation();

    const action = { type: 'test/devAction' };
    loggerMiddleware(store)(next)(action);

    expect(groupSpy).toHaveBeenCalledWith('[Redux] test/devAction');
    expect(logSpy).toHaveBeenCalledWith('Action:', action);
    expect(next).toHaveBeenCalledWith(action);
    expect(groupEndSpy).toHaveBeenCalled();

    groupSpy.mockRestore();
    logSpy.mockRestore();
    groupEndSpy.mockRestore();
    (process.env as Record<string, string>).NODE_ENV = originalEnv ?? 'test';
  });
});
