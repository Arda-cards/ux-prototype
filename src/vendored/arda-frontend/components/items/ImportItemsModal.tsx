// ImportItemsModal.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { FileText, Trash2, FileUp, X } from 'lucide-react';
import { ImportSuccessModal } from './ImportSuccessModal';
import './ImportItemsModal.css';
import * as pako from 'pako';
import { useAuthErrorHandler } from '@frontend/hooks/useAuthErrorHandler';

export type ImportState =
  | 'idle'
  | 'dragging'
  | 'uploading'
  | 'error'
  | 'success';

interface ImportItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

interface UploadResult {
  added: number;
  modified: number;
  deleted: number;
  processed?: number;
  errorCount?: number;
  status?: string;
  errors?: Array<{
    recordNumber: number;
    messages: string[];
  }>;
}

export const ImportItemsModal: React.FC<ImportItemsModalProps> = ({
  isOpen,
  onClose,
  onRefresh,
}) => {
  const { handleAuthError } = useAuthErrorHandler();
  const [state, setState] = useState<ImportState>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setState('idle');
      setFile(null);
      setErrorMessage('');
      setUploadResult(null);
      setUploadProgress(0);
      setShowSuccessModal(false);
    }
  }, [isOpen]);

  const isUnsupportedFile =
    file && file.type !== 'text/csv' && !file.name.endsWith('.csv');
  const isUploadFailure = state === 'error' && !isUnsupportedFile;

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (
      selectedFile.type !== 'text/csv' &&
      !selectedFile.name.endsWith('.csv')
    ) {
      setErrorMessage('Unsupported file type. Try again.');
      setState('error');
      setFile(selectedFile);
      return;
    }

    setFile(selectedFile);
    setState('idle'); // Don't start upload immediately, wait for Import button
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
    [handleFileSelect]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) handleFileSelect(selectedFile);
    },
    [handleFileSelect]
  );

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setState('idle');
    setUploadProgress(0);
    setErrorMessage('');
    setUploadResult(null);
  }, []);

  // Helper function to get auth headers
  const getAuthHeaders = useCallback(async () => {
    const accessToken = localStorage.getItem('accessToken');
    const idToken = localStorage.getItem('idToken');

    if (!accessToken || !idToken) {
      throw new Error('No authentication token found. Please sign in.');
    }

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'X-ID-Token': idToken,
    };
  }, []);

  const handleImport = useCallback(async () => {
    if (!file) return;

    setState('uploading');
    setErrorMessage('');
    setUploadProgress(0);

    try {
      // Step 1: Get upload URL
      setUploadProgress(10);

      const authHeaders = await getAuthHeaders();
      const uploadUrlResponse = await fetch('/api/arda/items/upload-url', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type,
        }),
      });

      if (!uploadUrlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const uploadUrlData = await uploadUrlResponse.json();

      if (!uploadUrlData.ok || !uploadUrlData.data?.url) {
        throw new Error('Invalid upload URL response');
      }

      const { url: uploadUrl, jobId } = uploadUrlData.data;
      setUploadProgress(25);

      // Step 2: Upload file to S3
      // Compress the file with gzip using a simpler approach
      const fileContent = await file.arrayBuffer();

      // Compress the file with gzip using pako (more reliable than CompressionStream)
      let compressedContent: Uint8Array;

      try {
        // Convert ArrayBuffer to Uint8Array for pako
        const fileData = new Uint8Array(fileContent);

        // Compress using pako
        const compressed = pako.gzip(fileData);
        compressedContent = compressed;
      } catch (compressionError) {
        console.error('[Upload] Pako compression failed:', compressionError);
        throw new Error(
          'Failed to compress file with pako: ' + compressionError
        );
      }

      const uploadFileResponse = await fetch(
        `/api/arda/items/upload-file?uploadUrl=${encodeURIComponent(
          uploadUrl
        )}`,
        {
          method: 'PUT',
          headers: authHeaders,
          body: new Blob([new Uint8Array(compressedContent)], {
            type: 'application/gzip',
          }),
        }
      );

      if (!uploadFileResponse.ok) {
        const errorText = await uploadFileResponse.text();
        console.error('[Upload] S3 Upload Error:', errorText);
        throw new Error('Failed to upload file to S3: ' + errorText);
      }

      setUploadProgress(50);

      // Step 3: Process the upload job

      const processJobResponse = await fetch(
        `/api/arda/items/upload-job/process`,
        {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ jobId }),
        }
      );

      if (!processJobResponse.ok) {
        throw new Error('Failed to process upload job');
      }

      const processJobData = await processJobResponse.json();

      if (!processJobData.ok) {
        throw new Error('Invalid process job response');
      }

      const { trackerId } = processJobData.data;
      setUploadProgress(75);

      // Step 4: Poll for upload status

      const pollStatus = async (): Promise<{
        status: string;
        added?: number;
        modified?: number;
        deleted?: number;
        error?: string;
        payload?: {
          status: string;
          successCount?: number;
          errorCount?: number;
          processed?: number;
        };
      }> => {
        const statusResponse = await fetch(
          `/api/arda/items/upload-status/${trackerId}`,
          {
            method: 'GET',
            headers: authHeaders,
          }
        );

        if (!statusResponse.ok) {
          throw new Error('Failed to get upload status');
        }

        const statusData = await statusResponse.json();

        if (!statusData.ok) {
          throw new Error('Invalid status response');
        }

        return statusData.data;
      };

      // Poll until completion
      let status;
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max

      do {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
        status = await pollStatus();
        attempts++;

        if (attempts >= maxAttempts) {
          throw new Error(
            'Upload timeout - status polling exceeded maximum attempts'
          );
        }
      } while (
        status?.payload?.status !== 'COMPLETED' &&
        status?.payload?.status !== 'FAILED'
      );

      if (status?.payload?.status === 'FAILED') {
        throw new Error(status?.error || 'Upload processing failed');
      }

      // Only proceed if status is COMPLETED
      if (status?.payload?.status !== 'COMPLETED') {
        throw new Error('Upload did not complete successfully');
      }

      setUploadProgress(100);
      setState('success');

      // Parse the results from the status response
      const result = {
        added: status?.payload?.successCount || 0,
        modified: 0, // Not available in this response
        deleted: 0, // Not available in this response
        processed: status?.payload?.processed || 0,
        errorCount: status?.payload?.errorCount || 0,
        status: status?.payload?.status || 'UNKNOWN',
        errors:
          (
            status?.payload as {
              errors?: Array<{ recordNumber: number; messages: string[] }>;
            }
          )?.errors || [],
      };

      setUploadResult(result);

      // Show success modal after a short delay
      setTimeout(() => {
        setShowSuccessModal(true);
      }, 500);
    } catch (error) {
      console.error('[Upload] Upload failed:', error);
      if (handleAuthError(error)) {
        return;
      }
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
      setState('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, getAuthHeaders]);

  const handleDownloadTemplate = useCallback(() => {
    window.open(
      'https://docs.google.com/spreadsheets/d/1ztT2ErR9-KZ_YuMmsPXa_NXkrxA2Kq-wG8Lz2bRRcIA/copy?gid=1701628473#gid=1701628473',
      '_blank'
    );
  }, []);

  return (
    <>
      {isOpen && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 min-h-screen'>
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
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>Import items</h2>
              <p style={{ fontSize: 14, color: '#737373' }}>
                You can create a whole stack of items at once by importing a
                .CSV file. Download the{' '}
                <button
                  onClick={handleDownloadTemplate}
                  style={{
                    color: 'var(--base-accent-foreground)',
                    textDecoration: 'underline',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  item template
                </button>
                , fill it out, then drop it here.
              </p>
            </div>

            <div
              style={{
                padding: state === 'idle' ? '32px' : '24px',
                background: '#F9FAFB',
                borderRadius: '8px',
                border:
                  state === 'idle'
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
                  <FileText
                    className='h-12 w-12'
                    style={{ color: 'var(--base-muted-foreground)' }}
                  />
                ) : isUploadFailure ? (
                  <FileText className='h-12 w-12 text-destructive' />
                ) : state === 'uploading' ? (
                  <div className='relative'>
                    <FileText className='h-12 w-12 text-primary' />
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <div className='animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent'></div>
                    </div>
                  </div>
                ) : (
                  <FileUp className='h-12 w-12 text-muted-foreground' />
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
                      }}
                    ></div>
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
                <p style={{ color: 'var(--base-destructive)', fontSize: 14 }}>
                  {errorMessage}
                </p>
              )}

              {state === 'idle' && (
                <div style={{ fontSize: 14 }}>
                  Drop file or click to select
                  <br />
                  <span style={{ fontSize: 12 }}>(csv)</span>
                  <div style={{ marginTop: 8 }}>
                    <input
                      id='file-input'
                      type='file'
                      accept='.csv'
                      onChange={handleFileInputChange}
                      style={{ display: 'none' }}
                    />
                    <label
                      htmlFor='file-input'
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

              {file && state !== 'idle' && (
                <button
                  onClick={handleRemoveFile}
                  className='absolute top-2 right-2'
                  aria-label='Remove file'
                >
                  {isUnsupportedFile ? (
                    <X className='w-4 h-4' />
                  ) : (
                    <Trash2 className='w-4 h-4' />
                  )}
                </button>
              )}
            </div>

            <div
              style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}
            >
              <button
                onClick={onClose}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #E5E5E5',
                  borderRadius: 8,
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
                  cursor:
                    file && state !== 'uploading' ? 'pointer' : 'not-allowed',
                  border: 'none',
                }}
              >
                {state === 'uploading' ? 'Importing...' : 'Import'}
              </button>
            </div>

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
              <X className='w-4 h-4' />
            </button>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <ImportSuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            onClose(); // Close the main modal too
            onRefresh?.(); // Refresh the items table
          }}
          added={uploadResult?.added || 0}
          modified={uploadResult?.modified || 0}
          deleted={uploadResult?.deleted || 0}
          errorCount={uploadResult?.errorCount || 0}
          errors={uploadResult?.errors || []}
        />
      )}
    </>
  );
};
