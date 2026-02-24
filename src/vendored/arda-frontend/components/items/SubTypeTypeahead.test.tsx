import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { SubTypeTypeahead } from './SubTypeTypeahead';
import { lookupSubtypes } from '@frontend/lib/ardaClient';

jest.mock('@/lib/ardaClient', () => ({
  lookupSubtypes: jest.fn(),
}));

const lookupSubtypesMock = lookupSubtypes as jest.Mock;

describe('SubTypeTypeahead', () => {
  const onChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    lookupSubtypesMock.mockResolvedValue([]);
  });

  describe('initial render', () => {
    it('renders with value and placeholder', () => {
      render(
        <SubTypeTypeahead
          value="Consumable"
          onChange={onChange}
          placeholder="Search for sub-type"
        />
      );
      const input = screen.getByPlaceholderText('Search for sub-type');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('Consumable');
    });

    it('renders with custom placeholder', () => {
      render(
        <SubTypeTypeahead value="" onChange={onChange} placeholder="Find a sub-type" />
      );
      expect(screen.getByPlaceholderText('Find a sub-type')).toBeInTheDocument();
    });

    it('renders with empty initial value', () => {
      render(<SubTypeTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-type');
      expect(input).toHaveValue('');
    });

    it('renders disabled state', () => {
      render(<SubTypeTypeahead value="Consumable" onChange={onChange} disabled />);
      const input = screen.getByPlaceholderText('Search for sub-type');
      expect(input).toBeDisabled();
    });

    it('updates input when value prop changes', () => {
      const { rerender } = render(
        <SubTypeTypeahead value="Consumable" onChange={onChange} />
      );
      const input = screen.getByPlaceholderText('Search for sub-type');
      expect(input).toHaveValue('Consumable');

      rerender(<SubTypeTypeahead value="Equipment" onChange={onChange} />);
      expect(input).toHaveValue('Equipment');
    });
  });

  describe('focus behavior', () => {
    it('does not call lookupSubtypes when input is empty on focus', () => {
      render(<SubTypeTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-type');
      fireEvent.focus(input);
      expect(lookupSubtypesMock).not.toHaveBeenCalled();
    });

    it('calls lookupSubtypes when input has value on focus', async () => {
      render(<SubTypeTypeahead value="Sub" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-type');
      fireEvent.focus(input);
      expect(lookupSubtypesMock).toHaveBeenCalledWith('Sub');
    });

    it('does not call lookupSubtypes on focus when value is only whitespace', () => {
      render(<SubTypeTypeahead value="   " onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-type');
      fireEvent.focus(input);
      expect(lookupSubtypesMock).not.toHaveBeenCalled();
    });
  });

  describe('search and results', () => {
    it('shows results when sub-types are found', async () => {
      lookupSubtypesMock.mockResolvedValue(['Consumable', 'Consumable Extra']);
      render(<SubTypeTypeahead value="Con" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Consumable')).toBeInTheDocument();
        expect(screen.getByText('Consumable Extra')).toBeInTheDocument();
      });
    });

    it('shows loading state while fetching', async () => {
      let resolve: (v: string[]) => void;
      lookupSubtypesMock.mockImplementation(
        () => new Promise((r) => { resolve = r; })
      );
      render(<SubTypeTypeahead value="Con" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });

      act(() => { resolve!([]); });
    });

    it('shows "new sub-type" option when typed text does not match results', async () => {
      lookupSubtypesMock.mockResolvedValue(['Consumable']);
      render(<SubTypeTypeahead value="NewType" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New sub-type:/)).toBeInTheDocument();
      });
    });

    it('does not show "new sub-type" option when typed text matches result (case insensitive)', async () => {
      lookupSubtypesMock.mockResolvedValue(['Consumable']);
      render(<SubTypeTypeahead value="CONSUMABLE" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Consumable')).toBeInTheDocument();
      });
      expect(screen.queryByText(/New sub-type:/)).not.toBeInTheDocument();
    });

    it('handles API error gracefully — shows new sub-type option', async () => {
      lookupSubtypesMock.mockRejectedValue(new Error('Network error'));
      render(<SubTypeTypeahead value="Con" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New sub-type:/)).toBeInTheDocument();
      });
    });

    it('clears options when input is cleared', () => {
      render(<SubTypeTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-type');
      fireEvent.change(input, { target: { value: 'x' } });
      fireEvent.change(input, { target: { value: '' } });
      expect(lookupSubtypesMock).not.toHaveBeenCalled();
    });
  });

  describe('selection', () => {
    it('calls onChange with selected sub-type name', async () => {
      lookupSubtypesMock.mockResolvedValue(['Consumable', 'Consumable Extra']);
      render(<SubTypeTypeahead value="Con" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Consumable')).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText('Consumable'));
      expect(onChange).toHaveBeenCalledWith('Consumable');
    });

    it('calls onChange with trimmed typed value when new sub-type is selected', async () => {
      lookupSubtypesMock.mockResolvedValue([]);
      render(<SubTypeTypeahead value="  NewType  " onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New sub-type:/)).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText(/New sub-type:/));
      expect(onChange).toHaveBeenCalledWith('NewType');
    });

    it('closes dropdown after selection', async () => {
      lookupSubtypesMock.mockResolvedValue(['Consumable']);
      render(<SubTypeTypeahead value="Con" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Consumable')).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText('Consumable'));
      expect(screen.queryByText('Consumable')).not.toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    it('navigates down through options with ArrowDown', async () => {
      lookupSubtypesMock.mockResolvedValue(['Consumable', 'Consumable Extra']);
      render(<SubTypeTypeahead value="Con" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Consumable')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' }); // past last item
    });

    it('navigates up through options with ArrowUp', async () => {
      lookupSubtypesMock.mockResolvedValue(['Consumable', 'Consumable Extra']);
      render(<SubTypeTypeahead value="Con" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Consumable')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowUp' });
    });

    it('selects highlighted option with Enter', async () => {
      lookupSubtypesMock.mockResolvedValue(['Consumable']);
      render(<SubTypeTypeahead value="Con" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Consumable')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('Consumable');
    });

    it('selects new sub-type with Enter when no option highlighted and input has text', async () => {
      lookupSubtypesMock.mockResolvedValue([]);
      render(<SubTypeTypeahead value="BrandNew" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New sub-type:/)).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('BrandNew');
    });

    it('reverts on Escape when dropdown is open', async () => {
      lookupSubtypesMock.mockResolvedValue(['Consumable']);
      render(<SubTypeTypeahead value="original" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New sub-type:/)).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Escape' });
      expect(onChange).toHaveBeenCalledWith('original');
    });

    it('Tab key with highlighted option selects it (non-cellEditorMode)', async () => {
      lookupSubtypesMock.mockResolvedValue(['Consumable']);
      render(<SubTypeTypeahead value="Con" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Consumable')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('Consumable');
    });

    it('Tab key with no highlighted option commits typed text (non-cellEditorMode)', async () => {
      lookupSubtypesMock.mockResolvedValue([]);
      render(<SubTypeTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-type');
      fireEvent.change(input, { target: { value: 'TypedType' } });

      await waitFor(() => {
        // Wait for state update
      });

      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('TypedType');
    });

    it('handles Escape when dropdown is closed', () => {
      render(<SubTypeTypeahead value="previous" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-type');
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(onChange).toHaveBeenCalledWith('previous');
    });
  });

  describe('cellEditorMode', () => {
    it('renders in cellEditorMode', () => {
      render(
        <SubTypeTypeahead value="Consumable" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for sub-type');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('Consumable');
    });

    it('in cellEditorMode, Escape reverts value', async () => {
      lookupSubtypesMock.mockResolvedValue(['Consumable']);
      render(
        <SubTypeTypeahead value="original" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for sub-type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New sub-type:/)).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Escape' });
      expect(onChange).toHaveBeenCalledWith('original');
    });

    it('in cellEditorMode, Tab key with highlighted option saves that value', async () => {
      lookupSubtypesMock.mockResolvedValue(['Consumable']);
      render(
        <SubTypeTypeahead value="Con" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for sub-type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Consumable')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('Consumable');
    });

    it('in cellEditorMode, Tab key with no option saves typed text', async () => {
      lookupSubtypesMock.mockResolvedValue([]);
      render(
        <SubTypeTypeahead value="" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for sub-type');
      fireEvent.change(input, { target: { value: 'CustomType' } });
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('CustomType');
    });

    it('in cellEditorMode, arrow keys when dropdown is closed commit current value', () => {
      render(
        <SubTypeTypeahead value="Consumable" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for sub-type');
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(onChange).toHaveBeenCalledWith('Consumable');
    });

    it('in cellEditorMode, Enter when dropdown is closed commits typed value', () => {
      render(
        <SubTypeTypeahead value="Equipment" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for sub-type');
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('Equipment');
    });
  });

  describe('blur behavior (form mode)', () => {
    it('reverts to previous value on blur when no selection made', async () => {
      render(<SubTypeTypeahead value="original" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-type');

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'changed' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('original');
      });
    });

    it('in cellEditorMode, blur accepts typed value', async () => {
      render(<SubTypeTypeahead value="original" onChange={onChange} cellEditorMode />);
      const input = screen.getByPlaceholderText('Search for sub-type');

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'newtype' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('newtype');
      });
    });
  });

  describe('mouse hover', () => {
    it('highlights option on mouse enter', async () => {
      lookupSubtypesMock.mockResolvedValue(['Consumable', 'Consumable Extra']);
      render(<SubTypeTypeahead value="Con" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for sub-type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Consumable')).toBeInTheDocument();
      });

      fireEvent.mouseEnter(screen.getByText('Consumable').closest('div')!);
    });
  });

  describe('click outside', () => {
    it('closes dropdown on click outside in form mode', async () => {
      lookupSubtypesMock.mockResolvedValue(['Consumable']);
      render(
        <div>
          <SubTypeTypeahead value="Con" onChange={onChange} />
          <div data-testid="outside">outside</div>
        </div>
      );
      const input = screen.getByPlaceholderText('Search for sub-type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Consumable')).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByTestId('outside'));
      await waitFor(() => {
        expect(screen.queryByText('Consumable')).not.toBeInTheDocument();
      });
    });
  });
});
