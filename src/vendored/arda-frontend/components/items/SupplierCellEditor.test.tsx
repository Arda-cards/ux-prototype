import { SupplierCellEditor } from './SupplierCellEditor';
import type { ICellEditorParams } from 'ag-grid-community';

// Mock React DOM's createRoot so we don't need a full browser environment
jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({
    render: jest.fn(),
    unmount: jest.fn(),
  })),
}));

// Mock SupplierTypeahead - the cell editor hosts it via React
jest.mock('./SupplierTypeahead', () => ({
  SupplierTypeahead: jest.fn(() => null),
}));

function makeParams(overrides: Partial<ICellEditorParams> = {}): ICellEditorParams {
  return {
    value: 'Acme Corp',
    stopEditing: jest.fn(),
    eGridCell: document.createElement('div'),
    column: {} as ICellEditorParams['column'],
    colDef: {} as ICellEditorParams['colDef'],
    node: {} as ICellEditorParams['node'],
    data: {},
    rowIndex: 0,
    api: {} as ICellEditorParams['api'],
    context: {},
    ...overrides,
  } as unknown as ICellEditorParams;
}

describe('SupplierCellEditor', () => {
  let editor: SupplierCellEditor;

  beforeEach(() => {
    jest.clearAllMocks();
    editor = new SupplierCellEditor();
  });

  describe('init', () => {
    it('creates a GUI element', () => {
      const params = makeParams({ value: 'Acme Corp' });
      editor.init(params);
      const gui = editor.getGui();
      expect(gui).toBeInstanceOf(HTMLDivElement);
    });

    it('sets className on the GUI element', () => {
      const params = makeParams({ value: 'Test Supplier' });
      editor.init(params);
      const gui = editor.getGui();
      expect(gui.className).toBe('ag-cell-edit-supplier');
    });

    it('initializes committedValue from params.value', () => {
      const params = makeParams({ value: 'Initial Supplier' });
      editor.init(params);
      // Inject input to test getValue
      const input = document.createElement('input');
      input.value = 'Initial Supplier';
      editor.getGui().appendChild(input);
      expect(editor.getValue()).toBe('Initial Supplier');
    });

    it('handles null/undefined value gracefully', () => {
      const params = makeParams({ value: null });
      editor.init(params);
      const gui = editor.getGui();
      expect(gui).toBeInstanceOf(HTMLDivElement);
    });

    it('initializes wasCancelled to false', () => {
      const params = makeParams({ value: 'Acme' });
      editor.init(params);
      expect(editor.isCancelAfterEnd()).toBe(false);
    });
  });

  describe('getGui', () => {
    it('returns the GUI element after init', () => {
      const params = makeParams();
      editor.init(params);
      const gui = editor.getGui();
      expect(gui).toBeInstanceOf(HTMLDivElement);
    });

    it('returns a fallback div when called before init', () => {
      const gui = editor.getGui();
      expect(gui).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('getValue', () => {
    it('returns committed value when no input element present', () => {
      const params = makeParams({ value: 'Acme Corp' });
      editor.init(params);
      expect(editor.getValue()).toBe('Acme Corp');
    });

    it('reads value from input element when present', () => {
      const params = makeParams({ value: 'Old Value' });
      editor.init(params);
      const input = document.createElement('input');
      input.value = '  New Value  ';
      editor.getGui().appendChild(input);
      expect(editor.getValue()).toBe('New Value');
    });

    it('trims whitespace from input value', () => {
      const params = makeParams({ value: '' });
      editor.init(params);
      const input = document.createElement('input');
      input.value = '   Padded Supplier   ';
      editor.getGui().appendChild(input);
      expect(editor.getValue()).toBe('Padded Supplier');
    });
  });

  describe('isCancelBeforeStart', () => {
    it('always returns false', () => {
      expect(editor.isCancelBeforeStart()).toBe(false);
      const params = makeParams();
      editor.init(params);
      expect(editor.isCancelBeforeStart()).toBe(false);
    });
  });

  describe('isCancelAfterEnd', () => {
    it('returns false before any init', () => {
      expect(editor.isCancelAfterEnd()).toBe(false);
    });

    it('returns false after normal init', () => {
      const params = makeParams({ value: 'Acme' });
      editor.init(params);
      expect(editor.isCancelAfterEnd()).toBe(false);
    });

    it('returns true after Escape key is pressed on the GUI', () => {
      const params = makeParams({ value: 'Acme' });
      editor.init(params);
      const gui = editor.getGui();

      const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      gui.dispatchEvent(escEvent);

      expect(editor.isCancelAfterEnd()).toBe(true);
    });

    it('calls stopEditing(true) when Escape is pressed', () => {
      const stopEditing = jest.fn();
      const params = makeParams({ value: 'Acme', stopEditing });
      editor.init(params);
      const gui = editor.getGui();

      const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      gui.dispatchEvent(escEvent);

      expect(stopEditing).toHaveBeenCalledWith(true);
    });

    it('marks wasCancelled and calls stopEditing when Escape is pressed', () => {
      const stopEditing = jest.fn();
      const params = makeParams({ value: 'Initial Supplier', stopEditing });
      editor.init(params);
      const gui = editor.getGui();

      const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      gui.dispatchEvent(escEvent);

      expect(editor.isCancelAfterEnd()).toBe(true);
      expect(stopEditing).toHaveBeenCalledWith(true);
    });

    it('other keys do not cancel editing', () => {
      const params = makeParams({ value: 'Acme' });
      editor.init(params);
      const gui = editor.getGui();

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      gui.dispatchEvent(enterEvent);

      expect(editor.isCancelAfterEnd()).toBe(false);
    });
  });

  describe('focusIn', () => {
    it('focuses the input when called', () => {
      jest.useFakeTimers();
      const params = makeParams({ value: 'Acme' });
      editor.init(params);
      const gui = editor.getGui();

      const input = document.createElement('input');
      const focusSpy = jest.spyOn(input, 'focus');
      gui.appendChild(input);

      editor.focusIn();
      jest.runAllTimers();

      expect(focusSpy).toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('does not throw when no input is present', () => {
      const params = makeParams({ value: 'Acme' });
      editor.init(params);
      expect(() => editor.focusIn()).not.toThrow();
    });
  });

  describe('focusOut', () => {
    it('updates committedValue from input on focusOut (not cancelled)', () => {
      const params = makeParams({ value: 'Initial' });
      editor.init(params);
      const gui = editor.getGui();

      const input = document.createElement('input');
      input.value = 'Updated Supplier';
      gui.appendChild(input);

      editor.focusOut();
      expect(editor.getValue()).toBe('Updated Supplier');
    });

    it('does not update committedValue when cancelled (focusOut skips update)', () => {
      const stopEditing = jest.fn();
      const params = makeParams({ value: 'Initial Supplier', stopEditing });
      editor.init(params);
      const gui = editor.getGui();

      // Press Escape to cancel — sets wasCancelled=true, committedValue=initialValue
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      gui.dispatchEvent(escEvent);

      // focusOut with no input attached — wasCancelled skips the update block
      editor.focusOut();
      // committedValue was set to initialValue by keydown, getValue with no input returns it
      expect(editor.getValue()).toBe('Initial Supplier');
    });

    it('does not throw when no input is present', () => {
      const params = makeParams({ value: 'Acme' });
      editor.init(params);
      expect(() => editor.focusOut()).not.toThrow();
    });
  });

  describe('afterGuiAttached', () => {
    it('focuses and selects input text', () => {
      jest.useFakeTimers();
      const params = makeParams({ value: 'Acme' });
      editor.init(params);
      const gui = editor.getGui();

      const input = document.createElement('input');
      const focusSpy = jest.spyOn(input, 'focus');
      const selectSpy = jest.spyOn(input, 'select');
      gui.appendChild(input);

      editor.afterGuiAttached();
      jest.runAllTimers();

      expect(focusSpy).toHaveBeenCalled();
      expect(selectSpy).toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('does not throw when no input is present', () => {
      const params = makeParams({ value: 'Acme' });
      editor.init(params);
      expect(() => editor.afterGuiAttached()).not.toThrow();
    });
  });

  describe('destroy', () => {
    it('removes keydown event listener on destroy', () => {
      const params = makeParams({ value: 'Acme' });
      editor.init(params);
      const gui = editor.getGui();
      const removeListenerSpy = jest.spyOn(gui, 'removeEventListener');

      editor.destroy();
      expect(removeListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('resets wasCancelled to false on destroy', () => {
      const stopEditing = jest.fn();
      const params = makeParams({ value: 'Acme', stopEditing });
      editor.init(params);
      const gui = editor.getGui();

      // Cancel
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      gui.dispatchEvent(escEvent);
      expect(editor.isCancelAfterEnd()).toBe(true);

      editor.destroy();
      // After destroy, isCancelAfterEnd uses wasCancelled which was reset to false
      expect(editor.isCancelAfterEnd()).toBe(false);
    });

    it('getGui returns fallback div after destroy', () => {
      const params = makeParams({ value: 'Acme' });
      editor.init(params);
      editor.destroy();
      const gui = editor.getGui();
      expect(gui).toBeInstanceOf(HTMLDivElement);
    });

    it('does not throw when destroyed multiple times', () => {
      const params = makeParams({ value: 'Acme' });
      editor.init(params);
      expect(() => {
        editor.destroy();
        editor.destroy();
      }).not.toThrow();
    });
  });
});
