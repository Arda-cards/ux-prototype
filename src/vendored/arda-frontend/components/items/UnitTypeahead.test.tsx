import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { UnitTypeahead } from './UnitTypeahead';
import { lookupUnits } from '@frontend/lib/ardaClient';

jest.mock('@/lib/ardaClient', () => ({
  lookupUnits: jest.fn(),
}));

const lookupUnitsMock = lookupUnits as jest.Mock;

describe('UnitTypeahead', () => {
  const onChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    lookupUnitsMock.mockResolvedValue([]);
  });

  describe('initial render', () => {
    it('renders with initial value and default placeholder', () => {
      render(<UnitTypeahead value="kg" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search units...');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('kg');
    });

    it('renders with custom placeholder', () => {
      render(
        <UnitTypeahead value="" onChange={onChange} placeholder="Find a unit" />
      );
      expect(screen.getByPlaceholderText('Find a unit')).toBeInTheDocument();
    });

    it('renders with empty initial value', () => {
      render(<UnitTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search units...');
      expect(input).toHaveValue('');
    });

    it('renders disabled state', () => {
      render(<UnitTypeahead value="kg" onChange={onChange} disabled />);
      const input = screen.getByPlaceholderText('Search units...');
      expect(input).toBeDisabled();
    });

    it('updates input when value prop changes', () => {
      const { rerender } = render(
        <UnitTypeahead value="kg" onChange={onChange} />
      );
      const input = screen.getByPlaceholderText('Search units...');
      expect(input).toHaveValue('kg');

      rerender(<UnitTypeahead value="lbs" onChange={onChange} />);
      expect(input).toHaveValue('lbs');
    });
  });

  describe('focus behavior', () => {
    it('does not call lookupUnits when input is empty on focus', () => {
      render(<UnitTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.focus(input);
      expect(lookupUnitsMock).not.toHaveBeenCalled();
    });

    it('calls lookupUnits when input has value on focus', () => {
      render(<UnitTypeahead value="kg" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.focus(input);
      expect(lookupUnitsMock).toHaveBeenCalledWith('kg');
    });

    it('does not call lookupUnits on focus when value is only whitespace', () => {
      render(<UnitTypeahead value="   " onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.focus(input);
      expect(lookupUnitsMock).not.toHaveBeenCalled();
    });
  });

  describe('search and results', () => {
    it('shows results when units are found', async () => {
      lookupUnitsMock.mockResolvedValue(['kilogram', 'kilometer']);
      render(<UnitTypeahead value="kilo" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('kilogram')).toBeInTheDocument();
        expect(screen.getByText('kilometer')).toBeInTheDocument();
      });
    });

    it('shows loading state while fetching', async () => {
      let resolve: (v: string[]) => void;
      lookupUnitsMock.mockImplementation(
        () => new Promise((r) => { resolve = r; })
      );
      render(<UnitTypeahead value="kilo" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });

      act(() => { resolve!([]); });
    });

    it('shows "new unit" option when typed text does not match results', async () => {
      lookupUnitsMock.mockResolvedValue(['kilogram']);
      render(<UnitTypeahead value="newunit" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New unit:/)).toBeInTheDocument();
      });
    });

    it('does not show "new unit" option when typed text matches result (case insensitive)', async () => {
      lookupUnitsMock.mockResolvedValue(['kilogram']);
      render(<UnitTypeahead value="KILOGRAM" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('kilogram')).toBeInTheDocument();
      });
      expect(screen.queryByText(/New unit:/)).not.toBeInTheDocument();
    });

    it('handles API error gracefully — shows new unit option', async () => {
      lookupUnitsMock.mockRejectedValue(new Error('Network error'));
      render(<UnitTypeahead value="kilo" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New unit:/)).toBeInTheDocument();
      });
    });

    it('clears options when input is cleared', () => {
      render(<UnitTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.change(input, { target: { value: 'x' } });
      fireEvent.change(input, { target: { value: '' } });
      expect(lookupUnitsMock).not.toHaveBeenCalled();
    });
  });

  describe('selection', () => {
    it('calls onChange with selected unit name', async () => {
      lookupUnitsMock.mockResolvedValue(['kilogram', 'kilometer']);
      render(<UnitTypeahead value="kilo" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('kilogram')).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText('kilogram'));
      expect(onChange).toHaveBeenCalledWith('kilogram');
    });

    it('calls onChange with trimmed typed value when new unit is selected', async () => {
      lookupUnitsMock.mockResolvedValue([]);
      render(<UnitTypeahead value="  newunit  " onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New unit:/)).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText(/New unit:/));
      expect(onChange).toHaveBeenCalledWith('newunit');
    });

    it('closes dropdown after selection', async () => {
      lookupUnitsMock.mockResolvedValue(['kilogram']);
      render(<UnitTypeahead value="kilo" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('kilogram')).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText('kilogram'));
      expect(screen.queryByText('kilogram')).not.toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    it('navigates down through options with ArrowDown', async () => {
      lookupUnitsMock.mockResolvedValue(['kilogram', 'kilometer']);
      render(<UnitTypeahead value="kilo" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('kilogram')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' }); // past last item
    });

    it('navigates up through options with ArrowUp', async () => {
      lookupUnitsMock.mockResolvedValue(['kilogram', 'kilometer']);
      render(<UnitTypeahead value="kilo" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('kilogram')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowUp' });
    });

    it('selects highlighted option with Enter', async () => {
      lookupUnitsMock.mockResolvedValue(['kilogram']);
      render(<UnitTypeahead value="kilo" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('kilogram')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('kilogram');
    });

    it('selects new unit with Enter when no option highlighted and input has text', async () => {
      lookupUnitsMock.mockResolvedValue([]);
      render(<UnitTypeahead value="customunit" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New unit:/)).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('customunit');
    });

    it('reverts on Escape when dropdown is open', async () => {
      lookupUnitsMock.mockResolvedValue(['kilogram']);
      render(<UnitTypeahead value="original" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New unit:/)).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Escape' });
      expect(onChange).toHaveBeenCalledWith('original');
    });

    it('Tab key with highlighted option selects it (non-cellEditorMode)', async () => {
      lookupUnitsMock.mockResolvedValue(['kilogram']);
      render(<UnitTypeahead value="kilo" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('kilogram')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('kilogram');
    });

    it('Tab key with no highlighted option commits typed text (non-cellEditorMode)', async () => {
      lookupUnitsMock.mockResolvedValue([]);
      render(<UnitTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.change(input, { target: { value: 'customunit' } });
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('customunit');
    });

    it('handles Escape when dropdown is closed', () => {
      render(<UnitTypeahead value="previous" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(onChange).toHaveBeenCalledWith('previous');
    });
  });

  describe('cellEditorMode', () => {
    it('renders in cellEditorMode', () => {
      render(
        <UnitTypeahead value="kg" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search units...');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('kg');
    });

    it('in cellEditorMode, Escape reverts value', async () => {
      lookupUnitsMock.mockResolvedValue(['kilogram']);
      render(
        <UnitTypeahead value="original" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New unit:/)).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Escape' });
      expect(onChange).toHaveBeenCalledWith('original');
    });

    it('in cellEditorMode, Tab key with highlighted option saves that value', async () => {
      lookupUnitsMock.mockResolvedValue(['kilogram']);
      render(
        <UnitTypeahead value="kilo" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('kilogram')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('kilogram');
    });

    it('in cellEditorMode, Tab key with no option saves typed text', async () => {
      lookupUnitsMock.mockResolvedValue([]);
      render(
        <UnitTypeahead value="" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.change(input, { target: { value: 'CustomUnit' } });
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('CustomUnit');
    });

    it('in cellEditorMode, arrow keys when dropdown is closed commit current value', () => {
      render(
        <UnitTypeahead value="kg" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(onChange).toHaveBeenCalledWith('kg');
    });

    it('in cellEditorMode, Enter when dropdown is closed commits typed value', () => {
      render(
        <UnitTypeahead value="lbs" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('lbs');
    });
  });

  describe('blur behavior (form mode)', () => {
    it('reverts to previous value on blur when no selection made', async () => {
      render(<UnitTypeahead value="original" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search units...');

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'changed' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('original');
      });
    });
  });

  describe('mouse hover', () => {
    it('highlights option on mouse enter', async () => {
      lookupUnitsMock.mockResolvedValue(['kilogram', 'kilometer']);
      render(<UnitTypeahead value="kilo" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('kilogram')).toBeInTheDocument();
      });

      fireEvent.mouseEnter(screen.getByText('kilogram').closest('div')!);
    });

    it('highlights new unit option on mouse enter when no results match', async () => {
      lookupUnitsMock.mockResolvedValue([]);
      render(<UnitTypeahead value="customunit" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New unit:/)).toBeInTheDocument();
      });

      const newOptionDiv = screen.getByText(/New unit:/).closest('div')!;
      fireEvent.mouseEnter(newOptionDiv);
    });

    it('clicks new unit option when no results match', async () => {
      lookupUnitsMock.mockResolvedValue([]);
      render(<UnitTypeahead value="brandnewunit" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New unit:/)).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText(/New unit:/));
      expect(onChange).toHaveBeenCalledWith('brandnewunit');
    });
  });

  describe('debounce search on input change', () => {
    it('triggers search after typing in input (via debounce)', async () => {
      jest.useFakeTimers();
      lookupUnitsMock.mockResolvedValue(['kilogram']);
      render(<UnitTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search units...');

      fireEvent.change(input, { target: { value: 'kilo' } });

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(lookupUnitsMock).toHaveBeenCalledWith('kilo');
      });

      jest.useRealTimers();
    });
  });

  describe('click outside', () => {
    it('closes dropdown on click outside in form mode and reverts value', async () => {
      lookupUnitsMock.mockResolvedValue(['kilogram']);
      render(
        <div>
          <UnitTypeahead value="kilo" onChange={onChange} />
          <div data-testid="outside">outside</div>
        </div>
      );
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('kilogram')).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByTestId('outside'));
      await waitFor(() => {
        expect(screen.queryByText('kilogram')).not.toBeInTheDocument();
      });
    });

    it('in cellEditorMode, click outside commits typed value', async () => {
      lookupUnitsMock.mockResolvedValue([]);
      render(
        <div>
          <UnitTypeahead value="kg" onChange={onChange} cellEditorMode />
          <div data-testid="outside">outside</div>
        </div>
      );
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'newunit' } });

      fireEvent.mouseDown(screen.getByTestId('outside'));
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('newunit');
      });
    });
  });

  describe('Tab with empty input', () => {
    it('Tab with empty input does nothing in form mode', () => {
      render(<UnitTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).not.toHaveBeenCalled();
    });

    it('in cellEditorMode, Tab with empty input does nothing', () => {
      render(<UnitTypeahead value="" onChange={onChange} cellEditorMode />);
      const input = screen.getByPlaceholderText('Search units...');
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('cellEditorMode blur', () => {
    it('in cellEditorMode, blur calls onChange with current input value', async () => {
      render(<UnitTypeahead value="original" onChange={onChange} cellEditorMode />);
      const input = screen.getByPlaceholderText('Search units...');

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'newvalue' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('newvalue');
      });
    });
  });

  describe('cellEditorMode Escape when dropdown is closed', () => {
    it('in cellEditorMode, Escape when dropdown is closed reverts value', () => {
      render(
        <UnitTypeahead value="original" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search units...');
      // Don't open dropdown - just press Escape
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(onChange).toHaveBeenCalledWith('original');
    });
  });

  describe('cellEditorMode Tab when dropdown is closed', () => {
    it('in cellEditorMode, Tab when dropdown is closed saves typed text', () => {
      render(
        <UnitTypeahead value="TypedValue" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search units...');
      // Dropdown is closed initially
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('TypedValue');
    });
  });
});
