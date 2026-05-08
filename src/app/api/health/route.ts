import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import pkg from "../../../../package.json";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const time = new Date().toISOString();
  const version = pkg.version;

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { status: "ok", db: "up", version, time },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { status: "degraded", db: "down", version, time },
      { status: 503 },
    );
  }
}
