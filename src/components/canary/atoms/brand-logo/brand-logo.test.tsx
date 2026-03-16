import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { BrandLogo, BrandIcon } from './brand-logo';

describe('BrandLogo', () => {
  it('renders default variant by default', () => {
    render(<BrandLogo />);
    const img = screen.getByAltText('Arda');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/canary/images/arda-logo-default.svg');
  });

  it('renders inverted variant', () => {
    render(<BrandLogo variant="inverted" />);
    expect(screen.getByAltText('Arda')).toHaveAttribute(
      'src',
      '/canary/images/arda-logo-inverted.svg',
    );
  });

  it('renders mono variants', () => {
    const { rerender } = render(<BrandLogo variant="mono" />);
    expect(screen.getByAltText('Arda')).toHaveAttribute('src', '/canary/images/arda-logo-mono.svg');

    rerender(<BrandLogo variant="mono-inverted" />);
    expect(screen.getByAltText('Arda')).toHaveAttribute(
      'src',
      '/canary/images/arda-logo-mono-inverted.svg',
    );
  });

  it('applies className', () => {
    render(<BrandLogo className="test-logo" />);
    expect(screen.getByAltText('Arda')).toHaveClass('test-logo');
  });
});

describe('BrandIcon', () => {
  it('renders default variant by default', () => {
    render(<BrandIcon />);
    const img = screen.getByAltText('Arda');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/canary/images/arda-logo-small-default.svg');
  });

  it('renders inverted variant', () => {
    render(<BrandIcon variant="inverted" />);
    expect(screen.getByAltText('Arda')).toHaveAttribute(
      'src',
      '/canary/images/arda-logo-small-inverted.svg',
    );
  });

  it('applies className', () => {
    render(<BrandIcon className="test-icon" />);
    expect(screen.getByAltText('Arda')).toHaveClass('test-icon');
  });
});
