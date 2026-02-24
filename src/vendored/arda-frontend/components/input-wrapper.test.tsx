import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InputWrapper from './input-wrapper';
import type { ItemColor } from '@frontend/types/items';

// Mock console.log from ColorPicker
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('InputWrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<InputWrapper />);
    expect(container.querySelector('.inputWrapper')).toBeInTheDocument();
  });

  it('shows default gray color swatch when no value', () => {
    const { container } = render(<InputWrapper />);
    const fill = container.querySelector('.fill') as HTMLElement;
    expect(fill).toBeInTheDocument();
    expect(fill.style.backgroundColor).toBe('rgb(203, 213, 225)'); // #cbd5e1
  });

  it('shows correct color swatch for RED value', () => {
    const { container } = render(<InputWrapper value={'RED' as ItemColor} />);
    const fill = container.querySelector('.fill') as HTMLElement;
    expect(fill.style.backgroundColor).toBe('rgb(239, 68, 68)'); // #EF4444
  });

  it('shows correct color swatch for BLUE value', () => {
    const { container } = render(<InputWrapper value={'BLUE' as ItemColor} />);
    const fill = container.querySelector('.fill') as HTMLElement;
    expect(fill.style.backgroundColor).toBe('rgb(59, 130, 246)'); // #3B82F6
  });

  it('color picker is hidden initially', () => {
    render(<InputWrapper />);
    expect(screen.queryByText('ColorPicker rendered')).not.toBeInTheDocument();
    // No overlay visible
    const overlay = document.querySelector('.fixed.inset-0');
    expect(overlay).not.toBeInTheDocument();
  });

  it('opens color picker when input is clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<InputWrapper />);
    const inputEl = container.querySelector('.input') as HTMLElement;
    await user.click(inputEl);
    // ColorPicker grid should now be visible
    const colorGrid = container.querySelector('.colorGrid');
    expect(colorGrid).toBeInTheDocument();
  });

  it('closes color picker when overlay is clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<InputWrapper />);
    const inputEl = container.querySelector('.input') as HTMLElement;

    // Open color picker
    await user.click(inputEl);
    expect(container.querySelector('.colorGrid')).toBeInTheDocument();

    // Click overlay
    const overlay = document.querySelector('.fixed.inset-0') as HTMLElement;
    await user.click(overlay);
    expect(container.querySelector('.colorGrid')).not.toBeInTheDocument();
  });

  it('calls onChange and closes picker when a color is selected', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { container } = render(<InputWrapper onChange={onChange} />);
    const inputEl = container.querySelector('.input') as HTMLElement;

    // Open color picker
    await user.click(inputEl);

    // Click a color
    const colorItems = container.querySelectorAll('.colorItem');
    expect(colorItems.length).toBeGreaterThan(0);
    await user.click(colorItems[0] as HTMLElement);

    expect(onChange).toHaveBeenCalledTimes(1);
    // After selection picker should close
    expect(container.querySelector('.colorGrid')).not.toBeInTheDocument();
  });

  it('toggles color picker on repeated clicks', async () => {
    const user = userEvent.setup();
    const { container } = render(<InputWrapper />);
    const inputEl = container.querySelector('.input') as HTMLElement;

    // First click opens
    await user.click(inputEl);
    expect(container.querySelector('.colorGrid')).toBeInTheDocument();

    // Second click closes
    await user.click(inputEl);
    expect(container.querySelector('.colorGrid')).not.toBeInTheDocument();
  });

  it('does not call onChange when no handler provided', async () => {
    const user = userEvent.setup();
    const { container } = render(<InputWrapper />);
    const inputEl = container.querySelector('.input') as HTMLElement;
    await user.click(inputEl);

    const colorItems = container.querySelectorAll('.colorItem');
    if (colorItems.length > 0) {
      await expect(user.click(colorItems[0] as HTMLElement)).resolves.not.toThrow();
    }
  });

  it('displays all 10 color options in the picker', async () => {
    const user = userEvent.setup();
    const { container } = render(<InputWrapper />);
    const inputEl = container.querySelector('.input') as HTMLElement;
    await user.click(inputEl);

    const colorItems = container.querySelectorAll('.colorItem');
    expect(colorItems).toHaveLength(10);
  });
});
