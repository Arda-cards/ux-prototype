import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TooltipProvider } from '@/components/canary/primitives/tooltip';
import { Button } from './button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Save</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled and shows spinner when loading', () => {
    render(<Button loading>Saving…</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    // Spinner SVG should be present
    const svg = button.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies variant classes', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-destructive');
  });

  it('applies size classes', () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('h-8');
  });

  it('merges custom className', () => {
    render(<Button className="mt-4">Save</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('mt-4');
  });

  // --- Loading enhancements ---

  it('shows custom loading text when loading is a string', () => {
    render(
      <Button loading="Downloading…">
        <span data-testid="original-label">Download</span>
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Downloading…');
    // Original children should be replaced by loading text
    expect(screen.queryByTestId('original-label')).not.toBeInTheDocument();
  });

  it('places spinner after text when loadingPosition is end', () => {
    render(
      <Button loading loadingPosition="end">
        Saving…
      </Button>,
    );
    const button = screen.getByRole('button');
    const svg = button.querySelector('svg');
    expect(svg).toBeTruthy();
    // SVG should come after the text node
    const children = Array.from(button.childNodes);
    const svgIndex = children.findIndex((node) => node === svg?.parentElement || node === svg);
    const textIndex = children.findIndex(
      (node) => node.textContent?.includes('Saving') && node !== svg?.parentElement,
    );
    expect(svgIndex).toBeGreaterThan(textIndex);
  });

  it('replaces children with spinner for icon sizes when loading', () => {
    render(
      <Button size="icon" loading aria-label="Loading">
        <span data-testid="icon-child">X</span>
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeTruthy();
    expect(screen.queryByTestId('icon-child')).not.toBeInTheDocument();
  });

  // --- Tooltip ---

  it('renders tooltip wrapper when tooltip prop is set', () => {
    render(
      <TooltipProvider>
        <Button tooltip="Save changes">Save</Button>
      </TooltipProvider>,
    );
    // Button should still be accessible
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
  });

  it('does not render tooltip wrapper when tooltip prop is absent', () => {
    const { container } = render(<Button>Save</Button>);
    // No tooltip trigger wrapper
    expect(container.querySelector('[data-slot="tooltip-trigger"]')).toBeNull();
  });

  it('wraps disabled button in span for tooltip pointer events', () => {
    render(
      <TooltipProvider>
        <Button tooltip="Not available yet" disabled>
          Order
        </Button>
      </TooltipProvider>,
    );
    const button = screen.getByRole('button', { name: 'Order' });
    // The button's parent should be a span (pointer-event absorber)
    expect(button.parentElement?.tagName).toBe('SPAN');
    expect(button.parentElement?.getAttribute('tabindex')).toBe('0');
  });
});
