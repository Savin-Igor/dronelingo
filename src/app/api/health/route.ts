import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import pkg from "../../../../package.json";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Health endpoint used by both the Docker healthcheck and the deploy
 * gate. The shape is stable:
 *
 *   { status: "ok"|"degraded", db: "up"|"down", version, time,
 *     content?: { topics, lessons, questions } }
 *
 * Content counts are best-effort and dropped on DB failure so the
 * healthcheck still reports the failure cleanly.
 */
export async function GET() {
  const time = new Date().toISOString();
  const version = pkg.version;

  try {
    await prisma.$queryRaw`SELECT 1`;
    const [topics, lessons, questions] = await Promise.all([
      prisma.topic.count(),
      prisma.lesson.count(),
      prisma.question.count(),
    ]);
    return NextResponse.json(
      {
        status: "ok",
        db: "up",
        version,
        time,
        content: { topics, lessons, questions },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { status: "degraded", db: "down", version, time },
      { status: 503 },
    );
  }
}
