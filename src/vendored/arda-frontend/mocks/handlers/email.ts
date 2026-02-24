// MSW handler for email send-order endpoint (MOCK-026)
import { http, HttpResponse } from 'msw';

export const emailHandlers = [
  http.post('/api/email/send-order', async ({ request }) => {
    console.log('[MSW] POST /api/email/send-order');

    const body = (await request.json()) as {
      supplierContactName?: string;
      supplierEmail?: string;
      tenantCompanyName?: string;
      tenantCompanyAddress?: string;
      userContext?: unknown;
      items?: Array<{ name: string; quantity: string }>;
      deliveryAddress?: { street?: string; city?: string; state?: string; zip?: string };
    };

    const recipientEmail = body.supplierEmail || 'supplier@example.com';
    const companyName = body.tenantCompanyName || '';
    const subject = companyName ? `${companyName} Order` : 'Order';
    const contactGreeting = body.supplierContactName ? `Hi ${body.supplierContactName}` : 'Hello';
    const itemsList = (body.items || [])
      .map((item) => `<li>${item.name} - Qty: ${item.quantity}</li>`)
      .join('');
    const addressBlock = body.deliveryAddress
      ? `<p>Deliver to: ${body.deliveryAddress.street || ''}, ${body.deliveryAddress.city || ''}, ${body.deliveryAddress.state || ''} ${body.deliveryAddress.zip || ''}</p>`
      : '';

    const htmlContent = `<p>${contactGreeting},</p><p>Please process the following order:</p><ul>${itemsList}</ul>${addressBlock}<p>Thank you</p>`;

    console.log(`[MSW] Generated email for ${recipientEmail}: ${subject}`);

    return HttpResponse.json({
      ok: true,
      status: 200,
      data: {
        recipientEmail,
        subject: `${subject} -- ${new Date().toLocaleDateString()}`,
        htmlContent,
      },
    });
  }),
];
