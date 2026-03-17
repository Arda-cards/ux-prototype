import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { EnumCellDisplay } from './enum-cell-display';
import { EnumCellEditor, type EnumCellEditorHandle } from './enum-cell-editor';
import React from 'react';

const options = {
  MARKETPLACE: 'Marketplace',
  DIRECT: 'Direct Sales',
  DISTRIBUTOR: 'Distributor',
  CONSIGNMENT: 'Consignment',
} as const;

type Mechanism = keyof typeof options;

describe('EnumCellDisplay', () => {
  it('renders the display label for a valid value', () => {
    render(<EnumCellDisplay value="MARKETPLACE" options={options} />);
    expect(screen.getByText('Marketplace')).toBeInTheDocument();
  });

  it('renders dash for undefined', () => {
    render(<EnumCellDisplay options={options} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders value as-is and warns when value not in options', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<EnumCellDisplay value={'UNKNOWN' as Mechanism} options={options} />);
    expect(screen.getByText('UNKNOWN')).toBeInTheDocument();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('UNKNOWN'));
    warnSpy.mockRestore();
  });
});

describe('EnumCellEditor', () => {
  it('renders with initial value selected', () => {
    render(<EnumCellEditor value="MARKETPLACE" options={options} />);
    expect(screen.getByRole('combobox')).toHaveValue('MARKETPLACE');
  });

  it('exposes getValue via ref', () => {
    const ref = React.createRef<EnumCellEditorHandle>();
    render(<EnumCellEditor ref={ref} value="DIRECT" options={options} />);
    expect(ref.current?.getValue()).toBe('DIRECT');
  });

  it('calls stopEditing on Enter', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();
    render(<EnumCellEditor value="MARKETPLACE" options={options} stopEditing={stopEditing} />);
    const select = screen.getByRole('combobox');
    await user.type(select, '{Enter}');
    expect(stopEditing).toHaveBeenCalledWith(false);
  });

  it('calls stopEditing with cancel on Escape', async () => {
    const user = userEvent.setup();
    const stopEditing = vi.fn();
    render(<EnumCellEditor value="MARKETPLACE" options={options} stopEditing={stopEditing} />);
    const select = screen.getByRole('combobox');
    await user.type(select, '{Escape}');
    expect(stopEditing).toHaveBeenCalledWith(true);
  });

  it('auto-focuses on mount', () => {
    render(<EnumCellEditor value="MARKETPLACE" options={options} />);
    expect(screen.getByRole('combobox')).toHaveFocus();
  });

  it('renders all options', () => {
    render(<EnumCellEditor value="MARKETPLACE" options={options} />);
    expect(screen.getByRole('option', { name: 'Marketplace' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Direct Sales' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Distributor' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Consignment' })).toBeInTheDocument();
  });
});
