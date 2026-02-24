import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

import { AppearanceSection } from './AppearanceSection';

describe('AppearanceSection', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NEXT_PUBLIC_DEPLOY_ENV;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_DEPLOY_ENV = originalEnv;
  });

  describe('production environment', () => {
    it('returns null in production', () => {
      process.env.NEXT_PUBLIC_DEPLOY_ENV = 'PRODUCTION';
      const { container } = render(<AppearanceSection />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('non-production environment', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_DEPLOY_ENV = 'STAGING';
    });

    it('renders appearance heading', () => {
      render(<AppearanceSection />);
      expect(screen.getByText('Appearance')).toBeInTheDocument();
    });

    it('renders font selector', () => {
      render(<AppearanceSection />);
      expect(screen.getByText('Inter')).toBeInTheDocument();
    });

    it('renders all three theme options', () => {
      render(<AppearanceSection />);
      expect(screen.getByAltText('Light theme')).toBeInTheDocument();
      expect(screen.getByAltText('Dark theme')).toBeInTheDocument();
      expect(screen.getByAltText('System theme')).toBeInTheDocument();
    });

    it('defaults to light theme selected (ring class)', () => {
      render(<AppearanceSection />);
      const lightThemeContainer = screen.getByAltText('Light theme').parentElement;
      expect(lightThemeContainer).toHaveClass('ring-2');
    });

    it('switches to dark theme on click', () => {
      render(<AppearanceSection />);
      const darkThemeContainer = screen.getByAltText('Dark theme').parentElement!;
      fireEvent.click(darkThemeContainer);
      expect(darkThemeContainer).toHaveClass('ring-2');
      // light should no longer have ring
      const lightThemeContainer = screen.getByAltText('Light theme').parentElement;
      expect(lightThemeContainer).not.toHaveClass('ring-2');
    });

    it('switches to system theme on click', () => {
      render(<AppearanceSection />);
      const systemThemeContainer = screen.getByAltText('System theme').parentElement!;
      fireEvent.click(systemThemeContainer);
      expect(systemThemeContainer).toHaveClass('ring-2');
    });

    it('renders update appearance button', () => {
      render(<AppearanceSection />);
      expect(screen.getByRole('button', { name: /update appearance/i })).toBeInTheDocument();
    });
  });
});
