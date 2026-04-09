import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, type Mock } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { ColorPicker, getColorHex } from './color-picker';

const SMALL_MAP = {
  RED: { hex: '#EF4444', name: 'Red' },
  GREEN: { hex: '#22C55E', name: 'Green' },
  BLUE: { hex: '#3B82F6', name: 'Blue' },
};

function renderPicker(
  overrides: Partial<{
    value: string;
    onValueChange: Mock<(color: string) => void>;
    disabled: boolean;
    colors: Record<string, { hex: string; name: string }>;
  }> = {},
) {
  const onValueChange = overrides.onValueChange ?? vi.fn<(color: string) => void>();
  const result = render(
    <ColorPicker
      value={overrides.value ?? 'RED'}
      onValueChange={onValueChange}
      disabled={overrides.disabled ?? false}
      colors={overrides.colors ?? SMALL_MAP}
    />,
  );
  return { ...result, onValueChange };
}

describe('ColorPicker', () => {
  it('renders trigger button with correct aria-label', () => {
    renderPicker({ value: 'RED' });
    expect(screen.getByRole('button', { name: /Color: Red/i })).toBeInTheDocument();
  });

  it('renders data-slot attribute', () => {
    renderPicker();
    expect(document.querySelector('[data-slot="color-picker"]')).toBeInTheDocument();
  });

  it('starts closed', () => {
    renderPicker();
    expect(document.querySelector('[data-slot="color-picker"]')).toHaveAttribute(
      'data-state',
      'closed',
    );
  });

  it('opens palette on trigger click', async () => {
    const user = userEvent.setup();
    renderPicker();
    await user.click(screen.getByRole('button', { name: /Color: Red/i }));
    expect(screen.getByRole('radiogroup', { name: /Color palette/i })).toBeInTheDocument();
  });

  it('renders all color options in palette', async () => {
    const user = userEvent.setup();
    renderPicker();
    await user.click(screen.getByRole('button', { name: /Color: Red/i }));
    expect(screen.getByRole('radio', { name: 'Red' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Green' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Blue' })).toBeInTheDocument();
  });

  it('marks selected color with aria-checked', async () => {
    const user = userEvent.setup();
    renderPicker({ value: 'GREEN' });
    await user.click(screen.getByRole('button', { name: /Color: Green/i }));
    expect(screen.getByRole('radio', { name: 'Green' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Red' })).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onValueChange when a color is selected', async () => {
    const user = userEvent.setup();
    const { onValueChange } = renderPicker({ value: 'RED' });
    await user.click(screen.getByRole('button', { name: /Color: Red/i }));
    await user.click(screen.getByRole('radio', { name: 'Blue' }));
    expect(onValueChange).toHaveBeenCalledWith('BLUE');
  });

  it('does not open when disabled', async () => {
    const user = userEvent.setup();
    renderPicker({ disabled: true });
    await user.click(screen.getByRole('button', { name: /Color: Red/i }));
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
  });

  it('sets data-disabled when disabled', () => {
    renderPicker({ disabled: true });
    expect(document.querySelector('[data-slot="color-picker"]')).toHaveAttribute('data-disabled');
  });

  it('navigates with arrow keys', async () => {
    const user = userEvent.setup();
    const { onValueChange } = renderPicker({ value: 'RED' });

    // Open palette
    await user.click(screen.getByRole('button', { name: /Color: Red/i }));

    // Wait for focus to settle
    await act(async () => {
      await new Promise((r) => requestAnimationFrame(r));
    });

    // ArrowRight moves to next color
    await user.keyboard('{ArrowRight}');
    // Enter selects it
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('GREEN');
  });

  it('wraps around with arrow keys', async () => {
    const user = userEvent.setup();
    const { onValueChange } = renderPicker({ value: 'BLUE' });

    await user.click(screen.getByRole('button', { name: /Color: Blue/i }));
    await act(async () => {
      await new Promise((r) => requestAnimationFrame(r));
    });

    // ArrowRight from last item wraps to first
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('RED');
  });

  it('selects with Space key', async () => {
    const user = userEvent.setup();
    const { onValueChange } = renderPicker({ value: 'RED' });

    await user.click(screen.getByRole('button', { name: /Color: Red/i }));
    await act(async () => {
      await new Promise((r) => requestAnimationFrame(r));
    });

    await user.keyboard('{ }');
    expect(onValueChange).toHaveBeenCalledWith('RED');
  });
});

describe('getColorHex', () => {
  it('returns hex for known color', () => {
    expect(getColorHex('RED', SMALL_MAP)).toBe('#EF4444');
  });

  it('returns fallback for unknown color', () => {
    expect(getColorHex('UNKNOWN', SMALL_MAP)).toBe('#6B7280');
  });
});
