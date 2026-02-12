import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  ArdaTable,
  ArdaTableBody,
  ArdaTableCell,
  ArdaTableHead,
  ArdaTableHeader,
  ArdaTableRow,
} from './table';

function renderTable(onRowClick?: (id: number) => void, activeId?: number) {
  const items = [
    { id: 1, name: 'Bolt M8', sku: 'BLT-001' },
    { id: 2, name: 'Nut M8', sku: 'NUT-001' },
  ];

  return render(
    <ArdaTable>
      <ArdaTableHeader>
        <ArdaTableRow>
          <ArdaTableHead>Name</ArdaTableHead>
          <ArdaTableHead>SKU</ArdaTableHead>
        </ArdaTableRow>
      </ArdaTableHeader>
      <ArdaTableBody>
        {items.map((item) => (
          <ArdaTableRow
            key={item.id}
            active={activeId === item.id}
            onClick={() => onRowClick?.(item.id)}
          >
            <ArdaTableCell>{item.name}</ArdaTableCell>
            <ArdaTableCell>{item.sku}</ArdaTableCell>
          </ArdaTableRow>
        ))}
      </ArdaTableBody>
    </ArdaTable>,
  );
}

describe('ArdaTable', () => {
  it('renders table with headers and rows', () => {
    renderTable();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('SKU')).toBeInTheDocument();
    expect(screen.getByText('Bolt M8')).toBeInTheDocument();
    expect(screen.getByText('Nut M8')).toBeInTheDocument();
  });

  it('renders header cells with th elements', () => {
    renderTable();
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(2);
  });

  it('renders data cells with td elements', () => {
    renderTable();
    const cells = screen.getAllByRole('cell');
    expect(cells).toHaveLength(4); // 2 rows x 2 columns
  });

  it('handles row click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    renderTable(handleClick);

    const row = screen.getByText('Bolt M8').closest('tr');
    if (row) {
      await user.click(row);
    }
    expect(handleClick).toHaveBeenCalledWith(1);
  });

  it('applies active state styling', () => {
    renderTable(undefined, 1);
    const activeRow = screen.getByText('Bolt M8').closest('tr');
    expect(activeRow?.className).toContain('font-medium');
  });

  it('does not apply active state to inactive rows', () => {
    renderTable(undefined, 1);
    const inactiveRow = screen.getByText('Nut M8').closest('tr');
    expect(inactiveRow?.className).not.toContain('font-medium');
  });

  it('applies custom className to table', () => {
    const { container } = render(
      <ArdaTable className="custom-table">
        <ArdaTableBody>
          <ArdaTableRow>
            <ArdaTableCell>Content</ArdaTableCell>
          </ArdaTableRow>
        </ArdaTableBody>
      </ArdaTable>,
    );
    const table = container.querySelector('table');
    expect(table?.className).toContain('custom-table');
  });
});
