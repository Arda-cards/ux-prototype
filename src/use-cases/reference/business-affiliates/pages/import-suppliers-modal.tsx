/**
 * Import Suppliers Modal — file upload dialog for bulk supplier import.
 *
 * Follows the same visual pattern as the Items ImportItemsModal.
 * Uses a simulated upload since there is no real supplier import API yet.
 */
import React, { useState, useCallback, useEffect } from 'react';
import { FileText, Trash2, FileUp, X, PlusCircle } from 'lucide-react';

type ImportState = 'idle' | 'dragging' | 'uploading' | 'error' | 'success';

interface ImportSuppliersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportSuppliersModal({ isOpen, onClose }: ImportSuppliersModalProps) {
  const [state, setState] = useState<ImportState>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [addedCount, setAddedCount] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setState('idle');
      setFile(null);
      setErrorMessage('');
      setUploadProgress(0);
      setAddedCount(0);
    }
  }, [isOpen]);

  const isUnsupportedFile =
    file !== null && file.type !== 'text/csv' && !file.name.endsWith('.csv');

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setErrorMessage('Unsupported file type. Try again.');
      setState('error');
      setFile(selectedFile);
      return;
    }
    setFile(selectedFile);
    setState('idle');
    setErrorMessage('');
    setUploadProgress(0);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState('dragging');
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState('idle');
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setState('idle');
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFileSelect(droppedFile);
    },
    [handleFileSelect],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) handleFileSelect(selectedFile);
    },
    [handleFileSelect],
  );

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setState('idle');
    setUploadProgress(0);
    setErrorMessage('');
  }, []);

  const handleImport = useCallback(() => {
    if (!file) return;
    setState('uploading');
    setErrorMessage('');
    setUploadProgress(0);

    // Simulated upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(Math.min(progress, 100));
      if (progress >= 100) {
        clearInterval(interval);
        setState('success');
        setAddedCount(Math.floor(Math.random() * 10) + 3);
      }
    }, 400);
  }, [file]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 min-h-screen"
      onClick={handleBackdropClick}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '32px 24px',
          background: 'var(--base-background, white)',
          boxShadow: '0px 4px 6px -4px rgba(0, 0, 0, 0.10)',
          borderRadius: '10px',
          border: '1px solid var(--base-border, #E5E5E5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          position: 'relative',
        }}
      >
        {/* Header */}
        {state === 'success' ? (
          <div className="flex flex-col items-center gap-1 text-center py-6">
            <h2 style={{ fontSize: 20, fontWeight: 600 }}>Success!</h2>
            <p style={{ fontSize: 14, color: '#737373' }}>
              All set &mdash; your upload&apos;s in the bag. Here&apos;s what happened:
            </p>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Import suppliers</h2>
            <p style={{ fontSize: 14, color: '#737373' }}>
              You can create a batch of suppliers at once by importing a .CSV file. Fill out a CSV
              with supplier data, then drop it here.
            </p>
          </div>
        )}

        {/* Success summary */}
        {state === 'success' && (
          <div className="flex flex-col gap-[10px]">
            <div
              style={{
                borderBottom: '1px solid var(--base-border, #E5E5E5)',
                padding: '16px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <PlusCircle size={22} strokeWidth={2} />
              <span style={{ fontSize: 14, fontWeight: 500 }}>{addedCount} suppliers added.</span>
            </div>
          </div>
        )}

        {/* Drop zone — hidden on success */}
        {state !== 'success' && (
          <div
            style={{
              padding: state === 'idle' || state === 'dragging' ? '32px' : '24px',
              background: state === 'dragging' ? '#F0F4FF' : '#F9FAFB',
              borderRadius: '8px',
              border:
                state === 'idle' || state === 'dragging'
                  ? '1px dashed var(--base-muted-foreground, #737373)'
                  : '1px solid var(--base-border, #E5E5E5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              position: 'relative',
              textAlign: 'center',
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div style={{ width: 54, height: 54 }}>
              {isUnsupportedFile ? (
                <FileText className="h-12 w-12" style={{ color: 'var(--base-muted-foreground)' }} />
              ) : state === 'uploading' ? (
                <div className="relative">
                  <FileText className="h-12 w-12 text-primary" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                  </div>
                </div>
              ) : state === 'error' && !isUnsupportedFile ? (
                <FileText className="h-12 w-12 text-destructive" />
              ) : (
                <FileUp className="h-12 w-12 text-muted-foreground" />
              )}
            </div>

            {file && (
              <div>
                <p style={{ fontSize: 14, fontWeight: 500 }}>{file.name}</p>
                {!isUnsupportedFile && (
                  <p style={{ fontSize: 12, color: '#737373' }}>
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                )}
              </div>
            )}

            {state === 'uploading' && (
              <div style={{ width: '100%' }}>
                <div
                  style={{
                    background: '#737373',
                    height: 8,
                    borderRadius: 4,
                  }}
                >
                  <div
                    style={{
                      background: '#FC5A29',
                      height: 8,
                      width: `${uploadProgress}%`,
                      borderRadius: 4,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: '#737373',
                    marginTop: 4,
                    textAlign: 'center',
                  }}
                >
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            {state === 'error' && (
              <p style={{ color: 'var(--base-destructive)', fontSize: 14 }}>{errorMessage}</p>
            )}

            {(state === 'idle' || state === 'dragging') && !file && (
              <div style={{ fontSize: 14 }}>
                Drop file or click to select
                <br />
                <span style={{ fontSize: 12 }}>(csv)</span>
                <div style={{ marginTop: 8 }}>
                  <input
                    id="supplier-file-input"
                    type="file"
                    accept=".csv"
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="supplier-file-input"
                    style={{
                      padding: '8px 16px',
                      background: '#fff',
                      border: '1px solid #E5E5E5',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                  >
                    Select file
                  </label>
                </div>
              </div>
            )}

            {file && state !== 'idle' && state !== 'dragging' && (
              <button
                onClick={handleRemoveFile}
                className="absolute top-2 right-2"
                aria-label="Remove file"
              >
                {isUnsupportedFile ? <X className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
              </button>
            )}
          </div>
        )}

        {/* Footer buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          {state === 'success' ? (
            <button
              onClick={onClose}
              style={{
                height: 36,
                padding: '8px 16px',
                background: '#fff',
                borderRadius: 8,
                outline: '1px solid #E5E5E5',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
              }}
            >
              Done
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #E5E5E5',
                  borderRadius: 8,
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!file || state === 'uploading'}
                style={{
                  padding: '8px 16px',
                  background: '#FC5A29',
                  color: '#fff',
                  borderRadius: 8,
                  opacity: file && state !== 'uploading' ? 1 : 0.5,
                  cursor: file && state !== 'uploading' ? 'pointer' : 'not-allowed',
                  border: 'none',
                }}
              >
                {state === 'uploading' ? 'Importing...' : 'Import'}
              </button>
            </>
          )}
        </div>

        {/* Close X button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 16,
            height: 16,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
