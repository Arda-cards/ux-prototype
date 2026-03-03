import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ArdaDetailField } from './detail-field';

describe('ArdaDetailField', () => {
  it('renders label and value', () => {
    render(<ArdaDetailField label="SKU" value="ABC-123" />);
    expect(screen.getByText('SKU')).toBeInTheDocument();
    expect(screen.getByText('ABC-123')).toBeInTheDocument();
  });

  it('renders the em-dash fallback when value is undefined', () => {
    render(<ArdaDetailField label="Code" />);
    expect(screen.getByText('Code')).toBeInTheDocument();
    expect(screen.getByText('\u2014')).toBeInTheDocument();
  });

  it('renders the em-dash fallback when value is an empty string', () => {
    render(<ArdaDetailField label="Code" value="" />);
    expect(screen.getByText('\u2014')).toBeInTheDocument();
  });

  it('renders custom fallback text', () => {
    render(<ArdaDetailField label="Link" fallback="No link available" />);
    expect(screen.getByText('No link available')).toBeInTheDocument();
  });

  it('renders children instead of value and fallback', () => {
    render(
      <ArdaDetailField label="Custom">
        <a href="https://example.com">Click here</a>
      </ArdaDetailField>,
    );
    expect(screen.getByText('Click here')).toBeInTheDocument();
    // The value slot should show the child link, not the fallback
    expect(screen.queryByText('\u2014')).not.toBeInTheDocument();
  });

  it('renders children even when value is also provided', () => {
    render(
      <ArdaDetailField label="Custom" value="ignored value">
        <span>custom content</span>
      </ArdaDetailField>,
    );
    expect(screen.getByText('custom content')).toBeInTheDocument();
    expect(screen.queryByText('ignored value')).not.toBeInTheDocument();
  });

  it('applies className prop to the root element', () => {
    const { container } = render(
      <ArdaDetailField label="Test" value="Val" className="my-custom-class" />,
    );
    expect(container.firstChild).toHaveClass('my-custom-class');
  });

  it('applies compact variant class', () => {
    const { container } = render(<ArdaDetailField label="Test" value="Val" variant="compact" />);
    expect(container.firstChild).toHaveClass('gap-0.5');
  });

  it('applies default variant (no extra gap class)', () => {
    const { container } = render(<ArdaDetailField label="Test" value="Val" variant="default" />);
    // base class always present
    expect(container.firstChild).toHaveClass('flex', 'flex-col', 'gap-1');
  });

  it('passes through HTML attributes to the root div', () => {
    render(<ArdaDetailField label="Test" value="Val" data-testid="detail-field" />);
    expect(screen.getByTestId('detail-field')).toBeInTheDocument();
  });

  it('label uses muted-foreground token class', () => {
    render(<ArdaDetailField label="My Label" value="Val" />);
    const label = screen.getByText('My Label');
    expect(label).toHaveClass('text-muted-foreground');
  });

  it('value uses foreground token class', () => {
    render(<ArdaDetailField label="My Label" value="My Value" />);
    const value = screen.getByText('My Value');
    expect(value).toHaveClass('text-foreground');
  });
});
