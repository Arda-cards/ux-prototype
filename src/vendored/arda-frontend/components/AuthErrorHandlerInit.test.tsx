import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockInitAuthErrorHandler = jest.fn();
const mockHandleAuthError = jest.fn();

jest.mock('@/lib/authErrorHandler', () => ({
  initAuthErrorHandler: (...args: unknown[]) => mockInitAuthErrorHandler(...args),
  handleAuthError: (...args: unknown[]) => mockHandleAuthError(...args),
}));

const mockIsAuthenticationError = jest.fn();
jest.mock('@/lib/utils', () => ({
  isAuthenticationError: (...args: unknown[]) => mockIsAuthenticationError(...args),
}));

jest.mock('@/hooks/useActivityTracking', () => ({
  useActivityTracking: jest.fn(),
}));

import { AuthErrorHandlerInit } from './AuthErrorHandlerInit';

beforeEach(() => {
  jest.clearAllMocks();
  mockIsAuthenticationError.mockReturnValue(false);
  mockHandleAuthError.mockReturnValue(false);
});

describe('AuthErrorHandlerInit', () => {
  it('renders nothing', () => {
    const { container } = render(<AuthErrorHandlerInit />);
    expect(container).toBeEmptyDOMElement();
  });

  it('calls initAuthErrorHandler on mount', () => {
    render(<AuthErrorHandlerInit />);
    expect(mockInitAuthErrorHandler).toHaveBeenCalledWith(expect.any(Function));
  });

  it('initAuthErrorHandler callback calls router.push', () => {
    render(<AuthErrorHandlerInit />);
    const redirectFn = mockInitAuthErrorHandler.mock.calls[0][0];
    redirectFn('/signin');
    expect(mockPush).toHaveBeenCalledWith('/signin');
  });

  it('handles unhandled error events that are auth errors', () => {
    mockIsAuthenticationError.mockReturnValue(true);
    render(<AuthErrorHandlerInit />);

    const errorEvent = new ErrorEvent('error', {
      error: new Error('Unauthorized'),
      message: 'Unauthorized',
    });
    Object.defineProperty(errorEvent, 'preventDefault', { value: jest.fn() });

    window.dispatchEvent(errorEvent);

    expect(mockIsAuthenticationError).toHaveBeenCalled();
    expect(mockHandleAuthError).toHaveBeenCalled();
  });

  it('does not call handleAuthError for non-auth errors', () => {
    mockIsAuthenticationError.mockReturnValue(false);
    render(<AuthErrorHandlerInit />);

    const errorEvent = new ErrorEvent('error', {
      error: new Error('Generic error'),
    });
    window.dispatchEvent(errorEvent);

    expect(mockHandleAuthError).not.toHaveBeenCalled();
  });

  it('handles unhandled promise rejections that are auth errors', () => {
    mockIsAuthenticationError.mockReturnValue(true);
    render(<AuthErrorHandlerInit />);

    // jsdom doesn't have PromiseRejectionEvent, use a custom event with reason
    const rejectionEvent = Object.assign(new Event('unhandledrejection'), {
      reason: new Error('Unauthorized'),
      preventDefault: jest.fn(),
    });
    window.dispatchEvent(rejectionEvent);

    expect(mockHandleAuthError).toHaveBeenCalled();
  });

  it('does not call handleAuthError for non-auth promise rejections', () => {
    mockIsAuthenticationError.mockReturnValue(false);
    render(<AuthErrorHandlerInit />);

    const rejectionEvent = Object.assign(new Event('unhandledrejection'), {
      reason: new Error('other'),
      preventDefault: jest.fn(),
    });
    window.dispatchEvent(rejectionEvent);

    expect(mockHandleAuthError).not.toHaveBeenCalled();
  });

  it('removes event listeners on unmount', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');
    const removeSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = render(<AuthErrorHandlerInit />);
    unmount();

    expect(removeSpy).toHaveBeenCalledWith('error', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('handles error event with message string instead of error object', () => {
    mockIsAuthenticationError.mockReturnValue(true);
    render(<AuthErrorHandlerInit />);

    const errorEvent = new ErrorEvent('error', { message: 'Unauthorized message' });
    window.dispatchEvent(errorEvent);

    // Should check the message when error is null
    expect(mockIsAuthenticationError).toHaveBeenCalled();
  });
});
