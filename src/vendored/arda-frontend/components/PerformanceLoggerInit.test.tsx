import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@/utils/performanceLogger', () => ({
  perfLogger: { enable: jest.fn(), disable: jest.fn() },
}));

import { PerformanceLoggerInit } from './PerformanceLoggerInit';
import { perfLogger } from '@frontend/utils/performanceLogger';

describe('PerformanceLoggerInit', () => {
  let originalEnv: string | undefined;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    // Clean up window.perfLogger between tests
    delete (window as unknown as Record<string, unknown>).perfLogger;
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    // restore NODE_ENV
    Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv, configurable: true });
  });

  it('renders nothing (returns null)', () => {
    const { container } = render(<PerformanceLoggerInit />);
    expect(container).toBeEmptyDOMElement();
  });

  it('assigns perfLogger to window', () => {
    render(<PerformanceLoggerInit />);
    expect((window as unknown as Record<string, unknown>).perfLogger).toBe(perfLogger);
  });

  it('logs in development mode', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', configurable: true });
    render(<PerformanceLoggerInit />);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Performance Logger initialized')
    );
  });

  it('does not log in test mode', () => {
    // NODE_ENV is 'test' by default in Jest
    render(<PerformanceLoggerInit />);
    expect(consoleSpy).not.toHaveBeenCalled();
  });
});
