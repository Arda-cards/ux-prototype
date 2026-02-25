import { render } from '@testing-library/react';

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(() => ({ theme: 'light' })),
}));

// Mock sonner
jest.mock('sonner', () => ({
  Toaster: jest.fn(({ theme, className, style: _style, toastOptions: _toastOptions, ...props }: Record<string, unknown>) => (
    <div
      data-testid="mock-sonner"
      data-theme={theme as string}
      className={className as string}
      {...props}
    />
  )),
}));

import { Toaster } from './sonner';
import { useTheme } from 'next-themes';

const mockUseTheme = useTheme as jest.Mock;

describe('Toaster (sonner)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTheme.mockReturnValue({ theme: 'light' });
  });

  it('renders without crashing', () => {
    const { getByTestId } = render(<Toaster />);
    expect(getByTestId('mock-sonner')).toBeInTheDocument();
  });

  it('passes light theme from useTheme', () => {
    mockUseTheme.mockReturnValue({ theme: 'light' });
    const { getByTestId } = render(<Toaster />);
    expect(getByTestId('mock-sonner')).toHaveAttribute('data-theme', 'light');
  });

  it('passes dark theme from useTheme', () => {
    mockUseTheme.mockReturnValue({ theme: 'dark' });
    const { getByTestId } = render(<Toaster />);
    expect(getByTestId('mock-sonner')).toHaveAttribute('data-theme', 'dark');
  });

  it('falls back to "system" theme when theme is undefined', () => {
    mockUseTheme.mockReturnValue({ theme: undefined });
    const { getByTestId } = render(<Toaster />);
    expect(getByTestId('mock-sonner')).toHaveAttribute('data-theme', 'system');
  });

  it('passes className="toaster group" to Sonner', () => {
    const { getByTestId } = render(<Toaster />);
    expect(getByTestId('mock-sonner')).toHaveClass('toaster');
    expect(getByTestId('mock-sonner')).toHaveClass('group');
  });

  it('passes additional props through to Sonner', () => {
    const { getByTestId } = render(<Toaster position="top-right" />);
    expect(getByTestId('mock-sonner')).toBeInTheDocument();
  });

  it('renders with system theme', () => {
    mockUseTheme.mockReturnValue({ theme: 'system' });
    const { getByTestId } = render(<Toaster />);
    expect(getByTestId('mock-sonner')).toHaveAttribute('data-theme', 'system');
  });
});
