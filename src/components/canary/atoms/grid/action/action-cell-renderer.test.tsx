import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';

import { ActionCellRenderer, type RowAction } from './action-cell-renderer';

// ============================================================================
// Test Entity
// ============================================================================

interface TestEntity {
  id: string;
  name: string;
}

const testEntity: TestEntity = { id: '1', name: 'Test Entity' };

// ============================================================================
// Tests
// ============================================================================

describe('ActionCellRenderer', () => {
  const makeActions = (overrides?: Partial<RowAction<TestEntity>>[]): RowAction<TestEntity>[] => [
    { label: 'Edit', onClick: vi.fn(), ...(overrides?.[0] ?? {}) },
    { label: 'Delete', onClick: vi.fn(), ...(overrides?.[1] ?? {}) },
  ];

  it('renders the trigger button', () => {
    render(<ActionCellRenderer<TestEntity> rowData={testEntity} actions={makeActions()} />);
    expect(screen.getByRole('button', { name: 'Row actions' })).toBeInTheDocument();
  });

  it('does not show dropdown menu initially', () => {
    render(<ActionCellRenderer<TestEntity> rowData={testEntity} actions={makeActions()} />);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens dropdown when trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<ActionCellRenderer<TestEntity> rowData={testEntity} actions={makeActions()} />);

    await user.click(screen.getByRole('button', { name: 'Row actions' }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument();
  });

  it('calls action onClick when menu item is clicked', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const actions: RowAction<TestEntity>[] = [
      { label: 'Edit', onClick: onEdit },
      { label: 'Delete', onClick: vi.fn() },
    ];

    render(<ActionCellRenderer<TestEntity> rowData={testEntity} actions={actions} />);

    await user.click(screen.getByRole('button', { name: 'Row actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));

    expect(onEdit).toHaveBeenCalledWith(testEntity);
  });

  it('closes the menu after an action is clicked', async () => {
    const user = userEvent.setup();
    const actions: RowAction<TestEntity>[] = [{ label: 'Edit', onClick: vi.fn() }];

    render(<ActionCellRenderer<TestEntity> rowData={testEntity} actions={actions} />);

    await user.click(screen.getByRole('button', { name: 'Row actions' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes the menu when Escape is pressed', async () => {
    const user = userEvent.setup();
    render(<ActionCellRenderer<TestEntity> rowData={testEntity} actions={makeActions()} />);

    await user.click(screen.getByRole('button', { name: 'Row actions' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('does not open when disabled', async () => {
    const user = userEvent.setup();
    render(
      <ActionCellRenderer<TestEntity> rowData={testEntity} actions={makeActions()} disabled />,
    );

    await user.click(screen.getByRole('button', { name: 'Row actions' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('renders action icons when provided', async () => {
    const user = userEvent.setup();
    const icon = <span data-testid="edit-icon">&#9998;</span>;
    const actions: RowAction<TestEntity>[] = [{ label: 'Edit', onClick: vi.fn(), icon }];

    render(<ActionCellRenderer<TestEntity> rowData={testEntity} actions={actions} />);

    await user.click(screen.getByRole('button', { name: 'Row actions' }));
    expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
  });

  it('sets aria-expanded on trigger when menu is open', async () => {
    const user = userEvent.setup();
    render(<ActionCellRenderer<TestEntity> rowData={testEntity} actions={makeActions()} />);

    const trigger = screen.getByRole('button', { name: 'Row actions' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes menu when clicking outside', () => {
    render(
      <div>
        <ActionCellRenderer<TestEntity> rowData={testEntity} actions={makeActions()} />
        <div data-testid="outside">Outside</div>
      </div>,
    );

    // Open the menu
    fireEvent.click(screen.getByRole('button', { name: 'Row actions' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    // Click outside
    fireEvent.pointerDown(screen.getByTestId('outside'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
