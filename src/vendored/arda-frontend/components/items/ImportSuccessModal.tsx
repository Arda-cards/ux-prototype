import React, { useState, useEffect } from 'react';
import { X, PlusCircle, CheckCircle, XCircle, ChevronDown } from 'lucide-react';

interface ImportSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  added: number;
  modified: number;
  deleted: number;
  errorCount?: number;
  errors?: Array<{
    recordNumber: number;
    messages: string[];
  }>;
}

export const ImportSuccessModal: React.FC<ImportSuccessModalProps> = ({
  isOpen,
  onClose,
  added,
  modified,
  deleted,
  errorCount = 0,
  errors = [],
}) => {
  const [isErrorsExpanded, setIsErrorsExpanded] = useState(false);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle backdrop click to close modal
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
      onClick={handleBackdropClick}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          background: 'var(--base-background, white)',
          borderRadius: 10,
          outline: '1px solid var(--base-border, #E5E5E5)',
          padding: 24,
          boxShadow: '0px 4px 6px -4px rgba(0, 0, 0, 0.10)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div className='flex flex-col items-center gap-1 text-center py-6'>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: 'var(--base-foreground, #0A0A0A)',
              fontFamily: 'Geist',
              lineHeight: '18px',
            }}
          >
            Success!
          </h1>
          <p
            style={{
              fontSize: 14,
              color: 'var(--base-muted-foreground, #737373)',
              fontFamily: 'Geist',
              lineHeight: '20px',
              fontWeight: 400,
            }}
          >
            All set — your upload’s in the bag. Here’s what happened:
          </p>
        </div>

        {/* Rows */}
        <div className='flex flex-col gap-[10px] '>
          <SummaryRow
            icon={
              <PlusCircle
                size={22}
                strokeWidth={2}
                className='text-[--base-foreground]'
              />
            }
            text={`${added} items added.`}
          />
          {modified > 0 && (
            <SummaryRow
              icon={
                <CheckCircle
                  size={22}
                  strokeWidth={2}
                  className='text-[--base-foreground]'
                />
              }
              text={`${modified} items modified.`}
            />
          )}
          {deleted > 0 && (
            <SummaryRow
              icon={
                <XCircle
                  size={22}
                  strokeWidth={2}
                  className='text-[--base-foreground]'
                />
              }
              text={`${deleted} items deleted.`}
            />
          )}

          {/* Show errors if any */}
          {errorCount > 0 && (
            <SummaryRow
              icon={
                <XCircle
                  size={22}
                  strokeWidth={2}
                  className='text-[--base-foreground]'
                />
              }
              text={`${errorCount} errors found.`}
              isExpandable={true}
              isExpanded={isErrorsExpanded}
              onToggle={() => setIsErrorsExpanded(!isErrorsExpanded)}
            />
          )}
        </div>

        {/* Error details - expandable */}
        {errors.length > 0 && isErrorsExpanded && (
          <div
            className='mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg'
            style={{
              maxHeight: '300px',
              overflowY: 'auto',
            }}
          >
            <div className='space-y-3'>
              {errors.map((error, index) => (
                <div
                  key={index}
                  className='bg-white p-3 rounded border border-gray-200'
                >
                  <div className='font-medium text-gray-800 text-sm mb-2'>
                    Record {error.recordNumber + 1}:
                  </div>
                  <div className='space-y-1'>
                    {error.messages
                      .map((message) => {
                        // Parse and translate the error message
                        let translatedMessage = message;

                        try {
                          // Try to parse as JSON to extract field and error info
                          const jsonMatch = message.match(/\{[\s\S]*\}/);
                          if (jsonMatch) {
                            const errorObj = JSON.parse(jsonMatch[0]);
                            if (
                              errorObj.field_validations &&
                              errorObj.field_validations.length > 0
                            ) {
                              const validation = errorObj.field_validations[0];
                              const fieldName =
                                validation.field?.replace('payload.', '') ||
                                'field';
                              const errorText =
                                validation.error || 'validation error';
                              translatedMessage = `${fieldName}: ${errorText}`;
                            } else if (errorObj.field && errorObj.error) {
                              const fieldName =
                                errorObj.field.replace('payload.', '') ||
                                'field';
                              translatedMessage = `${fieldName}: ${errorObj.error}`;
                            }
                          }
                        } catch {
                          // If parsing fails, use original message
                          translatedMessage = message;
                        }

                        return translatedMessage;
                      })
                      .filter(
                        (message, index, array) =>
                          array.indexOf(message) === index
                      ) // Remove duplicates
                      .map((translatedMessage, msgIndex) => (
                        <div
                          key={msgIndex}
                          className='text-xs text-gray-700 bg-gray-50 p-2 rounded border border-gray-200'
                        >
                          {translatedMessage}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Done button */}
        <div className='flex justify-end'>
          <button
            onClick={onClose}
            style={{
              height: 36,
              padding: '8px 16px',
              background: 'var(--custom-background-dark, #fff)',
              borderRadius: 8,
              outline: '1px solid var(--base-input, #E5E5E5)',
              fontSize: 14,
              fontWeight: 500,
              fontFamily: 'Geist',
              color: 'var(--base-foreground, #0A0A0A)',
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <X className='w-4 h-4 text-[--base-foreground] opacity-70' />
        </button>
      </div>
    </div>
  );
};

interface SummaryRowProps {
  icon: React.ReactNode;
  text: string;
  isExpandable?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const SummaryRow: React.FC<SummaryRowProps> = ({
  icon,
  text,
  isExpandable = false,
  isExpanded = false,
  onToggle,
}) => (
  <div
    style={{
      borderBottom: '1px solid var(--base-border, #E5E5E5)',
      padding: '16px 0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: isExpandable ? 'pointer' : 'default',
    }}
    onClick={isExpandable ? onToggle : undefined}
  >
    <div className='flex items-center gap-1'>
      <div className='w-6 h-6 flex items-center justify-center'>{icon}</div>
      <span
        style={{
          fontSize: 14,
          fontWeight: 500,
          fontFamily: 'Geist',
          color: 'var(--base-foreground, #0A0A0A)',
          lineHeight: '20px',
        }}
      >
        {text}
      </span>
    </div>
    <ChevronDown
      size={16}
      className={`text-[--base-muted-foreground] transition-transform duration-200 ${
        isExpanded ? 'rotate-180' : ''
      }`}
    />
  </div>
);

export default ImportSuccessModal;
