import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { env } from "@/env";

const createInvoiceSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

function generateReference(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const hex = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `INV-${date}-${hex}`;
}

function invoiceEmailHtml(opts: {
  reference: string;
  amount: number;
  currency: string;
  iban: string;
  bic: string;
  bankName: string;
  beneficiary: string;
}): string {
  const amountEuro = (opts.amount / 100).toFixed(2);
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 24px; color: #1a1a1a; }
        .amount-box { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center; }
        .amount-box .label { color: #666; font-size: 14px; margin-bottom: 8px; }
        .amount-box .value { font-size: 36px; font-weight: bold; color: #1a1a1a; }
        .reference-box { background: #f5f5f5; padding: 12px; border-radius: 8px; margin-bottom: 30px; font-family: monospace; text-align: center; word-break: break-all; }
        .bank-details { background: #fafafa; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9; margin-bottom: 30px; }
        .detail-row { margin-bottom: 12px; display: flex; }
        .detail-label { font-weight: bold; width: 100px; color: #666; }
        .detail-value { font-family: monospace; word-break: break-all; }
        .note { background: #fffbeb; padding: 12px; border-radius: 8px; border-left: 4px solid #f59e0b; font-size: 14px; color: #92400e; margin-bottom: 30px; }
        .footer { text-align: center; font-size: 12px; color: #999; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Invoice #${opts.reference}</h1>
          <p style="margin: 0; color: #666;">dronelingo.eu — Full Access</p>
        </div>

        <div class="amount-box">
          <div class="label">Total due</div>
          <div class="value">${amountEuro} ${opts.currency}</div>
        </div>

        <div class="reference-box">
          <strong>Payment reference:</strong><br/>
          ${opts.reference}
        </div>

        <h2 style="margin-top: 30px; margin-bottom: 15px; font-size: 16px;">Bank transfer details</h2>

        <div class="bank-details">
          <div class="detail-row">
            <div class="detail-label">Amount:</div>
            <div class="detail-value">${amountEuro} ${opts.currency}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">IBAN:</div>
            <div class="detail-value">${opts.iban}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">BIC:</div>
            <div class="detail-value">${opts.bic}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Beneficiary:</div>
            <div class="detail-value">${opts.beneficiary}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Description:</div>
            <div class="detail-value">${opts.reference}</div>
          </div>
        </div>

        <div class="note">
          We will activate your access within 1 business day of receiving your payment. Once activated, you will receive a confirmation email with an activation link.
        </div>

        <div class="footer">
          <p>Questions? Contact us at admin@dronelingo.eu</p>
          <p style="margin: 0;">© dronelingo.eu 2026</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function adminNotificationHtml(opts: {
  email: string;
  name?: string;
  reference: string;
  amount: number;
  currency: string;
  confirmUrl: string;
}): string {
  const amountEuro = (opts.amount / 100).toFixed(2);
  const displayName = opts.name || opts.email;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0ea5e9; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 20px; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .detail { margin-bottom: 12px; }
        .detail-label { font-weight: bold; color: #666; }
        .detail-value { font-family: monospace; margin-top: 4px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
        .footer { text-align: center; font-size: 12px; color: #999; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Invoice Request</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">dronelingo.eu</p>
        </div>

        <div class="content">
          <div class="detail">
            <div class="detail-label">Customer name:</div>
            <div class="detail-value">${displayName}</div>
          </div>

          <div class="detail">
            <div class="detail-label">Email:</div>
            <div class="detail-value">${opts.email}</div>
          </div>

          <div class="detail">
            <div class="detail-label">Invoice reference:</div>
            <div class="detail-value">${opts.reference}</div>
          </div>

          <div class="detail">
            <div class="detail-label">Amount:</div>
            <div class="detail-value">${amountEuro} ${opts.currency}</div>
          </div>

          <div class="detail">
            <div class="detail-label">Received at:</div>
            <div class="detail-value">${new Date().toLocaleString("en-US", { timeZone: "UTC" })} UTC</div>
          </div>

          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            Once you confirm the payment has been received, an activation link will be sent to the customer's email.
          </p>

          <a href="${opts.confirmUrl}" class="button">
            ✓ Confirm Payment & Activate Access
          </a>

          <div class="footer">
            <p>This is an automated message. Do not reply to this email.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createInvoiceSchema.parse(body);

    const reference = generateReference();

    const invoice = await prisma.invoiceRequest.create({
      data: {
        email: parsed.email,
        name: parsed.name,
        amount: 1900,
        currency: "EUR",
        reference,
      },
    });

    const invoiceHtml = invoiceEmailHtml({
      reference: invoice.reference,
      amount: invoice.amount,
      currency: invoice.currency,
      iban: env.INVOICE_IBAN ?? "LV00XXXX0000000000000",
      bic: env.INVOICE_BIC ?? "XXXXLV22",
      bankName: env.INVOICE_BANK_NAME ?? "SEB Latvia",
      beneficiary: env.INVOICE_BENEFICIARY ?? "Dronelingo SIA",
    });

    const confirmUrl = `${env.NEXT_PUBLIC_SITE_URL}/api/admin/invoices/${invoice.id}/confirm?secret=${env.ADMIN_SECRET}`;

    const adminHtml = adminNotificationHtml({
      email: parsed.email,
      name: parsed.name,
      reference: invoice.reference,
      amount: invoice.amount,
      currency: invoice.currency,
      confirmUrl,
    });

    await Promise.all([
      sendEmail({
        to: parsed.email,
        subject: `Invoice #${invoice.reference} — dronelingo.eu Full Access`,
        html: invoiceHtml,
      }),
      sendEmail({
        to: env.ADMIN_EMAIL ?? "admin@dronelingo.eu",
        subject: `[dronelingo] New invoice request — ${parsed.email}`,
        html: adminHtml,
      }),
    ]);

    return NextResponse.json({ ok: true, reference: invoice.reference });
  } catch (error) {
    console.error("POST /api/invoices error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Invalid request" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: false, error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
