import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { ArdaMoneyFieldDisplay, type Money } from './money-field-display';
import { ArdaMoneyFieldEditor } from './money-field-editor';
import { ArdaMoneyFieldInteractive } from './money-field-interactive';

const currencies = { USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound' };

describe('ArdaMoneyFieldDisplay', () => {
  it('renders formatted money value', () => {
    render(
      <ArdaMoneyFieldDisplay
        value={{ amount: 1500, currency: 'USD' }}
        currencyOptions={currencies}
      />,
    );
    expect(screen.getByText(/\$1,500\.00 USD/)).toBeInTheDocument();
  });

  it('renders dash for undefined', () => {
    render(<ArdaMoneyFieldDisplay currencyOptions={currencies} />);
    expect(screen.getByText('\u2014')).toBeInTheDocument();
  });

  it('renders with custom precision', () => {
    render(
      <ArdaMoneyFieldDisplay
        value={{ amount: 99.9, currency: 'USD' }}
        currencyOptions={currencies}
        precision={0}
      />,
    );
    expect(screen.getByText(/\$100 USD/)).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(
      <ArdaMoneyFieldDisplay
        value={{ amount: 50, currency: 'EUR' }}
        currencyOptions={currencies}
        label="Price"
      />,
    );
    expect(screen.getByText('Price')).toBeInTheDocument();
  });
});

describe('ArdaMoneyFieldEditor', () => {
  it('renders with initial value', () => {
    render(
      <ArdaMoneyFieldEditor
        value={{ amount: 100, currency: 'USD' }}
        currencyOptions={currencies}
      />,
    );
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue(100);
  });

  it('calls onChange with original and current values on amount change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ArdaMoneyFieldEditor
        value={{ amount: 100, currency: 'USD' }}
        currencyOptions={currencies}
        onChange={onChange}
      />,
    );
    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '200');
    expect(onChange).toHaveBeenCalledWith(
      { amount: 100, currency: 'USD' },
      expect.objectContaining({ currency: 'USD' }),
    );
  });

  it('calls onChange on currency change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ArdaMoneyFieldEditor
        value={{ amount: 100, currency: 'USD' }}
        currencyOptions={currencies}
        onChange={onChange}
      />,
    );
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'EUR');
    expect(onChange).toHaveBeenCalledWith(
      { amount: 100, currency: 'USD' },
      { amount: 100, currency: 'EUR' },
    );
  });

  it('calls onComplete on Enter', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(
      <ArdaMoneyFieldEditor
        value={{ amount: 100, currency: 'USD' }}
        currencyOptions={currencies}
        onComplete={onComplete}
      />,
    );
    await user.type(screen.getByRole('spinbutton'), '{Enter}');
    expect(onComplete).toHaveBeenCalledWith({ amount: 100, currency: 'USD' });
  });

  it('calls onCancel on Escape', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <ArdaMoneyFieldEditor
        value={{ amount: 100, currency: 'USD' }}
        currencyOptions={currencies}
        onCancel={onCancel}
      />,
    );
    await user.type(screen.getByRole('spinbutton'), '{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });

  it('renders error styling and messages when showErrors is true', () => {
    render(
      <ArdaMoneyFieldEditor
        value={{ amount: 0, currency: 'USD' }}
        currencyOptions={currencies}
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
      <ArdaMoneyFieldEditor
        value={{ amount: 0, currency: 'USD' }}
        currencyOptions={currencies}
        errors={['Amount is required']}
      />,
    );
    expect(screen.queryByText('Amount is required')).not.toBeInTheDocument();
  });
});

describe('ArdaMoneyFieldInteractive', () => {
  const noop = vi.fn();
  const defaultValue: Money = { amount: 1500, currency: 'USD' };

  it('renders display mode', () => {
    render(
      <ArdaMoneyFieldInteractive
        value={defaultValue}
        mode="display"
        onChange={noop}
        currencyOptions={currencies}
      />,
    );
    expect(screen.getByText(/1,500/)).toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it('renders edit mode with inputs', () => {
    render(
      <ArdaMoneyFieldInteractive
        value={defaultValue}
        mode="edit"
        onChange={noop}
        currencyOptions={currencies}
      />,
    );
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders error mode with inputs and error messages', () => {
    render(
      <ArdaMoneyFieldInteractive
        value={defaultValue}
        mode="error"
        onChange={noop}
        currencyOptions={currencies}
        errors={['Required field']}
      />,
    );
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('forces display mode when editable is false', () => {
    render(
      <ArdaMoneyFieldInteractive
        value={defaultValue}
        mode="edit"
        onChange={noop}
        currencyOptions={currencies}
        editable={false}
      />,
    );
    expect(screen.getByText(/1,500/)).toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it('forces display mode when editable is false even in error mode', () => {
    render(
      <ArdaMoneyFieldInteractive
        value={defaultValue}
        mode="error"
        onChange={noop}
        currencyOptions={currencies}
        editable={false}
        errors={['Required']}
      />,
    );
    expect(screen.getByText(/1,500/)).toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(screen.queryByText('Required')).not.toBeInTheDocument();
  });
});
