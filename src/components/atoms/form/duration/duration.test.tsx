import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { ArdaDurationFieldDisplay, type Duration } from './duration-field-display';
import { ArdaDurationFieldEditor } from './duration-field-editor';
import { ArdaDurationFieldInteractive } from './duration-field-interactive';

const units = { days: 'Days', hours: 'Hours', weeks: 'Weeks' };

describe('ArdaDurationFieldDisplay', () => {
  it('renders formatted duration value', () => {
    render(<ArdaDurationFieldDisplay value={{ value: 90, unit: 'days' }} unitOptions={units} />);
    expect(screen.getByText('90 days')).toBeInTheDocument();
  });

  it('renders dash for undefined', () => {
    render(<ArdaDurationFieldDisplay unitOptions={units} />);
    expect(screen.getByText('\u2014')).toBeInTheDocument();
  });

  it('renders with custom precision', () => {
    render(
      <ArdaDurationFieldDisplay
        value={{ value: 2.5, unit: 'hours' }}
        unitOptions={units}
        precision={1}
      />,
    );
    expect(screen.getByText('2.5 hours')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(
      <ArdaDurationFieldDisplay
        value={{ value: 90, unit: 'days' }}
        unitOptions={units}
        label="Lead Time"
      />,
    );
    expect(screen.getByText('Lead Time')).toBeInTheDocument();
  });
});

describe('ArdaDurationFieldEditor', () => {
  it('renders with initial value', () => {
    render(<ArdaDurationFieldEditor value={{ value: 90, unit: 'days' }} unitOptions={units} />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue(90);
  });

  it('calls onChange with original and current values on value change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ArdaDurationFieldEditor
        value={{ value: 90, unit: 'days' }}
        unitOptions={units}
        onChange={onChange}
      />,
    );
    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '120');
    expect(onChange).toHaveBeenCalledWith(
      { value: 90, unit: 'days' },
      expect.objectContaining({ unit: 'days' }),
    );
  });

  it('calls onChange on unit change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ArdaDurationFieldEditor
        value={{ value: 90, unit: 'days' }}
        unitOptions={units}
        onChange={onChange}
      />,
    );
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'hours');
    expect(onChange).toHaveBeenCalledWith(
      { value: 90, unit: 'days' },
      { value: 90, unit: 'hours' },
    );
  });

  it('calls onComplete on Enter', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(
      <ArdaDurationFieldEditor
        value={{ value: 90, unit: 'days' }}
        unitOptions={units}
        onComplete={onComplete}
      />,
    );
    await user.type(screen.getByRole('spinbutton'), '{Enter}');
    expect(onComplete).toHaveBeenCalledWith({ value: 90, unit: 'days' });
  });

  it('calls onCancel on Escape', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <ArdaDurationFieldEditor
        value={{ value: 90, unit: 'days' }}
        unitOptions={units}
        onCancel={onCancel}
      />,
    );
    await user.type(screen.getByRole('spinbutton'), '{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });

  it('renders error styling and messages when showErrors is true', () => {
    render(
      <ArdaDurationFieldEditor
        value={{ value: 0, unit: 'days' }}
        unitOptions={units}
        showErrors
        errors={['Duration is required', 'Must be positive']}
      />,
    );
    expect(screen.getByText('Duration is required')).toBeInTheDocument();
    expect(screen.getByText('Must be positive')).toBeInTheDocument();
    const input = screen.getByRole('spinbutton');
    expect(input.className).toContain('border-red-500');
  });

  it('does not render errors when showErrors is false', () => {
    render(
      <ArdaDurationFieldEditor
        value={{ value: 0, unit: 'days' }}
        unitOptions={units}
        errors={['Duration is required']}
      />,
    );
    expect(screen.queryByText('Duration is required')).not.toBeInTheDocument();
  });
});

describe('ArdaDurationFieldInteractive', () => {
  const noop = vi.fn();
  const defaultValue: Duration = { value: 90, unit: 'days' };

  it('renders display mode', () => {
    render(
      <ArdaDurationFieldInteractive
        value={defaultValue}
        mode="display"
        onChange={noop}
        unitOptions={units}
      />,
    );
    expect(screen.getByText('90 days')).toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it('renders edit mode with inputs', () => {
    render(
      <ArdaDurationFieldInteractive
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
      <ArdaDurationFieldInteractive
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
      <ArdaDurationFieldInteractive
        value={defaultValue}
        mode="edit"
        onChange={noop}
        unitOptions={units}
        editable={false}
      />,
    );
    expect(screen.getByText('90 days')).toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it('forces display mode when editable is false even in error mode', () => {
    render(
      <ArdaDurationFieldInteractive
        value={defaultValue}
        mode="error"
        onChange={noop}
        unitOptions={units}
        editable={false}
        errors={['Required']}
      />,
    );
    expect(screen.getByText('90 days')).toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(screen.queryByText('Required')).not.toBeInTheDocument();
  });
});
