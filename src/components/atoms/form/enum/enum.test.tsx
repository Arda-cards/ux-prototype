import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { ArdaEnumFieldDisplay } from './enum-field-display';
import { ArdaEnumFieldEditor } from './enum-field-editor';
import { ArdaEnumFieldInteractive } from './enum-field-interactive';

const options = {
  MARKETPLACE: 'Marketplace',
  DIRECT: 'Direct Sales',
  DISTRIBUTOR: 'Distributor',
  CONSIGNMENT: 'Consignment',
} as const;

type Mechanism = keyof typeof options;

describe('ArdaEnumFieldDisplay', () => {
  it('renders the display label for a valid value', () => {
    render(<ArdaEnumFieldDisplay value="MARKETPLACE" options={options} />);
    expect(screen.getByText('Marketplace')).toBeInTheDocument();
  });

  it('renders dash for undefined value', () => {
    render(<ArdaEnumFieldDisplay options={options} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders value as-is and warns when value not in options', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<ArdaEnumFieldDisplay value={'UNKNOWN' as Mechanism} options={options} />);
    expect(screen.getByText('UNKNOWN')).toBeInTheDocument();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('UNKNOWN'));
    warnSpy.mockRestore();
  });

  it('renders with label on the left', () => {
    render(
      <ArdaEnumFieldDisplay
        value="DIRECT"
        options={options}
        label="Mechanism"
        labelPosition="left"
      />,
    );
    expect(screen.getByText('Mechanism')).toBeInTheDocument();
    expect(screen.getByText('Direct Sales')).toBeInTheDocument();
  });

  it('renders with label on top', () => {
    render(
      <ArdaEnumFieldDisplay
        value="DIRECT"
        options={options}
        label="Mechanism"
        labelPosition="top"
      />,
    );
    const label = screen.getByText('Mechanism');
    expect(label.closest('div')).toHaveClass('flex-col');
  });
});

describe('ArdaEnumFieldEditor', () => {
  it('renders select with all options', () => {
    render(<ArdaEnumFieldEditor value="MARKETPLACE" options={options} />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('MARKETPLACE');
    expect(screen.getByText('Marketplace')).toBeInTheDocument();
    expect(screen.getByText('Direct Sales')).toBeInTheDocument();
    expect(screen.getByText('Distributor')).toBeInTheDocument();
    expect(screen.getByText('Consignment')).toBeInTheDocument();
  });

  it('calls onChange with original and current values on change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ArdaEnumFieldEditor value="MARKETPLACE" options={options} onChange={onChange} />);
    await user.selectOptions(screen.getByRole('combobox'), 'DIRECT');
    expect(onChange).toHaveBeenCalledWith('MARKETPLACE', 'DIRECT');
  });

  it('calls onComplete on Enter', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<ArdaEnumFieldEditor value="MARKETPLACE" options={options} onComplete={onComplete} />);
    const select = screen.getByRole('combobox');
    await user.type(select, '{Enter}');
    expect(onComplete).toHaveBeenCalledWith('MARKETPLACE');
  });

  it('calls onCancel on Escape', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ArdaEnumFieldEditor value="MARKETPLACE" options={options} onCancel={onCancel} />);
    const select = screen.getByRole('combobox');
    await user.type(select, '{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });

  it('is disabled when disabled prop is set', () => {
    render(<ArdaEnumFieldEditor value="MARKETPLACE" options={options} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('renders with label', () => {
    render(<ArdaEnumFieldEditor value="MARKETPLACE" options={options} label="Mechanism" />);
    expect(screen.getByText('Mechanism')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders error styling and messages when showErrors is true', () => {
    render(
      <ArdaEnumFieldEditor
        value="MARKETPLACE"
        options={options}
        showErrors
        errors={['Invalid selection', 'Not available']}
      />,
    );
    expect(screen.getByText('Invalid selection')).toBeInTheDocument();
    expect(screen.getByText('Not available')).toBeInTheDocument();
    const select = screen.getByRole('combobox');
    expect(select.className).toContain('border-red-500');
  });

  it('does not render errors when showErrors is false', () => {
    render(
      <ArdaEnumFieldEditor value="MARKETPLACE" options={options} errors={['Invalid selection']} />,
    );
    expect(screen.queryByText('Invalid selection')).not.toBeInTheDocument();
  });
});

describe('ArdaEnumFieldInteractive', () => {
  const noop = vi.fn();

  it('renders display mode with human-readable label', () => {
    render(
      <ArdaEnumFieldInteractive value="DIRECT" mode="display" onChange={noop} options={options} />,
    );
    expect(screen.getByText('Direct Sales')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('renders edit mode with select', () => {
    render(
      <ArdaEnumFieldInteractive
        value="MARKETPLACE"
        mode="edit"
        onChange={noop}
        options={options}
      />,
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('MARKETPLACE');
  });

  it('renders error mode with select and error messages', () => {
    render(
      <ArdaEnumFieldInteractive
        value="MARKETPLACE"
        mode="error"
        onChange={noop}
        options={options}
        errors={['Required field']}
      />,
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('forces display mode when editable is false', () => {
    render(
      <ArdaEnumFieldInteractive
        value="MARKETPLACE"
        mode="edit"
        onChange={noop}
        editable={false}
        options={options}
      />,
    );
    expect(screen.getByText('Marketplace')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('forces display mode when editable is false even in error mode', () => {
    render(
      <ArdaEnumFieldInteractive
        value="MARKETPLACE"
        mode="error"
        onChange={noop}
        editable={false}
        options={options}
        errors={['Required']}
      />,
    );
    expect(screen.getByText('Marketplace')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByText('Required')).not.toBeInTheDocument();
  });

  it('passes onChange with original and current to editor', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ArdaEnumFieldInteractive
        value="MARKETPLACE"
        mode="edit"
        onChange={onChange}
        options={options}
      />,
    );
    await user.selectOptions(screen.getByRole('combobox'), 'DISTRIBUTOR');
    expect(onChange).toHaveBeenCalledWith('MARKETPLACE', 'DISTRIBUTOR');
  });

  it('warns when options has >100 entries', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const manyOptions = {} as Record<string, string>;
    for (let i = 0; i <= 100; i++) {
      manyOptions[`OPT_${i}`] = `Option ${i}`;
    }
    render(
      <ArdaEnumFieldInteractive
        value={'OPT_0' as string}
        mode="display"
        onChange={noop as (original: string, current: string) => void}
        options={manyOptions}
      />,
    );
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('>100'));
    warnSpy.mockRestore();
  });
});
