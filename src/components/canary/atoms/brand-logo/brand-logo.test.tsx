import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { ArdaBrandLogo, ArdaBrandIcon } from './brand-logo';

describe('ArdaBrandLogo', () => {
  it('renders dark variant by default', () => {
    render(<ArdaBrandLogo />);
    const img = screen.getByAltText('Arda');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/images/brand/arda-logo-dark.svg');
  });

  it('renders light variant', () => {
    render(<ArdaBrandLogo variant="light" />);
    expect(screen.getByAltText('Arda')).toHaveAttribute('src', '/images/brand/arda-logo-light.svg');
  });

  it('renders mono variants', () => {
    const { rerender } = render(<ArdaBrandLogo variant="mono-dark" />);
    expect(screen.getByAltText('Arda')).toHaveAttribute(
      'src',
      '/images/brand/arda-logo-mono-dark.svg',
    );

    rerender(<ArdaBrandLogo variant="mono-light" />);
    expect(screen.getByAltText('Arda')).toHaveAttribute(
      'src',
      '/images/brand/arda-logo-mono-light.svg',
    );
  });

  it('applies className', () => {
    render(<ArdaBrandLogo className="test-logo" />);
    expect(screen.getByAltText('Arda')).toHaveClass('test-logo');
  });
});

describe('ArdaBrandIcon', () => {
  it('renders dark variant by default', () => {
    render(<ArdaBrandIcon />);
    const img = screen.getByAltText('Arda');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/images/brand/arda-logo-small-dark.svg');
  });

  it('renders light variant', () => {
    render(<ArdaBrandIcon variant="light" />);
    expect(screen.getByAltText('Arda')).toHaveAttribute(
      'src',
      '/images/brand/arda-logo-small-light.svg',
    );
  });

  it('applies className', () => {
    render(<ArdaBrandIcon className="test-icon" />);
    expect(screen.getByAltText('Arda')).toHaveClass('test-icon');
  });
});
