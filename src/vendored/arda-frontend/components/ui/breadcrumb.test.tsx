import { render, screen } from '@testing-library/react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from './breadcrumb';

describe('Breadcrumb', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Breadcrumb as a nav element with aria-label', () => {
    render(<Breadcrumb />);
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
  });

  it('Breadcrumb has data-slot="breadcrumb"', () => {
    const { container } = render(<Breadcrumb />);
    expect(container.querySelector('[data-slot="breadcrumb"]')).toBeInTheDocument();
  });

  it('renders BreadcrumbList as an ol', () => {
    const { container } = render(<BreadcrumbList />);
    expect(container.querySelector('ol[data-slot="breadcrumb-list"]')).toBeInTheDocument();
  });

  it('BreadcrumbList merges className', () => {
    const { container } = render(<BreadcrumbList className="custom-list" />);
    expect(container.querySelector('[data-slot="breadcrumb-list"]')).toHaveClass('custom-list');
  });

  it('renders BreadcrumbItem as an li', () => {
    const { container } = render(<BreadcrumbItem>Item</BreadcrumbItem>);
    const el = container.querySelector('li[data-slot="breadcrumb-item"]');
    expect(el).toBeInTheDocument();
  });

  it('BreadcrumbItem merges className', () => {
    const { container } = render(<BreadcrumbItem className="item-class" />);
    expect(container.querySelector('[data-slot="breadcrumb-item"]')).toHaveClass('item-class');
  });

  it('renders BreadcrumbLink as an anchor', () => {
    render(<BreadcrumbLink href="/home">Home</BreadcrumbLink>);
    const link = screen.getByRole('link', { name: 'Home' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/home');
  });

  it('BreadcrumbLink with asChild uses Slot', () => {
    render(
      <BreadcrumbLink asChild>
        <button>Home Button</button>
      </BreadcrumbLink>
    );
    expect(screen.getByRole('button', { name: 'Home Button' })).toBeInTheDocument();
  });

  it('BreadcrumbLink without asChild uses anchor', () => {
    render(<BreadcrumbLink href="/test">Link</BreadcrumbLink>);
    const el = screen.getByRole('link', { name: 'Link' });
    expect(el.tagName.toLowerCase()).toBe('a');
  });

  it('BreadcrumbLink merges className', () => {
    render(<BreadcrumbLink className="link-class" href="#">Link</BreadcrumbLink>);
    const el = screen.getByRole('link', { name: 'Link' });
    expect(el).toHaveClass('link-class');
  });

  it('renders BreadcrumbPage as a span with correct aria attributes', () => {
    render(<BreadcrumbPage>Current Page</BreadcrumbPage>);
    const el = screen.getByText('Current Page');
    expect(el.tagName.toLowerCase()).toBe('span');
    expect(el).toHaveAttribute('aria-current', 'page');
    expect(el).toHaveAttribute('aria-disabled', 'true');
  });

  it('BreadcrumbPage has data-slot="breadcrumb-page"', () => {
    const { container } = render(<BreadcrumbPage />);
    expect(container.querySelector('[data-slot="breadcrumb-page"]')).toBeInTheDocument();
  });

  it('BreadcrumbPage merges className', () => {
    const { container } = render(<BreadcrumbPage className="page-class" />);
    expect(container.querySelector('[data-slot="breadcrumb-page"]')).toHaveClass('page-class');
  });

  it('renders BreadcrumbSeparator with default chevron icon', () => {
    const { container } = render(<BreadcrumbSeparator />);
    const el = container.querySelector('[data-slot="breadcrumb-separator"]');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('aria-hidden', 'true');
    // Default renders an SVG icon (ChevronRight)
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('BreadcrumbSeparator with custom children renders them', () => {
    render(<BreadcrumbSeparator>/</BreadcrumbSeparator>);
    expect(screen.getByText('/')).toBeInTheDocument();
  });

  it('BreadcrumbSeparator has role="presentation"', () => {
    const { container } = render(<BreadcrumbSeparator />);
    expect(container.querySelector('[role="presentation"]')).toBeInTheDocument();
  });

  it('BreadcrumbSeparator merges className', () => {
    const { container } = render(<BreadcrumbSeparator className="sep-class" />);
    expect(container.querySelector('[data-slot="breadcrumb-separator"]')).toHaveClass('sep-class');
  });

  it('renders BreadcrumbEllipsis with MoreHorizontal icon and sr-only text', () => {
    const { container } = render(<BreadcrumbEllipsis />);
    const el = container.querySelector('[data-slot="breadcrumb-ellipsis"]');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('More')).toBeInTheDocument();
    expect(screen.getByText('More')).toHaveClass('sr-only');
  });

  it('BreadcrumbEllipsis has role="presentation"', () => {
    const { container } = render(<BreadcrumbEllipsis />);
    expect(container.querySelector('[role="presentation"]')).toBeInTheDocument();
  });

  it('BreadcrumbEllipsis merges className', () => {
    const { container } = render(<BreadcrumbEllipsis className="ellipsis-class" />);
    expect(container.querySelector('[data-slot="breadcrumb-ellipsis"]')).toHaveClass('ellipsis-class');
  });

  it('renders a complete breadcrumb navigation', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/products">Products</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Current</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('renders breadcrumb with ellipsis for collapsed items', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Current</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
    expect(screen.getByText('More')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
  });
});
