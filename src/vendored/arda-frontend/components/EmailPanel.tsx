'use client';

import React, { useRef } from 'react';
import { X, Copy } from 'lucide-react';
import { cn } from '@frontend/lib/utils';
import { toast } from 'sonner';

interface EmailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  items: Array<{
    id: string;
    name: string;
    quantity: string;
    supplier: string;
    orderMethod: string;
    taxable?: boolean;
    sku?: string;
    unitPrice?: number;
  }>;
  onSendEmail: (itemIds: string[]) => Promise<void>;
  /** Llamado al copiar al portapapeles; permite actualizar estado de las cards (ej. accept + cerrar panel) */
  onCopyToClipboard?: (itemIds: string[]) => void | Promise<void>;
  userContext?: {
    userId: string;
    email: string;
    name: string;
    tenantId: string;
    role: string;
    author: string;
  };
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

const COLUMNS = [
  { key: 'name', header: 'Item' },
  { key: 'quantity', header: 'Quantity' },
  { key: 'taxable', header: 'Taxable status' },
  { key: 'sku', header: 'Vendor sku' },
  { key: 'unitPrice', header: 'Unit price' },
] as const;

function buildPlainTextWithTable(
  items: EmailPanelProps['items'],
  supplier: string,
  deliveryAddress?: EmailPanelProps['deliveryAddress'],
  userContext?: EmailPanelProps['userContext']
): string {
  const getCell = (item: (typeof items)[0], col: (typeof COLUMNS)[number]) => {
    if (col.key === 'name') return item.name || '';
    if (col.key === 'quantity') return item.quantity || '';
    if (col.key === 'taxable') return item.taxable ? 'Yes' : 'No';
    if (col.key === 'sku') return item.sku || '-';
    if (col.key === 'unitPrice')
      return item.unitPrice != null ? `$${item.unitPrice.toFixed(2)}` : '-';
    return '';
  };

  const rows: string[][] = [COLUMNS.map((c) => c.header)];
  items.forEach((item) => {
    rows.push(COLUMNS.map((c) => getCell(item, c)));
  });

  const widths = COLUMNS.map((_, i) =>
    Math.max(COLUMNS[i].header.length, ...rows.map((r) => String(r[i] ?? '').length), 2)
  );

  const pad = (s: string, w: number) => s.padEnd(w).slice(0, w);
  const line = () => `+${widths.map((w) => '-'.repeat(w + 2)).join('+')}+`;
  const row = (cells: string[]) =>
    `| ${cells.map((c, i) => pad(String(c), widths[i])).join(' | ')} |`;

  const tableLines = [line(), row(rows[0]!), line(), ...rows.slice(1).map((r) => row(r)), line()];
  const tableBlock = tableLines.join('\n');

  const lines: string[] = [];
  if (supplier.trim() !== '') {
    lines.push(`Hi ${supplier},`);
    lines.push('');
  }
  lines.push('I would like to order the following items:');
  lines.push('');
  lines.push(tableBlock);
  lines.push('');
  if (deliveryAddress) {
    lines.push('Deliver To:');
    lines.push(deliveryAddress.street);
    lines.push(`${deliveryAddress.city}, ${deliveryAddress.state} ${deliveryAddress.zip}`);
    lines.push('');
  }
  lines.push('Best,');
  lines.push('');
  lines.push(userContext?.name || userContext?.email || '');
  lines.push('');
  lines.push('Powered by Arda');

  return lines.join('\n');
}

