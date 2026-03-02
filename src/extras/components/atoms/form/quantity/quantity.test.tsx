import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { ArdaQuantityFieldDisplay, type Quantity } from './quantity-field-display';
import { ArdaQuantityFieldEditor } from './quantity-field-editor';
import { ArdaQuantityFieldInteractive } from './quantity-field-interactive';

const units = { kg: 'Kilograms', lbs: 'Pounds', g: 'Grams' };

describe('ArdaQuantityFieldDisplay', () => {
  it('renders formatted quantity value', () => {
    render(<ArdaQuantityFieldDisplay value={{ amount: 250, unit: 'kg' }} unitOptions={units} />);
    expect(screen.getByText('250 kg')).toBeInTheDocument();
  });

  it('renders dash for undefined', () => {
    render(<ArdaQuantityFieldDisplay unitOptions={units} />);
    expect(screen.getByText('\u2014')).toBeInTheDocument();
  });

  it('renders with custom precision', () => {
    render(
      <ArdaQuantityFieldDisplay
        value={{ amount: 12.5, unit: 'lbs' }}
        unitOptions={units}
        precision={2}
      />,
    );
    expect(screen.getByText('12.50 lbs')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(
      <ArdaQuantityFieldDisplay
        value={{ amount: 50, unit: 'kg' }}
        unitOptions={units}
        label="Weight"
      />,
    );
    expect(screen.getByText('Weight')).toBeInTheDocument();
  });
});

describe('ArdaQuantityFieldEditor', () => {
  it('renders with initial value', () => {
    render(<ArdaQuantityFieldEditor value={{ amount: 100, unit: 'kg' }} unitOptions={units} />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue(100);
  });

  it('calls onChange with original and current values on amount change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ArdaQuantityFieldEditor
        value={{ amount: 100, unit: 'kg' }}
        unitOptions={units}
        onChange={onChange}
      />,
    );
    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '200');
    expect(onChange).toHaveBeenCalledWith(
      { amount: 100, unit: 'kg' },
      expect.objectContaining({ unit: 'kg' }),
    );
  });

  it('calls onChange on unit change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ArdaQuantityFieldEditor
        value={{ amount: 100, unit: 'kg' }}
        unitOptions={units}
        onChange={onChange}
      />,
    );
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'lbs');
    expect(onChange).toHaveBeenCalledWith(
      { amount: 100, unit: 'kg' },
      { amount: 100, unit: 'lbs' },
    );
  });

  it('calls onComplete on Enter', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(
      <ArdaQuantityFieldEditor
        value={{ amount: 100, unit: 'kg' }}
        unitOptions={units}
        onComplete={onComplete}
      />,
    );
    await user.type(screen.getByRole('spinbutton'), '{Enter}');
    expect(onComplete).toHaveBeenCalledWith({ amount: 100, unit: 'kg' });
  });

  it('calls onCancel on Escape', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <ArdaQuantityFieldEditor
        value={{ amount: 100, unit: 'kg' }}
        unitOptions={units}
        onCancel={onCancel}
      />,
    );
    await user.type(screen.getByRole('spinbutton'), '{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });

  it('renders error styling and messages when showErrors is true', () => {
    render(
      <ArdaQuantityFieldEditor
        value={{ amount: 0, unit: 'kg' }}
        unitOptions={units}
        showErrors
        errors={['Amount is required', 'Must be positive']}
      />,
    );
    expect(screen.getByText('Amount is required')).toBeInTheDocument();
    expect(screen.getByText('Must be positive')).toBeInTheDocument();
    const input = screen.getByRole('spinbutton');
    expect(input.className).toContain('border-red-500');
  });

  it('does not render errors when showErrors is false', () => {
    render(
      <ArdaQuantityFieldEditor
        value={{ amount: 0, unit: 'kg' }}
        unitOptions={units}
        errors={['Amount is required']}
      />,
    );
    expect(screen.queryByText('Amount is required')).not.toBeInTheDocument();
  });
});

describe('ArdaQuantityFieldInteractive', () => {
  const noop = vi.fn();
  const defaultValue: Quantity = { amount: 250, unit: 'kg' };

  it('renders display mode', () => {
    render(
      <ArdaQuantityFieldInteractive
        value={defaultValue}
        mode="display"
        onChange={noop}
        unitOptions={units}
      />,
    );
    expect(screen.getByText('250 kg')).toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it('renders edit mode with inputs', () => {
    render(
      <ArdaQuantityFieldInteractive
        value={defaultValue}
        mode="edit"
        onChange={noop}
        unitOptions={units}
      />,
    );
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders error mode with inputs and error messages', () => {
    render(
      <ArdaQuantityFieldInteractive
        value={defaultValue}
        mode="error"
        onChange={noop}
        unitOptions={units}
        errors={['Required field']}
      />,
    );
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('forces display mode when editable is false', () => {
    render(
      <ArdaQuantityFieldInteractive
        value={defaultValue}
        mode="edit"
        onChange={noop}
        unitOptions={units}
        editable={false}
      />,
    );
    expect(screen.getByText('250 kg')).toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it('forces display mode when editable is false even in error mode', () => {
    render(
      <ArdaQuantityFieldInteractive
        value={defaultValue}
        mode="error"
        onChange={noop}
        unitOptions={units}
        editable={false}
        errors={['Required']}
      />,
    );
    expect(screen.getByText('250 kg')).toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(screen.queryByText('Required')).not.toBeInTheDocument();
  });
});
