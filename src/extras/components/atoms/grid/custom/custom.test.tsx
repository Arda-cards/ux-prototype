import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import React from 'react';

import type { AtomMode } from '@/lib/data-types/atom-types';
import { ArdaCustomCellDisplay } from './custom-cell-display';
import { ArdaCustomCellEditor, type CustomCellEditorHandle } from './custom-cell-editor';
import { ArdaCustomCellInteractive } from './custom-cell-interactive';

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

describe('ArdaCustomCellDisplay', () => {
  it('renders via render prop in display mode', () => {
    const renderFn = vi.fn(testRender);
    render(<ArdaCustomCellDisplay value="hello" render={renderFn} />);
    expect(renderFn).toHaveBeenCalledWith('hello', 'display', expect.any(Function));
    expect(screen.getByTestId('value')).toHaveTextContent('hello');
    expect(screen.getByTestId('mode')).toHaveTextContent('display');
  });
});

describe('ArdaCustomCellEditor', () => {
  it('renders via render prop in edit mode', () => {
    const renderFn = vi.fn(testRender);
    render(<ArdaCustomCellEditor value="hello" render={renderFn} />);
    expect(renderFn).toHaveBeenCalledWith('hello', 'edit', expect.any(Function));
    expect(screen.getByTestId('mode')).toHaveTextContent('edit');
  });

  it('exposes getValue via ref', () => {
    const ref = React.createRef<CustomCellEditorHandle>();
    render(<ArdaCustomCellEditor ref={ref} value="initial" render={testRender} />);
    expect(ref.current?.getValue()).toBe('initial');
  });
});

describe('ArdaCustomCellInteractive', () => {
  it('renders display when mode is display', () => {
    const renderFn = vi.fn(testRender);
    render(
      <ArdaCustomCellInteractive
        value="hello"
        mode="display"
        onChange={() => {}}
        render={renderFn}
      />,
    );
    expect(renderFn).toHaveBeenCalledWith('hello', 'display', expect.any(Function));
    expect(screen.getByTestId('mode')).toHaveTextContent('display');
  });

  it('renders edit when mode is edit', () => {
    const renderFn = vi.fn(testRender);
    render(
      <ArdaCustomCellInteractive value="hello" mode="edit" onChange={() => {}} render={renderFn} />,
    );
    expect(renderFn).toHaveBeenCalledWith('hello', 'edit', expect.any(Function), undefined);
    expect(screen.getByTestId('mode')).toHaveTextContent('edit');
  });

  it('renders error mode with errors', () => {
    const renderFn = vi.fn(testRender);
    render(
      <ArdaCustomCellInteractive
        value="hello"
        mode="error"
        errors={['Required field']}
        onChange={() => {}}
        render={renderFn}
      />,
    );
    expect(renderFn).toHaveBeenCalledWith('hello', 'error', expect.any(Function), [
      'Required field',
    ]);
    expect(screen.getByTestId('error')).toHaveTextContent('Required field');
  });

  it('renders display when editable is false regardless of mode', () => {
    const renderFn = vi.fn(testRender);
    render(
      <ArdaCustomCellInteractive
        value="hello"
        mode="edit"
        editable={false}
        onChange={() => {}}
        render={renderFn}
      />,
    );
    expect(renderFn).toHaveBeenCalledWith('hello', 'display', expect.any(Function));
    expect(screen.getByTestId('mode')).toHaveTextContent('display');
  });

  it('passes onChange to render function in edit mode', () => {
    const onChange = vi.fn();
    let capturedOnChange: ((orig: unknown, cur: unknown) => void) | undefined;
    const renderFn = vi.fn(
      (_v: unknown, _m: AtomMode, onCh: (orig: unknown, cur: unknown) => void) => {
        capturedOnChange = onCh;
        return <span>custom</span>;
      },
    );

    render(
      <ArdaCustomCellInteractive value="hello" mode="edit" onChange={onChange} render={renderFn} />,
    );

    capturedOnChange?.('hello', 'world');
    expect(onChange).toHaveBeenCalledWith('hello', 'world');
  });
});
