import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';

describe('ToggleGroup', () => {
  it('renders items with toggle-group role', () => {
    render(
      <ToggleGroup type="single" aria-label="Alignment">
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="center">Center</ToggleGroupItem>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByRole('group', { name: 'Alignment' })).toBeVisible();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('single mode: selects one item at a time', () => {
    const onChange = vi.fn();
    render(
      <ToggleGroup type="single" onValueChange={onChange}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );
    fireEvent.click(screen.getByText('A'));
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('multiple mode: allows multiple selections', () => {
    const onChange = vi.fn();
    render(
      <ToggleGroup type="multiple" onValueChange={onChange}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );
    fireEvent.click(screen.getByText('A'));
    expect(onChange).toHaveBeenCalledWith(['a']);
  });

  it('respects controlled value in single mode', () => {
    render(
      <ToggleGroup type="single" value="b">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByText('B').closest('button')).toHaveAttribute('data-state', 'on');
    expect(screen.getByText('A').closest('button')).toHaveAttribute('data-state', 'off');
  });

  it('disables individual items', () => {
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="a" disabled>
          A
        </ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByText('A').closest('button')).toBeDisabled();
    expect(screen.getByText('B').closest('button')).not.toBeDisabled();
  });

  it('applies variant classes from context', () => {
    render(
      <ToggleGroup type="single" variant="outline">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );
    const item = screen.getByText('A').closest('button');
    expect(item?.className).toContain('border');
  });

  it('applies size classes from context', () => {
    render(
      <ToggleGroup type="single" size="sm">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );
    const item = screen.getByText('A').closest('button');
    expect(item?.className).toContain('h-8');
  });

  it('supports vertical orientation', () => {
    render(
      <ToggleGroup type="single" orientation="vertical">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );
    const group = screen.getByRole('group');
    expect(group.className).toContain('flex-col');
  });
});
