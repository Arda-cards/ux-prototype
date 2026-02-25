import { render } from '@testing-library/react';
import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument();
  });

  it('has default classes', () => {
    const { container } = render(<Skeleton />);
    const el = container.querySelector('[data-slot="skeleton"]')!;
    expect(el).toHaveClass('animate-pulse');
    expect(el).toHaveClass('rounded-md');
  });

  it('merges custom className', () => {
    const { container } = render(<Skeleton className="w-32 h-4" />);
    const el = container.querySelector('[data-slot="skeleton"]')!;
    expect(el).toHaveClass('w-32');
    expect(el).toHaveClass('h-4');
    expect(el).toHaveClass('animate-pulse');
  });

  it('forwards additional props', () => {
    const { container } = render(<Skeleton data-testid="skel" aria-label="loading" />);
    const el = container.querySelector('[data-testid="skel"]');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('aria-label', 'loading');
  });

  it('renders children when provided', () => {
    const { getByText } = render(<Skeleton>Loading...</Skeleton>);
    expect(getByText('Loading...')).toBeInTheDocument();
  });

  it('renders multiple skeletons with different sizes', () => {
    const { container } = render(
      <div>
        <Skeleton className="w-full h-4" data-testid="skel-1" />
        <Skeleton className="w-1/2 h-4" data-testid="skel-2" />
        <Skeleton className="w-1/4 h-4" data-testid="skel-3" />
      </div>
    );
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons).toHaveLength(3);
  });

  it('renders as a div element', () => {
    const { container } = render(<Skeleton />);
    const el = container.querySelector('[data-slot="skeleton"]');
    expect(el?.tagName.toLowerCase()).toBe('div');
  });
});
