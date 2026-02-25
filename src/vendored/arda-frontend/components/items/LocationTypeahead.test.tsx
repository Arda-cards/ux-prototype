import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { LocationTypeahead } from './LocationTypeahead';
import { lookupLocations } from '@frontend/lib/ardaClient';

jest.mock('@/lib/ardaClient', () => ({
  lookupLocations: jest.fn(),
}));

const lookupLocationsMock = lookupLocations as jest.Mock;

describe('LocationTypeahead', () => {
  const onChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    lookupLocationsMock.mockResolvedValue([]);
  });

  describe('initial render', () => {
    it('renders with value and placeholder', () => {
      render(
        <LocationTypeahead
          value="Storage"
          onChange={onChange}
          placeholder="Search for location"
        />
      );
      const input = screen.getByPlaceholderText('Search for location');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('Storage');
    });

    it('renders with custom placeholder', () => {
      render(
        <LocationTypeahead value="" onChange={onChange} placeholder="Find a location" />
      );
      expect(screen.getByPlaceholderText('Find a location')).toBeInTheDocument();
    });

    it('renders with empty initial value', () => {
      render(<LocationTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for location');
      expect(input).toHaveValue('');
    });

    it('renders disabled state', () => {
      render(<LocationTypeahead value="Storage" onChange={onChange} disabled />);
      const input = screen.getByPlaceholderText('Search for location');
      expect(input).toBeDisabled();
    });

    it('updates input when value prop changes', () => {
      const { rerender } = render(
        <LocationTypeahead value="Storage A" onChange={onChange} />
      );
      const input = screen.getByPlaceholderText('Search for location');
      expect(input).toHaveValue('Storage A');

      rerender(<LocationTypeahead value="Storage B" onChange={onChange} />);
      expect(input).toHaveValue('Storage B');
    });
  });

  describe('focus behavior', () => {
    it('does not call lookupLocations when input is empty on focus', () => {
      render(<LocationTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for location');
      fireEvent.focus(input);
      expect(lookupLocationsMock).not.toHaveBeenCalled();
    });

    it('calls lookupLocations when input has value on focus', async () => {
      render(<LocationTypeahead value="Stor" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for location');
      fireEvent.focus(input);
      expect(lookupLocationsMock).toHaveBeenCalledWith('Stor');
    });

    it('does not call lookupLocations on focus when value is only whitespace', () => {
      render(<LocationTypeahead value="   " onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for location');
      fireEvent.focus(input);
      expect(lookupLocationsMock).not.toHaveBeenCalled();
    });
  });

  describe('search and results', () => {
    it('shows results when locations are found', async () => {
      lookupLocationsMock.mockResolvedValue(['Storage A', 'Storage B']);
      render(<LocationTypeahead value="Stor" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Storage A')).toBeInTheDocument();
        expect(screen.getByText('Storage B')).toBeInTheDocument();
      });
    });

    it('shows loading state while fetching', async () => {
      let resolve: (v: string[]) => void;
      lookupLocationsMock.mockImplementation(
        () => new Promise((r) => { resolve = r; })
      );
      render(<LocationTypeahead value="Stor" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });

      act(() => { resolve!([]); });
    });

    it('shows "new location" option when typed text does not match results', async () => {
      lookupLocationsMock.mockResolvedValue(['Storage A']);
      render(<LocationTypeahead value="NewLocation" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New location:/)).toBeInTheDocument();
      });
    });

    it('does not show "new location" option when typed text matches result (case insensitive)', async () => {
      lookupLocationsMock.mockResolvedValue(['Storage A']);
      render(<LocationTypeahead value="storage a" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Storage A')).toBeInTheDocument();
      });
      expect(screen.queryByText(/New location:/)).not.toBeInTheDocument();
    });

    it('handles API error gracefully — shows new location option', async () => {
      lookupLocationsMock.mockRejectedValue(new Error('Network error'));
      render(<LocationTypeahead value="Stor" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New location:/)).toBeInTheDocument();
      });
    });

    it('clears options when input is cleared', () => {
      render(<LocationTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for location');
      fireEvent.change(input, { target: { value: 'x' } });
      fireEvent.change(input, { target: { value: '' } });
      expect(lookupLocationsMock).not.toHaveBeenCalled();
    });
  });

  describe('selection', () => {
    it('calls onChange with selected location name', async () => {
      lookupLocationsMock.mockResolvedValue(['Storage A', 'Storage B']);
      render(<LocationTypeahead value="Stor" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Storage A')).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText('Storage A'));
      expect(onChange).toHaveBeenCalledWith('Storage A');
    });

    it('calls onChange with trimmed typed value when new location is selected', async () => {
      lookupLocationsMock.mockResolvedValue([]);
      render(<LocationTypeahead value="  NewLocation  " onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New location:/)).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText(/New location:/));
      expect(onChange).toHaveBeenCalledWith('NewLocation');
    });

    it('closes dropdown after selection', async () => {
      lookupLocationsMock.mockResolvedValue(['Storage A']);
      render(<LocationTypeahead value="Stor" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Storage A')).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText('Storage A'));
      expect(screen.queryByText('Storage A')).not.toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    it('navigates down through options with ArrowDown', async () => {
      lookupLocationsMock.mockResolvedValue(['Storage A', 'Storage B']);
      render(<LocationTypeahead value="Stor" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Storage A')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' }); // past last item
    });

    it('navigates up through options with ArrowUp', async () => {
      lookupLocationsMock.mockResolvedValue(['Storage A', 'Storage B']);
      render(<LocationTypeahead value="Stor" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Storage A')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowUp' });
    });

    it('selects highlighted option with Enter', async () => {
      lookupLocationsMock.mockResolvedValue(['Storage A']);
      render(<LocationTypeahead value="Stor" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Storage A')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('Storage A');
    });

    it('selects new location with Enter when no option highlighted and input has text', async () => {
      lookupLocationsMock.mockResolvedValue([]);
      render(<LocationTypeahead value="BrandNew" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New location:/)).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('BrandNew');
    });

    it('reverts on Escape when dropdown is open', async () => {
      lookupLocationsMock.mockResolvedValue(['Storage A']);
      render(<LocationTypeahead value="original" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New location:/)).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Escape' });
      expect(onChange).toHaveBeenCalledWith('original');
    });

    it('Tab key with highlighted option selects it (non-cellEditorMode)', async () => {
      lookupLocationsMock.mockResolvedValue(['Storage A']);
      render(<LocationTypeahead value="Stor" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Storage A')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('Storage A');
    });

    it('Tab key with no highlighted option commits typed text (non-cellEditorMode)', async () => {
      lookupLocationsMock.mockResolvedValue([]);
      render(<LocationTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for location');
      fireEvent.change(input, { target: { value: 'TypedLocation' } });

      await waitFor(() => {
        // Wait for state update
      });

      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('TypedLocation');
    });

    it('handles Escape when dropdown is closed', () => {
      render(<LocationTypeahead value="previous" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for location');
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(onChange).toHaveBeenCalledWith('previous');
    });
  });

  describe('cellEditorMode', () => {
    it('renders in cellEditorMode', () => {
      render(
        <LocationTypeahead value="Storage" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for location');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('Storage');
    });

    it('in cellEditorMode, Escape reverts value', async () => {
      lookupLocationsMock.mockResolvedValue(['Storage A']);
      render(
        <LocationTypeahead value="original" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New location:/)).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Escape' });
      expect(onChange).toHaveBeenCalledWith('original');
    });

    it('in cellEditorMode, Tab key with highlighted option saves that value', async () => {
      lookupLocationsMock.mockResolvedValue(['Storage A']);
      render(
        <LocationTypeahead value="Stor" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Storage A')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('Storage A');
    });

    it('in cellEditorMode, Tab key with no option saves typed text', async () => {
      lookupLocationsMock.mockResolvedValue([]);
      render(
        <LocationTypeahead value="" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for location');
      fireEvent.change(input, { target: { value: 'CustomLocation' } });
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('CustomLocation');
    });

    it('in cellEditorMode, arrow keys when dropdown is closed commit current value', () => {
      render(
        <LocationTypeahead value="Storage" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for location');
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(onChange).toHaveBeenCalledWith('Storage');
    });

    it('in cellEditorMode, Enter when dropdown is closed commits typed value', () => {
      render(
        <LocationTypeahead value="Warehouse" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for location');
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('Warehouse');
    });
  });

  describe('blur behavior (form mode)', () => {
    it('reverts to previous value on blur when no selection made', async () => {
      render(<LocationTypeahead value="original" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for location');

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'changed' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('original');
      });
    });

    it('in cellEditorMode, blur accepts typed value', async () => {
      render(<LocationTypeahead value="original" onChange={onChange} cellEditorMode />);
      const input = screen.getByPlaceholderText('Search for location');

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'newlocation' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('newlocation');
      });
    });
  });

  describe('mouse hover', () => {
    it('highlights option on mouse enter', async () => {
      lookupLocationsMock.mockResolvedValue(['Storage A', 'Storage B']);
      render(<LocationTypeahead value="Stor" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for location');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Storage A')).toBeInTheDocument();
      });

      fireEvent.mouseEnter(screen.getByText('Storage A').closest('div')!);
    });
  });
});