const EmailPanel: React.FC<EmailPanelProps> = ({
  isOpen,
  onClose,
  items,
  userContext,
  deliveryAddress,
  onCopyToClipboard,
}) => {
  const bodyTextRef = useRef<HTMLDivElement>(null);

  const handleCopyToClipboard = async () => {
    const el = bodyTextRef.current;
    if (!el) return;
    const plainText = buildPlainTextWithTable(
      items,
      items[0]?.supplier ?? '',
      deliveryAddress,
      userContext
    );
    const htmlContent = el.innerHTML || '';
    const htmlDocument = `<!DOCTYPE html><html><meta charset="utf-8"><body>${htmlContent}</body></html>`;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([htmlDocument], { type: 'text/html' }),
          'text/plain': new Blob([plainText], { type: 'text/plain' }),
        }),
      ]);
      toast.success('Message copied to clipboard');
      const itemIds = items.map((i) => i.id);
      await onCopyToClipboard?.(itemIds);
    } catch {
      try {
        await navigator.clipboard.writeText(plainText);
        toast.success('Message copied to clipboard');
        const itemIds = items.map((i) => i.id);
        await onCopyToClipboard?.(itemIds);
      } catch {
        toast.error('Failed to copy');
      }
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as Element).id === 'email-panel-overlay') {
      onClose();
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      id='email-panel-overlay'
      onClick={handleOverlayClick}
      className={cn(
        'fixed inset-0 z-50 flex justify-end transition-all duration-300',
        isOpen ? 'visible opacity-100' : 'invisible opacity-0'
      )}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(0px)',
      }}
    >
      <div
        className={cn(
          'relative w-full sm:w-[420px] lg:w-[460px] h-full bg-white border-l border-border flex flex-col shadow-xl transition-transform duration-300 overflow-hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        style={{
          boxShadow: '-10px 0px 20px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* Close icon */}
        <button
          onClick={onClose}
          className='absolute top-2 right-4 z-50 text-muted-foreground hover:text-foreground'
        >
          <X className='w-6 h-6' />
        </button>

        {/* Header */}
        <div className='sticky top-0 z-40 bg-white px-4 pt-4 pb-4 border-b border-[#e2e8f0]'>
          <div className='flex flex-col gap-y-3'>
            {/* Title */}
            <h2 className='text-2xl font-semibold font-inter leading-8 text-black break-words tracking-[-0.01em]'>
              {items.length === 1
                ? items[0].name
                : `Order from ${items[0]?.supplier || 'Supplier'}`}
            </h2>
            {items.length > 1 && (
              <p className='text-sm text-gray-600'>
                {items.length} items to order
              </p>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className='flex-1 overflow-y-auto'>
          {/* Email Content */}
          <div className='px-4 pt-4 pb-12 space-y-4'>
            <p className='text-sm text-gray-600'>
              Copy body to your email
            </p>
            {/* Card Header (Hidden by default) */}
            <div className='w-full hidden flex-col gap-1.5'>
              <div className='text-base font-semibold text-[#0a0a0a] tracking-[-0.4px] leading-none'>
                Email order
              </div>
              <div className='text-sm leading-5 text-[#737373]'>
                Place from {items[0]?.supplier.toLowerCase() || 'supplier'}{' '}
                {currentDate}
              </div>
            </div>

            {/* Content Wrapper */}
            <div className='flex-1 flex flex-col gap-4'>
              {/* Body Field */}
              <div className='flex h-full flex-col gap-2 flex-1'>
                <div className='flex h-full items-start gap-0.5'>
                  <label className='text-sm font-medium text-[#0a0a0a] leading-none'>
                    Body
                  </label>
                  <div className='text-[#dc2626] px-0.5'>*</div>
                </div>
                <div className='w-full  h-full shadow-sm rounded-lg bg-white border border-[#e5e5e5] flex-1 min-h-[60px] p-2 px-3'>
                  <div
                    ref={bodyTextRef}
                    className='w-full h-full flex-1 text-sm leading-5 text-[#0a0a0a] pb-10'
                  >
                    {/* Following the template structure exactly */}

                    {/* Greeting - conditional based on template: {{ if supplier.contact.name is defined }} */}
                    {items[0]?.supplier && items[0].supplier.trim() !== '' && (
                      <>
                        <p className='m-0'>Hi {items[0].supplier},</p>
                        <p className='m-0'>&nbsp;</p>
                      </>
                    )}

                    <p className='m-0'>
                      I would like to order the following items:
                    </p>
                    <p className='m-0'>&nbsp;</p>

                    {/* Items table - estilo limpio: bordes grises suaves, header gris claro, esquinas redondeadas */}
                    <div
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        overflow: 'hidden',
                      }}
                    >
                      <table
                        style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          borderSpacing: 0,
                          fontFamily: 'sans-serif',
                        }}
                      >
                        <thead>
                          <tr style={{ backgroundColor: '#f3f4f6' }}>
                            <th
                              style={{
                                border: '1px solid #e5e7eb',
                                padding: '10px 12px',
                                textAlign: 'left',
                                fontWeight: 700,
                                fontSize: '12px',
                                color: '#111827',
                              }}
                            >
                              Item
                            </th>
                            <th
                              style={{
                                border: '1px solid #e5e7eb',
                                padding: '10px 12px',
                                textAlign: 'left',
                                fontWeight: 700,
                                fontSize: '12px',
                                color: '#111827',
                              }}
                            >
                              Quantity
                            </th>
                            <th
                              style={{
                                border: '1px solid #e5e7eb',
                                padding: '10px 12px',
                                textAlign: 'left',
                                fontWeight: 700,
                                fontSize: '12px',
                                color: '#111827',
                              }}
                            >
                              Taxable status
                            </th>
                            <th
                              style={{
                                border: '1px solid #e5e7eb',
                                padding: '10px 12px',
                                textAlign: 'left',
                                fontWeight: 700,
                                fontSize: '12px',
                                color: '#111827',
                              }}
                            >
                              Vendor sku
                            </th>
                            <th
                              style={{
                                border: '1px solid #e5e7eb',
                                padding: '10px 12px',
                                textAlign: 'left',
                                fontWeight: 700,
                                fontSize: '12px',
                                color: '#111827',
                              }}
                            >
                              Unit price
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, index) => (
                            <tr key={`${item.id}-${index}`} style={{ backgroundColor: '#ffffff' }}>
                              <td
                                style={{
                                  border: '1px solid #e5e7eb',
                                  padding: '10px 12px',
                                  fontSize: '12px',
                                  color: '#111827',
                                }}
                              >
                                {item.name || ''}
                              </td>
                              <td
                                style={{
                                  border: '1px solid #e5e7eb',
                                  padding: '10px 12px',
                                  fontSize: '12px',
                                  color: '#111827',
                                }}
                              >
                                {item.quantity || ''}
                              </td>
                              <td
                                style={{
                                  border: '1px solid #e5e7eb',
                                  padding: '10px 12px',
                                  fontSize: '12px',
                                  color: '#111827',
                                }}
                              >
                                {item.taxable ? 'Yes' : 'No'}
                              </td>
                              <td
                                style={{
                                  border: '1px solid #e5e7eb',
                                  padding: '10px 12px',
                                  fontSize: '12px',
                                  color: '#111827',
                                }}
                              >
                                {item.sku || '-'}
                              </td>
                              <td
                                style={{
                                  border: '1px solid #e5e7eb',
                                  padding: '10px 12px',
                                  fontSize: '12px',
                                  color: '#111827',
                                }}
                              >
                                {item.unitPrice
                                  ? `$${item.unitPrice.toFixed(2)}`
                                  : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Delivery address section */}
                    {deliveryAddress && (
                      <>
                        <p className='m-0'>&nbsp;</p>
                        <p className='m-0 font-semibold'>Deliver To:</p>
                        <p className='m-0'>{deliveryAddress.street}</p>
                        <p className='m-0'>
                          {deliveryAddress.city}, {deliveryAddress.state}{' '}
                          {deliveryAddress.zip}
                        </p>
                      </>
                    )}

                    <p className='m-0'>&nbsp;</p>
                    <p className='m-0'>Best,</p>
                    <p className='m-0'>&nbsp;</p>

                    {/* Signature following template: {{ if user.name is defined }} {{ user.name }} {{ else }} {{ user email }} {{ endif }} */}
                    <p className='m-0'>
                      {userContext?.name || userContext?.email || ''}
                    </p>

                    <p className='m-0'>&nbsp;</p>
                    <div className='mt-2'>
                      <div className='inline-flex items-center px-2 py-0.5 rounded-lg border border-[#0a0a0a] bg-white'>
                        <span className='text-xs font-semibold text-[#0a0a0a] leading-4'>
                          Powered by
                        </span>
                        <span className='text-xs font-semibold text-[#0a0a0a] leading-4 italic ml-1'>
                          Arda
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='w-full bg-white border-t border-[#e2e8f0] flex items-center justify-between px-4 py-4 gap-0'>
          <button
            onClick={onClose}
            className='rounded-md bg-white border border-[#e2e8f0] flex items-center justify-center px-4 py-2 text-sm font-medium text-[#0f172a] leading-6'
          >
            Cancel
          </button>
          <button
            onClick={handleCopyToClipboard}
            type='button'
            className='shadow-sm rounded-lg bg-[#fc5a29] h-9 flex items-center justify-center px-4 py-2 gap-2 text-[#fafafa] font-medium leading-5 hover:opacity-90'
          >
            <Copy className='w-4 h-4' />
            Copy to clipboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailPanel;
