import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ColorPicker from './color-picker';
import type { ItemColor } from '@frontend/types/items';


const colorOptions = [
  { value: 'RED' as ItemColor, color: '#EF4444', name: 'Red' },
  { value: 'GREEN' as ItemColor, color: '#22C55E', name: 'Green' },
  { value: 'BLUE' as ItemColor, color: '#3B82F6', name: 'Blue' },
];

describe('ColorPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<ColorPicker colorOptions={[]} />);
    expect(container.querySelector('.colorPicker')).toBeInTheDocument();
  });

  it('renders color items for each option', () => {
    const { container } = render(<ColorPicker colorOptions={colorOptions} />);
    const items = container.querySelectorAll('.colorItem');
    expect(items).toHaveLength(3);
  });

  it('renders color items with correct background colors', () => {
    const { container } = render(<ColorPicker colorOptions={colorOptions} />);
    const items = container.querySelectorAll('.colorItem');
    expect((items[0] as HTMLElement).style.backgroundColor).toBe('rgb(239, 68, 68)');
    expect((items[1] as HTMLElement).style.backgroundColor).toBe('rgb(34, 197, 94)');
    expect((items[2] as HTMLElement).style.backgroundColor).toBe('rgb(59, 130, 246)');
  });

  it('renders color items with correct title attributes', () => {
    const { container } = render(<ColorPicker colorOptions={colorOptions} />);
    const items = container.querySelectorAll('.colorItem');
    expect(items[0]).toHaveAttribute('title', 'Red');
    expect(items[1]).toHaveAttribute('title', 'Green');
    expect(items[2]).toHaveAttribute('title', 'Blue');
  });

  it('calls onColorSelect when a color item is clicked', async () => {
    const user = userEvent.setup();
    const onColorSelect = jest.fn();
    const { container } = render(
      <ColorPicker colorOptions={colorOptions} onColorSelect={onColorSelect} />
    );
    const items = container.querySelectorAll('.colorItem');
    await user.click(items[0] as HTMLElement);
    expect(onColorSelect).toHaveBeenCalledWith('RED');
  });

  it('calls onColorSelect with correct value for each color', async () => {
    const user = userEvent.setup();
    const onColorSelect = jest.fn();
    const { container } = render(
      <ColorPicker colorOptions={colorOptions} onColorSelect={onColorSelect} />
    );
    const items = container.querySelectorAll('.colorItem');
    await user.click(items[1] as HTMLElement);
    expect(onColorSelect).toHaveBeenCalledWith('GREEN');

    await user.click(items[2] as HTMLElement);
    expect(onColorSelect).toHaveBeenCalledWith('BLUE');
  });

  it('does not throw when onColorSelect is not provided', async () => {
    const user = userEvent.setup();
    const { container } = render(<ColorPicker colorOptions={colorOptions} />);
    const items = container.querySelectorAll('.colorItem');
    await expect(user.click(items[0] as HTMLElement)).resolves.not.toThrow();
  });

  it('renders with empty colorOptions', () => {
    const { container } = render(<ColorPicker colorOptions={[]} />);
    const items = container.querySelectorAll('.colorItem');
    expect(items).toHaveLength(0);
  });

  it('applies custom className', () => {
    const { container } = render(
      <ColorPicker colorOptions={[]} className="my-class" />
    );
    const picker = container.firstChild as HTMLElement;
    expect(picker.className).toContain('my-class');
  });

  it('logs onClose to console when rendered', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const onClose = jest.fn();
    render(<ColorPicker colorOptions={[]} onClose={onClose} />);
    expect(consoleSpy).toHaveBeenCalledWith('ColorPicker rendered', { onClose });
  });
});
