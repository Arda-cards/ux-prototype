import React from 'react';
import { render, screen } from '@testing-library/react';
import { Loader } from '@frontend/components/ui/loader';

describe('Loader Component', () => {
  it('renders properly', () => {
    render(<Loader />);

    const loader = screen.getByRole('status');
    expect(loader).toBeInTheDocument();
    expect(loader).toHaveClass('loader');
  });

  it('has correct accessibility attributes', () => {
    render(<Loader />);

    const loader = screen.getByRole('status');
    expect(loader).toHaveAttribute('aria-label', 'Loading...');
  });

  it('accepts custom aria-label', () => {
    render(<Loader aria-label="Custom loading message" />);

    const loader = screen.getByRole('status');
    expect(loader).toHaveAttribute('aria-label', 'Custom loading message');
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<Loader size="sm" />);
    expect(screen.getByRole('status')).toHaveClass('loader-sm');

    rerender(<Loader size="default" />);
    expect(screen.getByRole('status')).toHaveClass('loader-default');

    rerender(<Loader size="lg" />);
    expect(screen.getByRole('status')).toHaveClass('loader-lg');
  });

  it('accepts custom className', () => {
    render(<Loader className="custom-class" />);

    const loader = screen.getByRole('status');
    expect(loader).toHaveClass('custom-class');
  });

  it('renders with default props', () => {
    render(<Loader />);

    const loader = screen.getByRole('status');
    expect(loader).toBeInTheDocument();
    expect(loader).toHaveClass('loader', 'loader-default');
  });
});

// Snapshot test for visual regression
describe('Loader Snapshot', () => {
  it('matches snapshot for default loader', () => {
    const { container } = render(<Loader />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for small loader', () => {
    const { container } = render(<Loader size="sm" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for large loader', () => {
    const { container } = render(<Loader size="lg" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(<Loader className="test-class" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
