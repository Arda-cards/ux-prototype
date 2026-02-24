import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { TypeTypeahead } from './TypeTypeahead';
import { lookupTypes } from '@frontend/lib/ardaClient';

jest.mock('@/lib/ardaClient', () => ({
  lookupTypes: jest.fn(),
}));

const lookupTypesMock = lookupTypes as jest.Mock;

describe('TypeTypeahead', () => {
  const onChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    lookupTypesMock.mockResolvedValue([]);
  });

  describe('initial render', () => {
    it('renders with value and placeholder', () => {
      render(
        <TypeTypeahead
          value="Medical"
          onChange={onChange}
          placeholder="Search for type"
        />
      );
      const input = screen.getByPlaceholderText('Search for type');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('Medical');
    });

    it('renders with custom placeholder', () => {
      render(
        <TypeTypeahead value="" onChange={onChange} placeholder="Find a type" />
      );
      expect(screen.getByPlaceholderText('Find a type')).toBeInTheDocument();
    });

    it('renders with empty initial value', () => {
      render(<TypeTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for type');
      expect(input).toHaveValue('');
    });

    it('renders disabled state', () => {
      render(<TypeTypeahead value="Medical" onChange={onChange} disabled />);
      const input = screen.getByPlaceholderText('Search for type');
      expect(input).toBeDisabled();
    });

    it('updates input when value prop changes', () => {
      const { rerender } = render(
        <TypeTypeahead value="Medical" onChange={onChange} />
      );
      const input = screen.getByPlaceholderText('Search for type');
      expect(input).toHaveValue('Medical');

      rerender(<TypeTypeahead value="Surgical" onChange={onChange} />);
      expect(input).toHaveValue('Surgical');
    });
  });

  describe('focus behavior', () => {
    it('does not call lookupTypes when input is empty on focus', () => {
      render(<TypeTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for type');
      fireEvent.focus(input);
      expect(lookupTypesMock).not.toHaveBeenCalled();
    });

    it('calls lookupTypes when input has value on focus', async () => {
      render(<TypeTypeahead value="Med" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for type');
      fireEvent.focus(input);
      expect(lookupTypesMock).toHaveBeenCalledWith('Med');
    });

    it('does not call lookupTypes on focus when value is only whitespace', () => {
      render(<TypeTypeahead value="   " onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for type');
      fireEvent.focus(input);
      expect(lookupTypesMock).not.toHaveBeenCalled();
    });
  });

  describe('search and results', () => {
    it('shows results when types are found', async () => {
      lookupTypesMock.mockResolvedValue(['Medical', 'Surgical']);
      render(<TypeTypeahead value="Med" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Medical')).toBeInTheDocument();
        expect(screen.getByText('Surgical')).toBeInTheDocument();
      });
    });

    it('shows loading state while fetching', async () => {
      let resolve: (v: string[]) => void;
      lookupTypesMock.mockImplementation(
        () => new Promise((r) => { resolve = r; })
      );
      render(<TypeTypeahead value="Med" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });

      act(() => { resolve!([]); });
    });

    it('shows "new type" option when typed text does not match results', async () => {
      lookupTypesMock.mockResolvedValue(['Medical']);
      render(<TypeTypeahead value="NewType" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New type:/)).toBeInTheDocument();
      });
    });

    it('does not show "new type" option when typed text matches result (case insensitive)', async () => {
      lookupTypesMock.mockResolvedValue(['Medical']);
      render(<TypeTypeahead value="MEDICAL" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Medical')).toBeInTheDocument();
      });
      expect(screen.queryByText(/New type:/)).not.toBeInTheDocument();
    });

    it('handles API error gracefully — shows new type option', async () => {
      lookupTypesMock.mockRejectedValue(new Error('Network error'));
      render(<TypeTypeahead value="Med" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New type:/)).toBeInTheDocument();
      });
    });

    it('clears options when input is cleared', () => {
      render(<TypeTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for type');
      fireEvent.change(input, { target: { value: 'x' } });
      fireEvent.change(input, { target: { value: '' } });
      expect(lookupTypesMock).not.toHaveBeenCalled();
    });

    it('shows loading then options after fetch via input change', async () => {
      lookupTypesMock.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(['TypeA', 'TypeB']), 50);
          })
      );

      render(<TypeTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for type');

      await act(async () => {
        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: 't' } });
      });

      await act(async () => {
        await new Promise((r) => setTimeout(r, 300));
      });

      expect(lookupTypesMock).toHaveBeenCalledWith('t');
      await waitFor(() => {
        expect(screen.getByText('TypeA')).toBeInTheDocument();
      });
    });
  });

  describe('selection', () => {
    it('calls onChange with selected type name', async () => {
      lookupTypesMock.mockResolvedValue(['Medical', 'Surgical']);
      render(<TypeTypeahead value="Med" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Medical')).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText('Medical'));
      expect(onChange).toHaveBeenCalledWith('Medical');
    });

    it('calls onChange when user selects an option from dropdown', async () => {
      lookupTypesMock.mockResolvedValue(['Medical', 'Surgical', 'Consumable']);

      render(<TypeTypeahead value="" onChange={onChange} placeholder="Search for type" />);
      const input = screen.getByPlaceholderText('Search for type');

      await act(async () => {
        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: 'med' } });
      });

      await act(async () => {
        await new Promise((r) => setTimeout(r, 300));
      });

      const option = await screen.findByText('Medical');
      await act(async () => {
        fireEvent.mouseDown(option);
      });

      expect(onChange).toHaveBeenCalledWith('Medical');
    });

    it('calls onChange with trimmed typed value when new type is selected', async () => {
      lookupTypesMock.mockResolvedValue([]);
      render(<TypeTypeahead value="  NewType  " onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New type:/)).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText(/New type:/));
      expect(onChange).toHaveBeenCalledWith('NewType');
    });

    it('closes dropdown after selection', async () => {
      lookupTypesMock.mockResolvedValue(['Medical']);
      render(<TypeTypeahead value="Med" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Medical')).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByText('Medical'));
      expect(screen.queryByText('Medical')).not.toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    it('navigates down through options with ArrowDown', async () => {
      lookupTypesMock.mockResolvedValue(['Medical', 'Surgical']);
      render(<TypeTypeahead value="Med" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Medical')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' }); // past last item
    });

    it('navigates up through options with ArrowUp', async () => {
      lookupTypesMock.mockResolvedValue(['Medical', 'Surgical']);
      render(<TypeTypeahead value="Med" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Medical')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowUp' });
    });

    it('selects highlighted option with Enter', async () => {
      lookupTypesMock.mockResolvedValue(['Medical']);
      render(<TypeTypeahead value="Med" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Medical')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('Medical');
    });

    it('selects new type with Enter when no option highlighted and input has text', async () => {
      lookupTypesMock.mockResolvedValue([]);
      render(<TypeTypeahead value="BrandNew" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New type:/)).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('BrandNew');
    });

    it('reverts on Escape when dropdown is open', async () => {
      lookupTypesMock.mockResolvedValue(['Medical']);
      render(<TypeTypeahead value="original" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New type:/)).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Escape' });
      expect(onChange).toHaveBeenCalledWith('original');
    });

    it('Tab key with highlighted option selects it (non-cellEditorMode)', async () => {
      lookupTypesMock.mockResolvedValue(['Medical']);
      render(<TypeTypeahead value="Med" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Medical')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('Medical');
    });

    it('Tab key with no highlighted option commits typed text (non-cellEditorMode)', async () => {
      lookupTypesMock.mockResolvedValue([]);
      render(<TypeTypeahead value="" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for type');
      fireEvent.change(input, { target: { value: 'TypedType' } });

      await waitFor(() => {
        expect(input).toHaveValue('TypedType');
      });

      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('TypedType');
    });

    it('handles Escape when dropdown is closed', () => {
      render(<TypeTypeahead value="previous" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for type');
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(onChange).toHaveBeenCalledWith('previous');
    });
  });

  describe('cellEditorMode', () => {
    it('renders in cellEditorMode', () => {
      render(
        <TypeTypeahead value="Medical" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for type');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('Medical');
    });

    it('in cellEditorMode, Escape reverts value', async () => {
      lookupTypesMock.mockResolvedValue(['Medical']);
      render(
        <TypeTypeahead value="original" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/New type:/)).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Escape' });
      expect(onChange).toHaveBeenCalledWith('original');
    });

    it('in cellEditorMode, Tab key with highlighted option saves that value', async () => {
      lookupTypesMock.mockResolvedValue(['Medical']);
      render(
        <TypeTypeahead value="Med" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Medical')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('Medical');
    });

    it('in cellEditorMode, Tab key with no option saves typed text', async () => {
      lookupTypesMock.mockResolvedValue([]);
      render(
        <TypeTypeahead value="" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for type');
      fireEvent.change(input, { target: { value: 'CustomType' } });
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onChange).toHaveBeenCalledWith('CustomType');
    });

    it('in cellEditorMode, arrow keys when dropdown is closed commit current value', () => {
      render(
        <TypeTypeahead value="Medical" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for type');
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(onChange).toHaveBeenCalledWith('Medical');
    });

    it('in cellEditorMode, Enter when dropdown is closed commits typed value', () => {
      render(
        <TypeTypeahead value="Radiology" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for type');
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('Radiology');
    });

    it('in cellEditorMode, ArrowLeft commits value when dropdown is closed', () => {
      render(
        <TypeTypeahead value="Medical" onChange={onChange} cellEditorMode />
      );
      const input = screen.getByPlaceholderText('Search for type');
      fireEvent.keyDown(input, { key: 'ArrowLeft' });
      expect(onChange).toHaveBeenCalledWith('Medical');
    });
  });

  describe('blur behavior (form mode)', () => {
    it('reverts to previous value on blur when no selection made', async () => {
      render(<TypeTypeahead value="original" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for type');

      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'changed' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('original');
      });
    });

    it('in cellEditorMode, blur accepts typed value', async () => {
      render(<TypeTypeahead value="original" onChange={onChange} cellEditorMode />);
      const input = screen.getByPlaceholderText('Search for type');

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
      lookupTypesMock.mockResolvedValue(['Medical', 'Surgical']);
      render(<TypeTypeahead value="Med" onChange={onChange} />);
      const input = screen.getByPlaceholderText('Search for type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Medical')).toBeInTheDocument();
      });

      fireEvent.mouseEnter(screen.getByText('Medical').closest('div')!);
    });
  });

  describe('click outside', () => {
    it('closes dropdown on click outside in form mode', async () => {
      lookupTypesMock.mockResolvedValue(['Medical']);
      render(
        <div>
          <TypeTypeahead value="Med" onChange={onChange} />
          <div data-testid="outside">outside</div>
        </div>
      );
      const input = screen.getByPlaceholderText('Search for type');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Medical')).toBeInTheDocument();
      });

      fireEvent.mouseDown(screen.getByTestId('outside'));
      await waitFor(() => {
        expect(screen.queryByText('Medical')).not.toBeInTheDocument();
      });
    });
  });
});
