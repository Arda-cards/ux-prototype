import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { ArdaEnumCellDisplay } from './enum-cell-display';
import { ArdaEnumCellInteractive } from './enum-cell-interactive';

const options = {
  MARKETPLACE: 'Marketplace',
  DIRECT: 'Direct Sales',
  DISTRIBUTOR: 'Distributor',
  CONSIGNMENT: 'Consignment',
} as const;

type Mechanism = keyof typeof options;

describe('ArdaEnumCellDisplay', () => {
  it('renders the display label for a valid value', () => {
    render(<ArdaEnumCellDisplay value="MARKETPLACE" options={options} />);
    expect(screen.getByText('Marketplace')).toBeInTheDocument();
  });

  it('renders dash for undefined', () => {
    render(<ArdaEnumCellDisplay options={options} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders value as-is and warns when value not in options', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<ArdaEnumCellDisplay value={'UNKNOWN' as Mechanism} options={options} />);
    expect(screen.getByText('UNKNOWN')).toBeInTheDocument();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('UNKNOWN'));
    warnSpy.mockRestore();
  });
});

describe('ArdaEnumCellInteractive', () => {
  it('renders display when mode is display', () => {
    render(
      <ArdaEnumCellInteractive
        value="DIRECT"
        mode="display"
        onChange={() => {}}
        options={options}
      />,
    );
    expect(screen.getByText('Direct Sales')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('renders select when mode is edit', () => {
    render(
      <ArdaEnumCellInteractive
        value="MARKETPLACE"
        mode="edit"
        onChange={() => {}}
        options={options}
      />,
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('MARKETPLACE');
  });

  it('renders select with error styling when mode is error', () => {
    render(
      <ArdaEnumCellInteractive
        value="MARKETPLACE"
        mode="error"
        errors={['Required field']}
        onChange={() => {}}
        options={options}
      />,
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('renders display when editable is false regardless of mode', () => {
    render(
      <ArdaEnumCellInteractive
        value="MARKETPLACE"
        mode="edit"
        editable={false}
        onChange={() => {}}
        options={options}
      />,
    );
    expect(screen.getByText('Marketplace')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('calls onChange with (original, current) on selection change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ArdaEnumCellInteractive
        value="MARKETPLACE"
        mode="edit"
        onChange={onChange}
        options={options}
      />,
    );
    await user.selectOptions(screen.getByRole('combobox'), 'DISTRIBUTOR');
    expect(onChange).toHaveBeenCalledWith('MARKETPLACE', 'DISTRIBUTOR');
  });

  it('calls onComplete on Enter', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(
      <ArdaEnumCellInteractive
        value="MARKETPLACE"
        mode="edit"
        onChange={() => {}}
        onComplete={onComplete}
        options={options}
      />,
    );
    const select = screen.getByRole('combobox');
    await user.type(select, '{Enter}');
    expect(onComplete).toHaveBeenCalledWith('MARKETPLACE');
  });

  it('calls onCancel on Escape', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <ArdaEnumCellInteractive
        value="MARKETPLACE"
        mode="edit"
        onChange={() => {}}
        onCancel={onCancel}
        options={options}
      />,
    );
    const select = screen.getByRole('combobox');
    await user.type(select, '{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });

  it('warns when options has >100 entries', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const manyOptions = {} as Record<string, string>;
    for (let i = 0; i <= 100; i++) {
      manyOptions[`OPT_${i}`] = `Option ${i}`;
    }
    render(
      <ArdaEnumCellInteractive
        value={'OPT_0' as string}
        mode="display"
        onChange={() => {}}
        options={manyOptions}
      />,
    );
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('>100'));
    warnSpy.mockRestore();
  });
});
