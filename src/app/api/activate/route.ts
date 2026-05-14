import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "missing_token" },
        { status: 400 }
      );
    }

    const invoice = await prisma.invoiceRequest.findUnique({
      where: { accessToken: token },
    });

    if (!invoice) {
      return NextResponse.json(
        { ok: false, error: "invalid_token" },
        { status: 404 }
      );
    }

    if (invoice.status !== "PAID") {
      return NextResponse.json(
        { ok: false, error: "invalid_status" },
        { status: 400 }
      );
    }

    if (invoice.activatedAt !== null) {
      return NextResponse.json(
        { ok: false, error: "already_used" },
        { status: 409 }
      );
    }

    await prisma.invoiceRequest.update({
      where: { id: invoice.id },
      data: { status: "ACTIVATED", activatedAt: new Date() },
    });

    return NextResponse.json({
      ok: true,
      reference: invoice.reference,
      paidAt: invoice.paidAt?.toISOString(),
    });
  } catch (error) {
    console.error("GET /api/activate error:", error);
    return NextResponse.json(
      { ok: false, error: "server_error" },
      { status: 500 }
    );
  }
}
