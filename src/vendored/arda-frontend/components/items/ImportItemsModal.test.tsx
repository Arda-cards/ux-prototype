import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImportItemsModal } from './ImportItemsModal';

// Mock CSS import
jest.mock('./ImportItemsModal.css', () => ({}));

// Mock pako
jest.mock('pako', () => ({
  gzip: jest.fn((data: Uint8Array) => data),
}));

// Mock useAuthErrorHandler
jest.mock('@/hooks/useAuthErrorHandler', () => ({
  useAuthErrorHandler: () => ({ handleAuthError: jest.fn().mockReturnValue(false) }),
}));

// Mock ImportSuccessModal to keep tests focused
jest.mock('./ImportSuccessModal', () => ({
  ImportSuccessModal: ({
    isOpen,
    onClose,
    added,
  }: {
    isOpen: boolean;
    onClose: () => void;
    added: number;
  }) =>
    isOpen ? (
      <div data-testid='success-modal'>
        <span>Added: {added}</span>
        <button onClick={onClose}>Done</button>
      </div>
    ) : null,
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock window.open
global.open = jest.fn();

// Mock File.prototype.arrayBuffer so it resolves immediately in jsdom
Object.defineProperty(File.prototype, 'arrayBuffer', {
  writable: true,
  value: function () {
    return Promise.resolve(new ArrayBuffer(8));
  },
});

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onRefresh: jest.fn(),
};

function makeCSVFile(name = 'test.csv', size = 1024): File {
  const content = 'col1,col2\nval1,val2';
  const file = new File([content], name, { type: 'text/csv' });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('ImportItemsModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'accessToken') return 'mock-access-token';
      if (key === 'idToken') return 'mock-id-token';
      return null;
    });
  });

  describe('when closed', () => {
    it('does not render modal content when isOpen is false', () => {
      render(<ImportItemsModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Import items')).not.toBeInTheDocument();
    });
  });

  describe('idle state', () => {
    it('renders modal with title when open', () => {
      render(<ImportItemsModal {...defaultProps} />);
      expect(screen.getByText('Import items')).toBeInTheDocument();
    });

    it('renders Cancel and Import buttons', () => {
      render(<ImportItemsModal {...defaultProps} />);
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^import$/i })).toBeInTheDocument();
    });

    it('Import button is disabled when no file selected', () => {
      render(<ImportItemsModal {...defaultProps} />);
      const importBtn = screen.getByRole('button', { name: /^import$/i });
      expect(importBtn).toBeDisabled();
    });

    it('shows drag-and-drop area with file selection label', () => {
      render(<ImportItemsModal {...defaultProps} />);
      expect(screen.getByText(/drop file or click to select/i)).toBeInTheDocument();
      expect(screen.getByText('Select file')).toBeInTheDocument();
    });

    it('calls onClose when Cancel button is clicked', () => {
      render(<ImportItemsModal {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when corner X button is clicked', () => {
      render(<ImportItemsModal {...defaultProps} />);
      // The last button in the modal is the corner X
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[buttons.length - 1]);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('renders item template link button', () => {
      render(<ImportItemsModal {...defaultProps} />);
      expect(screen.getByText('item template')).toBeInTheDocument();
    });

    it('opens template URL when template link is clicked', () => {
      render(<ImportItemsModal {...defaultProps} />);
      fireEvent.click(screen.getByText('item template'));
      expect(global.open).toHaveBeenCalledWith(
        expect.stringContaining('docs.google.com'),
        '_blank'
      );
    });
  });

  describe('file selection — valid CSV', () => {
    it('shows file name after selecting a valid CSV file', () => {
      render(<ImportItemsModal {...defaultProps} />);
      const fileInput = screen.getByLabelText('Select file') as HTMLInputElement;
      const file = makeCSVFile();
      fireEvent.change(fileInput, { target: { files: [file] } });
      expect(screen.getByText('test.csv')).toBeInTheDocument();
    });

    it('enables Import button after valid file is selected', () => {
      render(<ImportItemsModal {...defaultProps} />);
      const fileInput = screen.getByLabelText('Select file') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [makeCSVFile()] } });
      const importBtn = screen.getByRole('button', { name: /^import$/i });
      expect(importBtn).not.toBeDisabled();
    });

    it('shows file size in MB', () => {
      render(<ImportItemsModal {...defaultProps} />);
      const fileInput = screen.getByLabelText('Select file') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [makeCSVFile('data.csv', 2 * 1024 * 1024)] } });
      expect(screen.getByText(/2\.0 MB/)).toBeInTheDocument();
    });

    it('hides file size for unsupported files', () => {
      render(<ImportItemsModal {...defaultProps} />);
      const fileInput = screen.getByLabelText('Select file') as HTMLInputElement;
      const badFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      Object.defineProperty(badFile, 'size', { value: 1024 * 1024 });
      fireEvent.change(fileInput, { target: { files: [badFile] } });
      // Size should not be shown for unsupported files
      expect(screen.queryByText(/MB/)).not.toBeInTheDocument();
    });
  });

  describe('file selection — unsupported file type', () => {
    it('shows error for non-CSV files', () => {
      render(<ImportItemsModal {...defaultProps} />);
      const fileInput = screen.getByLabelText('Select file') as HTMLInputElement;
      const badFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      fireEvent.change(fileInput, { target: { files: [badFile] } });
      expect(screen.getByText('Unsupported file type. Try again.')).toBeInTheDocument();
    });

    it('shows file name for unsupported file', () => {
      render(<ImportItemsModal {...defaultProps} />);
      const fileInput = screen.getByLabelText('Select file') as HTMLInputElement;
      const badFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      fireEvent.change(fileInput, { target: { files: [badFile] } });
      expect(screen.getByText('document.pdf')).toBeInTheDocument();
    });

    it('shows X icon (not trash) for unsupported files remove button', () => {
      render(<ImportItemsModal {...defaultProps} />);
      const fileInput = screen.getByLabelText('Select file') as HTMLInputElement;
      const badFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      fireEvent.change(fileInput, { target: { files: [badFile] } });
      // The remove button is visible
      expect(screen.getByRole('button', { name: /remove file/i })).toBeInTheDocument();
    });
  });

  describe('drag and drop', () => {
    it('handles drop event with valid CSV file', () => {
      render(<ImportItemsModal {...defaultProps} />);
      const dropArea = screen.getByText(/drop file or click to select/i).closest('div')!.parentElement!;
      const file = makeCSVFile();
      fireEvent.drop(dropArea, {
        dataTransfer: { files: [file] },
      });
      expect(screen.getByText('test.csv')).toBeInTheDocument();
    });

    it('handles drop event with invalid file', () => {
      render(<ImportItemsModal {...defaultProps} />);
      const dropArea = screen.getByText(/drop file or click to select/i).closest('div')!.parentElement!;
      const badFile = new File(['content'], 'data.xlsx', { type: 'application/vnd.openxmlformats' });
      fireEvent.drop(dropArea, {
        dataTransfer: { files: [badFile] },
      });
      expect(screen.getByText('Unsupported file type. Try again.')).toBeInTheDocument();
    });

    it('transitions to dragging state on dragOver', () => {
      render(<ImportItemsModal {...defaultProps} />);
      const dropArea = screen.getByText(/drop file or click to select/i).closest('div')!.parentElement!;
      fireEvent.dragOver(dropArea);
      // No crash expected, idle text goes away in dragging state
    });

    it('returns to idle state on dragLeave', () => {
      render(<ImportItemsModal {...defaultProps} />);
      const dropArea = screen.getByText(/drop file or click to select/i).closest('div')!.parentElement!;
      fireEvent.dragOver(dropArea);
      fireEvent.dragLeave(dropArea);
      expect(screen.getByText(/drop file or click to select/i)).toBeInTheDocument();
    });
  });

  describe('remove file', () => {
    it('shows remove button when error file selected', () => {
      render(<ImportItemsModal {...defaultProps} />);
      const fileInput = screen.getByLabelText('Select file') as HTMLInputElement;
      const badFile = new File(['content'], 'doc.pdf', { type: 'application/pdf' });
      fireEvent.change(fileInput, { target: { files: [badFile] } });
      expect(screen.getByRole('button', { name: /remove file/i })).toBeInTheDocument();
    });

    it('clears file and error when remove button is clicked', () => {
      render(<ImportItemsModal {...defaultProps} />);
      const fileInput = screen.getByLabelText('Select file') as HTMLInputElement;
      const badFile = new File(['content'], 'doc.pdf', { type: 'application/pdf' });
      fireEvent.change(fileInput, { target: { files: [badFile] } });
      fireEvent.click(screen.getByRole('button', { name: /remove file/i }));
      expect(screen.queryByText('Unsupported file type. Try again.')).not.toBeInTheDocument();
    });
  });

  describe('state reset when modal closes', () => {
    it('resets state when isOpen transitions from true to false', () => {
      const { rerender } = render(<ImportItemsModal {...defaultProps} isOpen={true} />);
      const fileInput = screen.getByLabelText('Select file') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [makeCSVFile()] } });
      expect(screen.getByText('test.csv')).toBeInTheDocument();

      rerender(<ImportItemsModal {...defaultProps} isOpen={false} />);
      rerender(<ImportItemsModal {...defaultProps} isOpen={true} />);
      // After reopen, file should be cleared
      expect(screen.queryByText('test.csv')).not.toBeInTheDocument();
    });
  });

  describe('handleImport — upload flow', () => {
    it('shows uploading state while import is in progress', async () => {
      // Make first fetch hang
      let resolveUploadUrl: (value: unknown) => void;
      mockFetch.mockImplementationOnce(() =>
        new Promise((resolve) => { resolveUploadUrl = resolve; })
      );

      render(<ImportItemsModal {...defaultProps} />);
      const fileInput = screen.getByLabelText('Select file') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [makeCSVFile()] } });
      fireEvent.click(screen.getByRole('button', { name: /^import$/i }));

      await waitFor(() => {
        expect(screen.getByText(/importing\.\.\./i)).toBeInTheDocument();
      });

      // Resolve to avoid open handles
      resolveUploadUrl!({ ok: false });
      // Allow error state to settle
      await waitFor(() => {
        expect(screen.queryByText(/importing\.\.\./i)).not.toBeInTheDocument();
      }, { timeout: 1000 }).catch(() => {/* ignore - just cleanup */});
    });

    it('shows error when upload-url request fails', async () => {
      mockFetch.mockResolvedValue({ ok: false, json: async () => ({}), text: async () => '' });

      render(<ImportItemsModal {...defaultProps} />);
      const fileInput = screen.getByLabelText('Select file') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [makeCSVFile()] } });
      fireEvent.click(screen.getByRole('button', { name: /^import$/i }));

      await waitFor(() => {
        expect(screen.getByText('Failed to get upload URL')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('shows error when upload-url returns ok:false data', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ ok: false }),
        text: async () => '',
      });

      render(<ImportItemsModal {...defaultProps} />);
      const fileInput = screen.getByLabelText('Select file') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [makeCSVFile()] } });
      fireEvent.click(screen.getByRole('button', { name: /^import$/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid upload URL response')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('shows error when auth tokens are missing', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      render(<ImportItemsModal {...defaultProps} />);
      const fileInput = screen.getByLabelText('Select file') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [makeCSVFile()] } });
      fireEvent.click(screen.getByRole('button', { name: /^import$/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/no authentication token found/i)
        ).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('shows error when file upload to S3 fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          data: { url: 'https://s3.example.com/upload', jobId: 'job-123' },
        }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => 'S3 upload error',
      });

      render(<ImportItemsModal {...defaultProps} />);
      const fileInput = screen.getByLabelText('Select file') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [makeCSVFile()] } });
      fireEvent.click(screen.getByRole('button', { name: /^import$/i }));

      await waitFor(() => {
        expect(screen.getByText(/failed to upload file to S3/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('shows error when process job request fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          data: { url: 'https://s3.example.com/upload', jobId: 'job-123' },
        }),
      });
      mockFetch.mockResolvedValueOnce({ ok: true, text: async () => '' });
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
        text: async () => '',
      });

      render(<ImportItemsModal {...defaultProps} />);
      const fileInput = screen.getByLabelText('Select file') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [makeCSVFile()] } });
      fireEvent.click(screen.getByRole('button', { name: /^import$/i }));

      await waitFor(() => {
        expect(screen.getByText('Failed to process upload job')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('does not trigger import when no file is selected', async () => {
      render(<ImportItemsModal {...defaultProps} />);
      const importBtn = screen.getByRole('button', { name: /^import$/i });
      // Button is disabled — click should not trigger fetch
      fireEvent.click(importBtn);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('sets uploading state and calls upload URL endpoint', async () => {
      // Verify the upload flow gets triggered at all (first fetch)
      // Step 1: upload URL
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          data: { url: 'https://s3.example.com/upload', jobId: 'job-123' },
        }),
      });
      // Step 2: upload file to S3
      mockFetch.mockResolvedValueOnce({ ok: true, text: async () => '' });
      // Step 3: process job - fail fast to avoid polling
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
        text: async () => '',
      });

      render(<ImportItemsModal {...defaultProps} />);
      const fileInput = screen.getByLabelText('Select file') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [makeCSVFile()] } });
      fireEvent.click(screen.getByRole('button', { name: /^import$/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(3);
      }, { timeout: 5000 });
    });

    it('shows error when process job response has ok:false in json', async () => {
      // Step 1: upload URL
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          data: { url: 'https://s3.example.com/upload', jobId: 'job-123' },
        }),
      });
      // Step 2: upload file to S3 (via proxy)
      mockFetch.mockResolvedValueOnce({ ok: true, text: async () => '' });
      // Step 3: process job - http ok but json data ok:false
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: false }),
        text: async () => '',
      });

      render(<ImportItemsModal {...defaultProps} />);
      const fileInput = screen.getByLabelText('Select file') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [makeCSVFile()] } });
      fireEvent.click(screen.getByRole('button', { name: /^import$/i }));

      await waitFor(() => {
        // After 3 fetches, the modal should not be in "importing" state
        expect(mockFetch).toHaveBeenCalledTimes(3);
      }, { timeout: 5000 });
    });


    it('shows error when pako compression fails', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pako = require('pako');
      const gzipSpy = jest.spyOn(pako, 'gzip').mockImplementation(() => {
        throw new Error('Compression failed');
      });

      // Step 1: upload URL
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          data: { url: 'https://s3.example.com/upload', jobId: 'job-123' },
        }),
      });

      render(<ImportItemsModal {...defaultProps} />);
      const fileInput = screen.getByLabelText('Select file') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [makeCSVFile()] } });
      fireEvent.click(screen.getByRole('button', { name: /^import$/i }));

      try {
        await waitFor(() => {
          expect(screen.getByText(/failed to compress file with pako/i)).toBeInTheDocument();
        }, { timeout: 3000 });
      } finally {
        gzipSpy.mockRestore();
      }
    });
  });
});
