import React from 'react';
import { render } from '@testing-library/react';
import {
  WaitingToBeReceivedIcon,
  ReceivedIcon,
  RecentlyFulfilledIcon,
} from './TabIcons';

describe('WaitingToBeReceivedIcon', () => {
  it('renders an SVG element', () => {
    const { container } = render(<WaitingToBeReceivedIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('uses default width=42 and height=42', () => {
    const { container } = render(<WaitingToBeReceivedIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '42');
    expect(svg).toHaveAttribute('height', '42');
  });

  it('accepts custom width and height', () => {
    const { container } = render(
      <WaitingToBeReceivedIcon width={24} height={24} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });

  it('has correct viewBox', () => {
    const { container } = render(<WaitingToBeReceivedIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 42 42');
  });
});

describe('ReceivedIcon', () => {
  it('renders an SVG element', () => {
    const { container } = render(<ReceivedIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('uses default width=42 and height=42', () => {
    const { container } = render(<ReceivedIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '42');
    expect(svg).toHaveAttribute('height', '42');
  });

  it('accepts custom width and height', () => {
    const { container } = render(<ReceivedIcon width={16} height={16} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '16');
    expect(svg).toHaveAttribute('height', '16');
  });

  it('has correct viewBox', () => {
    const { container } = render(<ReceivedIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 42 42');
  });
});

describe('RecentlyFulfilledIcon', () => {
  it('renders an SVG element', () => {
    const { container } = render(<RecentlyFulfilledIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('uses default width=42 and height=42', () => {
    const { container } = render(<RecentlyFulfilledIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '42');
    expect(svg).toHaveAttribute('height', '42');
  });

  it('accepts custom width and height', () => {
    const { container } = render(
      <RecentlyFulfilledIcon width={32} height={32} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
  });

  it('has correct viewBox', () => {
    const { container } = render(<RecentlyFulfilledIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 42 42');
  });
});
