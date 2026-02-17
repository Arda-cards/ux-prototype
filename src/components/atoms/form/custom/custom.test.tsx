import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import type { AtomMode } from '@/lib/data-types/atom-types';
import { ArdaCustomFieldDisplay } from './custom-field-display';
import { ArdaCustomFieldEditor } from './custom-field-editor';
import { ArdaCustomFieldInteractive } from './custom-field-interactive';

// A simple render function for testing
const testRender = (
  value: unknown,
  mode: AtomMode,
  _onChange: (orig: unknown, cur: unknown) => void,
  errors?: string[],
) => (
  <div>
    <span data-testid="value">{String(value)}</span>
    <span data-testid="mode">{mode}</span>
    {errors &&
      errors.map((e, i) => (
        <span key={i} data-testid="error">
          {e}
        </span>
      ))}
  </div>
);

describe('ArdaCustomFieldDisplay', () => {
  it('calls render with display mode', () => {
    const renderFn = vi.fn(testRender);
    render(<ArdaCustomFieldDisplay value="hello" render={renderFn} />);
    expect(renderFn).toHaveBeenCalledWith('hello', 'display', expect.any(Function));
    expect(screen.getByTestId('value')).toHaveTextContent('hello');
    expect(screen.getByTestId('mode')).toHaveTextContent('display');
  });

  it('renders with label', () => {
    render(
      <ArdaCustomFieldDisplay
        value="hello"
        render={testRender}
        label="Field"
        labelPosition="left"
      />,
    );
    expect(screen.getByText('Field')).toBeInTheDocument();
    expect(screen.getByTestId('value')).toHaveTextContent('hello');
  });

  it('renders with label on top', () => {
    render(
      <ArdaCustomFieldDisplay
        value="hello"
        render={testRender}
        label="Field"
        labelPosition="top"
      />,
    );
    const label = screen.getByText('Field');
    expect(label.closest('div')).toHaveClass('flex-col');
  });
});

describe('ArdaCustomFieldEditor', () => {
  it('calls render with edit mode by default', () => {
    const renderFn = vi.fn(testRender);
    render(<ArdaCustomFieldEditor value="hello" render={renderFn} />);
    expect(renderFn).toHaveBeenCalledWith('hello', 'edit', expect.any(Function), undefined);
    expect(screen.getByTestId('mode')).toHaveTextContent('edit');
  });

  it('calls render with error mode and errors when showErrors is true', () => {
    const renderFn = vi.fn(testRender);
    render(
      <ArdaCustomFieldEditor
        value="hello"
        render={renderFn}
        showErrors
        errors={['Required', 'Too short']}
      />,
    );
    expect(renderFn).toHaveBeenCalledWith('hello', 'error', expect.any(Function), [
      'Required',
      'Too short',
    ]);
    expect(screen.getAllByTestId('error')).toHaveLength(2);
  });

  it('does not pass errors when showErrors is false', () => {
    const renderFn = vi.fn(testRender);
    render(<ArdaCustomFieldEditor value="hello" render={renderFn} errors={['Required']} />);
    expect(renderFn).toHaveBeenCalledWith('hello', 'edit', expect.any(Function), undefined);
  });

  it('renders with label', () => {
    render(<ArdaCustomFieldEditor value="hello" render={testRender} label="Field" />);
    expect(screen.getByText('Field')).toBeInTheDocument();
  });
});

describe('ArdaCustomFieldInteractive', () => {
  const noop = vi.fn();

  it('renders display mode', () => {
    const renderFn = vi.fn(testRender);
    render(
      <ArdaCustomFieldInteractive value="hello" mode="display" onChange={noop} render={renderFn} />,
    );
    expect(renderFn).toHaveBeenCalledWith('hello', 'display', expect.any(Function));
    expect(screen.getByTestId('mode')).toHaveTextContent('display');
  });

  it('renders edit mode', () => {
    const renderFn = vi.fn(testRender);
    render(
      <ArdaCustomFieldInteractive value="hello" mode="edit" onChange={noop} render={renderFn} />,
    );
    expect(renderFn).toHaveBeenCalledWith('hello', 'edit', expect.any(Function), undefined);
    expect(screen.getByTestId('mode')).toHaveTextContent('edit');
  });

  it('renders error mode with errors', () => {
    const renderFn = vi.fn(testRender);
    render(
      <ArdaCustomFieldInteractive
        value="hello"
        mode="error"
        onChange={noop}
        render={renderFn}
        errors={['Required field']}
      />,
    );
    expect(renderFn).toHaveBeenCalledWith('hello', 'error', expect.any(Function), [
      'Required field',
    ]);
    expect(screen.getByTestId('error')).toHaveTextContent('Required field');
  });

  it('forces display mode when editable is false', () => {
    const renderFn = vi.fn(testRender);
    render(
      <ArdaCustomFieldInteractive
        value="hello"
        mode="edit"
        onChange={noop}
        editable={false}
        render={renderFn}
      />,
    );
    expect(renderFn).toHaveBeenCalledWith('hello', 'display', expect.any(Function));
    expect(screen.getByTestId('mode')).toHaveTextContent('display');
  });

  it('forces display mode when editable is false even in error mode', () => {
    const renderFn = vi.fn(testRender);
    render(
      <ArdaCustomFieldInteractive
        value="hello"
        mode="error"
        onChange={noop}
        editable={false}
        render={renderFn}
        errors={['Required']}
      />,
    );
    expect(renderFn).toHaveBeenCalledWith('hello', 'display', expect.any(Function));
    expect(screen.getByTestId('mode')).toHaveTextContent('display');
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
  });

  it('passes onChange to render function', () => {
    const onChange = vi.fn();
    let capturedOnChange: ((orig: unknown, cur: unknown) => void) | undefined;
    const renderFn = vi.fn(
      (_v: unknown, _m: AtomMode, onCh: (orig: unknown, cur: unknown) => void) => {
        capturedOnChange = onCh;
        return <span>custom</span>;
      },
    );

    render(
      <ArdaCustomFieldInteractive
        value="hello"
        mode="edit"
        onChange={onChange}
        render={renderFn}
      />,
    );

    capturedOnChange?.('hello', 'world');
    expect(onChange).toHaveBeenCalledWith('hello', 'world');
  });

  it('renders with label', () => {
    render(
      <ArdaCustomFieldInteractive
        value="hello"
        mode="display"
        onChange={noop}
        render={testRender}
        label="Custom"
      />,
    );
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });
});
