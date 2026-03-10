import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { ArdaReadOnlyField } from './read-only-field';

describe('ArdaReadOnlyField', () => {
  it('renders label and value', () => {
    render(<ArdaReadOnlyField label="SKU" value="ABC-123" />);
    expect(screen.getByText('SKU')).toBeInTheDocument();
    expect(screen.getByText('ABC-123')).toBeInTheDocument();
  });

  it('renders the em-dash fallback when value is undefined', () => {
    render(<ArdaReadOnlyField label="Code" />);
    expect(screen.getByText('Code')).toBeInTheDocument();
    expect(screen.getByText('\u2014')).toBeInTheDocument();
  });

  it('renders the em-dash fallback when value is an empty string', () => {
    render(<ArdaReadOnlyField label="Code" value="" />);
    expect(screen.getByText('\u2014')).toBeInTheDocument();
  });

  it('renders custom fallback text', () => {
    render(<ArdaReadOnlyField label="Link" fallback="No link available" />);
    expect(screen.getByText('No link available')).toBeInTheDocument();
  });

  it('renders children instead of value and fallback', () => {
    render(
      <ArdaReadOnlyField label="Custom">
        <a href="https://example.com">Click here</a>
      </ArdaReadOnlyField>,
    );
    expect(screen.getByText('Click here')).toBeInTheDocument();
    expect(screen.queryByText('\u2014')).not.toBeInTheDocument();
  });

  it('renders children even when value is also provided', () => {
    render(
      <ArdaReadOnlyField label="Custom" value="ignored value">
        <span>custom content</span>
      </ArdaReadOnlyField>,
    );
    expect(screen.getByText('custom content')).toBeInTheDocument();
    expect(screen.queryByText('ignored value')).not.toBeInTheDocument();
  });

  it('applies className prop to the root element', () => {
    const { container } = render(
      <ArdaReadOnlyField label="Test" value="Val" className="my-custom-class" />,
    );
    expect(container.firstChild).toHaveClass('my-custom-class');
  });

  it('applies compact variant class', () => {
    const { container } = render(<ArdaReadOnlyField label="Test" value="Val" variant="compact" />);
    expect(container.firstChild).toHaveClass('gap-px');
  });

  it('applies default variant (no extra gap class)', () => {
    const { container } = render(<ArdaReadOnlyField label="Test" value="Val" variant="default" />);
    expect(container.firstChild).toHaveClass('flex', 'flex-col', 'gap-0.5');
  });

  it('passes through HTML attributes to the root div', () => {
    render(<ArdaReadOnlyField label="Test" value="Val" data-testid="read-only-field" />);
    expect(screen.getByTestId('read-only-field')).toBeInTheDocument();
  });

  it('label uses muted-foreground token class', () => {
    render(<ArdaReadOnlyField label="My Label" value="Val" />);
    const label = screen.getByText('My Label');
    expect(label.className).toContain('text-muted-foreground');
  });

  it('value uses foreground token class', () => {
    render(<ArdaReadOnlyField label="My Label" value="My Value" />);
    const value = screen.getByText('My Value');
    expect(value).toHaveClass('text-foreground');
  });
});
