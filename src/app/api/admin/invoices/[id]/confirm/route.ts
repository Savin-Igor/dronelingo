import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { env } from "@/env";

function activationEmailHtml(opts: {
  activationUrl: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 28px; color: #10b981; }
        .content { background: #f9fafb; padding: 30px; border-radius: 8px; text-align: center; }
        .button { display: inline-block; background: #0ea5e9; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; font-size: 16px; }
        .footer { text-align: center; font-size: 12px; color: #999; margin-top: 30px; }
        .note { background: #f0f9ff; padding: 12px; border-radius: 6px; color: #0369a1; font-size: 14px; margin-top: 20px; border-left: 4px solid #0ea5e9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Payment Confirmed</h1>
          <p style="margin: 0; color: #666;">Your dronelingo access is ready</p>
        </div>

        <div class="content">
          <p>Thank you for your payment! We've confirmed receipt and your access is ready to activate.</p>

          <a href="${opts.activationUrl}" class="button">
            Activate Full Access
          </a>

          <div class="note">
            This link is unique to your account. You'll be able to access all 9 EASA A1/A3 topics, 45+ practice drills, and unlimited mock exams.
          </div>

          <p style="margin-top: 30px; color: #999; font-size: 14px;">
            If the button doesn't work, copy this link into your browser:<br/>
            <code style="background: white; padding: 2px 6px; border-radius: 4px; word-break: break-all;">${opts.activationUrl}</code>
          </p>
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

function successPageHtml(): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Payment Confirmed</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f9ff; color: #333; padding: 20px; }
        .container { max-width: 600px; margin: 40px auto; background: white; padding: 40px; border-radius: 8px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        h1 { color: #10b981; font-size: 32px; margin: 0 0 10px 0; }
        p { color: #666; font-size: 16px; line-height: 1.6; }
        .success-icon { font-size: 48px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="success-icon">✓</div>
        <h1>Payment Confirmed</h1>
        <p>The customer will receive an activation email shortly.</p>
        <p style="color: #999; font-size: 14px;">You can close this page.</p>
      </div>
    </body>
    </html>
  `;
}

function errorPageHtml(message: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Error</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fef2f2; color: #333; padding: 20px; }
        .container { max-width: 600px; margin: 40px auto; background: white; padding: 40px; border-radius: 8px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        h1 { color: #dc2626; font-size: 32px; margin: 0 0 10px 0; }
        p { color: #666; font-size: 16px; line-height: 1.6; }
        .error-icon { font-size: 48px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="error-icon">✗</div>
        <h1>Error</h1>
        <p>${message}</p>
        <p style="color: #999; font-size: 14px;">Contact admin@dronelingo.eu if you need assistance.</p>
      </div>
    </body>
    </html>
  `;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    if (secret !== env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403, headers: { "content-type": "text/html" } }
      );
    }

    const invoice = await prisma.invoiceRequest.findUnique({
      where: { id },
    });

    if (!invoice) {
      return new Response(errorPageHtml("Invoice not found."), {
        status: 404,
        headers: { "content-type": "text/html" },
      });
    }

    if (invoice.status !== "PENDING") {
      return new Response(
        errorPageHtml("This invoice has already been processed."),
        { status: 409, headers: { "content-type": "text/html" } }
      );
    }

    const accessToken = randomBytes(32).toString("hex");

    await prisma.invoiceRequest.update({
      where: { id: invoice.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        accessToken,
      },
    });

    const activationUrl = `${env.NEXT_PUBLIC_SITE_URL}/activate?token=${accessToken}`;

    const activationHtml = activationEmailHtml({ activationUrl });

    await sendEmail({
      to: invoice.email,
      subject: "Your dronelingo access is ready",
      html: activationHtml,
    });

    return new Response(successPageHtml(), {
      status: 200,
      headers: { "content-type": "text/html" },
    });
  } catch (error) {
    console.error("GET /api/admin/invoices/[id]/confirm error:", error);
    return new Response(errorPageHtml("An error occurred. Please try again."), {
      status: 500,
      headers: { "content-type": "text/html" },
    });
  }
}
